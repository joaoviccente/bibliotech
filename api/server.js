const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rota de teste básica
app.get('/api/health', (req, res) => {
  res.json({ 
    message: 'API BiblioTech funcionando!', 
    timestamp: new Date().toISOString(),
    status: 'ok'
  });
});

// Rota para testar conexão com banco
app.get('/api/test-db', async (req, res) => {
  try {
    const pool = require('./config/database');
    const result = await pool.query('SELECT NOW() as current_time');
    res.json({ 
      message: 'Conexão com PostgreSQL OK!', 
      timestamp: result.rows[0].current_time,
      status: 'connected'
    });
  } catch (error) {
    console.error('Erro ao conectar com o banco:', error);
    res.status(500).json({ 
      message: 'Erro de conexão com PostgreSQL', 
      error: error.message,
      status: 'error'
    });
  }
});

// Importar rotas
const authRoutes = require('./routes/auth');
const alunosRoutes = require('./routes/alunos');
const livrosRoutes = require('./routes/livros');
const reservasRoutes = require('./routes/reservas'); 
const adminRoutes = require('./routes/admin');
const relatoriosRoutes = require('./routes/relatorios');
// Usar rotas
app.use('/api/auth', authRoutes);
app.use('/api/alunos', alunosRoutes);
app.use('/api/livros', livrosRoutes);
app.use('/api/reservas', reservasRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin/relatorios', relatoriosRoutes);
// Middleware de tratamento de erros
app.use((err, req, res, next) => {
  console.error('Erro na API:', err);
  res.status(500).json({ 
    message: 'Erro interno do servidor',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor API rodando na porta ${PORT}`);
  console.log(`📍 URL: http://localhost:${PORT}`);
  console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
});

module.exports = app;
