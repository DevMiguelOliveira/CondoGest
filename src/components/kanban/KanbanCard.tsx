'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Checkbox } from '@/components/ui/checkbox'
import { Cartao } from '@/types'
import { PRIORIDADE_CARTAO, LANCAMENTO_STATUS } from '@/lib/constants'
import { formatDate, getInitials } from '@/lib/utils'
import {
    Calendar,
    MessageSquare,
    CheckSquare,
    DollarSign,
    AlertTriangle,
    MoreHorizontal,
    GripVertical,
} from 'lucide-react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'

interface KanbanCardProps {
    cartao: Cartao
    onClick: () => void
    onEdit?: () => void
    onDelete?: () => void
    onArchive?: () => void
}

export function KanbanCard({
    cartao,
    onClick,
    onEdit,
    onDelete,
    onArchive,
}: KanbanCardProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: cartao.id,
        data: {
            type: 'card',
            cartao,
        },
    })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    }

    const prioridadeConfig = PRIORIDADE_CARTAO[cartao.prioridade]

    // Check if linked financial entry is late
    const isFinanceiroAtrasado = cartao.lancamento?.status === 'atrasado'

    // Calculate checklist progress
    const checklistStats = cartao.checklists?.reduce(
        (acc, cl) => ({
            total: acc.total + cl.items.length,
            completed: acc.completed + cl.items.filter((i) => i.concluido).length,
        }),
        { total: 0, completed: 0 }
    ) || { total: 0, completed: 0 }

    // Check if due date is approaching or past
    const isOverdue = cartao.data_vencimento
        ? new Date(cartao.data_vencimento) < new Date()
        : false
    const isDueSoon = cartao.data_vencimento
        ? new Date(cartao.data_vencimento).getTime() - new Date().getTime() <
        2 * 24 * 60 * 60 * 1000
        : false

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={cn(
                'group relative bg-card border rounded-xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer',
                isDragging && 'opacity-50 shadow-lg ring-2 ring-primary',
                isFinanceiroAtrasado && 'border-red-500/50 bg-red-50/50 dark:bg-red-950/20'
            )}
        >
            {/* Drag Handle */}
            <div
                {...attributes}
                {...listeners}
                className="absolute left-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
            >
                <GripVertical className="h-4 w-4 text-muted-foreground" />
            </div>

            {/* Content */}
            <div onClick={onClick} className="space-y-3">
                {/* Priority & Labels */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-wrap">
                        <Badge
                            variant="outline"
                            className={cn('text-xs', prioridadeConfig.textColor)}
                        >
                            <span
                                className={cn(
                                    'w-1.5 h-1.5 rounded-full mr-1',
                                    prioridadeConfig.color
                                )}
                            />
                            {prioridadeConfig.label}
                        </Badge>
                        {cartao.lancamento_id && (
                            <Badge
                                variant={isFinanceiroAtrasado ? 'destructive' : 'secondary'}
                                className="text-xs"
                            >
                                <DollarSign className="h-3 w-3 mr-1" />
                                {isFinanceiroAtrasado ? 'Atrasado' : 'Financeiro'}
                            </Badge>
                        )}
                    </div>

                    {/* Actions Menu */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={onEdit}>Editar</DropdownMenuItem>
                            <DropdownMenuItem onClick={onArchive}>Arquivar</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={onDelete}
                                className="text-destructive focus:text-destructive"
                            >
                                Excluir
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                {/* Title */}
                <h4 className="font-medium text-sm leading-tight">{cartao.titulo}</h4>

                {/* Description Preview */}
                {cartao.descricao && (
                    <p className="text-xs text-muted-foreground line-clamp-2">
                        {cartao.descricao}
                    </p>
                )}

                {/* Tags/Labels */}
                {cartao.etiquetas && cartao.etiquetas.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                        {cartao.etiquetas.slice(0, 3).map((etiqueta, i) => (
                            <span
                                key={i}
                                className="px-2 py-0.5 text-xs rounded-full bg-primary/10 text-primary"
                            >
                                {etiqueta}
                            </span>
                        ))}
                        {cartao.etiquetas.length > 3 && (
                            <span className="text-xs text-muted-foreground">
                                +{cartao.etiquetas.length - 3}
                            </span>
                        )}
                    </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between pt-2 border-t">
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        {/* Due Date */}
                        {cartao.data_vencimento && (
                            <span
                                className={cn(
                                    'flex items-center gap-1',
                                    isOverdue && 'text-red-500',
                                    isDueSoon && !isOverdue && 'text-amber-500'
                                )}
                            >
                                {(isOverdue || isDueSoon) && (
                                    <AlertTriangle className="h-3 w-3" />
                                )}
                                <Calendar className="h-3 w-3" />
                                {formatDate(cartao.data_vencimento)}
                            </span>
                        )}

                        {/* Comments Count */}
                        {cartao.comentarios && cartao.comentarios.length > 0 && (
                            <span className="flex items-center gap-1">
                                <MessageSquare className="h-3 w-3" />
                                {cartao.comentarios.length}
                            </span>
                        )}

                        {/* Checklist Progress */}
                        {checklistStats.total > 0 && (
                            <span
                                className={cn(
                                    'flex items-center gap-1',
                                    checklistStats.completed === checklistStats.total &&
                                    'text-emerald-500'
                                )}
                            >
                                <CheckSquare className="h-3 w-3" />
                                {checklistStats.completed}/{checklistStats.total}
                            </span>
                        )}
                    </div>

                    {/* Assignee */}
                    {cartao.responsavel && (
                        <Avatar className="h-6 w-6">
                            <AvatarImage src={cartao.responsavel.avatar_url} />
                            <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                                {getInitials(cartao.responsavel.nome)}
                            </AvatarFallback>
                        </Avatar>
                    )}
                </div>
            </div>

            {/* Financial Status Indicator */}
            {isFinanceiroAtrasado && (
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"
                />
            )}
        </div>
    )
}
