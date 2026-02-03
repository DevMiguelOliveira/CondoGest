export const APP_NAME = 'CondoGest'
export const APP_DESCRIPTION = 'Sistema de Gestão Condominial'

export const USER_ROLES = {
    ADMIN_SAAS: {
        label: 'Administrador SaaS',
        description: 'Acesso total ao sistema',
        level: 100,
    },
    ADMIN_CONDOMINIO: {
        label: 'Administrador do Condomínio',
        description: 'Gestão completa do condomínio',
        level: 80,
    },
    SINDICO: {
        label: 'Síndico',
        description: 'Gestão operacional e financeira',
        level: 60,
    },
    CONSELHEIRO: {
        label: 'Conselheiro',
        description: 'Visualização e aprovação de contas',
        level: 40,
    },
    MORADOR: {
        label: 'Morador',
        description: 'Visualização de boletos e informações',
        level: 20,
    },
    PRESTADOR: {
        label: 'Prestador de Serviços',
        description: 'Acesso restrito a tarefas designadas',
        level: 10,
    },
} as const

export const LANCAMENTO_STATUS = {
    pago: { label: 'Pago', color: 'bg-emerald-500', textColor: 'text-emerald-500' },
    pendente: { label: 'Pendente', color: 'bg-amber-500', textColor: 'text-amber-500' },
    atrasado: { label: 'Atrasado', color: 'bg-red-500', textColor: 'text-red-500' },
    cancelado: { label: 'Cancelado', color: 'bg-gray-500', textColor: 'text-gray-500' },
} as const

export const TIPO_LANCAMENTO = {
    receita: { label: 'Receita', color: 'bg-emerald-500', icon: 'TrendingUp' },
    despesa: { label: 'Despesa', color: 'bg-red-500', icon: 'TrendingDown' },
} as const

export const PRIORIDADE_CARTAO = {
    baixa: { label: 'Baixa', color: 'bg-gray-400', textColor: 'text-gray-600' },
    media: { label: 'Média', color: 'bg-blue-500', textColor: 'text-blue-600' },
    alta: { label: 'Alta', color: 'bg-orange-500', textColor: 'text-orange-600' },
    urgente: { label: 'Urgente', color: 'bg-red-500', textColor: 'text-red-600' },
} as const

export const CORES_CATEGORIAS = [
    '#3B82F6', // Blue
    '#10B981', // Emerald
    '#F59E0B', // Amber
    '#EF4444', // Red
    '#8B5CF6', // Violet
    '#EC4899', // Pink
    '#06B6D4', // Cyan
    '#84CC16', // Lime
    '#F97316', // Orange
    '#6366F1', // Indigo
] as const

export const CORES_QUADROS = [
    { name: 'Azul', value: '#3B82F6' },
    { name: 'Verde', value: '#10B981' },
    { name: 'Roxo', value: '#8B5CF6' },
    { name: 'Laranja', value: '#F97316' },
    { name: 'Rosa', value: '#EC4899' },
    { name: 'Ciano', value: '#06B6D4' },
] as const

export const MESES = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
] as const

export const TIPOS_UNIDADE = [
    { value: 'apartamento', label: 'Apartamento' },
    { value: 'casa', label: 'Casa' },
    { value: 'sala', label: 'Sala Comercial' },
    { value: 'loja', label: 'Loja' },
] as const

export const ESTADOS_BRASIL = [
    { value: 'AC', label: 'Acre' },
    { value: 'AL', label: 'Alagoas' },
    { value: 'AP', label: 'Amapá' },
    { value: 'AM', label: 'Amazonas' },
    { value: 'BA', label: 'Bahia' },
    { value: 'CE', label: 'Ceará' },
    { value: 'DF', label: 'Distrito Federal' },
    { value: 'ES', label: 'Espírito Santo' },
    { value: 'GO', label: 'Goiás' },
    { value: 'MA', label: 'Maranhão' },
    { value: 'MT', label: 'Mato Grosso' },
    { value: 'MS', label: 'Mato Grosso do Sul' },
    { value: 'MG', label: 'Minas Gerais' },
    { value: 'PA', label: 'Pará' },
    { value: 'PB', label: 'Paraíba' },
    { value: 'PR', label: 'Paraná' },
    { value: 'PE', label: 'Pernambuco' },
    { value: 'PI', label: 'Piauí' },
    { value: 'RJ', label: 'Rio de Janeiro' },
    { value: 'RN', label: 'Rio Grande do Norte' },
    { value: 'RS', label: 'Rio Grande do Sul' },
    { value: 'RO', label: 'Rondônia' },
    { value: 'RR', label: 'Roraima' },
    { value: 'SC', label: 'Santa Catarina' },
    { value: 'SP', label: 'São Paulo' },
    { value: 'SE', label: 'Sergipe' },
    { value: 'TO', label: 'Tocantins' },
] as const

// Configurações de multa/juros
export const CONFIG_INADIMPLENCIA = {
    multaPercentual: 2, // 2%
    jurosDiarios: 0.033, // 0.033% ao dia (aproximadamente 1% ao mês)
} as const

// Pagination defaults
export const PAGINATION = {
    defaultPageSize: 10,
    pageSizeOptions: [10, 20, 50, 100],
} as const
