'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'framer-motion'
import { Building2, Mail, Lock, Eye, EyeOff, ArrowLeft, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { loginSchema, LoginFormData } from '@/lib/validations'
import { useAuth } from '@/contexts/AuthContext'

function LoginForm() {
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const { signIn } = useAuth()
    const router = useRouter()
    const searchParams = useSearchParams()
    const redirect = searchParams.get('redirect') || '/dashboard'

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
    })

    const onSubmit = async (data: LoginFormData) => {
        setError(null)
        const { error } = await signIn(data.email, data.password)

        if (error) {
            setError(error)
            return
        }

        router.push(redirect)
    }

    return (
        <div className="min-h-screen flex">
            {/* Left Side - Form */}
            <div className="flex-1 flex items-center justify-center p-8">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-md"
                >
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Voltar ao início
                    </Link>

                    <Card variant="elevated">
                        <CardHeader className="text-center">
                            <div className="flex justify-center mb-4">
                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 shadow-lg shadow-blue-500/30">
                                    <Building2 className="h-7 w-7 text-white" />
                                </div>
                            </div>
                            <CardTitle className="text-2xl">Bem-vindo de volta</CardTitle>
                            <CardDescription>
                                Entre com suas credenciais para acessar o sistema
                            </CardDescription>
                        </CardHeader>

                        <CardContent>
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="p-3 rounded-xl bg-destructive/10 text-destructive text-sm"
                                    >
                                        {error}
                                    </motion.div>
                                )}

                                <div className="space-y-2">
                                    <Label htmlFor="email">E-mail</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="seu@email.com"
                                        icon={<Mail className="h-4 w-4" />}
                                        {...register('email')}
                                        error={errors.email?.message}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="password">Senha</Label>
                                        <Link
                                            href="/recuperar-senha"
                                            className="text-xs text-primary hover:underline"
                                        >
                                            Esqueceu a senha?
                                        </Link>
                                    </div>
                                    <div className="relative">
                                        <Input
                                            id="password"
                                            type={showPassword ? 'text' : 'password'}
                                            placeholder="••••••••"
                                            icon={<Lock className="h-4 w-4" />}
                                            {...register('password')}
                                            error={errors.password?.message}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                        >
                                            {showPassword ? (
                                                <EyeOff className="h-4 w-4" />
                                            ) : (
                                                <Eye className="h-4 w-4" />
                                            )}
                                        </button>
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full"
                                    size="lg"
                                    isLoading={isSubmitting}
                                >
                                    Entrar
                                </Button>
                            </form>

                            <div className="mt-6 text-center text-sm">
                                <span className="text-muted-foreground">Não tem uma conta? </span>
                                <Link href="/cadastro" className="text-primary hover:underline font-medium">
                                    Criar conta grátis
                                </Link>
                            </div>

                            {/* Demo credentials */}
                            <div className="mt-6 p-4 rounded-xl bg-muted/50 text-sm">
                                <p className="font-medium mb-2">Credenciais de demonstração:</p>
                                <p className="text-muted-foreground">Email: demo@condogest.com</p>
                                <p className="text-muted-foreground">Senha: demo123</p>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* Right Side - Decoration */}
            <div className="hidden lg:flex flex-1 bg-gradient-to-br from-blue-600 to-blue-800 items-center justify-center p-12">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.7 }}
                    className="text-white max-w-lg"
                >
                    <h2 className="text-4xl font-bold mb-6">
                        Gestão condominial simplificada
                    </h2>
                    <p className="text-lg text-blue-100 mb-8">
                        Acesse suas finanças, tarefas e comunicação em uma única plataforma
                        moderna e intuitiva.
                    </p>
                    <div className="space-y-4">
                        {[
                            'Controle financeiro completo',
                            'Kanban integrado ao financeiro',
                            'Relatórios em tempo real',
                            'Acesso multi-dispositivo',
                        ].map((item, index) => (
                            <motion.div
                                key={item}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 + index * 0.1 }}
                                className="flex items-center gap-3"
                            >
                                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                                    <div className="w-2 h-2 rounded-full bg-white" />
                                </div>
                                <span>{item}</span>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </div>
    )
}

export default function LoginPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        }>
            <LoginForm />
        </Suspense>
    )
}
