<p align="center">
  <img src="public/logo.svg" width="120" alt="CondoGest Logo">
</p>

<h1 align="center">CondoGest — Sistema de Gestão Condominial SaaS</h1>

<p align="center">
  Plataforma multi-tenant de gestão financeira e operacional para condomínios,<br/>
  com módulos de finanças, Kanban e controle de acesso por papéis (RBAC).
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#tech-stack">Stack</a> •
  <a href="#setup-local">Setup</a> •
  <a href="#estrutura-de-pastas">Estrutura</a> •
  <a href="#segurança">Segurança</a> •
  <a href="#regras-de-negócio">Regras de Negócio</a> •
  <a href="#deploy">Deploy</a>
</p>

---

## Visão Geral

O **CondoGest** é um SaaS de gestão condominial projetado para ser escalável, seguro e fácil de usar. Ele permite que síndicos, administradores e moradores gerenciem finanças, tarefas e comunicação em um único local, com isolamento total de dados entre condomínios (multi-tenant via Row Level Security do PostgreSQL).

**Público-alvo:** Administradoras de condomínios, síndicos profissionais e condomínios autogeridos.

---

## Features

### 💰 Módulo Financeiro
- **Lançamentos completos**: Receitas e despesas com categorias e centros de custo
- **Rateio condominial**: Por unidade, por fração ideal ou igualitário
- **Inadimplência**: Cálculo automático de multa (2%) e juros (0,033%/dia)
- **Relatórios**: Fluxo de caixa mensal, despesas por categoria, previsto × realizado
- **Vinculação a unidades**: Associe lançamentos a apartamentos/casas

### 🧩 Módulo Kanban
- **Quadros personalizáveis**: Crie quantos quadros precisar
- **Drag & Drop fluido**: Arraste cartões entre listas com @dnd-kit
- **Checklists e progresso**: Acompanhe subtarefas
- **Comentários**: Colaboração em cada cartão
- **Responsáveis**: Atribua tarefas a usuários

### 🔗 Integração Financeiro ↔ Kanban
- Vincule cartões a lançamentos financeiros
- **Sincronização automática via triggers**:
  - Cartão concluído → Despesa marcada como paga
  - Lançamento atrasado → Cartão vira urgente
- Indicadores visuais de status financeiro nos cartões

### 🔐 RBAC (Controle de Acesso por Papéis)

| Role               | Descrição                           | Nível |
|---------------------|-------------------------------------|-------|
| `ADMIN_SAAS`        | Acesso total a todos os condomínios | 100   |
| `ADMIN_CONDOMINIO`  | Gestão completa do condomínio       | 80    |
| `SINDICO`           | Gestão operacional e financeira     | 60    |
| `CONSELHEIRO`       | Visualização e aprovação de contas  | 40    |
| `MORADOR`           | Somente leitura                     | 20    |
| `PRESTADOR`         | Acesso restrito a tarefas           | 10    |

### 📊 Dashboard
- Cards de métricas financeiras em tempo real
- Gráficos interativos (Recharts)
- Indicadores de inadimplência
- Resumo de tarefas pendentes

---

## Tech Stack

### Frontend
| Tecnologia | Uso |
|---|---|
| **Next.js 16** (App Router) | Framework React com SSR/SSG |
| **TypeScript** | Tipagem estática |
| **Tailwind CSS 4** | Estilização utility-first |
| **Radix UI** | Componentes acessíveis (shadcn/ui style) |
| **Framer Motion** | Animações e transições |
| **@dnd-kit** | Drag & Drop do Kanban |
| **Recharts** | Gráficos e visualizações |
| **React Hook Form + Zod** | Formulários + validação de schemas |

### Backend / Infra
| Tecnologia | Uso |
|---|---|
| **Supabase** | PostgreSQL, Auth, Storage, RLS |
| **Next.js API Routes** | Endpoints REST (quando necessário) |
| **Row Level Security** | Isolamento multi-tenant no banco |
| **Supabase Auth** | Autenticação (JWT gerenciado) |

