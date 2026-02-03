'use client'

import { useState } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { MetricCard } from '@/components/dashboard/MetricCard'
import { FluxoCaixaChart } from '@/components/dashboard/FluxoCaixaChart'
import { DespesaCategoriaChart } from '@/components/dashboard/DespesaCategoriaChart'
import { UltimosLancamentos } from '@/components/dashboard/UltimosLancamentos'
import { QuadrosResumo } from '@/components/dashboard/QuadrosResumo'
import {
    DollarSign,
    TrendingUp,
    TrendingDown,
    AlertTriangle,
    Users,
    Building2,
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { motion } from 'framer-motion'
import { LancamentoFinanceiro, Cartao } from '@/types'

// Mock data for demonstration
const mockMetrics = {
    saldoAtual: 125430.50,
    totalReceitas: 89500.00,
    totalDespesas: 64070.50,
    inadimplencia: 12350.00,
    inadimplenciaPercentual: 8.5,
}

const mockFluxoCaixa = [
    { mes: 'Jul', receitas: 75000, despesas: 58000, saldo: 17000 },
    { mes: 'Ago', receitas: 82000, despesas: 61000, saldo: 21000 },
    { mes: 'Set', receitas: 78500, despesas: 59500, saldo: 19000 },
    { mes: 'Out', receitas: 85000, despesas: 62000, saldo: 23000 },
    { mes: 'Nov', receitas: 83000, despesas: 60500, saldo: 22500 },
    { mes: 'Dez', receitas: 89500, despesas: 64070, saldo: 25430 },
]

const mockDespesasCategoria = [
    { categoria: 'Manutenção', valor: 18500, percentual: 29, cor: '#3B82F6' },
    { categoria: 'Funcionários', valor: 22000, percentual: 34, cor: '#10B981' },
    { categoria: 'Água/Luz', valor: 12500, percentual: 20, cor: '#F59E0B' },
    { categoria: 'Segurança', valor: 8500, percentual: 13, cor: '#8B5CF6' },
    { categoria: 'Outros', valor: 2570, percentual: 4, cor: '#EC4899' },
]

const mockLancamentos: LancamentoFinanceiro[] = [
    {
        id: '1',
        condominio_id: '1',
        tipo: 'receita',
        descricao: 'Taxa Condominial - Janeiro',
        valor: 450.00,
        data_vencimento: '2024-01-10',
        status: 'pago',
        categoria_id: '1',
        created_at: '2024-01-01',
        updated_at: '2024-01-10',
    },
    {
        id: '2',
        condominio_id: '1',
        tipo: 'despesa',
        descricao: 'Manutenção Elevador',
        valor: 2500.00,
        data_vencimento: '2024-01-15',
        status: 'pendente',
        categoria_id: '2',
        created_at: '2024-01-05',
        updated_at: '2024-01-05',
    },
    {
        id: '3',
        condominio_id: '1',
        tipo: 'receita',
        descricao: 'Taxa Condominial - Apt 101',
        valor: 450.00,
        data_vencimento: '2024-01-10',
        status: 'atrasado',
        categoria_id: '1',
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
    },
    {
        id: '4',
        condominio_id: '1',
        tipo: 'despesa',
        descricao: 'Conta de Energia',
        valor: 3200.00,
        data_vencimento: '2024-01-20',
        status: 'pago',
        categoria_id: '3',
        created_at: '2024-01-15',
        updated_at: '2024-01-18',
    },
    {
        id: '5',
        condominio_id: '1',
        tipo: 'despesa',
        descricao: 'Serviço de Jardinagem',
        valor: 800.00,
        data_vencimento: '2024-01-25',
        status: 'pendente',
        categoria_id: '4',
        created_at: '2024-01-20',
        updated_at: '2024-01-20',
    },
]

const mockCartoes: Cartao[] = [
    {
        id: '1',
        lista_id: '1',
        titulo: 'Revisar contrato de segurança',
        descricao: 'Analisar proposta de renovação do contrato',
        ordem: 1,
        prioridade: 'alta',
        status: 'em_andamento',
        data_vencimento: '2024-01-20',
        created_at: '2024-01-01',
        updated_at: '2024-01-15',
        checklists: [
            {
                id: '1',
                cartao_id: '1',
                titulo: 'Tarefas',
                ordem: 1,
                items: [
                    { id: '1', titulo: 'Analisar proposta', concluido: true, ordem: 1 },
                    { id: '2', titulo: 'Comparar preços', concluido: true, ordem: 2 },
                    { id: '3', titulo: 'Aprovar em assembleia', concluido: false, ordem: 3 },
                ],
                created_at: '2024-01-01',
                updated_at: '2024-01-15',
            },
        ],
    },
    {
        id: '2',
        lista_id: '1',
        titulo: 'Manutenção Piscina',
        ordem: 2,
        prioridade: 'urgente',
        status: 'pendente',
        data_vencimento: '2024-01-18',
        lancamento_id: '2',
        created_at: '2024-01-05',
        updated_at: '2024-01-05',
    },
    {
        id: '3',
        lista_id: '2',
        titulo: 'Atualizar regulamento interno',
        ordem: 1,
        prioridade: 'media',
        status: 'pendente',
        created_at: '2024-01-10',
        updated_at: '2024-01-10',
    },
]

export default function DashboardPage() {
    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Page Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                        <p className="text-muted-foreground">
                            Visão geral das finanças e tarefas do condomínio
                        </p>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>Última atualização: Hoje às 14:32</span>
                    </div>
                </div>

                {/* Metrics Grid */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <MetricCard
                        title="Saldo Atual"
                        value={formatCurrency(mockMetrics.saldoAtual)}
                        subtitle="Atualizado em tempo real"
                        icon={DollarSign}
                        variant="info"
                        trend={{ value: 12.5, isPositive: true }}
                    />
                    <MetricCard
                        title="Receitas (Mês)"
                        value={formatCurrency(mockMetrics.totalReceitas)}
                        subtitle="Total arrecadado"
                        icon={TrendingUp}
                        variant="success"
                        trend={{ value: 8.2, isPositive: true }}
                    />
                    <MetricCard
                        title="Despesas (Mês)"
                        value={formatCurrency(mockMetrics.totalDespesas)}
                        subtitle="Total de gastos"
                        icon={TrendingDown}
                        variant="danger"
                        trend={{ value: 3.1, isPositive: false }}
                    />
                    <MetricCard
                        title="Inadimplência"
                        value={formatCurrency(mockMetrics.inadimplencia)}
                        subtitle={`${mockMetrics.inadimplenciaPercentual}% do total`}
                        icon={AlertTriangle}
                        variant="warning"
                    />
                </div>

                {/* Charts Row */}
                <div className="grid gap-6 lg:grid-cols-3">
                    <FluxoCaixaChart data={mockFluxoCaixa} />
                    <DespesaCategoriaChart data={mockDespesasCategoria} />
                </div>

                {/* Bottom Row */}
                <div className="grid gap-6 lg:grid-cols-2">
                    <UltimosLancamentos lancamentos={mockLancamentos} />
                    <QuadrosResumo cartoes={mockCartoes} />
                </div>

                {/* Quick Stats */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="grid gap-4 md:grid-cols-3"
                >
                    <div className="p-4 rounded-2xl border bg-card flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-primary/10">
                            <Building2 className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Unidades</p>
                            <p className="text-2xl font-bold">48</p>
                        </div>
                    </div>
                    <div className="p-4 rounded-2xl border bg-card flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-emerald-500/10">
                            <Users className="h-6 w-6 text-emerald-500" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Moradores</p>
                            <p className="text-2xl font-bold">156</p>
                        </div>
                    </div>
                    <div className="p-4 rounded-2xl border bg-card flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-amber-500/10">
                            <AlertTriangle className="h-6 w-6 text-amber-500" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Tarefas Pendentes</p>
                            <p className="text-2xl font-bold">12</p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </DashboardLayout>
    )
}
