import { NextRequest } from 'next/server'
import {
    authenticateRequest,
    authorizeRequest,
    errorResponse,
    successResponse,
    parseRequestBody,
} from '@/lib/api-auth'
import { createClient } from '@/lib/supabase/server'
import { lancamentoSchema } from '@/lib/validations'
import { LancamentoInput } from '@/lib/validations'

// =====================================================
// GET /api/financeiro/lancamentos
// Lista lançamentos do condomínio do usuário autenticado.
// Acessível por: MORADOR+ (nível 20+)
// =====================================================
export async function GET(request: NextRequest) {
    // 1. Autenticação
    const auth = await authenticateRequest()
    if (auth.error) return errorResponse(auth.error, auth.status)

    const user = auth.user!

    // 2. Verificar vínculo com condomínio
    if (!user.condominio_id && user.role !== 'ADMIN_SAAS') {
        return errorResponse('Usuário não vinculado a um condomínio.', 403)
    }

    // 3. Buscar lançamentos (RLS garante isolamento)
    const supabase = await createClient()
    const searchParams = request.nextUrl.searchParams
    const tipo = searchParams.get('tipo')
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '10')

    let query = supabase
        .from('lancamentos_financeiros')
        .select('*, categoria:categorias(*), unidade:unidades(*)', { count: 'exact' })
        .order('data_vencimento', { ascending: false })

    // Filtros opcionais
    if (tipo && (tipo === 'receita' || tipo === 'despesa')) {
        query = query.eq('tipo', tipo)
    }
    if (status && ['pago', 'pendente', 'atrasado', 'cancelado'].includes(status)) {
        query = query.eq('status', status)
    }

    // Paginação
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1
    query = query.range(from, to)

    const { data, error, count } = await query

    if (error) {
        return errorResponse(`Erro ao buscar lançamentos: ${error.message}`, 500)
    }

    return successResponse({
        lancamentos: data,
        total: count || 0,
        page,
        pageSize,
        totalPages: Math.ceil((count || 0) / pageSize),
    })
}

// =====================================================
// POST /api/financeiro/lancamentos
// Cria um novo lançamento financeiro.
// Acessível por: CONSELHEIRO+ (nível 40+)
// =====================================================
export async function POST(request: NextRequest) {
    // 1. Autenticação + autorização
    const auth = await authorizeRequest('CONSELHEIRO')
    if (auth.error) return errorResponse(auth.error, auth.status)

    const user = auth.user!

    // 2. Verificar vínculo com condomínio
    if (!user.condominio_id) {
        return errorResponse('Usuário não vinculado a um condomínio.', 403)
    }

    // 3. Parse + validação do body
    const { data: body, error: parseError } = await parseRequestBody<LancamentoInput>(request)
    if (parseError || !body) {
        return errorResponse(parseError || 'Corpo da requisição inválido.', 400)
    }

    const validation = lancamentoSchema.safeParse(body)
    if (!validation.success) {
        const messages = validation.error.issues.map((e) => `${String(e.path.join('.'))}: ${e.message}`)
        return errorResponse(`Dados inválidos: ${messages.join('; ')}`, 422)
    }

    // 4. Validação de negócio: categoria deve pertencer ao mesmo condomínio
    const supabase = await createClient()

    const { data: categoria } = await supabase
        .from('categorias')
        .select('id, tipo, condominio_id')
        .eq('id', validation.data.categoria_id)
        .single()

    if (!categoria) {
        return errorResponse('Categoria não encontrada.', 404)
    }

    if (categoria.condominio_id !== user.condominio_id) {
        return errorResponse('Categoria não pertence ao seu condomínio.', 403)
    }

    if (categoria.tipo !== validation.data.tipo) {
        return errorResponse(
            `Tipo do lançamento (${validation.data.tipo}) não corresponde ao tipo da categoria (${categoria.tipo}).`,
            422
        )
    }

    // 5. Inserir
    const { data: lancamento, error: insertError } = await supabase
        .from('lancamentos_financeiros')
        .insert({
            ...validation.data,
            condominio_id: user.condominio_id,
            created_by: user.id,
        })
        .select()
        .single()

    if (insertError) {
        return errorResponse(`Erro ao criar lançamento: ${insertError.message}`, 500)
    }

    return successResponse(lancamento, 201)
}
