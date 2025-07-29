# BiblioTech - Sistema de Gerenciamento de Biblioteca Escolar

Sistema web desenvolvido para automatizar o processo de aluguel de livros em bibliotecas de escolas profissionais (EEEPs) do estado do Ceará, otimizando o trabalho dos bibliotecários e incentivando a leitura entre os alunos.

## 🚀 Tecnologias Utilizadas

- **Frontend**: Next.js 15 (App Router)
- **Linguagem**: JavaScript
- **Estilização**: Tailwind CSS
- **Banco de Dados**: PostgreSQL
- **Containerização**: Docker & Docker Compose
- **HTTP Client**: Axios
- **Versionamento**: Git

## 📋 Funcionalidades

### Para Alunos
- ✅ Cadastro de senha inicial
- ✅ Login seguro com matrícula e senha
- 📚 Busca e reserva de livros
- 📖 Visualização de "Meus Livros" (reservados/emprestados)
- 🏆 Ranking de leitores
- 📱 Interface responsiva e intuitiva

### Para Administradores/Bibliotecários
- ✅ Login administrativo
- 📊 Dashboard com estatísticas
- 📋 Gerenciamento de empréstimos e reservas
- 👥 Gestão de alunos
- 📚 Cadastro e controle de livros
- ⚠️ Controle de pendências e atrasos

## 🏗️ Arquitetura do Projeto

```
src/
├── app/                    # App Router (Next.js)
│   ├── login/             # Página de login
│   ├── cadastrar-senha/   # Cadastro de senha do aluno
│   ├── dashboard/         # Dashboard do aluno
│   ├── admin/             # Área administrativa
│   └── layout.js          # Layout principal
├── components/            # Componentes reutilizáveis
│   ├── Layout.js          # Layout base
│   ├── Loading.js         # Componentes de loading
│   └── Alert.js           # Sistema de alertas
└── services/              # Camada de serviços
    ├── api.js             # Configuração do Axios
    ├── alunos.service.js  # Serviços de alunos
    ├── livros.service.js  # Serviços de livros
    ├── auth.service.js    # Autenticação
    └── pendencias.service.js # Pendências
```

## 🗃️ Banco de Dados

### Entidades Principais

1. **Aluno**: Usuários estudantes do sistema
2. **Admin**: Administradores/bibliotecários
3. **Livro**: Acervo da biblioteca
4. **Reservas**: Controle de reservas de livros
5. **Pendências**: Registros de atrasos e pendências

## 🚀 Como Executar

### Pré-requisitos
- Node.js 18+ 
- Docker e Docker Compose
- Git

### Passo a Passo

1. **Clone o repositório**
```bash
git clone <repository-url>
cd projeto_web
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure o ambiente**
```bash
# O arquivo .env já está configurado com as credenciais padrão
# Verifique se as configurações estão corretas para seu ambiente
```

4. **Inicie o banco de dados**
```bash
docker-compose up -d database
```

5. **Execute a aplicação**
```bash
npm run dev
```

6. **Acesse o sistema**
- Aplicação: http://localhost:3000
- PgAdmin (opcional): http://localhost:8080

### Credenciais Padrão

**Administrador:**
- Nome: Bibliotecário Principal
- Senha: (configurar no banco)

**Alunos de Teste:**
- Matrícula: 2023001 (João Silva - Informática)
- Matrícula: 2023002 (Maria Santos - Administração)

## 🎨 Design System

O sistema segue os padrões visuais dos sistemas do Governo do Estado do Ceará:

- **Cores**: Paleta azul oficial das EEEPs
- **Tipografia**: Fonte Sans-serif limpa e legível
- **Layout**: Design clean e profissional
- **Responsividade**: Compatível com desktops e tablets

## 📊 Regras de Negócio

### Autenticação
- Alunos fazem login com matrícula e senha
- Primeiro acesso requer cadastro de senha
- Administradores usam nome de usuário e senha

### Reservas
- Livros só podem ser reservados se disponíveis
- Não é permitido reservar o mesmo livro duas vezes
- Status: reservado → retirado → devolvido

### Pendências
- Calculadas automaticamente baseado na data de devolução
- Alertas visuais para livros em atraso
- Histórico completo de empréstimos

## 🛠️ Scripts Disponíveis

```bash
npm run dev          # Desenvolvimento
npm run build        # Build de produção
npm run start        # Produção
npm run lint         # Verificação de código
```

## 🔧 Configuração do Docker

O arquivo `docker-compose.yml` inclui:
- **PostgreSQL**: Banco de dados principal
- **PgAdmin**: Interface web para administração do banco

## 📝 API Services

Todos os serviços estão organizados na pasta `src/services/`:
- **API Base**: Configuração centralizada do Axios
- **Interceptors**: Tratamento automático de tokens e erros
- **Serviços por Entidade**: Métodos organizados por funcionalidade

## 🔒 Segurança

- Autenticação baseada em JWT
- Validação de dados no frontend
- Sanitização de entradas
- Controle de acesso por tipo de usuário

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request
