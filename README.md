# CondoGest - Sistema de Gestão Condominial SaaS

<p align="center">
  <img src="public/logo.svg" width="120" alt="CondoGest Logo">
</p>

<p align="center">
  Sistema completo de gestão condominial com módulo financeiro e Kanban integrados.
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#setup">Setup</a> •
  <a href="#estrutura">Estrutura</a> •
  <a href="#deploy">Deploy</a>
</p>

---

## 🚀 Features

### 💰 Módulo Financeiro
- **Lançamentos completos**: Receitas e despesas com categorias e centros de custo
- **Inadimplência inteligente**: Cálculo automático de multas (2%) e juros (0.033%/dia)
- **Relatórios**: Fluxo de caixa mensal, despesas por categoria, previsto x realizado
- **Vinculação a unidades**: Associe lançamentos a apartamentos/casas

### 🧩 Módulo Kanban
- **Quadros personalizáveis**: Crie quantos quadros precisar
- **Drag & Drop fluido**: Arraste cartões entre listas com @dnd-kit
- **Checklists**: Acompanhe progresso de tarefas
- **Comentários**: Colaboração em tempo real
- **Responsáveis**: Atribua tarefas a usuários

### 🔗 Integração Financeiro ↔ Kanban
- Vincule cartões a lançamentos financeiros
- **Sincronização automática**:
  - Cartão concluído → Despesa marcada como paga
  - Lançamento atrasado → Cartão vira urgente
- Indicadores visuais de status financeiro nos cartões

### 🔐 Sistema de Permissões (RBAC)
| Role | Descrição | Nível |
|------|-----------|-------|
| ADMIN_SAAS | Acesso total ao sistema | 100 |
| ADMIN_CONDOMINIO | Gestão completa do condomínio | 80 |
| SINDICO | Gestão operacional e financeira | 60 |
| CONSELHEIRO | Visualização e aprovação | 40 |
| MORADOR | Somente leitura | 20 |
| PRESTADOR | Acesso restrito | 10 |

### 📊 Dashboard
- Cards de métricas em tempo real
- Gráficos interativos com Recharts
- Resumo de tarefas e lançamentos
- Indicadores de inadimplência

---

## 🛠 Tech Stack

### Frontend
- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Radix UI** (componentes acessíveis)
- **Framer Motion** (animações)
- **@dnd-kit** (drag & drop)
- **Recharts** (gráficos)
- **React Hook Form + Zod** (formulários)

### Backend
- **Supabase**
  - PostgreSQL (banco de dados)
  - Auth (autenticação)
  - Storage (arquivos)
  - Row Level Security (RLS)
- **API REST** (Next.js API Routes)

---

## 📦 Setup

### Pré-requisitos
- Node.js 18+
- npm ou pnpm
- Conta no [Supabase](https://supabase.com)

### 1. Clone e instale dependências

```bash
git clone https://github.com/seu-usuario/condominio-saas.git
cd condominio-saas
npm install
```

### 2. Configure o Supabase

1. Crie um novo projeto no [Supabase](https://supabase.com)
2. Copie a URL e chave anon do projeto
3. Execute o schema SQL:
   - Vá em SQL Editor no Supabase Dashboard
   - Cole o conteúdo de `supabase/migrations/001_initial_schema.sql`
   - Execute

### 3. Configure variáveis de ambiente

```bash
cp .env.local.example .env.local
```

Edite `.env.local` com suas credenciais:

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon
```

### 4. Execute o projeto

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000)

---

## 📁 Estrutura

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Rotas de autenticação
│   ├── dashboard/         # Dashboard principal
│   ├── financeiro/        # Módulo financeiro
│   ├── kanban/            # Módulo Kanban
│   └── layout.tsx         # Layout raiz
├── components/
│   ├── ui/                # Componentes base (shadcn/ui style)
│   ├── layout/            # Header, Sidebar, etc
│   ├── dashboard/         # Componentes do dashboard
│   ├── financeiro/        # Componentes financeiros
│   └── kanban/            # Componentes Kanban
├── contexts/              # React Contexts
├── hooks/                 # Custom hooks
├── lib/
│   ├── supabase/          # Clientes Supabase
│   ├── utils.ts           # Utilitários
│   ├── constants.ts       # Constantes
│   └── validations.ts     # Schemas Zod
├── types/                 # TypeScript types
└── middleware.ts          # Next.js middleware
```

---

## 🚢 Deploy

### Vercel (Recomendado)

1. Faça push do código para o GitHub
2. Conecte o repositório na [Vercel](https://vercel.com)
3. Configure as variáveis de ambiente
4. Deploy automático!

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

---

## 📈 Escalabilidade

### Multi-tenant
- Isolamento por `condominio_id` em todas as tabelas
- Row Level Security (RLS) no PostgreSQL
- Suporte a múltiplos condomínios por conta

### Performance
- Server Components por padrão
- Lazy loading de componentes pesados
- Índices otimizados no banco
- Cache com React Query (opcional)

### White-label (Roadmap)
- Temas personalizáveis por condomínio
- Logo e cores customizáveis
- Subdomínios dedicados

---

## 🗺 Roadmap

- [ ] App mobile (React Native)
- [ ] Notificações push
- [ ] Integração com boletos bancários
- [ ] Módulo de assembleias
- [ ] Chat entre moradores
- [ ] Reserva de áreas comuns
- [ ] Controle de portaria

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

## 🤝 Contribuindo

1. Fork o projeto
2. Crie sua feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

---

<p align="center">
  Desenvolvido com ❤️ para modernizar a gestão condominial
</p>
