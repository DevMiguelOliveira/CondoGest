'use client'

import { useState, useCallback } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { KanbanBoard } from '@/components/kanban/KanbanBoard'
import { CardDetailDialog } from '@/components/kanban/CardDetailDialog'
import { Button } from '@/components/ui/button'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Quadro, Lista, Cartao, User, LancamentoFinanceiro } from '@/types'
import { Plus, Settings } from 'lucide-react'
import { CartaoInput } from '@/lib/validations'

// Mock data
const mockQuadros: Quadro[] = [
    {
        id: '1',
        condominio_id: '1',
        nome: 'Gestão do Condomínio',
        descricao: 'Quadro principal para gestão de tarefas do condomínio',
        cor: '#3B82F6',
        ordem: 1,
        created_at: '',
        updated_at: '',
    },
    {
        id: '2',
        condominio_id: '1',
        nome: 'Manutenções',
        descricao: 'Controle de manutenções preventivas e corretivas',
        cor: '#10B981',
        ordem: 2,
        created_at: '',
        updated_at: '',
    },
]

const mockListas: Lista[] = [
    { id: '1', quadro_id: '1', nome: 'A Fazer', ordem: 1, cor: '#6366F1', created_at: '', updated_at: '' },
    { id: '2', quadro_id: '1', nome: 'Em Andamento', ordem: 2, cor: '#F59E0B', created_at: '', updated_at: '' },
    { id: '3', quadro_id: '1', nome: 'Aguardando', ordem: 3, cor: '#EF4444', created_at: '', updated_at: '' },
    { id: '4', quadro_id: '1', nome: 'Concluído', ordem: 4, cor: '#10B981', created_at: '', updated_at: '' },
]

const initialCartoes: Record<string, Cartao[]> = {
    '1': [
        {
            id: '1',
            lista_id: '1',
            titulo: 'Revisar contrato de segurança',
            descricao: 'Analisar proposta de renovação do contrato com a empresa de segurança',
            ordem: 1,
            prioridade: 'alta',
            status: 'pendente',
            data_vencimento: '2024-01-25',
            etiquetas: ['Urgente', 'Contrato'],
            created_at: '2024-01-01',
            updated_at: '2024-01-15',
            checklists: [
                {
                    id: '1',
                    cartao_id: '1',
                    titulo: 'Tarefas',
                    ordem: 1,
                    items: [
                        { id: '1', titulo: 'Analisar proposta atual', concluido: true, ordem: 1 },
                        { id: '2', titulo: 'Comparar com concorrentes', concluido: true, ordem: 2 },
                        { id: '3', titulo: 'Apresentar em assembleia', concluido: false, ordem: 3 },
                    ],
                    created_at: '',
                    updated_at: '',
                },
            ],
            comentarios: [
                {
                    id: '1',
                    cartao_id: '1',
                    usuario_id: '1',
                    conteudo: 'Já solicitei 3 orçamentos de outras empresas.',
                    created_at: '2024-01-10T14:30:00Z',
                    updated_at: '2024-01-10T14:30:00Z',
                },
            ],
        },
        {
            id: '2',
            lista_id: '1',
            titulo: 'Organizar assembleia de janeiro',
            ordem: 2,
            prioridade: 'media',
            status: 'pendente',
            data_vencimento: '2024-01-30',
            created_at: '2024-01-05',
            updated_at: '2024-01-05',
        },
    ],
    '2': [
        {
            id: '3',
            lista_id: '2',
            titulo: 'Manutenção da piscina',
            descricao: 'Realizar limpeza e manutenção mensal da piscina',
            ordem: 1,
            prioridade: 'urgente',
            status: 'em_andamento',
            data_vencimento: '2024-01-20',
            lancamento_id: 'lanc-1',
            created_at: '2024-01-10',
            updated_at: '2024-01-15',
            lancamento: {
                id: 'lanc-1',
                condominio_id: '1',
                tipo: 'despesa',
                descricao: 'Manutenção Piscina',
                valor: 1500.00,
                data_vencimento: '2024-01-20',
                status: 'pendente',
                categoria_id: '1',
                created_at: '',
                updated_at: '',
            },
        },
    ],
    '3': [
        {
            id: '4',
            lista_id: '3',
            titulo: 'Aguardar aprovação orçamento',
            ordem: 1,
            prioridade: 'baixa',
            status: 'pendente',
            created_at: '2024-01-08',
            updated_at: '2024-01-08',
        },
    ],
    '4': [
        {
            id: '5',
            lista_id: '4',
            titulo: 'Instalação de câmeras',
            descricao: 'Sistema de câmeras instalado com sucesso',
            ordem: 1,
            prioridade: 'alta',
            status: 'concluido',
            created_at: '2024-01-01',
            updated_at: '2024-01-12',
        },
    ],
}

