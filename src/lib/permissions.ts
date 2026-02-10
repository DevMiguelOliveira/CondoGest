import { UserRole } from '@/types'

// =====================================================
// Definição centralizada de permissões por recurso + ação
// =====================================================

export type ResourceAction = 'view' | 'create' | 'update' | 'delete' | 'approve'

export type Resource =
    | 'dashboard'
    | 'lancamentos'
    | 'categorias'
    | 'centros_custo'
    | 'unidades'
    | 'usuarios'
    | 'quadros'
    | 'cartoes'
    | 'rateio'
    | 'relatorios'
    | 'configuracoes'
    | 'audit_log'

/**
 * Mapa de permissões: para cada recurso, quais roles têm acesso a cada ação.
 * Roles com nível mais alto herdam automaticamente via roleHierarchy.
 */
const permissionMap: Record<Resource, Partial<Record<ResourceAction, UserRole>>> = {
    dashboard: {
        view: 'MORADOR',
    },
    lancamentos: {
        view: 'MORADOR',
        create: 'CONSELHEIRO',
        update: 'CONSELHEIRO',
        delete: 'SINDICO',
        approve: 'SINDICO',
    },
    categorias: {
        view: 'MORADOR',
        create: 'SINDICO',
        update: 'SINDICO',
        delete: 'ADMIN_CONDOMINIO',
    },
    centros_custo: {
        view: 'CONSELHEIRO',
        create: 'SINDICO',
        update: 'SINDICO',
        delete: 'ADMIN_CONDOMINIO',
    },
    unidades: {
        view: 'MORADOR',
        create: 'SINDICO',
        update: 'SINDICO',
        delete: 'ADMIN_CONDOMINIO',
    },
    usuarios: {
        view: 'SINDICO',
        create: 'ADMIN_CONDOMINIO',
        update: 'ADMIN_CONDOMINIO',
        delete: 'ADMIN_SAAS',
    },
    quadros: {
        view: 'MORADOR',
        create: 'CONSELHEIRO',
        update: 'CONSELHEIRO',
        delete: 'SINDICO',
    },
    cartoes: {
        view: 'MORADOR',
        create: 'PRESTADOR',
        update: 'PRESTADOR',
        delete: 'SINDICO',
    },
    rateio: {
        view: 'CONSELHEIRO',
        create: 'SINDICO',
        approve: 'SINDICO',
    },
    relatorios: {
        view: 'CONSELHEIRO',
    },
    configuracoes: {
        view: 'SINDICO',
        update: 'ADMIN_CONDOMINIO',
    },
    audit_log: {
        view: 'ADMIN_CONDOMINIO',
    },
}

const roleHierarchy: Record<UserRole, number> = {
    ADMIN_SAAS: 100,
    ADMIN_CONDOMINIO: 80,
    SINDICO: 60,
    CONSELHEIRO: 40,
    MORADOR: 20,
    PRESTADOR: 10,
}

/**
 * Verifica se um papel tem nível suficiente para uma ação em um recurso.
 */
export function hasPermission(
    userRole: UserRole,
    resource: Resource,
    action: ResourceAction
): boolean {
    const requiredRole = permissionMap[resource]?.[action]
    if (!requiredRole) return false
    return roleHierarchy[userRole] >= roleHierarchy[requiredRole]
}

/**
 * Retorna a role mínima necessária para uma ação em um recurso.
 */
export function getRequiredRole(
    resource: Resource,
    action: ResourceAction
): UserRole | null {
    return permissionMap[resource]?.[action] ?? null
}

/**
 * Verifica se o papel do usuário é pelo menos do nível informado.
 */
export function hasMinimumRole(userRole: UserRole, minimumRole: UserRole): boolean {
    return roleHierarchy[userRole] >= roleHierarchy[minimumRole]
}

/**
 * Retorna o nível numérico de um papel.
 */
export function getRoleLevel(role: UserRole): number {
    return roleHierarchy[role]
}
