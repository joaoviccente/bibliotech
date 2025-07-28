# Integração do Prisma no Projeto BiblioTech

## Visão Geral

Este documento descreve a integração do Prisma ORM no projeto BiblioTech, substituindo a configuração manual do PostgreSQL.

## Mudanças Implementadas

### 1. Instalação e Configuração

- **Dependências adicionadas:**
  - `prisma`: CLI e ferramentas do Prisma
  - `@prisma/client`: Cliente Prisma gerado

- **Arquivos criados:**
  - `prisma/schema.prisma`: Schema do banco de dados
  - `api/config/prisma.js`: Configuração do cliente Prisma
  - `.env`: Variáveis de ambiente (incluindo DATABASE_URL)

### 2. Schema do Prisma

O schema foi criado baseado na estrutura existente do banco:

```prisma
// Modelos principais
model Admin {
  id_admin   Int      @id @default(autoincrement())
  nome       String   @db.VarChar(100)
  senha      String   @db.VarChar(255)
  created_at DateTime @default(now()) @db.Timestamp(6)
}

model Aluno {
  id_aluno              Int      @id @default(autoincrement())
  matricula             String   @unique @db.VarChar(20)
  senha                 String?  @db.VarChar(255)
  nome                  String   @db.VarChar(100)
  curso                 String   @db.VarChar(100)
  total_livros_alugados Int      @default(0)
  total_livros_lidos    Int      @default(0)
  genero_mais_lido      String?  @db.VarChar(50)
  created_at            DateTime @default(now()) @db.Timestamp(6)

  // Relacionamentos
  pendencias Pendencias[]
  reservas   Reservas[]
}

model Livro {
  id_livro              Int      @id @default(autoincrement())
  nome                  String   @db.VarChar(200)
  genero                String   @db.VarChar(50)
  quantidade_disponivel Int      @default(0)
  quantidade_total      Int      @default(0)
  quantidade_alugada    Int      @default(0)
  autor                 String   @db.VarChar(100)
  disponibilidade       Boolean  @default(true)
  created_at            DateTime @default(now()) @db.Timestamp(6)

  // Relacionamentos
  pendencias Pendencias[]
  reservas   Reservas[]
}

model Pendencias {
  id_pendencia          Int      @id @default(autoincrement())
  id_aluno              Int
  id_livro              Int
  curso_aluno           String   @db.VarChar(100)
  ano                   Int
  nome_livro_pendente   String   @db.VarChar(200)
  dias_atraso           Int      @default(0)
  data_emprestimo       DateTime @db.Date
  data_devolucao_prevista DateTime @db.Date
  status                String   @default("pendente") @db.VarChar(20)
  created_at            DateTime @default(now()) @db.Timestamp(6)

  // Relacionamentos
  aluno Aluno @relation(fields: [id_aluno], references: [id_aluno], onDelete: Cascade)
  livro Livro @relation(fields: [id_livro], references: [id_livro], onDelete: Cascade)
}

model Reservas {
  id_reserva            Int      @id @default(autoincrement())
  id_aluno              Int
  id_livro              Int
  data_reserva          DateTime @default(now()) @db.Timestamp(6)
  data_devolucao_prevista DateTime @db.Date
  status                String   @default("reservado") @db.VarChar(20)
  created_at            DateTime @default(now()) @db.Timestamp(6)

  // Relacionamentos
  aluno Aluno @relation(fields: [id_aluno], references: [id_aluno], onDelete: Cascade)
  livro Livro @relation(fields: [id_livro], references: [id_livro], onDelete: Cascade)
}
```

### 3. Rotas Atualizadas

#### Autenticação (`api/routes/auth.js`)
- Login de aluno e admin
- Cadastro de senha
- Busca de aluno por matrícula

#### Alunos (`api/routes/alunos.js`)
- Ranking de estudantes
- Perfil do aluno
- Estatísticas do aluno

#### Livros (`api/routes/livros.js`)
- Buscar livros disponíveis
- Buscar livro por ID
- Reservar livro
- Histórico de livros
- Marcar livro como concluído

### 4. Benefícios da Migração

#### Vantagens do Prisma:
1. **Type Safety**: Tipagem automática baseada no schema
2. **Auto-completion**: IntelliSense melhorado no IDE
3. **Migrations**: Controle de versão do banco de dados
4. **Query Builder**: Sintaxe mais limpa e legível
5. **Transações**: Suporte nativo a transações
6. **Relacionamentos**: Gerenciamento automático de relacionamentos
7. **Performance**: Otimizações automáticas de queries

#### Melhorias no Código:
- **Queries mais legíveis**: Substituição de SQL raw por Prisma queries
- **Transações mais seguras**: Uso de `$transaction` do Prisma
- **Menos código boilerplate**: Relacionamentos automáticos
- **Melhor tratamento de erros**: Tipagem forte reduz erros em runtime

### 5. Scripts NPM Adicionados

```json
{
  "prisma:generate": "prisma generate",
  "prisma:migrate": "prisma migrate dev",
  "prisma:studio": "prisma studio",
  "prisma:push": "prisma db push",
  "db:setup": "npm run prisma:generate && npm run prisma:push"
}
```

### 6. Configuração de Ambiente

O arquivo `.env` foi configurado com:

```env
DATABASE_URL="postgresql://postgres:biblioteca123@localhost:5432/bibliotech?schema=public"
POSTGRES_USER=postgres
POSTGRES_PASSWORD=biblioteca123
POSTGRES_DB=bibliotech
JWT_SECRET=your_jwt_secret_key_here
```

## Comandos Úteis

### Desenvolvimento
```bash
# Gerar cliente Prisma
npm run prisma:generate

# Aplicar mudanças no banco
npm run prisma:push

# Abrir Prisma Studio
npm run prisma:studio

# Configurar banco completo
npm run db:setup
```

### Migrações
```bash
# Criar nova migração
npx prisma migrate dev --name nome_da_migracao

# Aplicar migrações em produção
npx prisma migrate deploy

# Resetar banco (desenvolvimento)
npx prisma migrate reset
```

## Próximos Passos

1. **Migrar rotas restantes**: Admin, relatórios, etc.
2. **Implementar migrations**: Para controle de versão do banco
3. **Adicionar seeds**: Dados iniciais do sistema
4. **Configurar Prisma Studio**: Para administração visual do banco
5. **Otimizar queries**: Usar includes e selects apropriados
6. **Implementar cache**: Para queries frequentes

## Compatibilidade

- ✅ Banco de dados existente mantido
- ✅ API endpoints inalterados
- ✅ Frontend não afetado
- ✅ Docker Compose mantido
- ✅ Estrutura de pastas preservada

## Troubleshooting

### Problemas Comuns

1. **Erro de conexão**: Verificar DATABASE_URL no .env
2. **Schema não sincronizado**: Executar `npm run prisma:push`
3. **Cliente não gerado**: Executar `npm run prisma:generate`
4. **Tipos TypeScript**: O Prisma Client é gerado automaticamente

### Logs Úteis

O Prisma está configurado para logar queries:
```javascript
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});
```

## Conclusão

A integração do Prisma foi concluída com sucesso, mantendo toda a funcionalidade existente enquanto adiciona benefícios significativos em termos de desenvolvimento, manutenção e performance. O projeto agora está preparado para escalabilidade e manutenção a longo prazo. 