# 🔐 Segurança — CondoGest

> Guia de segurança e checklist para o sistema CondoGest.

---

## Arquitetura de Segurança

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENTE (Browser)                        │
│   ┌──────────────┐    ┌────────────────┐    ┌───────────────┐  │
│   │ React + Next │    │ Zod Validation │    │ hasPermission  │  │
│   │ (UI only)    │    │ (UX feedback)  │    │ (UI toggle)   │  │
│   └──────┬───────┘    └────────────────┘    └───────────────┘  │
│          │                                                      │
└──────────┼──────────────────────────────────────────────────────┘
           │ HTTPS (JWT nos cookies HttpOnly)
           ▼
┌──────────────────────────────────────────────────────────────────┐
│                     SERVIDOR (Next.js + Supabase)                │
│   ┌──────────────────┐   ┌───────────────────┐                  │
│   │ Middleware Next.js │   │ API Route Guards  │                  │
│   │ (rota protegida)  │   │ (authenticateReq  │                  │
│   │ → redirect /login │   │  authorizeReq     │                  │
│   └──────────────────┘   │  validateTenant)   │                  │
│                           └─────────┬─────────┘                  │
│                                     │                            │
│   ┌─────────────────────────────────▼──────────────────────────┐ │
│   │                    SUPABASE (PostgreSQL)                    │ │
│   │   ┌─────────────────────────────────────────────────────┐  │ │
│   │   │              Row Level Security (RLS)                │  │ │
│   │   │   • get_user_condominio_id()                         │  │ │
│   │   │   • is_admin_saas()                                  │  │ │
│   │   │   • Políticas por tabela (SELECT/INSERT/UPDATE/DEL)  │  │ │
│   │   └─────────────────────────────────────────────────────┘  │ │
│   │   ┌─────────────────────────────────────────────────────┐  │ │
│   │   │              Constraints (CHECK, FK, UNIQUE)         │  │ │
│   │   │   • valor > 0                                        │  │ │
│   │   │   • ENUM types                                       │  │ │
│   │   │   • GENERATED ALWAYS AS (valor_total)                │  │ │
│   │   └─────────────────────────────────────────────────────┘  │ │
│   └────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────┘
```

---

## Camadas de Proteção

### 1. Autenticação (Quem é você?)

| Mecanismo | Local | Descrição |
|---|---|---|
| Supabase Auth | Backend | Gerencia sessões com JWT em cookies HttpOnly |
| Next.js Middleware | Server | Protege rotas `/dashboard`, `/financeiro`, `/kanban` |
| `authenticateRequest()` | API Routes | Valida JWT e busca perfil do usuário |

### 2. Autorização (O que você pode fazer?)

| Mecanismo | Local | Descrição |
|---|---|---|
| `hasPermission()` | Frontend Context | Condiciona UI (exibir/ocultar botões) |
| `authorizeRequest(role)` | API Routes | Bloqueia ações insuficientes (403) |
| RLS Policies | PostgreSQL | Enforcement final — impossível burlar via SQL |

### 3. Isolamento Multi-tenant (De quem são os dados?)

| Mecanismo | Local | Descrição |
|---|---|---|
| `condominio_id` | Todas as tabelas | Chave de segregação |
| `get_user_condominio_id()` | PostgreSQL Function | Retorna o condomínio do usuário logado |
| `validateTenantAccess()` | API Routes | Verifica no application layer |
| RLS Policies | PostgreSQL | Filtro automático em todas as queries |

### 4. Validação de Dados (Os dados estão corretos?)

| Mecanismo | Local | Descrição |
|---|---|---|
| Zod Schemas | Frontend + API | Validação de tipo/formato |
| CHECK constraints | PostgreSQL | `valor > 0`, ENUM values |
| UNIQUE constraints | PostgreSQL | Sem duplicatas |
| FK constraints | PostgreSQL | Referencial integrity |
| GENERATED columns | PostgreSQL | `valor_total` calculado automaticamente |

---

## Checklist de Segurança

### ✅ Implementado

- [x] **Autenticação**: Supabase Auth com JWT
- [x] **Middleware**: Rotas protegidas no Next.js
- [x] **RBAC hierárquico**: 6 papéis com níveis numéricos (10–100)
- [x] **Permissões granulares**: Mapa de `Resource × Action → Role mínima` (`permissions.ts`)
- [x] **API Route Guards**: `authenticateRequest()` + `authorizeRequest()` + `validateTenantAccess()`
- [x] **RLS em todas as tabelas**: 13 tabelas com políticas configuradas
- [x] **`SECURITY DEFINER`**: Em funções que acessam dados de sistema
- [x] **Validação dupla**: Zod (frontend) + constraints (banco)
- [x] **Tipo correto para valores monetários**: `DECIMAL(12,2)` (nunca float)
- [x] **CHECK constraint**: `valor > 0` em lançamentos e itens de rateio
- [x] **GENERATED column**: `valor_total` calculado automaticamente
- [x] **FK com ON DELETE correto**: CASCADE para filhos, RESTRICT para dependências, SET NULL para opcionais
- [x] **Índices otimizados**: 14+ índices para queries frequentes
- [x] **Triggers de consistência**: Sync Kanban ↔ Financeiro, cálculo de multa/juros
- [x] **`SUPABASE_SERVICE_ROLE_KEY`**: Nunca exposta ao browser (`NEXT_PUBLIC_` não usado)
- [x] **Respostas padronizadas**: `successResponse()` / `errorResponse()` — nunca leak de stack trace
- [x] **Log de auditoria**: Tabela `logs_auditoria` estruturada

### ⚠️ Recomendado (Próximas Iterações)

- [ ] **Rate limiting**: Limitar requests por IP/usuário (ex: 100 req/min)
- [ ] **CORS**: Configurar `Access-Control-Allow-Origin` explicitamente
- [ ] **CSP headers**: Content Security Policy para prevenir XSS
- [ ] **Audit log automático**: Trigger para registrar toda operação financeira
- [ ] **Soft delete**: Nunca deletar lançamentos financeiros, apenas marcar como cancelado
- [ ] **Senha forte**: Política de senha mínima de 8 caracteres + complexidade
- [ ] **2FA**: Autenticação de dois fatores para síndicos e administradores
- [ ] **IP Allowlist**: Opção de restringir acesso por IP para administradores
- [ ] **Backup automático**: Política de backup diário do banco
- [ ] **Monitoramento**: Alertas de segurança (login suspeito, muitas tentativas falhas)

---

## Padrão para Novas API Routes

Todo novo endpoint deve seguir este padrão:

```typescript
import { NextRequest } from 'next/server'
import { authorizeRequest, errorResponse, successResponse, parseRequestBody } from '@/lib/api-auth'
import { createClient } from '@/lib/supabase/server'
import { meuSchema } from '@/lib/validations'

