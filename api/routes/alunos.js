const express = require("express");
const prisma = require("../config/prisma");
const { authMiddleware } = require("../middleware/auth");
const router = express.Router();

// Ranking de estudantes
router.get("/ranking", authMiddleware, async (req, res) => {
  try {
    const { periodo } = req.query;

    let dateFilter = {};

    // Filtrar por período (baseado na data de reserva dos livros concluídos)
    switch (periodo) {
      case "mes":
        dateFilter = {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        };
        break;
      case "trimestre":
        dateFilter = {
          gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
        };
        break;
      case "ano":
        dateFilter = {
          gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
        };
        break;
      case "geral":
      default:
        dateFilter = {};
        break;
    }

    const alunos = await prisma.aluno.findMany({
      select: {
        id_aluno: true,
        nome: true,
        matricula: true,
        curso: true,
        reservas: {
          where: {
            status: "concluido",
            data_reserva: dateFilter,
          },
          include: {
            livro: {
              select: {
                genero: true,
              },
            },
          },
        },
      },
    });

    // Processar dados para calcular estatísticas
    const ranking = alunos.map((aluno) => {
      const livrosLidos = aluno.reservas.length;
      const diasLendo = new Set(
        aluno.reservas.map((r) => r.data_reserva.toISOString().split("T")[0])
      ).size;

      // Calcular gênero favorito
      const generos = aluno.reservas.map((r) => r.livro.genero);
      const generoFavorito =
        generos.length > 0
          ? generos
              .sort(
                (a, b) =>
                  generos.filter((v) => v === a).length -
                  generos.filter((v) => v === b).length
              )
              .pop()
          : "Literatura Brasileira";

      return {
        id_aluno: aluno.id_aluno,
        nome: aluno.nome,
        matricula: aluno.matricula,
        curso: aluno.curso,
        livros_lidos: livrosLidos,
        dias_lendo: diasLendo,
        genero_favorito: generoFavorito,
      };
    });

    // Ordenar por livros lidos e dias lendo
    ranking.sort((a, b) => {
      if (b.livros_lidos !== a.livros_lidos) {
        return b.livros_lidos - a.livros_lidos;
      }
      return b.dias_lendo - a.dias_lendo;
    });

    res.json(ranking.slice(0, 50));
  } catch (error) {
    console.error("Erro ao buscar ranking:", error);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
});

// Buscar perfil do aluno atual
router.get("/perfil", authMiddleware, async (req, res) => {
  try {
    const id_aluno = req.user.id;

    const aluno = await prisma.aluno.findUnique({
      where: { id_aluno: parseInt(id_aluno) },
      include: {
        reservas: {
          include: {
            livro: {
              select: {
                genero: true,
              },
            },
          },
        },
      },
    });

    if (!aluno) {
      return res.status(404).json({ message: "Aluno não encontrado" });
    }

    // Calcular estatísticas
    const totalLivrosLidos = aluno.reservas.filter(
      (r) => r.status === "concluido"
    ).length;
    const livrosAtivos = aluno.reservas.filter((r) =>
      ["reservado", "emprestado"].includes(r.status)
    ).length;

    // Calcular gênero mais lido
    const generos = aluno.reservas
      .filter((r) => r.status === "concluido")
      .map((r) => r.livro.genero);

    const generoMaisLido =
      generos.length > 0
        ? generos
            .sort(
              (a, b) =>
                generos.filter((v) => v === a).length -
                generos.filter((v) => v === b).length
            )
            .pop()
        : "Literatura Brasileira";

    res.json({
      id_aluno: aluno.id_aluno,
      nome: aluno.nome,
      matricula: aluno.matricula,
      curso: aluno.curso,
      total_livros_lidos: totalLivrosLidos,
      livros_ativos: livrosAtivos,
      genero_mais_lido: generoMaisLido,
    });
  } catch (error) {
    console.error("Erro ao buscar perfil:", error);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
});

// Buscar estatísticas do aluno atual
router.get("/estatisticas", authMiddleware, async (req, res) => {
  try {
    const id_aluno = req.user.id;

    const aluno = await prisma.aluno.findUnique({
      where: { id_aluno: parseInt(id_aluno) },
      include: {
        reservas: {
          include: {
            livro: {
              select: {
                genero: true,
              },
            },
          },
        },
      },
    });

    if (!aluno) {
      return res.json({
        livros_lidos: 0,
        livros_reservados: 0,
        genero_favorito: "Literatura Brasileira",
      });
    }

    // Calcular estatísticas
    const livrosLidos = aluno.reservas.filter(
      (r) => r.status === "concluido"
    ).length;
    const livrosReservados = aluno.reservas.filter((r) =>
      ["reservado", "emprestado"].includes(r.status)
    ).length;

    // Calcular gênero favorito
    const generos = aluno.reservas
      .filter((r) => r.status === "concluido")
      .map((r) => r.livro.genero);

    const generoFavorito =
      generos.length > 0
        ? generos
            .sort(
              (a, b) =>
                generos.filter((v) => v === a).length -
                generos.filter((v) => v === b).length
            )
            .pop()
        : "Literatura Brasileira";

    res.json({
      livros_lidos: livrosLidos,
      livros_reservados: livrosReservados,
      genero_favorito: generoFavorito,
    });
  } catch (error) {
    console.error("Erro ao buscar estatísticas:", error);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
});

router.get("/alunos", authMiddleware, async (req, res) => {
  try {
    const alunos = await prisma.aluno.findMany({
      select: {
        id_aluno: true,
        nome: true,
        matricula: true,
        curso: true,
      },
    });

    const quantity = alunos.length;

    res.json(quantity);
  } catch (error) {
    console.error("Erro ao buscar alunos:", error);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
});

module.exports = router;
