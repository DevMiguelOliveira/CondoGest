'use client'

import { useState } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { LancamentosTable } from '@/components/financeiro/LancamentosTable'
import { LancamentoFormDialog } from '@/components/financeiro/LancamentoFormDialog'
import { InadimplenciaPanel } from '@/components/financeiro/InadimplenciaPanel'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { LancamentoFinanceiro, Categoria, CentroCusto, Unidade } from '@/types'
import { LancamentoInput } from '@/lib/validations'

// Mock data
const mockCategorias: Categoria[] = [
    { id: '1', condominio_id: '1', nome: 'Taxa Condominial', tipo: 'receita', cor: '#10B981', created_at: '' },
    { id: '2', condominio_id: '1', nome: 'Aluguel Salão', tipo: 'receita', cor: '#3B82F6', created_at: '' },
    { id: '3', condominio_id: '1', nome: 'Manutenção', tipo: 'despesa', cor: '#F59E0B', created_at: '' },
    { id: '4', condominio_id: '1', nome: 'Funcionários', tipo: 'despesa', cor: '#8B5CF6', created_at: '' },
    { id: '5', condominio_id: '1', nome: 'Água/Luz', tipo: 'despesa', cor: '#EF4444', created_at: '' },
]

const mockCentrosCusto: CentroCusto[] = [
    { id: '1', condominio_id: '1', nome: 'Área Comum', ativo: true, created_at: '' },
    { id: '2', condominio_id: '1', nome: 'Piscina', ativo: true, created_at: '' },
    { id: '3', condominio_id: '1', nome: 'Salão de Festas', ativo: true, created_at: '' },
]

const mockUnidades: Unidade[] = [
    { id: '1', condominio_id: '1', bloco: 'A', numero: '101', tipo: 'apartamento', created_at: '', updated_at: '' },
    { id: '2', condominio_id: '1', bloco: 'A', numero: '102', tipo: 'apartamento', created_at: '', updated_at: '' },
    { id: '3', condominio_id: '1', bloco: 'A', numero: '201', tipo: 'apartamento', created_at: '', updated_at: '' },
    { id: '4', condominio_id: '1', bloco: 'B', numero: '101', tipo: 'apartamento', created_at: '', updated_at: '' },
]

const mockLancamentos: LancamentoFinanceiro[] = [
    {
        id: '1',
        condominio_id: '1',
        tipo: 'receita',
        descricao: 'Taxa Condominial - Janeiro - Apt 101',
        valor: 650.00,
        data_vencimento: '2024-01-10',
        data_pagamento: '2024-01-08',
        status: 'pago',
        categoria_id: '1',
        unidade_id: '1',
        created_at: '2024-01-01',
        updated_at: '2024-01-08',
        categoria: mockCategorias[0],
    },
    {
        id: '2',
        condominio_id: '1',
        tipo: 'receita',
        descricao: 'Taxa Condominial - Janeiro - Apt 102',
        valor: 650.00,
        data_vencimento: '2024-01-10',
        status: 'atrasado',
        categoria_id: '1',
        unidade_id: '2',
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
        categoria: mockCategorias[0],
    },
    {
        id: '3',
        condominio_id: '1',
        tipo: 'despesa',
        descricao: 'Manutenção Elevador - Preventiva',
        valor: 2500.00,
        data_vencimento: '2024-01-15',
        status: 'pendente',
        categoria_id: '3',
        centro_custo_id: '1',
        created_at: '2024-01-05',
        updated_at: '2024-01-05',
        categoria: mockCategorias[2],
    },
    {
        id: '4',
        condominio_id: '1',
        tipo: 'despesa',
        descricao: 'Conta de Energia - Dezembro',
        valor: 4800.00,
        data_vencimento: '2024-01-20',
        data_pagamento: '2024-01-18',
        status: 'pago',
        categoria_id: '5',
        created_at: '2024-01-10',
        updated_at: '2024-01-18',
        categoria: mockCategorias[4],
    },
    {
        id: '5',
        condominio_id: '1',
        tipo: 'receita',
        descricao: 'Aluguel Salão de Festas - 15/01',
        valor: 350.00,
        data_vencimento: '2024-01-15',
        data_pagamento: '2024-01-14',
        status: 'pago',
        categoria_id: '2',
        created_at: '2024-01-10',
        updated_at: '2024-01-14',
        categoria: mockCategorias[1],
    },
    {
        id: '6',
        condominio_id: '1',
        tipo: 'receita',
        descricao: 'Taxa Condominial - Janeiro - Apt 201',
        valor: 650.00,
        data_vencimento: '2024-01-10',
        status: 'atrasado',
        categoria_id: '1',
        unidade_id: '3',
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
        categoria: mockCategorias[0],
    },
    {
        id: '7',
        condominio_id: '1',
        tipo: 'despesa',
        descricao: 'Folha de Pagamento - Janeiro',
        valor: 8500.00,
        data_vencimento: '2024-01-05',
        data_pagamento: '2024-01-05',
        status: 'pago',
        categoria_id: '4',
        centro_custo_id: '1',
        created_at: '2024-01-03',
        updated_at: '2024-01-05',
        categoria: mockCategorias[3],
    },
]