---

## Setup Local

### Pré-requisitos
- **Node.js** 18+ (recomendado 20 LTS)
- **npm** (incluso com Node) ou **pnpm**
- Conta no [Supabase](https://supabase.com)

### 1. Clonar o repositório

```bash
git clone https://github.com/seu-usuario/condominio-saas.git
cd condominio-saas
```

### 2. Instalar dependências

```bash
npm install
```

> **Nota:** O `node_modules/` **não** é versionado. Sempre execute `npm install` após clonar ou atualizar o repositório.

### 3. Configurar variáveis de ambiente

```bash
cp .env.local.example .env.local
```

Edite `.env.local` com suas credenciais do Supabase:

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key
```

### 4. Criar o banco de dados

1. Acesse o [Supabase Dashboard](https://supabase.com) → seu projeto
2. Vá em **SQL Editor**
3. Cole e execute o conteúdo de `supabase/migrations/001_initial_schema.sql`

### 5. Executar o projeto

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000).

---

## Scripts Disponíveis

| Comando | Descrição |
|---|---|
| `npm run dev` | Inicia o servidor de desenvolvimento |
| `npm run build` | Gera o build de produção |
| `npm start` | Executa o build de produção |
| `npm run lint` | Executa o linter (ESLint) |

---

## Estrutura de Pastas

```
condominio-saas/
├── public/                         # Arquivos estáticos (logo, favicon, etc.)
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql  # Schema completo do banco (DDL + RLS + triggers)
├── src/
│   ├── app/                        # Next.js App Router
│   │   ├── layout.tsx              # Layout raiz (providers globais)
│   │   ├── page.tsx                # Landing page
│   │   ├── login/                  # Tela de autenticação
│   │   ├── dashboard/              # Dashboard principal
│   │   ├── financeiro/             # Módulo financeiro
│   │   └── kanban/                 # Módulo Kanban
│   ├── components/
│   │   ├── ui/                     # Componentes primitivos (shadcn/ui style)
│   │   ├── layout/                 # Header, Sidebar, DashboardLayout
│   │   ├── dashboard/              # MetricCard, Charts, QuadrosResumo
│   │   ├── financeiro/             # LancamentosTable, FormDialog, Inadimplência
│   │   └── kanban/                 # KanbanBoard, Column, Card, CardDetail
│   ├── contexts/
│   │   ├── AuthContext.tsx          # Autenticação + RBAC
│   │   └── CondominioContext.tsx    # Seleção de condomínio ativo
│   ├── lib/
│   │   ├── constants.ts            # Configurações, cores, roles, estados
│   │   ├── utils.ts                # Utilitários (formatação, cálculos)
│   │   ├── validations.ts          # Schemas Zod (formulários)
│   │   └── supabase/
│   │       ├── client.ts           # Supabase client (browser)
│   │       ├── server.ts           # Supabase client (server)
│   │       └── middleware.ts       # Middleware de autenticação
│   └── types/
│       └── index.ts                # Types/Interfaces TypeScript
├── .env.local.example              # Template de variáveis de ambiente
├── .gitignore                      # Arquivos ignorados pelo Git
├── package.json                    # Dependências e scripts
├── tsconfig.json                   # Configuração TypeScript
└── README.md                       # Este arquivo
```

---

## Segurança

### Autenticação
- **Supabase Auth** gerencia sessões com JWT automaticamente
- Middleware do Next.js protege rotas server-side (`/dashboard`, `/financeiro`, `/kanban`)
- Redirecionamento automático: não autenticado → `/login`

### Autorização (RBAC)
- Hierarquia de papéis numérica (`ADMIN_SAAS: 100` → `PRESTADOR: 10`)
- `hasPermission(role)` no frontend para condicionar UI
- **RLS no PostgreSQL** garante enforcement server-side — não depende do frontend

### Isolamento Multi-tenant
- Todas as tabelas possuem `condominio_id` como chave de isolamento
- **Row Level Security (RLS)** ativada em todas as tabelas
- Função helper `get_user_condominio_id()` consulta o tenant do usuário logado
- Impossível acessar dados de outro condomínio, mesmo manipulando requisições

### Checklist de Segurança

- [x] RLS habilitado em todas as tabelas
- [x] Políticas RLS por papel (SELECT, INSERT, UPDATE, DELETE)
- [x] Middleware de autenticação no Next.js
- [x] Validação de dados com Zod no frontend
- [x] `SECURITY DEFINER` nas functions críticas
- [x] `SUPABASE_SERVICE_ROLE_KEY` nunca exposta ao browser
- [x] `CHECK (valor > 0)` no banco para valores financeiros
- [x] Trigger automático de multa/juros para lançamentos atrasados
- [x] Foreign keys com `ON DELETE CASCADE/RESTRICT` coerentes
- [x] Índices otimizados para queries frequentes
- [ ] Rate limiting na API (roadmap)
- [ ] Audit log completo para operações financeiras (parcial — tabela existe)
- [ ] HTTPS forçado em produção (via Vercel/infra)

---

## Regras de Negócio Financeiras

> Documentação completa em [`docs/REGRAS_FINANCEIRAS.md`](docs/REGRAS_FINANCEIRAS.md)

### Resumo

| Conceito | Descrição |
|---|---|
| **Receita** | Entrada de recursos (taxa condominial, aluguel de espaço, multas) |
| **Despesa** | Saída de recursos (manutenção, folha, concessionárias) |
| **Saldo** | `Σ Receitas pagas − Σ Despesas pagas` (calculado, não armazenado) |
| **Rateio** | Divisão de despesas entre unidades do condomínio |

### Modelos de Rateio
1. **Igualitário**: `Valor total ÷ Nº de unidades`
2. **Por fração ideal**: `Valor total × fração_ideal da unidade`
3. **Por unidade fixa**: Valor fixo definido manualmente

### Inadimplência
- **Multa**: 2% sobre o valor original (aplicada uma vez)
- **Juros**: 0,033% ao dia (≈ 1%/mês) calculados proporcionalmente
- **Valor total** = `valor + multa + juros` (coluna GENERATED no banco)

---

## Deploy

### Vercel (Recomendado)

1. Push do código para o GitHub
2. Conecte na [Vercel](https://vercel.com)
3. Configure as variáveis de ambiente (`.env.local` → Environment Variables)
4. Deploy automático a cada push!

### Docker

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
EXPOSE 3000
CMD ["node", "server.js"]
```

---

## Boas Práticas Adotadas

- ✅ **Separation of Concerns** — código organizado em camadas (UI, lógica, dados)
- ✅ **Type-safe** — TypeScript em todo o projeto
- ✅ **Validação dupla** — Zod no frontend + constraints no banco
- ✅ **Multi-tenant seguro** — RLS no PostgreSQL, não no application layer
- ✅ **RBAC hierárquico** — roles com níveis numéricos para fácil comparação
- ✅ **Triggers para consistência** — status de inadimplência e sync Kanban ↔ Financeiro
- ✅ **Clean Code** — funções pequenas, nomes descritivos, sem comentários óbvios
- ✅ **RESTful** — endpoints padronizados, status codes corretos
- ✅ **Componentes acessíveis** — Radix UI como base

---

## Roadmap

- [ ] App mobile (React Native)
- [ ] Notificações push
- [ ] Integração com boletos bancários (PIX/banco)
- [ ] Módulo de assembleias
- [ ] Chat entre moradores
- [ ] Reserva de áreas comuns
- [ ] Controle de portaria
- [ ] Rate limiting e audit log completo

---

## Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

<p align="center">
  Desenvolvido com ❤️ para modernizar a gestão condominial
</p>
