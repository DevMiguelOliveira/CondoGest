'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { formatCurrency, formatDate } from '@/lib/utils'
import { LANCAMENTO_STATUS } from '@/lib/constants'
import { LancamentoFinanceiro } from '@/types'
import { motion } from 'framer-motion'
import { ArrowUpRight, ArrowDownRight } from 'lucide-react'

interface UltimosLancamentosProps {
    lancamentos: LancamentoFinanceiro[]
}

export function UltimosLancamentos({ lancamentos }: UltimosLancamentosProps) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg font-semibold">Últimos Lançamentos</CardTitle>
                <a
                    href="/financeiro"
                    className="text-sm text-primary hover:underline"
                >
                    Ver todos
                </a>
            </CardHeader>
            <CardContent className="p-0">
                <ScrollArea className="h-[300px]">
                    <div className="space-y-1 p-6 pt-0">
                        {lancamentos.length === 0 ? (
                            <p className="text-center text-muted-foreground py-8">
                                Nenhum lançamento encontrado
                            </p>
                        ) : (
                            lancamentos.map((lancamento, index) => {
                                const statusConfig = LANCAMENTO_STATUS[lancamento.status]
                                const isReceita = lancamento.tipo === 'receita'

                                return (
                                    <motion.div
                                        key={lancamento.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="flex items-center justify-between py-3 border-b last:border-0"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div
                                                className={`p-2 rounded-lg ${isReceita
                                                        ? 'bg-emerald-500/10 text-emerald-500'
                                                        : 'bg-red-500/10 text-red-500'
                                                    }`}
                                            >
                                                {isReceita ? (
                                                    <ArrowUpRight className="h-4 w-4" />
                                                ) : (
                                                    <ArrowDownRight className="h-4 w-4" />
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium">{lancamento.descricao}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {formatDate(lancamento.data_vencimento)}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p
                                                className={`text-sm font-semibold ${isReceita ? 'text-emerald-500' : 'text-red-500'
                                                    }`}
                                            >
                                                {isReceita ? '+' : '-'}{formatCurrency(lancamento.valor)}
                                            </p>
                                            <Badge
                                                variant="outline"
                                                className={`text-xs ${statusConfig.textColor}`}
                                            >
                                                {statusConfig.label}
                                            </Badge>
                                        </div>
                                    </motion.div>
                                )
                            })
                        )}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    )
}
