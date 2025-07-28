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
console.log('Iniciando carregamento das rotas...');

const authRoutes = require('./routes/auth');
console.log('✅ authRoutes carregado');

const alunosRoutes = require('./routes/alunos');
console.log('✅ alunosRoutes carregado');

const livrosRoutes = require('./routes/livros');
console.log('✅ livrosRoutes carregado');

const reservasRoutes = require('./routes/reservas');
console.log('✅ reservasRoutes carregado');

const adminRoutes = require('./routes/admin');
console.log('✅ adminRoutes carregado');

const relatoriosRoutes = require('./routes/relatorios');
console.log('✅ relatoriosRoutes carregado');

console.log('Rotas importadas com sucesso!');

// Usar rotas
app.use('/api/auth', authRoutes);
console.log('✅ Rota /api/auth configurada');

app.use('/api/alunos', alunosRoutes);
console.log('✅ Rota /api/alunos configurada');

app.use('/api/livros', livrosRoutes);
console.log('✅ Rota /api/livros configurada');

app.use('/api/reservas', reservasRoutes);
console.log('✅ Rota /api/reservas configurada');

app.use('/api/admin', adminRoutes);
console.log('✅ Rota /api/admin configurada');

app.use('/api/admin/relatorios', relatoriosRoutes);
console.log('✅ Rota /api/admin/relatorios configurada');

console.log('Rotas configuradas!');

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
