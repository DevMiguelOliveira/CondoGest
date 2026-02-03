'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User, UserRole } from '@/types'
import { useRouter } from 'next/navigation'

interface AuthContextType {
    user: User | null
    loading: boolean
    signIn: (email: string, password: string) => Promise<{ error: string | null }>
    signUp: (email: string, password: string, name: string) => Promise<{ error: string | null }>
    signOut: () => Promise<void>
    hasPermission: (requiredRole: UserRole) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const roleHierarchy: Record<UserRole, number> = {
    ADMIN_SAAS: 100,
    ADMIN_CONDOMINIO: 80,
    SINDICO: 60,
    CONSELHEIRO: 40,
    MORADOR: 20,
    PRESTADOR: 10,
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)
    const supabase = createClient()
    const router = useRouter()

    useEffect(() => {
        const getUser = async () => {
            const { data: { session } } = await supabase.auth.getSession()

            if (session?.user) {
                // Get user profile from our users table
                const { data: profile } = await supabase
                    .from('usuarios')
                    .select('*')
                    .eq('id', session.user.id)
                    .single()

                if (profile) {
                    setUser(profile as User)
                }
            }

            setLoading(false)
        }

        getUser()

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                if (event === 'SIGNED_OUT') {
                    setUser(null)
                } else if (session?.user) {
                    const { data: profile } = await supabase
                        .from('usuarios')
                        .select('*')
                        .eq('id', session.user.id)
                        .single()

                    if (profile) {
                        setUser(profile as User)
                    }
                }
                setLoading(false)
            }
        )

        return () => subscription.unsubscribe()
    }, [supabase])

    const signIn = async (email: string, password: string) => {
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })

        if (error) {
            return { error: error.message }
        }

        return { error: null }
    }

    const signUp = async (email: string, password: string, name: string) => {
        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    nome: name,
                },
            },
        })

        if (error) {
            return { error: error.message }
        }

        return { error: null }
    }

    const signOut = async () => {
        await supabase.auth.signOut()
        router.push('/login')
    }

    const hasPermission = (requiredRole: UserRole): boolean => {
        if (!user) return false
        return roleHierarchy[user.role] >= roleHierarchy[requiredRole]
    }

    return (
        <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut, hasPermission }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}