export async function POST(request: NextRequest) {
    // 1. Autenticação + Autorização
    const auth = await authorizeRequest('ROLE_MINIMA')
    if (auth.error) return errorResponse(auth.error, auth.status)
    const user = auth.user!

    // 2. Verificar vínculo com condomínio (quando necessário)
    if (!user.condominio_id) {
        return errorResponse('Usuário não vinculado a um condomínio.', 403)
    }

    // 3. Parse + Validação do body
    const { data: body, error: parseError } = await parseRequestBody<MeuTipo>(request)
    if (parseError || !body) return errorResponse(parseError || 'Corpo inválido.', 400)

    const validation = meuSchema.safeParse(body)
    if (!validation.success) {
        const msgs = validation.error.errors.map(e => `${e.path.join('.')}: ${e.message}`)
        return errorResponse(`Dados inválidos: ${msgs.join('; ')}`, 422)
    }

    // 4. Validação de negócio (cross-table, regras específicas)
    // ...

    // 5. Operação no banco
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('minha_tabela')
        .insert({ ...validation.data, condominio_id: user.condominio_id })
        .select()
        .single()

    if (error) return errorResponse(`Erro: ${error.message}`, 500)

    // 6. Resposta padronizada
    return successResponse(data, 201)
}
```

### Nunca faça isto:

```typescript
// ❌ Confiar no condominio_id vindo do frontend
const { condominio_id } = body // NUNCA!

// ✅ Sempre usar o condominio_id do usuário autenticado
const condominio_id = auth.user!.condominio_id
```

```typescript
// ❌ Expor stack trace ou detalhes internos
return NextResponse.json({ error: error.stack })

// ✅ Mensagem genérica + log interno
console.error('Erro detalhado:', error)
return errorResponse('Erro ao processar requisição.', 500)
```
