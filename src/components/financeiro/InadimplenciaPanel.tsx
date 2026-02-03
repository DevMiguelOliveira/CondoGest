'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip'
import { formatCurrency, formatDate, calculateLateFee } from '@/lib/utils'
import { LancamentoFinanceiro, Unidade } from '@/types'
import { motion } from 'framer-motion'
import {
    AlertTriangle,
    Mail,
    Phone,
    TrendingUp,
    Calendar,
    User,
    Building2,
} from 'lucide-react'

interface InadimplenciaPanelProps {
    lancamentos: LancamentoFinanceiro[]
    unidades: Unidade[]
    onNotify?: (lancamentoId: string) => void
}

export function InadimplenciaPanel({
    lancamentos,
    unidades,
    onNotify,
}: InadimplenciaPanelProps) {
    // Filter only late revenue entries
    const inadimplentes = lancamentos.filter(
        (l) => l.tipo === 'receita' && l.status === 'atrasado'
    )

    // Calculate totals with fees
    const totals = inadimplentes.reduce(
        (acc, l) => {
            const lateInfo = calculateLateFee(l.valor, l.data_vencimento)
            acc.valorOriginal += l.valor
            acc.multas += lateInfo.fee
            acc.juros += lateInfo.interest
            acc.total += lateInfo.total
            return acc
        },
        { valorOriginal: 0, multas: 0, juros: 0, total: 0 }
    )

    // Group by unit
    const byUnit = inadimplentes.reduce((acc, l) => {
        const unidadeId = l.unidade_id || 'sem_unidade'
        if (!acc[unidadeId]) {
            acc[unidadeId] = {
                unidade: unidades.find((u) => u.id === l.unidade_id) || null,
                lancamentos: [],
                total: 0,
            }
        }
        const lateInfo = calculateLateFee(l.valor, l.data_vencimento)
        acc[unidadeId].lancamentos.push({ ...l, lateInfo })
        acc[unidadeId].total += lateInfo.total
        return acc
    }, {} as Record<string, { unidade: Unidade | null; lancamentos: (LancamentoFinanceiro & { lateInfo: ReturnType<typeof calculateLateFee> })[]; total: number }>)

    const unitsWithDebt = Object.values(byUnit).sort((a, b) => b.total - a.total)

    return (
        <Card className="border-red-200 dark:border-red-900">
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-red-500" />
                        <CardTitle className="text-lg">Inadimplência</CardTitle>
                    </div>
                    <Badge variant="destructive">
                        {inadimplentes.length} pendências
                    </Badge>
                </div>
            </CardHeader>

            <CardContent>
                {/* Summary */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="p-3 rounded-xl bg-muted/50">
                        <p className="text-xs text-muted-foreground">Valor Original</p>
                        <p className="text-lg font-semibold">
                            {formatCurrency(totals.valorOriginal)}
                        </p>
                    </div>
                    <div className="p-3 rounded-xl bg-amber-500/10">
                        <p className="text-xs text-amber-600">Multas (2%)</p>
                        <p className="text-lg font-semibold text-amber-600">
                            +{formatCurrency(totals.multas)}
                        </p>
                    </div>
                    <div className="p-3 rounded-xl bg-orange-500/10">
                        <p className="text-xs text-orange-600">Juros</p>
                        <p className="text-lg font-semibold text-orange-600">
                            +{formatCurrency(totals.juros)}
                        </p>
                    </div>
                    <div className="p-3 rounded-xl bg-red-500/10">
                        <p className="text-xs text-red-600">Total a Receber</p>
                        <p className="text-lg font-bold text-red-600">
                            {formatCurrency(totals.total)}
                        </p>
                    </div>
                </div>

                {/* By Unit List */}
                <ScrollArea className="h-[300px]">
                    <div className="space-y-4">
                        {unitsWithDebt.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                <TrendingUp className="h-12 w-12 mx-auto mb-2 text-emerald-500" />
                                <p>Nenhuma inadimplência! 🎉</p>
                            </div>
                        ) : (
                            unitsWithDebt.map((item, index) => (
                                <motion.div
                                    key={item.unidade?.id || 'sem_unidade'}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="p-4 rounded-xl border bg-card hover:shadow-md transition-all"
                                >
                                    {/* Unit Header */}
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-lg bg-red-500/10">
                                                <Building2 className="h-5 w-5 text-red-500" />
                                            </div>
                                            <div>
                                                <h4 className="font-semibold">
                                                    {item.unidade ? (
                                                        <>
                                                            {item.unidade.bloco
                                                                ? `Bloco ${item.unidade.bloco} - `
                                                                : ''}
                                                            Unidade {item.unidade.numero}
                                                        </>
                                                    ) : (
                                                        'Sem unidade vinculada'
                                                    )}
                                                </h4>
                                                <p className="text-xs text-muted-foreground">
                                                    {item.lancamentos.length} pendência
                                                    {item.lancamentos.length > 1 ? 's' : ''}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-lg font-bold text-red-600">
                                                {formatCurrency(item.total)}
                                            </p>
                                            <TooltipProvider>
                                                <div className="flex items-center gap-1 mt-1">
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-7 w-7"
                                                            >
                                                                <Mail className="h-4 w-4" />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>Enviar e-mail</TooltipContent>
                                                    </Tooltip>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-7 w-7"
                                                            >
                                                                <Phone className="h-4 w-4" />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>Ligar</TooltipContent>
                                                    </Tooltip>
                                                </div>
                                            </TooltipProvider>
                                        </div>
                                    </div>

                                    {/* Lancamentos */}
                                    <div className="space-y-2">
                                        {item.lancamentos.map((lanc) => (
                                            <div
                                                key={lanc.id}
                                                className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/30 text-sm"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                                                    <span>{lanc.descricao}</span>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <Badge variant="outline" className="text-xs">
                                                        {lanc.lateInfo.daysLate} dias
                                                    </Badge>
                                                    <div className="text-right">
                                                        <span className="line-through text-xs text-muted-foreground">
                                                            {formatCurrency(lanc.valor)}
                                                        </span>
                                                        <span className="font-medium text-red-600 ml-2">
                                                            {formatCurrency(lanc.lateInfo.total)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    )
}
