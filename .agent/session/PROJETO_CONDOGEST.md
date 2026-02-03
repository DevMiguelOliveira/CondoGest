# CondoGest - Documentação de Desenvolvimento

**Última Atualização:** 2026-02-03 00:06
**Status:** MVP em Desenvolvimento

---

## 📋 Visão Geral do Projeto

### Objetivo
Criar um **SaaS completo para gestão condominial** inspirado no "Seu Condomínio", com módulos integrados de:
- **Financeiro**: Receitas, despesas, inadimplência com cálculo automático de multas/juros
- **Kanban**: Gestão visual de tarefas com drag & drop
- **Integração**: Sincronização automática entre financeiro e Kanban

### Stack Tecnológico
| Camada | Tecnologia |
|--------|------------|
| Framework | Next.js 14 (App Router) |
| Linguagem | TypeScript |
| Estilização | Tailwind CSS |
| Componentes | shadcn/ui + Radix UI |
| Animações | Framer Motion |
| Drag & Drop | @dnd-kit |
| Gráficos | Recharts |
| Formulários | React Hook Form + Zod |
| Backend | Supabase (PostgreSQL + Auth + Storage) |
| Segurança | Row Level Security (RLS) |

---

## 🏗️ Arquivos Criados

### Configuração
```
condominio-saas/
├── package.json                    # Dependências
├── .env.local                      # Variáveis de ambiente (local)
├── .env.local.example              # Template de variáveis
├── middleware.ts                   # Proteção de rotas Next.js
├── README.md                       # Documentação completa
└── supabase/
    └── migrations/
        └── 001_initial_schema.sql  # Schema completo do banco
```

### Biblioteca Core (`src/lib/`)
```
lib/
├── utils.ts                # Funções utilitárias
│   ├── cn()               - Merge de classes Tailwind
│   ├── formatCurrency()   - Formatação R$ brasileiro
│   ├── formatDate()       - Formatação de datas
│   ├── calculateLateFee() - Cálculo de multa/juros
│   ├── debounce()        - Debounce de funções
│   └── slugify()         - Slugificação de strings
│
├── constants.ts           # Constantes do sistema
│   ├── USER_ROLES        - Papéis com níveis hierárquicos
│   ├── LANCAMENTO_STATUS - Status financeiros com cores
│   ├── PRIORIDADE_CARTAO - Prioridades do Kanban
│   ├── CORES_CATEGORIAS  - Paleta de cores
│   └── ESTADOS_BRASIL    - Lista de estados
│
├── validations.ts         # Schemas Zod
│   ├── loginSchema
│   ├── cadastroSchema
│   ├── lancamentoSchema
│   ├── categoriaSchema
│   ├── quadroSchema
│   ├── listaSchema
│   ├── cartaoSchema
│   └── checklistSchema
│
└── supabase/
    ├── client.ts          # Cliente browser
    ├── server.ts          # Cliente server (SSR)
    └── middleware.ts      # Middleware de sessão
```

### Types (`src/types/`)
```
types/
└── index.ts               # Interfaces TypeScript
    ├── User               - Usuário com role
    ├── Condominio         - Entidade principal
    ├── Unidade            - Apartamento/Casa
    ├── Categoria          - Categorias financeiras
    ├── CentroCusto        - Centros de custo
    ├── LancamentoFinanceiro - Receitas/Despesas
    ├── Quadro             - Boards do Kanban
    ├── Lista              - Colunas do Kanban
    ├── Cartao             - Cards do Kanban
    ├── Checklist          - Listas de tarefas
    ├── Comentario         - Comentários em cards
    ├── DashboardMetrics   - Métricas do dashboard
    └── ApiResponse        - Resposta padrão API
```

### Contextos (`src/contexts/`)
```
contexts/
├── AuthContext.tsx        # Autenticação + RBAC
│   ├── user              - Dados do usuário
│   ├── signIn()          - Login
│   ├── signUp()          - Cadastro
│   ├── signOut()         - Logout
│   └── hasPermission()   - Verificação de permissão
│
└── CondominioContext.tsx  # Multi-tenancy
    ├── condominioAtual   - Condomínio selecionado
    └── setCondominioAtual() - Troca de condomínio
```

