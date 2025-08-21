const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

// Teste de conexão
prisma.$connect()
  .then(() => {
    console.log('✅ Conectado ao PostgreSQL via Prisma');
  })
  .catch((err) => {
    console.error('❌ Erro na conexão com PostgreSQL via Prisma:', err);
    process.exit(-1);
  });

process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

module.exports = prisma; 