const mockUsuarios: User[] = [
    { id: '1', email: 'sindico@condo.com', nome: 'João Silva', role: 'SINDICO', created_at: '', updated_at: '' },
    { id: '2', email: 'zelador@condo.com', nome: 'Carlos Santos', role: 'PRESTADOR', created_at: '', updated_at: '' },
]

const mockLancamentos: LancamentoFinanceiro[] = [
    {
        id: 'lanc-1',
        condominio_id: '1',
        tipo: 'despesa',
        descricao: 'Manutenção Piscina',
        valor: 1500.00,
        data_vencimento: '2024-01-20',
        status: 'pendente',
        categoria_id: '1',
        created_at: '',
        updated_at: '',
    },
    {
        id: 'lanc-2',
        condominio_id: '1',
        tipo: 'despesa',
        descricao: 'Contrato Segurança',
        valor: 3500.00,
        data_vencimento: '2024-02-01',
        status: 'pendente',
        categoria_id: '2',
        created_at: '',
        updated_at: '',
    },
]

export default function KanbanPage() {
    const [selectedQuadro, setSelectedQuadro] = useState<Quadro>(mockQuadros[0])
    const [listas] = useState<Lista[]>(mockListas)
    const [cartoes, setCartoes] = useState<Record<string, Cartao[]>>(initialCartoes)
    const [selectedCard, setSelectedCard] = useState<Cartao | null>(null)
    const [isDetailOpen, setIsDetailOpen] = useState(false)

    const handleAddList = () => {
        console.log('Add new list')
    }

    const handleEditList = (lista: Lista) => {
        console.log('Edit list:', lista)
    }

    const handleDeleteList = (listaId: string) => {
        console.log('Delete list:', listaId)
    }

    const handleAddCard = (listaId: string) => {
        const newCard: Cartao = {
            id: Math.random().toString(36).substring(7),
            lista_id: listaId,
            titulo: 'Novo cartão',
            ordem: (cartoes[listaId]?.length || 0) + 1,
            prioridade: 'media',
            status: 'pendente',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        }
        setCartoes((prev) => ({
            ...prev,
            [listaId]: [...(prev[listaId] || []), newCard],
        }))
    }

    const handleEditCard = (cartao: Cartao) => {
        setSelectedCard(cartao)
        setIsDetailOpen(true)
    }

    const handleDeleteCard = (cartaoId: string) => {
        setCartoes((prev) => {
            const updated = { ...prev }
            for (const listaId in updated) {
                updated[listaId] = updated[listaId].filter((c) => c.id !== cartaoId)
            }
            return updated
        })
    }

    const handleArchiveCard = (cartaoId: string) => {
        console.log('Archive card:', cartaoId)
    }

    const handleCardClick = (cartao: Cartao) => {
        setSelectedCard(cartao)
        setIsDetailOpen(true)
    }

    const handleMoveCard = useCallback(
        (cartaoId: string, sourceListaId: string, destListaId: string, newIndex: number) => {
            setCartoes((prev) => {
                const updated = { ...prev }

                // Find and remove card from source
                const sourceCards = [...(updated[sourceListaId] || [])]
                const cardIndex = sourceCards.findIndex((c) => c.id === cartaoId)
                if (cardIndex === -1) return prev

                const [card] = sourceCards.splice(cardIndex, 1)
                updated[sourceListaId] = sourceCards

                // Add to destination
                const destCards = [...(updated[destListaId] || [])]
                card.lista_id = destListaId
                destCards.splice(newIndex, 0, card)
                updated[destListaId] = destCards

                return updated
            })
        },
        []
    )

    const handleReorderCards = useCallback((listaId: string, reorderedCards: Cartao[]) => {
        setCartoes((prev) => ({
            ...prev,
            [listaId]: reorderedCards,
        }))
    }, [])

    const handleSaveCard = (data: CartaoInput) => {
        if (!selectedCard) return

        setCartoes((prev) => {
            const updated = { ...prev }
            const listaId = selectedCard.lista_id
            updated[listaId] = updated[listaId].map((c) =>
                c.id === selectedCard.id
                    ? { ...c, ...data, updated_at: new Date().toISOString() }
                    : c
            )
            return updated
        })
        setIsDetailOpen(false)
    }

    const handleDeleteSelectedCard = () => {
        if (!selectedCard) return
        handleDeleteCard(selectedCard.id)
        setIsDetailOpen(false)
    }

    const handleAddChecklist = (titulo: string) => {
        console.log('Add checklist:', titulo)
    }

    const handleToggleChecklistItem = (checklistId: string, itemId: string) => {
        console.log('Toggle checklist item:', checklistId, itemId)
    }

    const handleAddComment = (conteudo: string) => {
        console.log('Add comment:', conteudo)
    }

    return (
        <DashboardLayout>
            <div className="h-[calc(100vh-130px)] flex flex-col">
                {/* Page Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Kanban</h1>
                        <p className="text-muted-foreground">
                            Gerencie tarefas e projetos visualmente
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Select
                            value={selectedQuadro.id}
                            onValueChange={(value) => {
                                const quadro = mockQuadros.find((q) => q.id === value)
                                if (quadro) setSelectedQuadro(quadro)
                            }}
                        >
                            <SelectTrigger className="w-[220px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {mockQuadros.map((quadro) => (
                                    <SelectItem key={quadro.id} value={quadro.id}>
                                        <div className="flex items-center gap-2">
                                            <div
                                                className="w-3 h-3 rounded-full"
                                                style={{ backgroundColor: quadro.cor }}
                                            />
                                            {quadro.nome}
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Button variant="outline" size="icon">
                            <Settings className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* Kanban Board */}
                <div className="flex-1 overflow-hidden">
                    <KanbanBoard
                        quadro={selectedQuadro}
                        listas={listas.filter((l) => l.quadro_id === selectedQuadro.id)}
                        cartoes={cartoes}
                        onAddList={handleAddList}
                        onEditList={handleEditList}
                        onDeleteList={handleDeleteList}
                        onAddCard={handleAddCard}
                        onEditCard={handleEditCard}
                        onDeleteCard={handleDeleteCard}
                        onArchiveCard={handleArchiveCard}
                        onCardClick={handleCardClick}
                        onMoveCard={handleMoveCard}
                        onReorderCards={handleReorderCards}
                    />
                </div>

                {/* Card Detail Dialog */}
                <CardDetailDialog
                    open={isDetailOpen}
                    onClose={() => setIsDetailOpen(false)}
                    cartao={selectedCard}
                    usuarios={mockUsuarios}
                    lancamentos={mockLancamentos}
                    onSave={handleSaveCard}
                    onDelete={handleDeleteSelectedCard}
                    onAddChecklist={handleAddChecklist}
                    onToggleChecklistItem={handleToggleChecklistItem}
                    onAddComment={handleAddComment}
                />
            </div>
        </DashboardLayout>
    )
}
