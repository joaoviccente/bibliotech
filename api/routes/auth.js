const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');
const router = express.Router();

// Login de aluno
router.post('/aluno/login', async (req, res) => {
  try {
    const { matricula, senha } = req.body;

    if (!matricula || !senha) {
      return res.status(400).json({ message: 'Matrícula e senha são obrigatórios' });
    }

    // Buscar aluno por matrícula
    const aluno = await prisma.aluno.findUnique({
      where: { matricula: matricula }
    });

    if (!aluno) {
      return res.status(401).json({ message: 'Matrícula não encontrada' });
    }

    if (!aluno.senha) {
      return res.status(401).json({ message: 'Senha não cadastrada. Acesse a página de cadastro de senha.' });
    }

    // Verificar senha
    const senhaValida = await bcrypt.compare(senha, aluno.senha);
    if (!senhaValida) {
      return res.status(401).json({ message: 'Senha incorreta' });
    }

    // Gerar token JWT
    const token = jwt.sign(
      { 
        id: aluno.id_aluno, 
        userType: 'aluno',
        matricula: aluno.matricula 
      },
      process.env.JWT_SECRET || 'bibliotech_secret_key',
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id_aluno: aluno.id_aluno,
        nome: aluno.nome,
        matricula: aluno.matricula,
        curso: aluno.curso,
        userType: 'aluno'
      }
    });

  } catch (error) {
    console.error('Erro no login do aluno:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Login de admin
router.post('/admin/login', async (req, res) => {
  try {
    const { nome, senha } = req.body;

    if (!nome || !senha) {
      return res.status(400).json({ message: 'Nome e senha são obrigatórios' });
    }

    // Buscar admin por nome
    const admin = await prisma.admin.findFirst({
      where: { nome: nome }
    });

    if (!admin) {
      return res.status(401).json({ message: 'Administrador não encontrado' });
    }

    // Verificar senha (temporário: aceitar senha simples para admin)
    let senhaValida = false;
    
    // Primeiro tenta bcrypt (para senhas hasheadas)
    try {
      senhaValida = await bcrypt.compare(senha, admin.senha);
    } catch (error) {
      // Se falhar, tenta comparação direta (para senhas não hasheadas)
      senhaValida = (senha === admin.senha);
    }
    
    // Se ainda não validou, tenta comparação direta
    if (!senhaValida) {
      senhaValida = (senha === admin.senha);
    }
    
    if (!senhaValida) {
      return res.status(401).json({ message: 'Senha incorreta' });
    }

    // Gerar token JWT
    const token = jwt.sign(
      { 
        id: admin.id_admin, 
        userType: 'admin',
        nome: admin.nome 
      },
      process.env.JWT_SECRET || 'bibliotech_secret_key',
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id_admin: admin.id_admin,
        nome: admin.nome,
        userType: 'admin'
      }
    });

  } catch (error) {
    console.error('Erro no login do admin:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Cadastrar senha do aluno
router.post('/aluno/cadastrar-senha', async (req, res) => {
  try {
    const { matricula, senha, confirmarSenha } = req.body;

    if (!matricula || !senha || !confirmarSenha) {
      return res.status(400).json({ message: 'Todos os campos são obrigatórios' });
    }

    if (senha !== confirmarSenha) {
      return res.status(400).json({ message: 'As senhas não coincidem' });
    }

    if (senha.length < 6) {
      return res.status(400).json({ message: 'A senha deve ter pelo menos 6 caracteres' });
    }

    // Buscar aluno por matrícula
    const aluno = await prisma.aluno.findUnique({
      where: { matricula: matricula }
    });

    if (!aluno) {
      return res.status(404).json({ message: 'Matrícula não encontrada' });
    }

    if (aluno.senha) {
      return res.status(400).json({ message: 'Senha já cadastrada para esta matrícula' });
    }

    // Criptografar senha
    const senhaCriptografada = await bcrypt.hash(senha, 12);

    // Atualizar senha no banco
    await prisma.aluno.update({
      where: { matricula: matricula },
      data: { senha: senhaCriptografada }
    });

    res.json({ message: 'Senha cadastrada com sucesso!' });

  } catch (error) {
    console.error('Erro ao cadastrar senha:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Buscar aluno por matrícula (para cadastro de senha)
router.get('/aluno/buscar/matricula/:matricula', async (req, res) => {
  try {
    const { matricula } = req.params;

    const aluno = await prisma.aluno.findUnique({
      where: { matricula: matricula },
      select: {
        id_aluno: true,
        nome: true,
        matricula: true,
        curso: true
      }
    });

    if (!aluno) {
      return res.status(404).json({ message: 'Matrícula não encontrada' });
    }

    res.json(aluno);

  } catch (error) {
    console.error('Erro ao buscar aluno:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

module.exports = router;
