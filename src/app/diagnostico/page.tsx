'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function DiagnosticoPage() {
    const [status, setStatus] = useState<any>({ loading: true })
    const supabase = createClient()

    useEffect(() => {
        async function runDiagnostics() {
            const results: any = {
                env: {
                    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
                    hasKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
                    keyPrefix: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 15)
                }
            }

            try {
                // Teste 1: Conexão Pública (Condominios)
                const start = performance.now()
                const { data, error, count } = await supabase
                    .from('condominios')
                    .select('count', { count: 'exact', head: true })

                results.connection = {
                    success: !error,
                    latency: Math.round(performance.now() - start) + 'ms',
                    error: error?.message,
                    count
                }

                // Teste 2: Auth Session
                const { data: { session }, error: sessionError } = await supabase.auth.getSession()
                results.auth = {
                    hasSession: !!session,
                    userEmail: session?.user?.email,
                    error: sessionError?.message
                }

                if (session?.user) {
                    // Teste 3: Perfil do Usuário
                    const { data: profile, error: profileError } = await supabase
                        .from('usuarios')
                        .select('*')
                        .eq('id', session.user.id)
                        .single()

                    results.profile = {
                        found: !!profile,
                        role: profile?.role,
                        error: profileError?.message
                    }
                }

            } catch (err: any) {
                results.exception = err.message
            }

            setStatus(results)
        }

        runDiagnostics()
    }, [])

    return (
        <div className="p-8 max-w-2xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold">Diagnóstico de Conexão Supabase</h1>

            <div className="p-4 bg-gray-100 rounded-lg overflow-auto font-mono text-sm">
                <pre>{JSON.stringify(status, null, 2)}</pre>
            </div>

            <div className="space-y-2">
                <p><strong>URL Esperada:</strong> https://uifwafiicunnksgrntgh.supabase.co</p>
                <p><strong>Key Esperada (Início):</strong> sb_publishable_...</p>
            </div>

            <div className="flex gap-4">
                <button
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                    Rodar Novamente
                </button>
                <button
                    onClick={() => window.location.href = '/login'}
                    className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                >
                    Ir para Login
                </button>
            </div>
        </div>
    )
}
