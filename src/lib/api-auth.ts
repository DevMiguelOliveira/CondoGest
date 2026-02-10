import { createClient } from '@/lib/supabase/server'
import { UserRole } from '@/types'
import { hasMinimumRole } from '@/lib/permissions'
import { NextRequest, NextResponse } from 'next/server'

// =====================================================
// Helpers para API Routes protegidas (Next.js App Router)
// =====================================================

export interface AuthenticatedUser {
    id: string
    email: string
    role: UserRole
    condominio_id: string | null
}

export interface AuthResult {
    user: AuthenticatedUser | null
    error: string | null
    status: number
}

/**
 * Valida autenticação e retorna dados do usuário.
 * Uso em API Routes:
 *
 * ```ts
 * const auth = await authenticateRequest()
 * if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status })
 * const user = auth.user!
 * ```
 */
export async function authenticateRequest(): Promise<AuthResult> {
    try {
        const supabase = await createClient()

        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()

        if (authError || !authUser) {
            return {
                user: null,
                error: 'Não autenticado. Faça login para continuar.',
                status: 401,
            }
        }

        // Buscar perfil do usuário com role e condominio_id
        const { data: profile, error: profileError } = await supabase
            .from('usuarios')
            .select('id, email, role, condominio_id')
            .eq('id', authUser.id)
            .single()

        if (profileError || !profile) {
            return {
                user: null,
                error: 'Perfil de usuário não encontrado.',
                status: 403,
            }
        }

        return {
            user: profile as AuthenticatedUser,
            error: null,
            status: 200,
        }
    } catch {
        return {
            user: null,
            error: 'Erro interno de autenticação.',
            status: 500,
        }
    }
}

/**
 * Valida autenticação + autorização por role mínima.
 *
 * ```ts
 * const auth = await authorizeRequest('SINDICO')
 * if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status })
 * ```
 */
export async function authorizeRequest(minimumRole: UserRole): Promise<AuthResult> {
    const auth = await authenticateRequest()

    if (auth.error) return auth

    if (!hasMinimumRole(auth.user!.role, minimumRole)) {
        return {
            user: auth.user,
            error: `Acesso negado. Nível mínimo requerido: ${minimumRole}.`,
            status: 403,
        }
    }

    return auth
}

/**
 * Valida que o usuário pertence ao condomínio informado.
 * Impede acesso cross-tenant.
 */
export function validateTenantAccess(
    user: AuthenticatedUser,
    requestedCondominioId: string
): { error: string | null; status: number } {
    // ADMIN_SAAS pode acessar qualquer condomínio
    if (user.role === 'ADMIN_SAAS') {
        return { error: null, status: 200 }
    }

    if (!user.condominio_id) {
        return {
            error: 'Usuário não está vinculado a nenhum condomínio.',
            status: 403,
        }
    }

    if (user.condominio_id !== requestedCondominioId) {
        return {
            error: 'Acesso negado. Você não pertence a este condomínio.',
            status: 403,
        }
    }

    return { error: null, status: 200 }
}

/**
 * Helper para criar respostas de erro padronizadas.
 */
export function errorResponse(message: string, status: number = 400) {
    return NextResponse.json(
        { error: message, success: false, data: null },
        { status }
    )
}

/**
 * Helper para criar respostas de sucesso padronizadas.
 */
export function successResponse<T>(data: T, status: number = 200) {
    return NextResponse.json(
        { data, error: null, success: true },
        { status }
    )
}

/**
 * Valida que o body da requisição não está vazio e é JSON válido.
 */
export async function parseRequestBody<T>(request: NextRequest): Promise<{
    data: T | null
    error: string | null
}> {
    try {
        const body = await request.json()
        if (!body || typeof body !== 'object') {
            return { data: null, error: 'Corpo da requisição inválido.' }
        }
        return { data: body as T, error: null }
    } catch {
        return { data: null, error: 'JSON inválido no corpo da requisição.' }
    }
}
