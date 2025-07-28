const jwt = require('jsonwebtoken');
const pool = require('../config/database');

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Token de acesso requerido' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'bibliotech_secret_key');
    
    // Verificar se o usuário ainda existe no banco
    let user;
    if (decoded.userType === 'aluno') {
      const result = await pool.query('SELECT * FROM aluno WHERE id_aluno = $1', [decoded.id]);
      user = result.rows[0];
    } else if (decoded.userType === 'admin') {
      const result = await pool.query('SELECT * FROM admin WHERE id_admin = $1', [decoded.id]);
      user = result.rows[0];
    }

    if (!user) {
      return res.status(401).json({ message: 'Usuário não encontrado' });
    }

    req.user = {
      id: decoded.userType === 'aluno' ? user.id_aluno : user.id_admin,
      userType: decoded.userType,
      ...user
    };
    
    next();
  } catch (error) {
    console.error('Erro na autenticação:', error);
    res.status(401).json({ message: 'Token inválido' });
  }
};

// Middleware para verificar se é aluno
const isAluno = (req, res, next) => {
  if (req.user.userType !== 'aluno') {
    return res.status(403).json({ message: 'Acesso restrito a alunos' });
  }
  next();
};

// Middleware para verificar se é admin
const isAdmin = (req, res, next) => {
  if (req.user.userType !== 'admin') {
    return res.status(403).json({ message: 'Acesso restrito a administradores' });
  }
  next();
};

module.exports = { authMiddleware, isAluno, isAdmin };
