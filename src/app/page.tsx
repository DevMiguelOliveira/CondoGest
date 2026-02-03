'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Building2, ArrowRight, CheckCircle2, BarChart3, Kanban, Shield, Users, Zap } from 'lucide-react'

const features = [
  {
    icon: BarChart3,
    title: 'Gestão Financeira Completa',
    description: 'Controle receitas, despesas, inadimplência e fluxo de caixa com relatórios detalhados.',
  },
  {
    icon: Kanban,
    title: 'Kanban Integrado',
    description: 'Gerencie tarefas e projetos com quadros visuais conectados ao financeiro.',
  },
  {
    icon: Shield,
    title: 'Segurança Avançada',
    description: 'Controle de acesso por perfil (RBAC) e dados isolados por condomínio.',
  },
  {
    icon: Users,
    title: 'Multi-usuários',
    description: 'Síndicos, conselheiros, moradores e prestadores com permissões específicas.',
  },
  {
    icon: Zap,
    title: 'Automações',
    description: 'Cálculo automático de multas, juros e sincronização entre módulos.',
  },
  {
    icon: Building2,
    title: 'Multi-tenant',
    description: 'Gerencie múltiplos condomínios em uma única plataforma.',
  },
]

const benefits = [
  'Reduza a inadimplência em até 40%',
  'Economize 10+ horas por semana',
  'Relatórios em tempo real',
  'Acesso de qualquer dispositivo',
  'Suporte especializado',
  'Atualizações contínuas',
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 shadow-lg shadow-blue-500/30">
              <Building2 className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-xl">CondoGest</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Funcionalidades
            </a>
            <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Preços
            </a>
            <a href="#contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Contato
            </a>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost">Entrar</Button>
            </Link>
            <Link href="/cadastro">
              <Button>Começar Grátis</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 md:py-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-4xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <Zap className="h-4 w-4" />
            Novo: Integração Financeiro + Kanban
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            Gestão Condominial
            <span className="gradient-text block">Moderna e Inteligente</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Simplifique a administração do seu condomínio com nossa plataforma completa.
            Financeiro, tarefas e comunicação em um só lugar.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/cadastro">
              <Button size="xl">
                Começar Agora
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Button variant="outline" size="xl">
              Ver Demonstração
            </Button>
          </div>
        </motion.div>

        {/* Hero Image/Preview */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-16 relative"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent z-10 h-32 bottom-0 top-auto" />
          <div className="rounded-2xl border shadow-2xl overflow-hidden bg-card">
            <div className="aspect-video bg-gradient-to-br from-blue-500/10 to-purple-500/10 flex items-center justify-center">
              <div className="text-center">
                <Building2 className="h-16 w-16 text-primary mx-auto mb-4" />
                <p className="text-lg font-medium">Preview do Dashboard</p>
                <p className="text-sm text-muted-foreground">Interface moderna e intuitiva</p>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Tudo que você precisa em um só lugar
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Ferramentas poderosas para simplificar a gestão do seu condomínio
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="p-6 rounded-2xl border bg-card hover:shadow-lg transition-all card-hover"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="bg-primary/5 py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Por que escolher o CondoGest?
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Desenvolvido por especialistas em gestão condominial, nosso sistema
                oferece as ferramentas certas para otimizar sua rotina.
              </p>
              <div className="grid grid-cols-2 gap-4">
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={benefit}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="flex items-center gap-2"
                  >
                    <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                    <span className="text-sm font-medium">{benefit}</span>
                  </motion.div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="rounded-2xl bg-gradient-to-br from-primary/20 to-purple-500/20 aspect-square flex items-center justify-center">
                <BarChart3 className="h-32 w-32 text-primary/50" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="relative rounded-3xl bg-gradient-to-r from-blue-600 to-blue-800 p-12 md:p-16 text-center text-white overflow-hidden"
        >
          <div className="absolute inset-0 bg-grid-white/10" />
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Pronto para transformar sua gestão?
            </h2>
            <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
              Comece gratuitamente e veja como o CondoGest pode simplificar
              a administração do seu condomínio.
            </p>
            <Link href="/cadastro">
              <Button size="xl" variant="secondary" className="bg-white text-primary hover:bg-blue-50">
                Criar Conta Grátis
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-700">
                <Building2 className="h-4 w-4 text-white" />
              </div>
              <span className="font-semibold">CondoGest</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 CondoGest. Todos os direitos reservados.
            </p>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">Termos</a>
              <a href="#" className="hover:text-foreground transition-colors">Privacidade</a>
              <a href="#" className="hover:text-foreground transition-colors">Suporte</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
