import { NextRequest } from 'next/server'
import {
    authorizeRequest,
    errorResponse,
    successResponse,
    parseRequestBody,
} from '@/lib/api-auth'
import { createClient } from '@/lib/supabase/server'
import { calcularRateio, RateioInput } from '@/lib/rateio'
import { Unidade } from '@/types'
import { z } from 'zod'

// Schema de validação do rateio
const rateioRequestSchema = z.object({
    despesa_id: z.string().uuid('ID da despesa inválido'),
    modelo: z.enum(['igualitario', 'fracao_ideal', 'valor_fixo']),
    data_vencimento: z.string().min(1, 'Data de vencimento obrigatória'),
    categoria_id: z.string().uuid('ID da categoria inválido'),
    observacoes: z.string().optional(),
    valores_manuais: z.record(z.string(), z.number().positive()).optional(),
})

// =====================================================
// POST /api/financeiro/rateio/calcular
// Calcula preview do rateio sem criar lançamentos.
// Acessível por: SINDICO+ (nível 60+)
// =====================================================
export async function POST(request: NextRequest) {
    // 1. Autenticação + autorização (apenas Síndico ou superior)
    const auth = await authorizeRequest('SINDICO')
    if (auth.error) return errorResponse(auth.error, auth.status)

    const user = auth.user!

    if (!user.condominio_id) {
        return errorResponse('Usuário não vinculado a um condomínio.', 403)
    }

    // 2. Parse + validação
    const { data: body, error: parseError } = await parseRequestBody<z.infer<typeof rateioRequestSchema>>(request)
    if (parseError || !body) {
        return errorResponse(parseError || 'Corpo da requisição inválido.', 400)
    }

    const validation = rateioRequestSchema.safeParse(body)
    if (!validation.success) {
        const messages = validation.error.issues.map((e) => `${String(e.path.join('.'))}: ${e.message}`)
        return errorResponse(`Dados inválidos: ${messages.join('; ')}`, 422)
    }

    const supabase = await createClient()

    // 3. Buscar a despesa
    const { data: despesa, error: despesaError } = await supabase
        .from('lancamentos_financeiros')
        .select('*')
        .eq('id', validation.data.despesa_id)
        .eq('tipo', 'despesa')
        .single()

    if (despesaError || !despesa) {
        return errorResponse('Despesa não encontrada ou não é do tipo "despesa".', 404)
    }

    // 4. Verificar que a despesa pertence ao condomínio do usuário
    if (despesa.condominio_id !== user.condominio_id) {
        return errorResponse('Despesa não pertence ao seu condomínio.', 403)
    }

    // 5. Buscar unidades do condomínio
    const { data: unidades, error: unidadesError } = await supabase
        .from('unidades')
        .select('*')
        .eq('condominio_id', user.condominio_id)
        .order('bloco', { ascending: true })
        .order('numero', { ascending: true })

    if (unidadesError) {
        return errorResponse('Erro ao buscar unidades do condomínio.', 500)
    }

    if (!unidades || unidades.length === 0) {
        return errorResponse('Nenhuma unidade cadastrada no condomínio.', 422)
    }

    // 6. Calcular rateio
    const rateioInput: RateioInput = {
        despesa_id: validation.data.despesa_id,
        valor_total: despesa.valor,
        modelo: validation.data.modelo,
        data_vencimento: validation.data.data_vencimento,
        categoria_id: validation.data.categoria_id,
        observacoes: validation.data.observacoes,
        valores_manuais: validation.data.valores_manuais,
    }

    const resultado = calcularRateio(rateioInput, unidades as Unidade[])

    if (!resultado.valido) {
        return errorResponse(
            `Rateio inválido: ${resultado.erros.join('; ')}`,
            422
        )
    }

    return successResponse({
        rateio: resultado,
        despesa: {
            id: despesa.id,
            descricao: despesa.descricao,
            valor: despesa.valor,
        },
        modelo: validation.data.modelo,
        total_unidades: unidades.length,
    })
}
