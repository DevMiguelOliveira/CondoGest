# 📊 Regras de Negócio Financeiras — CondoGest

> Este documento define **todas** as regras financeiras do sistema, com precisão e exemplos práticos.
> Qualquer alteração nessas regras deve ser discutida e versionada.

---

## Índice

1. [Conceitos Fundamentais](#1-conceitos-fundamentais)
2. [Receitas](#2-receitas)
3. [Despesas](#3-despesas)
4. [Saldo](#4-saldo)
5. [Rateio Condominial](#5-rateio-condominial)
6. [Inadimplência (Multa e Juros)](#6-inadimplência-multa-e-juros)
7. [Validações Obrigatórias](#7-validações-obrigatórias)
8. [Cenários Práticos](#8-cenários-práticos)
9. [Glossário](#9-glossário)

---

## 1. Conceitos Fundamentais

### Lançamento Financeiro

Todo registro financeiro é um **lançamento** (`lancamentos_financeiros`), que pode ser do tipo **receita** ou **despesa**.

| Campo | Tipo | Obrigatório | Regra |
|---|---|---|---|
| `tipo` | `receita` / `despesa` | ✅ | Define a natureza do lançamento |
| `valor` | `DECIMAL(12,2)` | ✅ | Sempre positivo (`CHECK > 0`) |
| `data_vencimento` | `DATE` | ✅ | Data esperada de pagamento |
| `data_pagamento` | `DATE` | Não | Preenchida quando o pagamento é efetivado |
| `status` | enum | ✅ | `pendente`, `pago`, `atrasado`, `cancelado` |
| `categoria_id` | `UUID` | ✅ | Classificação (ex: "Manutenção", "Taxa Condominial") |
| `centro_custo_id` | `UUID` | Não | Agrupamento para relatórios |
| `unidade_id` | `UUID` | Não | Vinculação a apartamento/casa (obrigatório em receitas de unidade) |
| `multa` | `DECIMAL(12,2)` | Não | Calculada automaticamente se atrasado |
| `juros` | `DECIMAL(12,2)` | Não | Calculados automaticamente se atrasado |
| `valor_total` | `DECIMAL(12,2)` | Auto | `= valor + multa + juros` (coluna GENERATED) |

### Ciclo de Vida de um Lançamento

```
  ┌──────────┐    vencimento     ┌──────────┐
  │ PENDENTE │ ───── chega ────→ │ ATRASADO │
  └────┬─────┘                   └────┬─────┘
       │                              │
       │   pagamento efetuado         │   pagamento efetuado
       ▼                              ▼
  ┌──────────┐                   ┌──────────┐
  │   PAGO   │                   │   PAGO   │ (com multa+juros)
  └──────────┘                   └──────────┘

  Qualquer status → CANCELADO (operação administrativa)
```

- `PENDENTE → ATRASADO`: automático via trigger quando `data_vencimento < CURRENT_DATE`
- `PENDENTE → PAGO`: quando `data_pagamento` é preenchida e ≤ `data_vencimento`
- `ATRASADO → PAGO`: quando `data_pagamento` é preenchida (multa e juros são preservados)
- `→ CANCELADO`: apenas por `SINDICO` ou superior

---

## 2. Receitas

**Definição:** Todo recurso que **entra** no caixa do condomínio.

### Tipos de Receita

| Categoria | Descrição | Recorrente? |
|---|---|---|
| Taxa Condominial | Mensalidade cobrada de cada unidade | Sim |
| Taxa Extra | Cobrança extraordinária (obras, reformas) | Não |
| Aluguel de Espaço | Salão de festas, churrasqueira, etc. | Eventual |
| Multa de Infração | Penalidade por descumprimento de regras | Eventual |
| Receita Financeira | Rendimentos de aplicações do fundo | Eventual |
| Outras Receitas | Taxas de mudança, segunda via de boleto, etc. | Eventual |

### Regras de Receita

1. O `valor` deve ser **sempre positivo** e com **precisão de 2 casas decimais**
2. Receitas vinculadas a unidades **devem** ter `unidade_id` preenchido
3. Receitas recorrentes (taxa condominial) devem gerar lançamentos individuais por mês/unidade
4. A `categoria_id` deve ser de `tipo = 'receita'` — validação no Zod e no banco

---

## 3. Despesas

**Definição:** Todo recurso que **sai** do caixa do condomínio.

### Tipos de Despesa

| Categoria | Descrição | Rateável? |
|---|---|---|
| Manutenção | Reparos, conservação | Sim |
| Folha de Pagamento | Porteiros, zeladores, faxineiros | Sim |
| Água / Luz / Gás | Concessionárias | Sim |
| Segurança | Monitoramento, câmeras, portaria remota | Sim |
| Administradora | Taxa de administradora terceirizada | Sim |
| Seguros | Seguro do prédio, responsabilidade civil | Sim |
| Material de Limpeza | Insumos operacionais | Sim |
| Obras / Reformas | Melhorias estruturais | Sim |
| Jurídico / Contábil | Assessoria legal e fiscal | Sim |
| Outras Despesas | Despesas não categorizadas | Sim |

### Regras de Despesa

1. O `valor` deve ser **sempre positivo** e com **precisão de 2 casas decimais**
2. A `categoria_id` deve ser de `tipo = 'despesa'`
3. Despesas devem estar vinculadas a um `centro_custo_id` quando possível (para relatórios)
4. Despesas podem ser vinculadas a cartões Kanban para acompanhamento de tarefas

---

## 4. Saldo

**Definição:** Diferença entre receitas efetivamente pagas e despesas efetivamente pagas em um período.

### Fórmula

```
Saldo = Σ(receitas com status='pago') − Σ(despesas com status='pago')
```

### Regras

1. O saldo é **sempre calculado**, **nunca armazenado** em uma coluna
2. Saldo mensal: considera apenas lançamentos com `data_pagamento` no mês
3. Saldo geral: considera todos os lançamentos pagos desde a criação do condomínio
4. O saldo **pode ser negativo** (indica déficit)
5. Lançamentos `cancelados` **não** entram no cálculo
6. Lançamentos `pendentes` e `atrasados` entram no fluxo "previsto", não no saldo real

### Indicadores do Dashboard

| Métrica | Fórmula |
|---|---|
| Saldo Atual (mês) | `Receitas pagas no mês − Despesas pagas no mês` |
| Inadimplência Total | `Σ valor_total de receitas com status='atrasado'` |
| % Inadimplência | `(Inadimplência Total / Total Receitas Previstas) × 100` |
| Previsto × Realizado | Comparação entre lançamentos pendentes e pagos |

---

## 5. Rateio Condominial

**Definição:** Processo de divisão de uma despesa total entre as unidades do condomínio, resultando em lançamentos individuais de **receita** (cobrança da parte de cada unidade).

### 5.1 Rateio Igualitário

Cada unidade paga o **mesmo valor**, independentemente do tamanho.

```
Valor por unidade = Despesa Total ÷ Nº de unidades do condomínio
```

#### Quando usar
- Serviços que beneficiam igualmente todas as unidades (segurança, administrativo)
- Condomínios horizontais com unidades de tamanho similar

#### Exemplo

> **Despesa:** Folha de pagamento = R$ 12.000,00
> **Condomínio:** 40 unidades
>
> ```
> Valor por unidade = 12.000,00 ÷ 40 = R$ 300,00
> ```
>
> 40 lançamentos de receita são gerados, cada um de R$ 300,00.

### 5.2 Rateio por Fração Ideal

Cada unidade paga proporcionalmente à sua **fração ideal** (definida na convenção do condomínio, baseada na área privativa em relação à área total).

```
Valor da unidade = Despesa Total × fração_ideal da unidade
```

#### Regra de Consistência

A soma de todas as `fração_ideal` de um condomínio **deve ser igual a 1.0** (ou 100%):

```
Σ(fração_ideal de todas as unidades) = 1.000000
```

> ⚠️ Tolerância: aceitar diferença de até `0.000001` para evitar erros de arredondamento.

#### Quando usar
- Padrão legal para a maioria dos condomínios verticais (prédios)
- Quando unidades têm tamanhos significativamente diferentes

#### Exemplo

> **Despesa:** Manutenção do elevador = R$ 5.000,00
> **Condomínio:** 4 unidades
>
> | Unidade | Área (m²) | Fração Ideal | Valor |
> |---------|-----------|-------------|-------|
> | Apto 101 | 50 | 0.150000 | R$ 750,00 |
> | Apto 102 | 70 | 0.210000 | R$ 1.050,00 |
> | Apto 201 | 80 | 0.240000 | R$ 1.200,00 |
> | Cobertura 301 | 133.33 | 0.400000 | R$ 2.000,00 |
> | **Total** | **333.33** | **1.000000** | **R$ 5.000,00** |

### 5.3 Rateio por Unidade (Valor Fixo)

Cada unidade recebe um **valor fixo definido manualmente** pelo síndico.

```
Valor da unidade = Valor atribuído manualmente
```

#### Regra de Consistência

```
Σ(valores atribuídos) = Despesa Total
```

> ⚠️ O sistema **deve impedir** a finalização do rateio se a soma divergir do total.

#### Quando usar
- Situações especiais (ex: obra que beneficia apenas algumas unidades)
- Acordos internos entre condôminos

#### Exemplo

> **Despesa:** Reparo de infiltração = R$ 3.000,00
> Afeta apenas 3 unidades do bloco A.
>
> | Unidade | Valor |
> |---------|-------|
> | Apto 101 | R$ 1.200,00 |
> | Apto 102 | R$ 1.000,00 |
> | Apto 201 | R$ 800,00 |
> | **Total** | **R$ 3.000,00** ✅ |

### 5.4 Processo de Rateio (Fluxo)

```
1. Síndico seleciona uma ou mais despesas para ratear
2. Escolhe o modelo de rateio (igualitário / fração ideal / fixo)
3. Sistema calcula os valores por unidade automaticamente (ou recebe manual)
4. Sistema valida: Σ valores = total da despesa
5. Sistema gera N lançamentos de RECEITA (um por unidade)
6. Cada receita fica vinculada à unidade e à despesa original
7. Status: 'pendente' → aguardando pagamento de cada morador
```

### 5.5 Validações do Rateio

| Validação | Descrição |
|---|---|
| Soma bate | A soma de todos os valores individuais deve ser igual ao total da despesa |
| Valor positivo | Cada parcela individual deve ser > 0 |
| Unidades ativas | Só considerar unidades ativas (não desocupadas indefinidamente) |
| Fração ideal válida | Se rateio por fração, verificar que `Σ frações = 1.0 (±0.000001)` |
| Sem duplicata | Não permitir rateio duplo da mesma despesa para a mesma unidade/mês |
| Mínimo de unidades | Pelo menos 1 unidade deve participar do rateio |

---

## 6. Inadimplência (Multa e Juros)

### Multa

- Percentual: **2% sobre o valor original** (uma única vez)
- Aplicação: automática quando o status muda de `pendente` para `atrasado`
- Base legal: Art. 1.336 do Código Civil + Art. 52 do CDC

```
Multa = valor × 0.02
```

### Juros de Mora

- Taxa: **0,033% ao dia** (equivale a aproximadamente 1% ao mês)
- Aplicação: calculados proporcionalmente ao número de dias de atraso
- Atualização: recalculados a cada consulta/atualização do lançamento

```
Juros = valor × 0.00033 × dias_de_atraso
```

### Valor Total

Coluna `GENERATED ALWAYS AS` no banco de dados:

```sql
valor_total = valor + COALESCE(multa, 0) + COALESCE(juros, 0)
```

### Exemplo Completo

> **Lançamento:** Taxa condominial
> **Valor:** R$ 800,00
> **Vencimento:** 10/01/2026
> **Data atual:** 25/01/2026 (15 dias de atraso)
>
> ```
> Multa  = 800,00 × 0,02        = R$  16,00
> Juros  = 800,00 × 0,00033 × 15 = R$   3,96
> Total  = 800,00 + 16,00 + 3,96 = R$ 819,96
> ```

### Regras Adicionais

1. Multa e juros **não incidem sobre multa e juros** (não há capitalização)
2. Se o pagamento for efetuado, multa e juros ficam **congelados** na data do pagamento
3. Se o lançamento for **cancelado**, multa e juros são zerados
4. O trigger `update_lancamento_status()` atualiza automaticamente no banco

---

## 7. Validações Obrigatórias

### No Backend (banco de dados)

| Validação | Implementação |
|---|---|
| Valor positivo | `CHECK (valor > 0)` na tabela |
| Status válido | `ENUM status_lancamento` |
| Tipo válido | `ENUM tipo_lancamento` |
| Categoria compatível | Trigger/verificação: tipo da categoria = tipo do lançamento |
| Multa/juros automáticos | Trigger `update_lancamento_status()` |
| valor_total coerente | Coluna `GENERATED ALWAYS AS` |
| Isolamento multi-tenant | RLS com `condominio_id` |
| Unicidade | `UNIQUE(condominio_id, bloco, numero)` em unidades |

### No Frontend (Zod schemas)

| Validação | Schema |
|---|---|
| Valor positivo | `z.number().positive()` |
| Descrição mínima | `z.string().min(3)` |
| Categoria obrigatória | `z.string().uuid()` |
| Data de vencimento obrigatória | `z.string()` (formato date) |
| Status válido | `z.enum(['pago', 'pendente', 'atrasado', 'cancelado'])` |

### Princípio: Nunca Confiar no Frontend

Todas as validações críticas **devem** existir no banco de dados (constraints, triggers, RLS), pois o frontend pode ser manipulado. O frontend valida para **UX** (feedback imediato); o backend valida para **integridade**.

---

## 8. Cenários Práticos

### Cenário 1: Mês normal de operação

> **Condomínio Residencial Sol Nascente — 30 unidades**
>
> **Despesas do mês:**
> - Folha de pagamento: R$ 8.000,00
> - Manutenção geral: R$ 2.500,00
> - Energia áreas comuns: R$ 1.200,00
> - Segurança: R$ 3.000,00
> - TOTAL: R$ 14.700,00
>
> **Rateio igualitário:**
> ```
> Taxa mensal = 14.700,00 ÷ 30 = R$ 490,00 por unidade
> ```
>
> **Resultado esperado:**
> - 30 lançamentos de receita (R$ 490,00 cada)
> - Se 28 pagam em dia e 2 atrasam:
>   - Receita realizada: R$ 13.720,00
>   - Inadimplência: R$ 980,00 + multas/juros

### Cenário 2: Rateio por fração ideal

> **Condomínio Torre Premium — 10 unidades**
>
> **Despesa:** Troca do sistema de CFTV = R$ 20.000,00
>
> | Unidade | Fração Ideal | Valor |
> |---------|-------------|-------|
> | 101 | 0.08 | R$ 1.600,00 |
> | 102 | 0.08 | R$ 1.600,00 |
> | 201 | 0.10 | R$ 2.000,00 |
> | 202 | 0.10 | R$ 2.000,00 |
> | 301 | 0.10 | R$ 2.000,00 |
> | 302 | 0.10 | R$ 2.000,00 |
> | 401 | 0.12 | R$ 2.400,00 |
> | 402 | 0.12 | R$ 2.400,00 |
> | Cob 501 | 0.10 | R$ 2.000,00 |
> | Cob 502 | 0.10 | R$ 2.000,00 |
> | **TOTAL** | **1.00** | **R$ 20.000,00** ✅ |

### Cenário 3: Pagamento em atraso

> **Morador:** João da Silva — Apto 201
> **Taxa condominial:** R$ 490,00
> **Vencimento:** 10/03/2026
> **Pagamento efetuado:** 28/03/2026 (18 dias de atraso)
>
> ```
> Multa  = 490,00 × 0,02        = R$   9,80
> Juros  = 490,00 × 0,00033 × 18 = R$   2,91
> Total  = 490,00 + 9,80 + 2,91  = R$ 502,71
> ```
>
> O morador paga **R$ 502,71**. O status muda para `pago`.

### Cenário 4: Cancelamento de lançamento

> **Síndico identifica lançamento duplicado**
> - Altera status para `cancelado`
> - Multa e juros são zerados
> - Lançamento sai de todos os cálculos (saldo, inadimplência)
> - Registro mantido para auditoria (soft delete)

---

## 9. Glossário

| Termo | Definição |
|---|---|
| **Lançamento** | Registro financeiro (receita ou despesa) |
| **Receita** | Entrada de recursos no caixa |
| **Despesa** | Saída de recursos do caixa |
| **Rateio** | Divisão de despesa entre unidades |
| **Fração Ideal** | Proporção da unidade em relação ao total do condomínio |
| **Inadimplência** | Receitas vencidas e não pagas |
| **Multa** | Penalidade fixa de 2% pelo atraso no pagamento |
| **Juros de Mora** | Encargo diário de 0,033% pelo atraso |
| **Centro de Custo** | Agrupamento de despesas para fins gerenciais |
| **Categoria** | Classificação do tipo de receita ou despesa |
| **Multi-tenant** | Arquitetura onde múltiplos condomínios compartilham a mesma infraestrutura mas com dados isolados |
| **RLS** | Row Level Security — mecanismo do PostgreSQL que filtra linhas por usuário |
| **RBAC** | Role-Based Access Control — controle de acesso baseado em papéis |
