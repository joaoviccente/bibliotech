const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.POSTGRES_USER || 'bibliotech_user',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.POSTGRES_DB || 'bibliotech_db',
  password: process.env.POSTGRES_PASSWORD || 'bibliotech_pass',
  port: process.env.DB_PORT || 5432,
});

// Teste de conexão
pool.on('connect', () => {
  console.log('✅ Conectado ao PostgreSQL');
});

pool.on('error', (err) => {
  console.error('❌ Erro na conexão com PostgreSQL:', err);
  process.exit(-1);
});

module.exports = pool;
