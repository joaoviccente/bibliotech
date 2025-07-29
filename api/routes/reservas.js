const express = require("express");
const pool = require("../config/database");
const { authMiddleware, isAluno } = require("../middleware/auth");
const router = express.Router();

// Cancelar reserva
router.delete("/cancelar/:id", authMiddleware, isAluno, async (req, res) => {
  try {
    const { id } = req.params;
    const id_aluno = req.user.id;

    // Verificar se a reserva existe e pertence ao usuário
    const reservaResult = await pool.query(
      `
      SELECT * FROM reservas 
      WHERE id_reserva = $1 AND id_aluno = $2 AND status = 'reservado'
    `,
      [id, id_aluno]
    );

    if (reservaResult.rows.length === 0) {
      return res
        .status(404)
        .json({ message: "Reserva não encontrada ou não pode ser cancelada" });
    }

    const reserva = reservaResult.rows[0];

    // Iniciar transação
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      // Cancelar reserva
      await client.query(
        `
        UPDATE reservas 
        SET status = 'cancelado', data_devolucao = NOW() 
        WHERE id_reserva = $1
      `,
        [id]
      );

      // Aumentar quantidade disponível e decrementar quantidade alugada
      await client.query(
        `
        UPDATE livro 
        SET quantidade_disponivel = quantidade_disponivel + 1,
            quantidade_alugada = quantidade_alugada - 1,
            disponibilidade = true
        WHERE id_livro = $1
      `,
        [reserva.id_livro]
      );

      await client.query("COMMIT");

      res.json({ message: "Reserva cancelada com sucesso!" });
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Erro ao cancelar reserva:", error);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
});

// Renovar empréstimo
router.put("/renovar/:id", authMiddleware, isAluno, async (req, res) => {
  try {
    const { id } = req.params;
    const id_aluno = req.user.id;

    // Verificar se a reserva existe, pertence ao usuário e está emprestada
    const reservaResult = await pool.query(
      `
      SELECT * FROM reservas 
      WHERE id_reserva = $1 AND id_aluno = $2 AND status = 'emprestado'
    `,
      [id, id_aluno]
    );

    if (reservaResult.rows.length === 0) {
      return res
        .status(404)
        .json({
          message: "Empréstimo não encontrado ou não pode ser renovado",
        });
    }

    const reserva = reservaResult.rows[0];

    // Verificar se não está em atraso
    const hoje = new Date();
    const dataVencimento = new Date(reserva.data_vencimento);

    if (hoje > dataVencimento) {
      return res
        .status(400)
        .json({ message: "Não é possível renovar um empréstimo em atraso" });
    }

    // Calcular nova data de vencimento (15 dias a partir de hoje)
    const novaDataVencimento = new Date();
    novaDataVencimento.setDate(novaDataVencimento.getDate() + 15);

    // Atualizar data de vencimento
    await pool.query(
      `
      UPDATE reservas 
      SET data_vencimento = $1 
      WHERE id_reserva = $2
    `,
      [novaDataVencimento, id]
    );

    res.json({
      message: "Empréstimo renovado com sucesso!",
      nova_data_vencimento: novaDataVencimento,
    });
  } catch (error) {
    console.error("Erro ao renovar empréstimo:", error);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
});

router.get("/qtd-pendencias", authMiddleware, async (req, res) => {
  try {
    const livrosPendentes = await this.prisma.reservas.findMany();

    let qtd = 0;

    for (const reserva of livrosPendentes) {
      if (reserva.status === "pendente") {
        qtd++;
      }
    }

    res.json({ quantidade: qtd });
  } catch (error) {
    console.error("Erro ao contar pendências:", error);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
});

module.exports = router;