### Componentes UI (`src/components/ui/`)
```
ui/
├── button.tsx      # Botão com variantes e loading
├── input.tsx       # Input com ícone e erro
├── label.tsx       # Label de formulário
├── card.tsx        # Card com efeito glass
├── dialog.tsx      # Modal com animações
├── select.tsx      # Select animado
├── tabs.tsx        # Abas de navegação
├── checkbox.tsx    # Checkbox animado
├── avatar.tsx      # Avatar com fallback
├── dropdown-menu.tsx # Menu dropdown completo
├── progress.tsx    # Barra de progresso
├── scroll-area.tsx # Área de scroll customizada
├── separator.tsx   # Separador visual
├── textarea.tsx    # Área de texto
├── tooltip.tsx     # Tooltip animado
├── badge.tsx       # Badge com variantes
└── table.tsx       # Componentes de tabela
```

### Layout (`src/components/layout/`)
```
layout/
├── Sidebar.tsx           # Menu lateral colapsável
│   ├── Navegação por seções
│   ├── Tooltips quando colapsado
│   └── Indicador de página ativa
│
├── Header.tsx            # Cabeçalho superior
│   ├── Busca global
│   ├── Notificações
│   ├── Toggle de tema
│   └── Menu do usuário
│
└── DashboardLayout.tsx   # Layout principal
    ├── Sidebar responsiva
    └── Área de conteúdo
```

### Dashboard (`src/components/dashboard/`)
```
dashboard/
├── MetricCard.tsx            # Card de métrica com trend
├── FluxoCaixaChart.tsx       # Gráfico área receitas x despesas
├── DespesaCategoriaChart.tsx # Gráfico pizza por categoria
├── UltimosLancamentos.tsx    # Lista de lançamentos recentes
└── QuadrosResumo.tsx         # Resumo de cards do Kanban
```

### Financeiro (`src/components/financeiro/`)
```
financeiro/
├── LancamentosTable.tsx      # Tabela de lançamentos
│   ├── Filtros por status/tipo
│   ├── Tabs (Todos/Receitas/Despesas/Atrasados)
│   ├── Cálculo de totais
│   └── Ações (editar, excluir, vincular)
│
├── LancamentoFormDialog.tsx  # Formulário de lançamento
│   ├── Validação com Zod
│   ├── Seleção de categoria por tipo
│   └── Vinculação a unidades
│
└── InadimplenciaPanel.tsx    # Painel de inadimplência
    ├── Totais de multa/juros
    ├── Agrupamento por unidade
    └── Ações de cobrança
```

### Kanban (`src/components/kanban/`)
```
kanban/
├── KanbanBoard.tsx           # Board principal
│   ├── @dnd-kit para drag & drop
│   ├── DragOverlay visual
│   └── Reordenação de cards
│
├── KanbanColumn.tsx          # Coluna/Lista
│   ├── Drop zone para cards
│   ├── Ações (add card, editar, excluir)
│   └── Scroll customizado
│
├── KanbanCard.tsx            # Card individual
│   ├── Indicadores visuais (prioridade, vencimento)
│   ├── Progresso de checklist
│   ├── Link financeiro
│   └── Menu de ações
│
└── CardDetailDialog.tsx      # Modal de detalhes
    ├── Tab Detalhes - Formulário principal
    ├── Tab Checklists - Listas de tarefas
    ├── Tab Comentários - Discussão
    └── Tab Atividade - Histórico
```

### Páginas (`src/app/`)
```
app/
├── globals.css              # CSS global + design system
├── layout.tsx               # Layout raiz com providers
├── page.tsx                 # Landing page
├── login/page.tsx           # Página de login
├── dashboard/page.tsx       # Dashboard principal
├── financeiro/page.tsx      # Módulo financeiro
└── kanban/page.tsx          # Módulo Kanban
```

---

## 🗄️ Schema do Banco de Dados

### Tabelas Principais
| Tabela | Descrição |
|--------|-----------|
| `condominios` | Condomínios (base multi-tenant) |
| `usuarios` | Usuários com roles |
| `unidades` | Apartamentos/casas |
| `categorias` | Categorias financeiras |
| `centros_custo` | Centros de custo |
| `lancamentos_financeiros` | Receitas e despesas |
| `quadros` | Boards do Kanban |
| `listas` | Colunas dos boards |
| `cartoes` | Cards do Kanban |
| `checklists` | Listas de tarefas |
| `checklist_items` | Itens das checklists |
| `comentarios` | Comentários nos cards |
| `logs_auditoria` | Histórico de ações |

