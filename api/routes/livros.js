const express = require("express");
const prisma = require("../config/prisma");
const { authMiddleware, isAluno } = require("../middleware/auth");
const router = express.Router();

// Buscar todos os livros (com opção de filtrar por disponibilidade)
router.get("/disponiveis", authMiddleware, async (req, res) => {
  try {
    const { disponivel_apenas } = req.query;

    let whereClause = { disponibilidade: true };

    // Se o parâmetro disponivel_apenas for 'true', filtrar apenas livros com quantidade > 0
    if (disponivel_apenas === "false") {
      whereClause.quantidade_disponivel = { gt: 0 };
    }

    const livros = await prisma.livro.findMany({
      where: whereClause,
      select: {
        id_livro: true,
        nome: true,
        autor: true,
        genero: true,
        quantidade_total: true,
        quantidade_disponivel: true,
        disponibilidade: true,
      },
      orderBy: { nome: "asc" },
    });

    res.json(livros);
  } catch (error) {
    console.error("Erro ao buscar livros disponíveis:", error);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
});

// Buscar livro por ID
router.get("/id/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const livro = await prisma.livro.findUnique({
      where: { id_livro: parseInt(id) },
    });

    if (!livro) {
      return res.status(404).json({ message: "Livro não encontrado" });
    }

    res.json(livro);
  } catch (error) {
    console.error("Erro ao buscar livro:", error);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
});

// Reservar livro
router.post("/reservar", authMiddleware, isAluno, async (req, res) => {
  try {
    const { id_livro } = req.body;
    const id_aluno = req.user.id;

    if (!id_livro) {
      return res.status(400).json({ message: "ID do livro é obrigatório" });
    }

    // Verificar se o livro existe e está disponível
    const livro = await prisma.livro.findUnique({
      where: { id_livro: parseInt(id_livro) },
    });

    if (!livro) {
      return res.status(404).json({ message: "Livro não encontrado" });
    }

    if (!livro.disponibilidade || livro.quantidade_disponivel <= 0) {
      return res
        .status(400)
        .json({ message: "Livro não disponível para reserva" });
    }

    // Verificar se o aluno já possui uma reserva ativa para este livro
    const reservaExistente = await prisma.reservas.findFirst({
      where: {
        id_aluno: parseInt(id_aluno),
        id_livro: parseInt(id_livro),
        status: {
          in: ["reservado", "emprestado"],
        },
      },
    });

    if (reservaExistente) {
      return res
        .status(400)
        .json({ message: "Você já possui uma reserva ativa para este livro" });
    }

    // Usar transação do Prisma
    const resultado = await prisma.$transaction(async (tx) => {
      // Criar reserva
      const reserva = await tx.reservas.create({
        data: {
          id_aluno: parseInt(id_aluno),
          id_livro: parseInt(id_livro),
          data_devolucao_prevista: new Date(
            Date.now() + 7 * 24 * 60 * 60 * 1000
          ), // 7 dias
          status: "reservado",
        },
      });

      // Atualizar livro
      const novaQuantidadeDisponivel = livro.quantidade_disponivel - 1;
      await tx.livro.update({
        where: { id_livro: parseInt(id_livro) },
        data: {
          quantidade_disponivel: novaQuantidadeDisponivel,
          quantidade_alugada: livro.quantidade_alugada + 1,
          disponibilidade: novaQuantidadeDisponivel > 0,
        },
      });

      return reserva;
    });

    res.status(201).json({
      message: "Livro reservado com sucesso!",
      reserva: resultado,
    });
  } catch (error) {
    console.error("Erro ao reservar livro:", error);
    res.status(500).json({
      message: "Erro interno do servidor",
      error: error.message,
    });
  }
});

// Buscar histórico de livros do usuário
router.get("/meu-historico", authMiddleware, isAluno, async (req, res) => {
  try {
    const id_aluno = req.user.id;

    const reservas = await prisma.reservas.findMany({
      where: { id_aluno: parseInt(id_aluno) },
      include: {
        livro: {
          select: {
            nome: true,
            autor: true,
            genero: true,
          },
        },
      },
      orderBy: { data_reserva: "desc" },
    });

    const historico = reservas.map((reserva) => ({
      id_reserva: reserva.id_reserva,
      data_reserva: reserva.data_reserva,
      data_devolucao_prevista: reserva.data_devolucao_prevista,
      status: reserva.status,
      created_at: reserva.created_at,
      nome_livro: reserva.livro.nome,
      autor_livro: reserva.livro.autor,
      genero_livro: reserva.livro.genero,
    }));

    res.json(historico);
  } catch (error) {
    console.error("Erro ao buscar histórico:", error);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
});

router.get("/qtd-livros", authMiddleware, async (req, res) => {
  try {
    const livros = await prisma.livro.findMany();

    const quantity = livros.length;

    res.json({quantity});
  } catch (error) {
    console.error("Erro ao buscar alunos:", error);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
});

router.get("/qtd-livros/emprestados", authMiddleware, async (req, res) => {
  try {
    const livros = await prisma.livro.findMany();

    // Soma todas as quantidades alugadas (caso o campo esteja presente)
    const totalEmprestados = livros.reduce((total, livro) => {
      return total + (livro.quantidade_alugada || 0);
    }, 0);

    res.json({ totalEmprestados });
  } catch (error) {
    console.error("Erro ao buscar livros:", error);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
});


// Marcar livro como concluído
router.patch(
  "/concluir/:id_reserva",
  authMiddleware,
  isAluno,
  async (req, res) => {
    try {
      const { id_reserva } = req.params;
      const id_aluno = req.user.id;

      // Verificar se a reserva existe e pertence ao aluno
      const reserva = await prisma.reservas.findFirst({
        where: {
          id_reserva: parseInt(id_reserva),
          id_aluno: parseInt(id_aluno),
          status: {
            in: ["reservado", "emprestado"],
          },
        },
      });

      if (!reserva) {
        return res
          .status(404)
          .json({ message: "Reserva não encontrada ou já foi processada" });
      }

      // Usar transação do Prisma
      await prisma.$transaction(async (tx) => {
        // Atualizar status da reserva para 'concluido'
        await tx.reservas.update({
          where: { id_reserva: parseInt(id_reserva) },
          data: { status: "concluido" },
        });

        // Atualizar estatísticas do aluno
        await tx.aluno.update({
          where: { id_aluno: parseInt(id_aluno) },
          data: {
            total_livros_lidos: {
              increment: 1,
            },
          },
        });
      });

      res.json({
        message:
          "Livro marcado como concluído com sucesso! Aguarde a devolução física para que o livro seja liberado.",
      });
    } catch (error) {
      console.error("Erro ao marcar livro como concluído:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  }
);

module.exports = router;
