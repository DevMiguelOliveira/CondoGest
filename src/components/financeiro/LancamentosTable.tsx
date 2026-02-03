'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { LancamentoFinanceiro } from '@/types'
import { LANCAMENTO_STATUS, TIPO_LANCAMENTO } from '@/lib/constants'
import { formatCurrency, formatDate, calculateLateFee } from '@/lib/utils'
import {
    Search,
    Filter,
    Plus,
    MoreHorizontal,
    TrendingUp,
    TrendingDown,
    AlertTriangle,
    Calendar,
    Download,
    Eye,
    Edit,
    Trash2,
    Link,
} from 'lucide-react'

interface LancamentosTableProps {
    lancamentos: LancamentoFinanceiro[]
    onAdd: () => void
    onEdit: (lancamento: LancamentoFinanceiro) => void
    onDelete: (id: string) => void
    onView: (lancamento: LancamentoFinanceiro) => void
    onLinkToKanban: (lancamento: LancamentoFinanceiro) => void
}

export function LancamentosTable({
    lancamentos,
    onAdd,
    onEdit,
    onDelete,
    onView,
    onLinkToKanban,
}: LancamentosTableProps) {
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState<string>('all')
    const [tipoFilter, setTipoFilter] = useState<string>('all')
    const [activeTab, setActiveTab] = useState<string>('todos')

    // Filter lancamentos
    const filteredLancamentos = lancamentos.filter((l) => {
        const matchesSearch = l.descricao
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
        const matchesStatus =
            statusFilter === 'all' || l.status === statusFilter
        const matchesTipo = tipoFilter === 'all' || l.tipo === tipoFilter

        // Tab filter
        let matchesTab = true
        if (activeTab === 'receitas') matchesTab = l.tipo === 'receita'
        if (activeTab === 'despesas') matchesTab = l.tipo === 'despesa'
        if (activeTab === 'atrasados') matchesTab = l.status === 'atrasado'

        return matchesSearch && matchesStatus && matchesTipo && matchesTab
    })

    // Calculate totals
    const totals = filteredLancamentos.reduce(
        (acc, l) => {
            if (l.tipo === 'receita') {
                acc.receitas += l.valor
            } else {
                acc.despesas += l.valor
            }
            if (l.status === 'atrasado') {
                acc.atrasados += l.valor
            }
            return acc
        },
        { receitas: 0, despesas: 0, atrasados: 0 }
    )

    return (
        <Card>
            <CardHeader className="pb-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <CardTitle className="text-xl">Lançamentos Financeiros</CardTitle>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            Exportar
                        </Button>
                        <Button size="sm" onClick={onAdd}>
                            <Plus className="h-4 w-4 mr-2" />
                            Novo Lançamento
                        </Button>
                    </div>
                </div>
            </CardHeader>

            <CardContent>
                {/* Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4">
                    <TabsList>
                        <TabsTrigger value="todos">Todos</TabsTrigger>
                        <TabsTrigger value="receitas" className="text-emerald-600">
                            Receitas
                        </TabsTrigger>
                        <TabsTrigger value="despesas" className="text-red-600">
                            Despesas
                        </TabsTrigger>
                        <TabsTrigger value="atrasados" className="text-amber-600">
                            Atrasados
                        </TabsTrigger>
                    </TabsList>
                </Tabs>

                {/* Filters */}
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar lançamentos..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos os status</SelectItem>
                            {Object.entries(LANCAMENTO_STATUS).map(([key, config]) => (
                                <SelectItem key={key} value={key}>
                                    {config.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                        <div className="flex items-center gap-2 text-emerald-600">
                            <TrendingUp className="h-4 w-4" />
                            <span className="text-sm font-medium">Total Receitas</span>
                        </div>
                        <p className="text-2xl font-bold text-emerald-600 mt-1">
                            {formatCurrency(totals.receitas)}
                        </p>
                    </div>
                    <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                        <div className="flex items-center gap-2 text-red-600">
                            <TrendingDown className="h-4 w-4" />
                            <span className="text-sm font-medium">Total Despesas</span>
                        </div>
                        <p className="text-2xl font-bold text-red-600 mt-1">
                            {formatCurrency(totals.despesas)}
                        </p>
                    </div>
                    <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                        <div className="flex items-center gap-2 text-amber-600">
                            <AlertTriangle className="h-4 w-4" />
                            <span className="text-sm font-medium">Atrasados</span>
                        </div>
                        <p className="text-2xl font-bold text-amber-600 mt-1">
                            {formatCurrency(totals.atrasados)}
                        </p>
                    </div>
                </div>

                {/* Table */}
                <ScrollArea className="h-[400px]">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Descrição</TableHead>
                                <TableHead>Tipo</TableHead>
                                <TableHead>Categoria</TableHead>
                                <TableHead>Valor</TableHead>
                                <TableHead>Vencimento</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="w-[50px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <AnimatePresence>
                                {filteredLancamentos.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-8">
                                            <p className="text-muted-foreground">
                                                Nenhum lançamento encontrado
                                            </p>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredLancamentos.map((lancamento, index) => {
                                        const statusConfig = LANCAMENTO_STATUS[lancamento.status]
                                        const isReceita = lancamento.tipo === 'receita'
                                        const lateInfo =
                                            lancamento.status === 'atrasado' && lancamento.tipo === 'receita'
                                                ? calculateLateFee(
                                                    lancamento.valor,
                                                    lancamento.data_vencimento
                                                )
                                                : null

                                        return (
                                            <motion.tr
                                                key={lancamento.id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: index * 0.03 }}
                                                className={cn(
                                                    'group',
                                                    lancamento.status === 'atrasado' &&
                                                    'bg-red-50/50 dark:bg-red-950/20'
                                                )}
                                            >
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        <div
                                                            className={cn(
                                                                'p-2 rounded-lg',
                                                                isReceita
                                                                    ? 'bg-emerald-500/10'
                                                                    : 'bg-red-500/10'
                                                            )}
                                                        >
                                                            {isReceita ? (
                                                                <TrendingUp className="h-4 w-4 text-emerald-500" />
                                                            ) : (
                                                                <TrendingDown className="h-4 w-4 text-red-500" />
                                                            )}
                                                        </div>
                                                        <div>
                                                            <p className="font-medium">{lancamento.descricao}</p>
                                                            {lancamento.cartao_id && (
                                                                <Badge variant="outline" className="text-xs mt-1">
                                                                    <Link className="h-3 w-3 mr-1" />
                                                                    Vinculado ao Kanban
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge
                                                        variant={isReceita ? 'success' : 'destructive'}
                                                    >
                                                        {TIPO_LANCAMENTO[lancamento.tipo].label}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    {lancamento.categoria?.nome || '-'}
                                                </TableCell>
                                                <TableCell>
                                                    <div>
                                                        <p
                                                            className={cn(
                                                                'font-semibold',
                                                                isReceita ? 'text-emerald-600' : 'text-red-600'
                                                            )}
                                                        >
                                                            {formatCurrency(lancamento.valor)}
                                                        </p>
                                                        {lateInfo && lateInfo.daysLate > 0 && (
                                                            <p className="text-xs text-red-500">
                                                                +{formatCurrency(lateInfo.fee + lateInfo.interest)} (multa/juros)
                                                            </p>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                                        {formatDate(lancamento.data_vencimento)}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge
                                                        variant="outline"
                                                        className={statusConfig.textColor}
                                                    >
                                                        <span
                                                            className={cn(
                                                                'w-1.5 h-1.5 rounded-full mr-1.5',
                                                                statusConfig.color
                                                            )}
                                                        />
                                                        {statusConfig.label}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="opacity-0 group-hover:opacity-100 transition-opacity"
                                                            >
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem onClick={() => onView(lancamento)}>
                                                                <Eye className="h-4 w-4 mr-2" />
                                                                Visualizar
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => onEdit(lancamento)}>
                                                                <Edit className="h-4 w-4 mr-2" />
                                                                Editar
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                onClick={() => onLinkToKanban(lancamento)}
                                                            >
                                                                <Link className="h-4 w-4 mr-2" />
                                                                Vincular ao Kanban
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem
                                                                onClick={() => onDelete(lancamento.id)}
                                                                className="text-destructive focus:text-destructive"
                                                            >
                                                                <Trash2 className="h-4 w-4 mr-2" />
                                                                Excluir
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </motion.tr>
                                        )
                                    })
                                )}
                            </AnimatePresence>
                        </TableBody>
                    </Table>
                </ScrollArea>
            </CardContent>
        </Card>
    )
}
