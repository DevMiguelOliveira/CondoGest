'use client'

import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Lista, Cartao } from '@/types'
import { KanbanCard } from './KanbanCard'
import { motion } from 'framer-motion'
import { Plus, MoreHorizontal, GripVertical } from 'lucide-react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface KanbanColumnProps {
    lista: Lista
    cartoes: Cartao[]
    onAddCard: () => void
    onEditCard: (cartao: Cartao) => void
    onDeleteCard: (cartaoId: string) => void
    onArchiveCard: (cartaoId: string) => void
    onCardClick: (cartao: Cartao) => void
    onEditColumn: () => void
    onDeleteColumn: () => void
}

export function KanbanColumn({
    lista,
    cartoes,
    onAddCard,
    onEditCard,
    onDeleteCard,
    onArchiveCard,
    onCardClick,
    onEditColumn,
    onDeleteColumn,
}: KanbanColumnProps) {
    const { setNodeRef, isOver } = useDroppable({
        id: lista.id,
        data: {
            type: 'column',
            lista,
        },
    })

    const cardIds = cartoes.map((c) => c.id)

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={cn(
                'flex flex-col w-[320px] flex-shrink-0 rounded-2xl bg-muted/50 border',
                isOver && 'ring-2 ring-primary ring-offset-2'
            )}
        >
            {/* Column Header */}
            <div className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center gap-2">
                    <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                    <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: lista.cor || '#6366f1' }}
                    />
                    <h3 className="font-semibold text-sm">{lista.nome}</h3>
                    <span className="text-xs text-muted-foreground bg-background px-2 py-0.5 rounded-full">
                        {cartoes.length}
                    </span>
                </div>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={onAddCard}>Adicionar Cartão</DropdownMenuItem>
                        <DropdownMenuItem onClick={onEditColumn}>Editar Lista</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onClick={onDeleteColumn}
                            className="text-destructive focus:text-destructive"
                        >
                            Excluir Lista
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* Cards Container */}
            <ScrollArea className="flex-1 max-h-[calc(100vh-280px)]">
                <div
                    ref={setNodeRef}
                    className="p-3 space-y-3 min-h-[100px]"
                >
                    <SortableContext items={cardIds} strategy={verticalListSortingStrategy}>
                        {cartoes.map((cartao) => (
                            <KanbanCard
                                key={cartao.id}
                                cartao={cartao}
                                onClick={() => onCardClick(cartao)}
                                onEdit={() => onEditCard(cartao)}
                                onDelete={() => onDeleteCard(cartao.id)}
                                onArchive={() => onArchiveCard(cartao.id)}
                            />
                        ))}
                    </SortableContext>

                    {cartoes.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                            <p className="text-sm">Nenhum cartão</p>
                            <p className="text-xs">Arraste ou adicione um cartão</p>
                        </div>
                    )}
                </div>
            </ScrollArea>

            {/* Add Card Button */}
            <div className="p-3 border-t">
                <Button
                    variant="ghost"
                    className="w-full justify-start text-muted-foreground hover:text-foreground"
                    onClick={onAddCard}
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar cartão
                </Button>
            </div>
        </motion.div>
    )
}