### Enums
- `user_role`: ADMIN_SAAS, ADMIN_CONDOMINIO, SINDICO, CONSELHEIRO, MORADOR, PRESTADOR
- `tipo_lancamento`: receita, despesa
- `status_lancamento`: pago, pendente, atrasado, cancelado
- `prioridade_cartao`: baixa, media, alta, urgente
- `status_cartao`: pendente, em_andamento, concluido, arquivado

### Triggers de Sincronização
1. **Cartão → Financeiro**: Ao concluir card, marca lançamento como pago
2. **Financeiro → Cartão**: Ao atrasar lançamento, define prioridade urgente
3. **Auto-cálculo**: Multa (2%) e juros (0.033%/dia) calculados automaticamente

---

## 🔐 Sistema de Permissões (RBAC)

| Role | Nível | Permissões |
|------|-------|------------|
| ADMIN_SAAS | 100 | Acesso total ao sistema |
| ADMIN_CONDOMINIO | 80 | Gestão completa do condomínio |
| SINDICO | 60 | Gestão operacional e financeira |
| CONSELHEIRO | 40 | Visualização e aprovação |
| MORADOR | 20 | Somente leitura |
| PRESTADOR | 10 | Acesso restrito a tarefas |

---

## ✅ O que foi feito

- [x] Inicialização do projeto Next.js 14
- [x] Instalação de todas as dependências
- [x] Estrutura de pastas completa
- [x] 18 componentes UI base (shadcn/ui style)
- [x] Layout responsivo com Sidebar colapsável
- [x] Dashboard com gráficos interativos
- [x] Módulo financeiro com tabela e filtros
- [x] Painel de inadimplência com cálculos
- [x] Módulo Kanban com drag & drop completo
- [x] Modal de detalhes do card com tabs
- [x] Integração Financeiro ↔ Kanban (visual)
- [x] Landing page moderna
- [x] Página de login com validação
- [x] Schema SQL completo para Supabase
- [x] Middleware de proteção de rotas
- [x] Contextos de Auth e Multi-tenant

---

## 🔜 Próximos Passos

### Prioridade Alta
1. **Configurar Supabase real**
   - Criar projeto no Supabase Dashboard
   - Executar migrations SQL
   - Configurar variáveis de ambiente

2. **Conectar dados reais**
   - Criar hooks para fetch/mutate
   - Substituir mock data por queries Supabase
   - Implementar cache com React Query (opcional)

3. **Autenticação completa**
   - Finalizar página de cadastro
   - Recuperação de senha
   - Verificação de email

### Prioridade Média
4. **CRUD completo de entidades**
   - Categorias
   - Centros de custo
   - Unidades
   - Quadros Kanban

5. **Relatórios financeiros**
   - Fluxo de caixa detalhado
   - Previsto x Realizado
   - Exportação para Excel/PDF

6. **Notificações**
   - Sistema de notificações in-app
   - Emails para vencimentos

### Prioridade Baixa
7. **Melhorias de UX**
   - Tema dark/light persistente
   - Tour de onboarding
   - Atalhos de teclado

8. **Features avançadas**
   - Módulo de assembleias
   - Reserva de áreas comuns
   - Chat entre moradores

---

## 🚀 Como Continuar

### 1. Iniciar o servidor de desenvolvimento
```bash
cd "d:\Estudos Dev\SISTEMA FINANCEIRO\condominio-saas"
npm run dev
```

### 2. Acessar no navegador
- Landing: http://localhost:3000
- Login: http://localhost:3000/login
- Dashboard: http://localhost:3000/dashboard
- Financeiro: http://localhost:3000/financeiro
- Kanban: http://localhost:3000/kanban

### 3. Configurar Supabase
1. Acesse https://supabase.com e crie um projeto
2. Em Settings > API, copie URL e anon key
3. Edite `.env.local` com as credenciais reais
4. Em SQL Editor, execute `supabase/migrations/001_initial_schema.sql`

---

## 📝 Notas Importantes

- O projeto usa **Next.js 16.1.6** com Turbopack
- O middleware mostra warning de depreciação (migrar para "proxy" futuramente)
- Os gráficos Recharts precisam de container com altura definida
- Dados mock estão nas páginas para demonstração
- RLS está configurado mas precisa de usuário autenticado para funcionar

---

## 🛠️ Comandos Úteis

```bash
# Desenvolvimento
npm run dev

# Build de produção
npm run build

# Verificar tipos
npx tsc --noEmit

# Lint
npm run lint
```

---

*Documento gerado automaticamente para continuidade do desenvolvimento*