export default function FinanceiroPage() {
    const [lancamentos, setLancamentos] = useState<LancamentoFinanceiro[]>(mockLancamentos)
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [editingLancamento, setEditingLancamento] = useState<LancamentoFinanceiro | null>(null)

    const handleAdd = () => {
        setEditingLancamento(null)
        setIsFormOpen(true)
    }

    const handleEdit = (lancamento: LancamentoFinanceiro) => {
        setEditingLancamento(lancamento)
        setIsFormOpen(true)
    }

    const handleDelete = (id: string) => {
        setLancamentos((prev) => prev.filter((l) => l.id !== id))
    }

    const handleView = (lancamento: LancamentoFinanceiro) => {
        console.log('View lancamento:', lancamento)
    }

    const handleLinkToKanban = (lancamento: LancamentoFinanceiro) => {
        console.log('Link to Kanban:', lancamento)
    }

    const handleSubmit = (data: LancamentoInput) => {
        if (editingLancamento) {
            // Update
            setLancamentos((prev) =>
                prev.map((l) =>
                    l.id === editingLancamento.id
                        ? { ...l, ...data, updated_at: new Date().toISOString() }
                        : l
                )
            )
        } else {
            // Create
            const newLancamento: LancamentoFinanceiro = {
                id: Math.random().toString(36).substring(7),
                condominio_id: '1',
                ...data,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                categoria: mockCategorias.find((c) => c.id === data.categoria_id),
            }
            setLancamentos((prev) => [newLancamento, ...prev])
        }
        setIsFormOpen(false)
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Page Header */}
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Financeiro</h1>
                    <p className="text-muted-foreground">
                        Gerencie receitas, despesas e acompanhe o fluxo de caixa
                    </p>
                </div>

                {/* Content Tabs */}
                <Tabs defaultValue="lancamentos" className="space-y-6">
                    <TabsList>
                        <TabsTrigger value="lancamentos">Lançamentos</TabsTrigger>
                        <TabsTrigger value="inadimplencia">Inadimplência</TabsTrigger>
                        <TabsTrigger value="relatorios">Relatórios</TabsTrigger>
                    </TabsList>

                    <TabsContent value="lancamentos">
                        <LancamentosTable
                            lancamentos={lancamentos}
                            onAdd={handleAdd}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            onView={handleView}
                            onLinkToKanban={handleLinkToKanban}
                        />
                    </TabsContent>

                    <TabsContent value="inadimplencia">
                        <InadimplenciaPanel
                            lancamentos={lancamentos}
                            unidades={mockUnidades}
                        />
                    </TabsContent>

                    <TabsContent value="relatorios">
                        <div className="text-center py-12">
                            <p className="text-muted-foreground">
                                Módulo de relatórios em desenvolvimento
                            </p>
                        </div>
                    </TabsContent>
                </Tabs>

                {/* Form Dialog */}
                <LancamentoFormDialog
                    open={isFormOpen}
                    onClose={() => setIsFormOpen(false)}
                    onSubmit={handleSubmit}
                    lancamento={editingLancamento}
                    categorias={mockCategorias}
                    centrosCusto={mockCentrosCusto}
                    unidades={mockUnidades}
                />
            </div>
        </DashboardLayout>
    )
}
