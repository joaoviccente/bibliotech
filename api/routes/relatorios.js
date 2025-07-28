const express = require('express');
const PDFDocument = require('pdfkit');
const pool = require('../config/database');
const jwt = require('jsonwebtoken');
const path = require('path');

// Carregar .env da raiz do projeto
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const router = express.Router();

// Middleware para verificar se é admin
const verifyAdmin = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'Token não fornecido' });
    }

    // Verificar se JWT_SECRET está definido
    if (!process.env.JWT_SECRET) {
      console.error('❌ JWT_SECRET não encontrado nas variáveis de ambiente');
      return res.status(500).json({ message: 'Erro de configuração do servidor' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Verificar se o usuário é admin
    const adminResult = await pool.query('SELECT * FROM admin WHERE id_admin = $1', [decoded.id]);
    if (adminResult.rows.length === 0) {
      return res.status(403).json({ message: 'Acesso negado. Apenas administradores.' });
    }

    req.user = decoded;
    next();
  } catch (error) {
    console.error('❌ Erro na verificação do admin:', error);
    return res.status(401).json({ message: 'Token inválido' });
  }
};

// Função para formatar data em português
const formatDate = (date) => {
  return new Date(date).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

// Função para formatar data e hora em português
const formatDateTime = (date) => {
  return new Date(date).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Gerar relatório de reservas em PDF
router.get('/reservas', verifyAdmin, async (req, res) => {
  try {
    console.log('📊 Gerando relatório de reservas...');

    // Buscar dados das reservas
    const reservasQuery = `
      SELECT 
        r.id_reserva,
        r.data_reserva,
        r.data_devolucao_prevista,
        r.status,
        r.created_at,
        l.nome as livro_nome,
        l.autor as livro_autor,
        l.genero as livro_genero,
        a.nome as aluno_nome,
        a.matricula as aluno_matricula,
        a.curso as aluno_curso
      FROM reservas r
      JOIN livro l ON r.id_livro = l.id_livro
      JOIN aluno a ON r.id_aluno = a.id_aluno
      ORDER BY r.data_reserva DESC
    `;

    const reservasResult = await pool.query(reservasQuery);
    const reservas = reservasResult.rows;

    // Criar documento PDF
    const doc = new PDFDocument({ 
      margin: 50,
      bufferPages: true,
      info: {
        Title: 'BiblioTech - Relatorio de Reservas',
        Author: 'BiblioTech System',
        Subject: 'Relatorio de Reservas de Livros',
        Creator: 'BiblioTech'
      }
    });
    
    // Configurar headers para download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=relatorio-reservas-${new Date().toISOString().split('T')[0]}.pdf`);
    
    // Pipe do documento para a resposta
    doc.pipe(res);

    // Cabeçalho do documento
    doc.fontSize(20)
       .text('BiblioTech - Relatório de Reservas', { align: 'center' })
       .moveDown();

    doc.fontSize(12)
       .text(`Gerado em: ${formatDateTime(new Date())}`, { align: 'center' })
       .text(`Total de reservas: ${reservas.length}`, { align: 'center' })
       .moveDown(2);

    // Estatísticas gerais
    const statusCount = reservas.reduce((acc, reserva) => {
      acc[reserva.status] = (acc[reserva.status] || 0) + 1;
      return acc;
    }, {});

    doc.fontSize(14)
       .text('Estatísticas Gerais:', { underline: true })
       .moveDown(0.5);

    doc.fontSize(11);
    Object.entries(statusCount).forEach(([status, count]) => {
      const statusText = {
        'reservado': 'Reservados',
        'concluido': 'Concluidos',
        'devolvido': 'Devolvidos',
        'cancelado': 'Cancelados'
      }[status] || status;
      
      doc.text(`- ${statusText}: ${count} reservas`);
    });

    doc.moveDown(2);

    // Lista de reservas
    doc.fontSize(14)
       .text('Lista Detalhada de Reservas:', { underline: true })
       .moveDown(1);

    reservas.forEach((reserva, index) => {
      // Verificar se precisa de nova página
      if (doc.y > 700) {
        doc.addPage();
      }

      doc.fontSize(12)
         .text(`${index + 1}. Reserva #${reserva.id_reserva}`, { underline: true })
         .moveDown(0.3);

      doc.fontSize(10);
      
      // Informações do aluno
      doc.text(`Aluno: ${reserva.aluno_nome}`)
         .text(`Matrícula: ${reserva.aluno_matricula}`)
         .text(`Curso: ${reserva.aluno_curso}`)
         .moveDown(0.3);

      // Informações do livro
      doc.text(`Livro: ${reserva.livro_nome}`)
         .text(`Autor: ${reserva.livro_autor}`)
         .text(`Gênero: ${reserva.livro_genero}`)
         .moveDown(0.3);

      // Informações da reserva
      doc.text(`Data da Reserva: ${formatDate(reserva.data_reserva)}`)
         .text(`Devolução Prevista: ${formatDate(reserva.data_devolucao_prevista)}`)
         .text(`Status: ${reserva.status.charAt(0).toUpperCase() + reserva.status.slice(1)}`)
         .moveDown(1);

      // Linha separadora
      doc.moveTo(50, doc.y)
         .lineTo(550, doc.y)
         .stroke()
         .moveDown(0.5);
    });

    // Rodapé
    doc.fontSize(8)
       .text('BiblioTech - Sistema de Gestão de Biblioteca Digital', 50, doc.page.height - 50, {
         align: 'center'
       });

    // Finalizar documento
    doc.end();

    console.log('✅ Relatório de reservas gerado com sucesso');

  } catch (error) {
    console.error('❌ Erro ao gerar relatório de reservas:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Gerar ranking de leitura em PDF
router.get('/ranking', verifyAdmin, async (req, res) => {
  try {
    console.log('🏆 Gerando ranking de leitura...');

    // Buscar ranking dos alunos
    const rankingQuery = `
      SELECT 
        a.nome,
        a.matricula,
        a.curso,
        a.total_livros_lidos,
        COUNT(r.id_reserva) as total_reservas
      FROM aluno a
      LEFT JOIN reservas r ON a.id_aluno = r.id_aluno
      GROUP BY a.id_aluno, a.nome, a.matricula, a.curso, a.total_livros_lidos
      ORDER BY a.total_livros_lidos DESC, total_reservas DESC
    `;

    // Buscar livros mais populares
    const livrosPopularesQuery = `
      SELECT 
        l.nome,
        l.autor,
        l.genero,
        COUNT(r.id_reserva) as total_reservas
      FROM livro l
      LEFT JOIN reservas r ON l.id_livro = r.id_livro
      GROUP BY l.id_livro, l.nome, l.autor, l.genero
      HAVING COUNT(r.id_reserva) > 0
      ORDER BY total_reservas DESC
      LIMIT 10
    `;

    // Buscar gêneros mais lidos
    const generosQuery = `
      SELECT 
        l.genero,
        COUNT(r.id_reserva) as total_reservas
      FROM livro l
      LEFT JOIN reservas r ON l.id_livro = r.id_livro
      WHERE r.status IN ('concluido', 'devolvido')
      GROUP BY l.genero
      ORDER BY total_reservas DESC
    `;

    const [rankingResult, livrosResult, generosResult] = await Promise.all([
      pool.query(rankingQuery),
      pool.query(livrosPopularesQuery),
      pool.query(generosQuery)
    ]);

    const ranking = rankingResult.rows;
    const livrosPopulares = livrosResult.rows;
    const generos = generosResult.rows;

    // Criar documento PDF
    const doc = new PDFDocument({ 
      margin: 50,
      bufferPages: true,
      info: {
        Title: 'BiblioTech - Ranking de Leitura',
        Author: 'BiblioTech System',
        Subject: 'Relatorio de Ranking de Leitura',
        Creator: 'BiblioTech'
      }
    });
    
    // Configurar headers para download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=ranking-leitura-${new Date().toISOString().split('T')[0]}.pdf`);
    
    // Pipe do documento para a resposta
    doc.pipe(res);

    // Cabeçalho do documento
    doc.fontSize(20)
       .text('BiblioTech - Ranking de Leitura', { align: 'center' })
       .moveDown();

    doc.fontSize(12)
       .text(`Gerado em: ${formatDateTime(new Date())}`, { align: 'center' })
       .moveDown(2);

    // Ranking dos Alunos
    doc.fontSize(16)
       .text('RANKING DOS LEITORES', { underline: true })
       .moveDown(1);

    doc.fontSize(11);
    ranking.slice(0, 20).forEach((aluno, index) => {
      const posicao = index + 1;
      let medalha;
      if (posicao === 1) medalha = '1o LUGAR';
      else if (posicao === 2) medalha = '2o LUGAR';
      else if (posicao === 3) medalha = '3o LUGAR';
      else medalha = `${posicao}o`;
      
      doc.text(`${medalha} - ${aluno.nome}`)
         .text(`    Matricula: ${aluno.matricula} | Curso: ${aluno.curso}`)
         .text(`    Livros lidos: ${aluno.total_livros_lidos} | Total de reservas: ${aluno.total_reservas}`)
         .moveDown(0.5);
    });

    doc.addPage();

    // Livros mais populares
    doc.fontSize(16)
       .text('LIVROS MAIS POPULARES', { underline: true })
       .moveDown(1);

    doc.fontSize(11);
    livrosPopulares.forEach((livro, index) => {
      doc.text(`${index + 1}. ${livro.nome}`)
         .text(`    Autor: ${livro.autor} | Genero: ${livro.genero}`)
         .text(`    Total de reservas: ${livro.total_reservas}`)
         .moveDown(0.5);
    });

    doc.moveDown(2);

    // Gêneros mais lidos
    doc.fontSize(16)
       .text('GENEROS MAIS LIDOS', { underline: true })
       .moveDown(1);

    doc.fontSize(11);
    generos.forEach((genero, index) => {
      doc.text(`${index + 1}. ${genero.genero}: ${genero.total_reservas} leituras`);
    });

    doc.moveDown(2);

    // Estatísticas gerais
    const totalLivrosLidos = ranking.reduce((sum, aluno) => sum + parseInt(aluno.total_livros_lidos), 0);
    const totalAlunos = ranking.length;
    const mediaLivrosPorAluno = totalAlunos > 0 ? (totalLivrosLidos / totalAlunos).toFixed(1) : 0;

    doc.fontSize(16)
       .text('ESTATISTICAS GERAIS', { underline: true })
       .moveDown(1);

    doc.fontSize(11)
       .text(`Total de alunos cadastrados: ${totalAlunos}`)
       .text(`Total de livros lidos: ${totalLivrosLidos}`)
       .text(`Media de livros por aluno: ${mediaLivrosPorAluno}`)
       .text(`Total de generos diferentes: ${generos.length}`)
       .text(`Livros mais reservados: ${livrosPopulares[0]?.nome || 'N/A'}`);

    // Rodapé
    doc.fontSize(8)
       .text('BiblioTech - Sistema de Gestão de Biblioteca Digital', 50, doc.page.height - 50, {
         align: 'center'
       });

    // Finalizar documento
    doc.end();

    console.log('✅ Ranking de leitura gerado com sucesso');

  } catch (error) {
    console.error('❌ Erro ao gerar ranking de leitura:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Buscar dados das reservas (para preview)
router.get('/reservas/data', verifyAdmin, async (req, res) => {
  try {
    const query = `
      SELECT 
        r.status,
        COUNT(*) as quantidade
      FROM reservas r
      GROUP BY r.status
    `;

    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar dados de reservas:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Buscar dados do ranking (para preview)
router.get('/ranking/data', verifyAdmin, async (req, res) => {
  try {
    const query = `
      SELECT 
        COUNT(*) as total_alunos,
        SUM(total_livros_lidos) as total_livros_lidos,
        AVG(total_livros_lidos) as media_livros
      FROM aluno
    `;

    const result = await pool.query(query);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao buscar dados de ranking:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

module.exports = router;
