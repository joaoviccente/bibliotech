-- CreateTable
CREATE TABLE "admin" (
    "id_admin" SERIAL NOT NULL,
    "nome" VARCHAR(100) NOT NULL,
    "senha" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admin_pkey" PRIMARY KEY ("id_admin")
);

-- CreateTable
CREATE TABLE "aluno" (
    "id_aluno" SERIAL NOT NULL,
    "matricula" VARCHAR(20) NOT NULL,
    "senha" VARCHAR(255),
    "nome" VARCHAR(100) NOT NULL,
    "curso" VARCHAR(100) NOT NULL,
    "total_livros_alugados" INTEGER NOT NULL DEFAULT 0,
    "total_livros_lidos" INTEGER NOT NULL DEFAULT 0,
    "genero_mais_lido" VARCHAR(50),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "aluno_pkey" PRIMARY KEY ("id_aluno")
);

-- CreateTable
CREATE TABLE "livro" (
    "id_livro" SERIAL NOT NULL,
    "nome" VARCHAR(200) NOT NULL,
    "genero" VARCHAR(50) NOT NULL,
    "quantidade_disponivel" INTEGER NOT NULL DEFAULT 0,
    "quantidade_total" INTEGER NOT NULL DEFAULT 0,
    "quantidade_alugada" INTEGER NOT NULL DEFAULT 0,
    "autor" VARCHAR(100) NOT NULL,
    "disponibilidade" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "livro_pkey" PRIMARY KEY ("id_livro")
);

-- CreateTable
CREATE TABLE "pendencias" (
    "id_pendencia" SERIAL NOT NULL,
    "id_aluno" INTEGER NOT NULL,
    "id_livro" INTEGER NOT NULL,
    "curso_aluno" VARCHAR(100) NOT NULL,
    "ano" INTEGER NOT NULL,
    "nome_livro_pendente" VARCHAR(200) NOT NULL,
    "dias_atraso" INTEGER NOT NULL DEFAULT 0,
    "data_emprestimo" DATE NOT NULL,
    "data_devolucao_prevista" DATE NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'pendente',
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pendencias_pkey" PRIMARY KEY ("id_pendencia")
);

-- CreateTable
CREATE TABLE "reservas" (
    "id_reserva" SERIAL NOT NULL,
    "id_aluno" INTEGER NOT NULL,
    "id_livro" INTEGER NOT NULL,
    "data_reserva" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data_devolucao_prevista" DATE NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'reservado',
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reservas_pkey" PRIMARY KEY ("id_reserva")
);

-- CreateIndex
CREATE UNIQUE INDEX "aluno_matricula_key" ON "aluno"("matricula");

-- AddForeignKey
ALTER TABLE "pendencias" ADD CONSTRAINT "pendencias_id_aluno_fkey" FOREIGN KEY ("id_aluno") REFERENCES "aluno"("id_aluno") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pendencias" ADD CONSTRAINT "pendencias_id_livro_fkey" FOREIGN KEY ("id_livro") REFERENCES "livro"("id_livro") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservas" ADD CONSTRAINT "reservas_id_aluno_fkey" FOREIGN KEY ("id_aluno") REFERENCES "aluno"("id_aluno") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservas" ADD CONSTRAINT "reservas_id_livro_fkey" FOREIGN KEY ("id_livro") REFERENCES "livro"("id_livro") ON DELETE CASCADE ON UPDATE CASCADE;
