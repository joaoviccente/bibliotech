const express = require('express');
const pool = require('../config/database');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const router = express.Router();

// Middleware para verificar se é admin
const verifyAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      console.log('❌ Token não fornecido');
      return res.status(401).json({ message: 'Token não fornecido' });
    }

    const token = authHeader.replace('Bearer ', '');
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'bibliotech_secret_key');

    // Verificar se é admin
    const adminQuery = 'SELECT * FROM admin WHERE id_admin = $1';
    const adminResult = await pool.query(adminQuery, [decoded.id]);

    if (adminResult.rows.length === 0) {
      console.log('❌ Admin não encontrado no banco');
      return res.status(403).json({ message: 'Acesso negado' });
    }

    req.user = decoded;
    next();
  } catch (error) {
    console.error('❌ Erro na verificação do admin:', error);
    return res.status(401).json({ message: 'Token inválido' });
  }
};

// Listar todas as reservas ativas (reservado e concluido)
router.get('/reservas', verifyAdmin, async (req, res) => {
  try {
    const query = `
      SELECT 
        r.id_reserva as id,
        r.data_reserva,
        r.data_devolucao_prevista,
        r.status,
        l.nome as livro_nome,
        l.autor as livro_autor,
        a.nome as aluno_nome,
        a.matricula as aluno_matricula,
        a.curso as aluno_curso
      FROM reservas r
      JOIN livro l ON r.id_livro = l.id_livro
      JOIN aluno a ON r.id_aluno = a.id_aluno
      WHERE r.status IN ('reservado', 'concluido')
      ORDER BY r.data_reserva DESC
    `;

    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('❌ Erro ao buscar reservas:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Processar devolução de livro
router.post('/devolver/:id', verifyAdmin, async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    const reservaId = req.params.id;

    // Buscar informações da reserva (pode estar 'reservado' ou 'concluido')
    const reservaQuery = 'SELECT * FROM reservas WHERE id_reserva = $1 AND status IN ($2, $3)';
    const reservaResult = await client.query(reservaQuery, [reservaId, 'reservado', 'concluido']);


    if (reservaResult.rows.length === 0) {
      console.log('❌ Reserva não encontrada ou já devolvida');
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Reserva não encontrada ou já devolvida' });
    }

    const reserva = reservaResult.rows[0];
    console.log('✅ Reserva encontrada:', reserva);

    // Atualizar status da reserva para 'devolvido'
    const updateReservaQuery = `
      UPDATE reservas 
      SET status = 'devolvido' 
      WHERE id_reserva = $1
    `;
    await client.query(updateReservaQuery, [reservaId]);

    // Incrementar quantidade disponível e decrementar quantidade alugada
    const updateLivroQuery = `
      UPDATE livro 
      SET quantidade_disponivel = quantidade_disponivel + 1,
          quantidade_alugada = quantidade_alugada - 1 
      WHERE id_livro = $1
    `;
    await client.query(updateLivroQuery, [reserva.id_livro]);

    // Remover da tabela de pendências se existir
    const removePendenciaQuery = 'DELETE FROM pendencias WHERE id_aluno = $1 AND id_livro = $2';
    await client.query(removePendenciaQuery, [reserva.id_aluno, reserva.id_livro]);

    await client.query('COMMIT');
    res.json({ message: 'Livro devolvido com sucesso' });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Erro ao processar devolução:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  } finally {
    client.release();
  }
});

// Cadastrar novo livro
router.post('/livros', verifyAdmin, async (req, res) => {
  try {
    const { nome, autor, genero, quantidade } = req.body;

    // Validações
    if (!nome || !autor || !genero || !quantidade) {
      return res.status(400).json({ message: 'Todos os campos são obrigatórios' });
    }

    if (parseInt(quantidade) <= 0) {
      return res.status(400).json({ message: 'A quantidade deve ser maior que zero' });
    }

    // Verificar se o livro já existe
    const checkLivroQuery = 'SELECT * FROM livro WHERE LOWER(nome) = LOWER($1) AND LOWER(autor) = LOWER($2)';
    const existingLivro = await pool.query(checkLivroQuery, [nome, autor]);

    if (existingLivro.rows.length > 0) {
      return res.status(400).json({ message: 'Já existe um livro com este nome e autor' });
    }

    // Inserir novo livro
    const insertQuery = `
      INSERT INTO livro (nome, autor, genero, quantidade_total, quantidade_disponivel, quantidade_alugada) 
      VALUES ($1, $2, $3, $4, $4, 0) 
      RETURNING *
    `;
    
    const result = await pool.query(insertQuery, [nome, autor, genero, parseInt(quantidade)]);
    
    res.status(201).json({ 
      message: 'Livro cadastrado com sucesso',
      livro: result.rows[0]
    });

  } catch (error) {
    console.error('❌ Erro ao cadastrar livro:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Cadastrar novo aluno
router.post('/alunos', verifyAdmin, async (req, res) => {
  try {
    const { nome, matricula, curso } = req.body;

    // Validações
    if (!nome || !matricula || !curso) {
      return res.status(400).json({ message: 'Nome, matrícula e curso são obrigatórios' });
    }

    // Verificar se a matrícula já existe
    const checkMatriculaQuery = 'SELECT * FROM aluno WHERE matricula = $1';
    const existingAluno = await pool.query(checkMatriculaQuery, [matricula]);

    if (existingAluno.rows.length > 0) {
      return res.status(400).json({ message: 'Já existe um aluno com esta matrícula' });
    }

    // Inserir novo aluno (senha será null até o aluno cadastrar)
    const insertQuery = `
      INSERT INTO aluno (nome, matricula, curso, senha, total_livros_lidos, total_livros_alugados) 
      VALUES ($1, $2, $3, NULL, 0, 0) 
      RETURNING id_aluno, nome, matricula, curso, total_livros_lidos, total_livros_alugados
    `;
    
    const result = await pool.query(insertQuery, [nome, matricula, curso]);
    
    res.status(201).json({ 
      message: 'Aluno cadastrado com sucesso. O aluno deve cadastrar sua senha posteriormente.',
      aluno: result.rows[0]
    });

  } catch (error) {
    console.error('❌ Erro ao cadastrar aluno:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

module.exports = router;
