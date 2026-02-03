'use client'

import { useState, useCallback } from 'react'
import {
    DndContext,
    DragOverlay,
    closestCorners,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragStartEvent,
    DragEndEvent,
    DragOverEvent,
} from '@dnd-kit/core'
import {
    arrayMove,
    SortableContext,
    horizontalListSortingStrategy,
} from '@dnd-kit/sortable'
import { Quadro, Lista, Cartao } from '@/types'
import { KanbanColumn } from './KanbanColumn'
import { KanbanCard } from './KanbanCard'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { motion } from 'framer-motion'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'

interface KanbanBoardProps {
    quadro: Quadro
    listas: Lista[]
    cartoes: Record<string, Cartao[]>
    onAddList: () => void
    onEditList: (lista: Lista) => void
    onDeleteList: (listaId: string) => void
    onAddCard: (listaId: string) => void
    onEditCard: (cartao: Cartao) => void
    onDeleteCard: (cartaoId: string) => void
    onArchiveCard: (cartaoId: string) => void
    onCardClick: (cartao: Cartao) => void
    onMoveCard: (cartaoId: string, sourceListaId: string, destListaId: string, newIndex: number) => void
    onReorderCards: (listaId: string, cartoes: Cartao[]) => void
}

export function KanbanBoard({
    quadro,
    listas,
    cartoes,
    onAddList,
    onEditList,
    onDeleteList,
    onAddCard,
    onEditCard,
    onDeleteCard,
    onArchiveCard,
    onCardClick,
    onMoveCard,
    onReorderCards,
}: KanbanBoardProps) {
    const [activeCard, setActiveCard] = useState<Cartao | null>(null)

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor)
    )

    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event
        const activeData = active.data.current

        if (activeData?.type === 'card') {
            setActiveCard(activeData.cartao)
        }
    }

    const handleDragOver = (event: DragOverEvent) => {
        const { active, over } = event
        if (!over) return

        const activeId = active.id as string
        const overId = over.id as string

        if (activeId === overId) return

        const activeData = active.data.current
        const overData = over.data.current

        // Only handle card moves
        if (activeData?.type !== 'card') return

        const activeListaId = Object.entries(cartoes).find(([, cards]) =>
            cards.some((c) => c.id === activeId)
        )?.[0]

        let overListaId: string | undefined

        if (overData?.type === 'column') {
            overListaId = overId
        } else if (overData?.type === 'card') {
            overListaId = Object.entries(cartoes).find(([, cards]) =>
                cards.some((c) => c.id === overId)
            )?.[0]
        }

        if (!activeListaId || !overListaId) return

        // Moving to different column
        if (activeListaId !== overListaId) {
            const overCards = cartoes[overListaId] || []
            let newIndex = overCards.length

            if (overData?.type === 'card') {
                newIndex = overCards.findIndex((c) => c.id === overId)
            }

            onMoveCard(activeId, activeListaId, overListaId, newIndex)
        }
    }

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event

        setActiveCard(null)

        if (!over) return

        const activeId = active.id as string
        const overId = over.id as string

        if (activeId === overId) return

        const activeData = active.data.current
        const overData = over.data.current

        // Handle reordering within same column
        if (activeData?.type === 'card' && overData?.type === 'card') {
            const listaId = Object.entries(cartoes).find(([, cards]) =>
                cards.some((c) => c.id === activeId)
            )?.[0]

            if (!listaId) return

            const columnCards = cartoes[listaId]
            const activeIndex = columnCards.findIndex((c) => c.id === activeId)
            const overIndex = columnCards.findIndex((c) => c.id === overId)

            if (activeIndex !== overIndex) {
                const reordered = arrayMove(columnCards, activeIndex, overIndex)
                onReorderCards(listaId, reordered)
            }
        }
    }

    return (
        <div className="h-full">
            {/* Board Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold">{quadro.nome}</h1>
                    {quadro.descricao && (
                        <p className="text-muted-foreground mt-1">{quadro.descricao}</p>
                    )}
                </div>
                <Button onClick={onAddList}>
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Lista
                </Button>
            </div>

            {/* Kanban Columns */}
            <ScrollArea className="w-full pb-4">
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCorners}
                    onDragStart={handleDragStart}
                    onDragOver={handleDragOver}
                    onDragEnd={handleDragEnd}
                >
                    <div className="flex gap-4">
                        <SortableContext
                            items={listas.map((l) => l.id)}
                            strategy={horizontalListSortingStrategy}
                        >
                            {listas.map((lista) => (
                                <KanbanColumn
                                    key={lista.id}
                                    lista={lista}
                                    cartoes={cartoes[lista.id] || []}
                                    onAddCard={() => onAddCard(lista.id)}
                                    onEditCard={onEditCard}
                                    onDeleteCard={onDeleteCard}
                                    onArchiveCard={onArchiveCard}
                                    onCardClick={onCardClick}
                                    onEditColumn={() => onEditList(lista)}
                                    onDeleteColumn={() => onDeleteList(lista.id)}
                                />
                            ))}
                        </SortableContext>

                        {/* Add Column Button */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex-shrink-0"
                        >
                            <Button
                                variant="outline"
                                className="w-[320px] h-12 border-dashed justify-start"
                                onClick={onAddList}
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Adicionar lista
                            </Button>
                        </motion.div>
                    </div>

                    {/* Drag Overlay */}
                    <DragOverlay>
                        {activeCard ? (
                            <div className="rotate-3 opacity-90">
                                <KanbanCard
                                    cartao={activeCard}
                                    onClick={() => { }}
                                />
                            </div>
                        ) : null}
                    </DragOverlay>
                </DndContext>
                <ScrollBar orientation="horizontal" />
            </ScrollArea>
        </div>
    )
}
