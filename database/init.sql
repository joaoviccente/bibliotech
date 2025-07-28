-- BiblioTech Database Schema

-- Tabela de Administradores
CREATE TABLE IF NOT EXISTS admin (
    id_admin SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    senha VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Alunos
CREATE TABLE IF NOT EXISTS aluno (
    id_aluno SERIAL PRIMARY KEY,
    matricula VARCHAR(20) UNIQUE NOT NULL,
    senha VARCHAR(255),
    nome VARCHAR(100) NOT NULL,
    curso VARCHAR(100) NOT NULL,
    total_livros_alugados INTEGER DEFAULT 0,
    total_livros_lidos INTEGER DEFAULT 0,
    genero_mais_lido VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Livros
CREATE TABLE IF NOT EXISTS livro (
    id_livro SERIAL PRIMARY KEY,
    nome VARCHAR(200) NOT NULL,
    genero VARCHAR(50) NOT NULL,
    quantidade_disponivel INTEGER NOT NULL DEFAULT 0,
    quantidade_total INTEGER NOT NULL,
    quantidade_alugada INTEGER DEFAULT 0,
    autor VARCHAR(100) NOT NULL,
    disponibilidade BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Pendências
CREATE TABLE IF NOT EXISTS pendencias (
    id_pendencia SERIAL PRIMARY KEY,
    id_aluno INTEGER REFERENCES aluno(id_aluno) ON DELETE CASCADE,
    id_livro INTEGER REFERENCES livro(id_livro) ON DELETE CASCADE,
    curso_aluno VARCHAR(100) NOT NULL,
    ano INTEGER NOT NULL,
    nome_livro_pendente VARCHAR(200) NOT NULL,
    dias_atraso INTEGER DEFAULT 0,
    data_emprestimo DATE NOT NULL,
    data_devolucao_prevista DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'pendente', -- 'pendente', 'devolvido', 'atrasado'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Reservas (para gerenciar reservas de livros)
CREATE TABLE IF NOT EXISTS reservas (
    id_reserva SERIAL PRIMARY KEY,
    id_aluno INTEGER REFERENCES aluno(id_aluno) ON DELETE CASCADE,
    id_livro INTEGER REFERENCES livro(id_livro) ON DELETE CASCADE,
    data_reserva TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_devolucao_prevista DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'reservado', -- 'reservado', 'retirado', 'devolvido', 'cancelado'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Inserir dados iniciais para teste

-- Admin padrão
INSERT INTO admin (nome, senha) VALUES 
('Bibliotecário Principal', '$2b$10$example_hashed_password_here');

-- Alguns alunos de exemplo
INSERT INTO aluno (matricula, nome, curso) VALUES 
('2023001', 'João Silva', 'Informática'),
('2023002', 'Maria Santos', 'Administração'),
('2023003', 'Pedro Oliveira', 'Edificações'),
('2023004', 'Ana Costa', 'Enfermagem');

-- Alguns livros de exemplo
INSERT INTO livro (nome, genero, quantidade_disponivel, quantidade_total, autor) VALUES 
('Dom Casmurro', 'Literatura Brasileira', 3, 3, 'Machado de Assis'),
('O Cortiço', 'Literatura Brasileira', 2, 2, 'Aluísio Azevedo'),
('1984', 'Ficção Científica', 1, 1, 'George Orwell'),
('O Pequeno Príncipe', 'Infantil', 4, 4, 'Antoine de Saint-Exupéry'),
('Algoritmos e Estruturas de Dados', 'Técnico', 2, 2, 'Thomas H. Cormen'),
('Fundamentos de Enfermagem', 'Técnico', 3, 3, 'Patricia A. Potter'),
('Gestão de Projetos', 'Administração', 2, 2, 'Ricardo Vargas'),
('Materiais de Construção', 'Técnico', 1, 1, 'L.A. Falcão Bauer');

-- Índices para otimização
CREATE INDEX IF NOT EXISTS idx_aluno_matricula ON aluno(matricula);
CREATE INDEX IF NOT EXISTS idx_livro_disponibilidade ON livro(disponibilidade);
CREATE INDEX IF NOT EXISTS idx_reservas_status ON reservas(status);
CREATE INDEX IF NOT EXISTS idx_pendencias_status ON pendencias(status);
