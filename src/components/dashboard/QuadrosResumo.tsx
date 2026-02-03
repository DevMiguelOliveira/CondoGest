'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { getInitials } from '@/lib/utils'
import { PRIORIDADE_CARTAO } from '@/lib/constants'
import { Cartao } from '@/types'
import { motion } from 'framer-motion'
import { Calendar, CheckCircle2 } from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface QuadrosResumoProps {
    cartoes: Cartao[]
    onCardClick?: (cartao: Cartao) => void
}

export function QuadrosResumo({ cartoes, onCardClick }: QuadrosResumoProps) {
    const calculateProgress = (cartao: Cartao) => {
        if (!cartao.checklists || cartao.checklists.length === 0) return 0
        const totalItems = cartao.checklists.reduce(
            (acc, cl) => acc + cl.items.length,
            0
        )
        const completedItems = cartao.checklists.reduce(
            (acc, cl) => acc + cl.items.filter((item) => item.concluido).length,
            0
        )
        return totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg font-semibold">Tarefas em Destaque</CardTitle>
                <a href="/kanban" className="text-sm text-primary hover:underline">
                    Ver Kanban
                </a>
            </CardHeader>
            <CardContent className="p-0">
                <ScrollArea className="h-[300px]">
                    <div className="space-y-3 p-6 pt-0">
                        {cartoes.length === 0 ? (
                            <p className="text-center text-muted-foreground py-8">
                                Nenhuma tarefa em destaque
                            </p>
                        ) : (
                            cartoes.map((cartao, index) => {
                                const prioridadeConfig = PRIORIDADE_CARTAO[cartao.prioridade]
                                const progress = calculateProgress(cartao)

                                return (
                                    <motion.div
                                        key={cartao.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        onClick={() => onCardClick?.(cartao)}
                                        className="p-4 rounded-xl border bg-card hover:shadow-md transition-all cursor-pointer group"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <Badge
                                                        variant="outline"
                                                        className={`text-xs ${prioridadeConfig.textColor}`}
                                                    >
                                                        {prioridadeConfig.label}
                                                    </Badge>
                                                    {cartao.lancamento_id && (
                                                        <Badge variant="secondary" className="text-xs">
                                                            💰 Financeiro
                                                        </Badge>
                                                    )}
                                                </div>
                                                <h4 className="font-medium text-sm truncate group-hover:text-primary transition-colors">
                                                    {cartao.titulo}
                                                </h4>
                                                {cartao.data_vencimento && (
                                                    <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                                                        <Calendar className="h-3 w-3" />
                                                        <span>{formatDate(cartao.data_vencimento)}</span>
                                                    </div>
                                                )}
                                            </div>
                                            {cartao.responsavel && (
                                                <Avatar className="h-8 w-8">
                                                    <AvatarFallback className="text-xs bg-primary/10 text-primary">
                                                        {getInitials(cartao.responsavel.nome)}
                                                    </AvatarFallback>
                                                </Avatar>
                                            )}
                                        </div>
                                        {progress > 0 && (
                                            <div className="mt-3 space-y-1">
                                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                                    <span className="flex items-center gap-1">
                                                        <CheckCircle2 className="h-3 w-3" />
                                                        Progresso
                                                    </span>
                                                    <span>{progress}%</span>
                                                </div>
                                                <Progress value={progress} className="h-1.5" />
                                            </div>
                                        )}
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
