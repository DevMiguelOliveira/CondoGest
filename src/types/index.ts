// User Roles - RBAC System
export type UserRole =
    | 'ADMIN_SAAS'
    | 'ADMIN_CONDOMINIO'
    | 'SINDICO'
    | 'CONSELHEIRO'
    | 'MORADOR'
    | 'PRESTADOR'

export interface User {
    id: string
    email: string
    nome: string
    avatar_url?: string
    role: UserRole
    condominio_id?: string
    created_at: string
    updated_at: string
}

export interface Condominio {
    id: string
    nome: string
    endereco: string
    cidade: string
    estado: string
    cep: string
    cnpj: string
    telefone?: string
    email?: string
    logo_url?: string
    created_at: string
    updated_at: string
}

export interface Unidade {
    id: string
    condominio_id: string
    bloco?: string
    numero: string
    tipo: 'apartamento' | 'casa' | 'sala' | 'loja'
    area?: number
    fracao_ideal?: number
    proprietario_id?: string
    morador_id?: string
    created_at: string
    updated_at: string
}

// Financial Types
export type TipoLancamento = 'receita' | 'despesa'
export type StatusLancamento = 'pago' | 'pendente' | 'atrasado' | 'cancelado'

export interface Categoria {
    id: string
    condominio_id: string
    nome: string
    tipo: TipoLancamento
    cor: string
    icone?: string
    created_at: string
}

export interface CentroCusto {
    id: string
    condominio_id: string
    nome: string
    descricao?: string
    ativo: boolean
    created_at: string
}

export interface LancamentoFinanceiro {
    id: string
    condominio_id: string
    tipo: TipoLancamento
    descricao: string
    valor: number
    data_vencimento: string
    data_pagamento?: string
    status: StatusLancamento
    categoria_id: string
    centro_custo_id?: string
    unidade_id?: string
    cartao_id?: string
    comprovante_url?: string
    observacoes?: string
    multa?: number
    juros?: number
    valor_total?: number
    created_at: string
    updated_at: string
    // Relations
    categoria?: Categoria
    centro_custo?: CentroCusto
    unidade?: Unidade
    cartao?: Cartao
}

// Kanban Types
export type PrioridadeCartao = 'baixa' | 'media' | 'alta' | 'urgente'
export type StatusCartao = 'pendente' | 'em_andamento' | 'concluido' | 'arquivado'

export interface Quadro {
    id: string
    condominio_id: string
    nome: string
    descricao?: string
    cor: string
    ordem: number
    created_at: string
    updated_at: string
    // Relations
    listas?: Lista[]
}

export interface Lista {
    id: string
    quadro_id: string
    nome: string
    ordem: number
    cor?: string
    created_at: string
    updated_at: string
    // Relations
    cartoes?: Cartao[]
}

export interface Cartao {
    id: string
    lista_id: string
    titulo: string
    descricao?: string
    ordem: number
    prioridade: PrioridadeCartao
    status: StatusCartao
    data_vencimento?: string
    responsavel_id?: string
    lancamento_id?: string
    etiquetas?: string[]
    created_at: string
    updated_at: string
    // Relations
    responsavel?: User
    lancamento?: LancamentoFinanceiro
    checklists?: Checklist[]
    comentarios?: Comentario[]
}

export interface Checklist {
    id: string
    cartao_id: string
    titulo: string
    ordem: number
    items: ChecklistItem[]
    created_at: string
    updated_at: string
}

export interface ChecklistItem {
    id: string
    titulo: string
    concluido: boolean
    ordem: number
}

export interface Comentario {
    id: string
    cartao_id: string
    usuario_id: string
    conteudo: string
    created_at: string
    updated_at: string
    // Relations
    usuario?: User
}

export interface LogAuditoria {
    id: string
    condominio_id?: string
    usuario_id: string
    acao: string
    entidade: string
    entidade_id: string
    dados_anteriores?: Record<string, unknown>
    dados_novos?: Record<string, unknown>
    ip?: string
    user_agent?: string
    created_at: string
}

// Dashboard Types
export interface DashboardMetrics {
    saldoAtual: number
    totalReceitas: number
    totalDespesas: number
    inadimplencia: number
    inadimplenciaPercentual: number
    receitasMes: number
    despesasMes: number
    previsto: number
    realizado: number
}

export interface FluxoCaixaMensal {
    mes: string
    receitas: number
    despesas: number
    saldo: number
}

export interface DespesaPorCategoria {
    categoria: string
    valor: number
    percentual: number
    cor: string
}

// API Response Types
export interface ApiResponse<T> {
    data: T | null
    error: string | null
    success: boolean
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
    total: number
    page: number
    pageSize: number
    totalPages: number
}

// Form Types
export interface LancamentoFormData {
    tipo: TipoLancamento
    descricao: string
    valor: number
    data_vencimento: string
    data_pagamento?: string
    status: StatusLancamento
    categoria_id: string
    centro_custo_id?: string
    unidade_id?: string
    observacoes?: string
}

export interface CartaoFormData {
    titulo: string
    descricao?: string
    prioridade: PrioridadeCartao
    data_vencimento?: string
    responsavel_id?: string
    lancamento_id?: string
    etiquetas?: string[]
}
