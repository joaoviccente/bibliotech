const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  try {
    // Limpeza dos dados existentes (opcional - descomente se quiser resetar)
    // await prisma.reservas.deleteMany();
    // await prisma.pendencias.deleteMany();
    // await prisma.livro.deleteMany();
    // await prisma.aluno.deleteMany();
    // await prisma.admin.deleteMany();

    // 1. ADMINISTRADORES/BIBLIOTECÁRIOS
    const adminPassword = await bcrypt.hash('admin123', 10);
    
    await prisma.admin.createMany({
      data: [
        {
          nome: 'Bibliotecária Principal',
          senha: adminPassword,
        },
      ],
      skipDuplicates: true,
    });

    // 2. ALUNOS (sem senha - irão criar via matrícula)
    await prisma.aluno.createMany({
      data: [
        {
          matricula: '2024001',
          nome: 'Milena Chaves',
          curso: 'Administração',
          total_livros_lidos: 23,
          genero_mais_lido: 'Tech',
        },
        {
          matricula: '2024002', 
          nome: 'João Vicente',
          curso: 'Informática',
          total_livros_lidos: 17,
          genero_mais_lido: 'Educacional',
        },
        {
          matricula: '2024003',
          nome: 'Iago Farias', 
          curso: 'Informática',
          total_livros_lidos: 12,
          genero_mais_lido: 'Educacional',
        },
        {
          matricula: '2024004',
          nome: 'Igor Farias',
          curso: 'Enfermagem', 
          total_livros_lidos: 12,
          genero_mais_lido: 'Tech',
        },
        {
          matricula: '2024005',
          nome: 'André Melo',
          curso: 'Informática',
          total_livros_lidos: 10,
          genero_mais_lido: 'Tech',
        },
        {
          matricula: '2024006',
          nome: 'Matheus Silva',
          curso: 'Administração',
          total_livros_lidos: 10,
          genero_mais_lido: 'Tech',
        },
        {
          matricula: '2024007',
          nome: 'Ana Carolina',
          curso: 'Enfermagem',
          total_livros_lidos: 8,
          genero_mais_lido: 'Educacional',
        },
        {
          matricula: '2024008',
          nome: 'Pedro Santos',
          curso: 'Edificações',
          total_livros_lidos: 7,
          genero_mais_lido: 'Tech',
        },
        {
          matricula: '2024009',
          nome: 'Mariana Costa',
          curso: 'Informática',
          total_livros_lidos: 6,
          genero_mais_lido: 'Literatura',
        },
        {
          matricula: '2024010',
          nome: 'Lucas Oliveira',
          curso: 'Administração',
          total_livros_lidos: 5,
          genero_mais_lido: 'Educacional',
        }
      ],
      skipDuplicates: true,
    });

    // 3. LIVROS
    await prisma.livro.createMany({
      data: [
        // Tech
        {
          nome: 'Arquitetura Limpa',
          autor: 'Robert C. Martin',
          genero: 'Tech',
          quantidade_total: 15,
          quantidade_disponivel: 15,
          quantidade_alugada: 0,
        },
        {
          nome: 'Clean Code',
          autor: 'Robert C. Martin', 
          genero: 'Tech',
          quantidade_total: 10,
          quantidade_disponivel: 10,
          quantidade_alugada: 0,
        },
        {
          nome: 'Aprenda C#',
          autor: 'Microsoft Press',
          genero: 'Tech',
          quantidade_total: 8,
          quantidade_disponivel: 8,
          quantidade_alugada: 0,
        },
        {
          nome: 'POO - Programação Orientada a Objetos',
          autor: 'João Silva',
          genero: 'Tech',
          quantidade_total: 12,
          quantidade_disponivel: 12,
          quantidade_alugada: 0,
        },
        {
          nome: 'Algoritmos e Estruturas de Dados',
          autor: 'Thomas H. Cormen',
          genero: 'Tech',
          quantidade_total: 7,
          quantidade_disponivel: 7,
          quantidade_alugada: 0,
        },

        // Educacional/Didático
        {
          nome: 'Calcule Mais',
          autor: 'Maria Educadora',
          genero: 'Educacional',
          quantidade_total: 20,
          quantidade_disponivel: 20,
          quantidade_alugada: 0,
        },
        {
          nome: 'Fundamentos da Física',
          autor: 'David Halliday',
          genero: 'Educacional',
          quantidade_total: 15,
          quantidade_disponivel: 15,
          quantidade_alugada: 0,
        },
        {
          nome: 'Química Geral',
          autor: 'John McMurry',
          genero: 'Educacional',
          quantidade_total: 10,
          quantidade_disponivel: 10,
          quantidade_alugada: 0,
        },
        {
          nome: 'Matemática Básica',
          autor: 'Antonio Carlos',
          genero: 'Educacional',
          quantidade_total: 25,
          quantidade_disponivel: 25,
          quantidade_alugada: 0,
        },

        // Literatura
        {
          nome: 'Dom Casmurro',
          autor: 'Machado de Assis',
          genero: 'Literatura',
          quantidade_total: 12,
          quantidade_disponivel: 12,
          quantidade_alugada: 0,
        },
        {
          nome: 'O Cortiço',
          autor: 'Aluísio Azevedo',
          genero: 'Literatura',
          quantidade_total: 8,
          quantidade_disponivel: 8,
          quantidade_alugada: 0,
        },
        {
          nome: 'O Pequeno Príncipe',
          autor: 'Antoine de Saint-Exupéry',
          genero: 'Literatura',
          quantidade_total: 15,
          quantidade_disponivel: 15,
          quantidade_alugada: 0,
        },

        // Romance
        {
          nome: 'Orgulho e Preconceito',
          autor: 'Jane Austen',
          genero: 'Romance',
          quantidade_total: 6,
          quantidade_disponivel: 6,
          quantidade_alugada: 0,
        },
        {
          nome: 'Como Eu Era Antes de Você',
          autor: 'Jojo Moyes',
          genero: 'Romance',
          quantidade_total: 8,
          quantidade_disponivel: 8,
          quantidade_alugada: 0,
        },

        // Ação
        {
          nome: 'O Código Da Vinci',
          autor: 'Dan Brown',
          genero: 'Ação',
          quantidade_total: 5,
          quantidade_disponivel: 5,
          quantidade_alugada: 0,
        },
        {
          nome: 'Jogos Vorazes',
          autor: 'Suzanne Collins',
          genero: 'Ação',
          quantidade_total: 7,
          quantidade_disponivel: 7,
          quantidade_alugada: 0,
        },

        // Comédia
        {
          nome: 'O Guia do Mochileiro das Galáxias',
          autor: 'Douglas Adams',
          genero: 'Comédia',
          quantidade_total: 4,
          quantidade_disponivel: 4,
          quantidade_alugada: 0,
        },
        {
          nome: 'Bridget Jones - O Diário de uma Paixão',
          autor: 'Helen Fielding',
          genero: 'Comédia',
          quantidade_total: 6,
          quantidade_disponivel: 6,
          quantidade_alugada: 0,
        },

        // Administração
        {
          nome: 'Gestão de Projetos',
          autor: 'Ricardo Vargas',
          genero: 'Administração',
          quantidade_total: 10,
          quantidade_disponivel: 10,
          quantidade_alugada: 0,
        },
        {
          nome: 'Princípios de Marketing',
          autor: 'Philip Kotler',
          genero: 'Administração',
          quantidade_total: 8,
          quantidade_disponivel: 8,
          quantidade_alugada: 0,
        },

        // Enfermagem
        {
          nome: 'Fundamentos de Enfermagem',
          autor: 'Patricia A. Potter',
          genero: 'Enfermagem',
          quantidade_total: 12,
          quantidade_disponivel: 12,
          quantidade_alugada: 0,
        },
        {
          nome: 'Anatomia e Fisiologia Humana',
          autor: 'Elaine N. Marieb',
          genero: 'Enfermagem',
          quantidade_total: 9,
          quantidade_disponivel: 9,
          quantidade_alugada: 0,
        },

        // Edificações
        {
          nome: 'Materiais de Construção',
          autor: 'L.A. Falcão Bauer',
          genero: 'Edificações',
          quantidade_total: 6,
          quantidade_disponivel: 6,
          quantidade_alugada: 0,
        },
        {
          nome: 'Resistência dos Materiais',
          autor: 'Ferdinand Beer',
          genero: 'Edificações',
          quantidade_total: 8,
          quantidade_disponivel: 8,
          quantidade_alugada: 0,
        }
      ],
      skipDuplicates: true,
    });

    // 4. CRIAR ALGUMAS RESERVAS PARA DEMONSTRAÇÃO
    
    // Buscar alguns alunos e livros para criar reservas
    const alunos = await prisma.aluno.findMany({ take: 5 });
    const livros = await prisma.livro.findMany({ take: 8 });

    if (alunos.length > 0 && livros.length > 0) {
      // Reservas ativas
      await prisma.reservas.createMany({
        data: [
          {
            id_aluno: alunos[0].id_aluno,
            id_livro: livros[0].id_livro,
            data_devolucao_prevista: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 dias
            status: 'reservado',
          },
          {
            id_aluno: alunos[1].id_aluno,
            id_livro: livros[1].id_livro,
            data_devolucao_prevista: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 dias
            status: 'emprestado',
          },
          {
            id_aluno: alunos[2].id_aluno,
            id_livro: livros[2].id_livro,
            data_devolucao_prevista: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 dias atrás (atrasado)
            status: 'emprestado',
          },
          {
            id_aluno: alunos[0].id_aluno,
            id_livro: livros[3].id_livro,
            data_devolucao_prevista: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Concluído
            status: 'devolvido',
          },
          {
            id_aluno: alunos[1].id_aluno,
            id_livro: livros[4].id_livro,
            data_devolucao_prevista: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // Concluído
            status: 'devolvido',
          }
        ],
        skipDuplicates: true,
      });

    }
  } catch (error) {
    console.error('❌ Erro durante o seed:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error('❌ Erro fatal no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 