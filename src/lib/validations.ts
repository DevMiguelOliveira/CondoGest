import { z } from 'zod'

// User Schemas
export const loginSchema = z.object({
    email: z.string().email('E-mail inválido'),
    password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
})

export const cadastroSchema = z.object({
    nome: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
    email: z.string().email('E-mail inválido'),
    password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
    confirmPassword: z.string(),
    nomeCondominio: z.string().min(3, 'Nome do condomínio deve ter no mínimo 3 caracteres'),
    cnpj: z.string().length(18, 'CNPJ inválido'),
    endereco: z.string().min(5, 'Endereço inválido'),
    cidade: z.string().min(2, 'Cidade inválida'),
    estado: z.string().length(2, 'Estado inválido'),
    cep: z.string().length(9, 'CEP inválido'),
}).refine((data) => data.password === data.confirmPassword, {
    message: 'Senhas não conferem',
    path: ['confirmPassword'],
})

// Financial Schemas
export const lancamentoSchema = z.object({
    tipo: z.enum(['receita', 'despesa']),
    descricao: z.string().min(3, 'Descrição deve ter no mínimo 3 caracteres'),
    valor: z.number().positive('Valor deve ser positivo'),
    data_vencimento: z.string(),
    data_pagamento: z.string().optional(),
    status: z.enum(['pago', 'pendente', 'atrasado', 'cancelado']),
    categoria_id: z.string().uuid('Categoria inválida'),
    centro_custo_id: z.string().uuid('Centro de custo inválido').optional(),
    unidade_id: z.string().uuid('Unidade inválida').optional(),
    observacoes: z.string().optional(),
})

export const categoriaSchema = z.object({
    nome: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
    tipo: z.enum(['receita', 'despesa']),
    cor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Cor inválida'),
    icone: z.string().optional(),
})

export const centroCustoSchema = z.object({
    nome: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
    descricao: z.string().optional(),
    ativo: z.boolean().default(true),
})

// Kanban Schemas
export const quadroSchema = z.object({
    nome: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
    descricao: z.string().optional(),
    cor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Cor inválida'),
})

export const listaSchema = z.object({
    nome: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
    cor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Cor inválida').optional(),
})

export const cartaoSchema = z.object({
    titulo: z.string().min(2, 'Título deve ter no mínimo 2 caracteres'),
    descricao: z.string().optional(),
    prioridade: z.enum(['baixa', 'media', 'alta', 'urgente']),
    data_vencimento: z.string().optional(),
    responsavel_id: z.string().uuid('Responsável inválido').optional(),
    lancamento_id: z.string().uuid('Lançamento inválido').optional(),
    etiquetas: z.array(z.string()).optional(),
})

export const checklistSchema = z.object({
    titulo: z.string().min(2, 'Título deve ter no mínimo 2 caracteres'),
})

export const comentarioSchema = z.object({
    conteudo: z.string().min(1, 'Comentário não pode estar vazio'),
})

// Condominium Schemas
export const condominioSchema = z.object({
    nome: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
    endereco: z.string().min(5, 'Endereço inválido'),
    cidade: z.string().min(2, 'Cidade inválida'),
    estado: z.string().length(2, 'Estado inválido'),
    cep: z.string().length(9, 'CEP inválido'),
    cnpj: z.string().length(18, 'CNPJ inválido'),
    telefone: z.string().optional(),
    email: z.string().email('E-mail inválido').optional(),
})

export const unidadeSchema = z.object({
    bloco: z.string().optional(),
    numero: z.string().min(1, 'Número inválido'),
    tipo: z.enum(['apartamento', 'casa', 'sala', 'loja']),
    area: z.number().positive('Área deve ser positiva').optional(),
    fracao_ideal: z.number().min(0, 'Fração ideal deve ser >= 0').max(1, 'Fração ideal deve ser <= 1').optional(),
    proprietario_id: z.string().uuid('Proprietário inválido').optional(),
    morador_id: z.string().uuid('Morador inválido').optional(),
})

// Rateio Schemas
export const rateioSchema = z.object({
    despesa_id: z.string().uuid('ID da despesa inválido'),
    modelo: z.enum(['igualitario', 'fracao_ideal', 'valor_fixo']),
    data_vencimento: z.string().min(1, 'Data de vencimento é obrigatória'),
    categoria_id: z.string().uuid('ID da categoria inválido'),
    observacoes: z.string().optional(),
    valores_manuais: z.record(z.string(), z.number().positive('Valor deve ser positivo')).optional(),
})

// Type exports
export type LoginFormData = z.infer<typeof loginSchema>
export type CadastroFormData = z.infer<typeof cadastroSchema>
export type LancamentoInput = z.infer<typeof lancamentoSchema>
export type CategoriaInput = z.infer<typeof categoriaSchema>
export type CentroCustoInput = z.infer<typeof centroCustoSchema>
export type QuadroInput = z.infer<typeof quadroSchema>
export type ListaInput = z.infer<typeof listaSchema>
export type CartaoInput = z.infer<typeof cartaoSchema>
export type ChecklistInput = z.infer<typeof checklistSchema>
export type ComentarioInput = z.infer<typeof comentarioSchema>
export type CondominioInput = z.infer<typeof condominioSchema>
export type UnidadeInput = z.infer<typeof unidadeSchema>
export type RateioInput = z.infer<typeof rateioSchema>
