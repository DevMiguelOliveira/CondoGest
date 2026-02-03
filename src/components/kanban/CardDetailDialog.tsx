'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cartaoSchema, CartaoInput } from '@/lib/validations'
import { PRIORIDADE_CARTAO, LANCAMENTO_STATUS } from '@/lib/constants'
import { formatCurrency, formatDate, formatDateTime, getInitials } from '@/lib/utils'
import { Cartao, User, LancamentoFinanceiro, Checklist } from '@/types'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Calendar,
    User as UserIcon,
    DollarSign,
    CheckSquare,
    MessageSquare,
    Clock,
    Plus,
    Trash2,
    X,
} from 'lucide-react'

interface CardDetailDialogProps {
    open: boolean
    onClose: () => void
    cartao: Cartao | null
    usuarios: User[]
    lancamentos: LancamentoFinanceiro[]
    onSave: (data: CartaoInput) => void
    onDelete: () => void
    onAddChecklist: (titulo: string) => void
    onToggleChecklistItem: (checklistId: string, itemId: string) => void
    onAddComment: (conteudo: string) => void
}

export function CardDetailDialog({
    open,
    onClose,
    cartao,
    usuarios,
    lancamentos,
    onSave,
    onDelete,
    onAddChecklist,
    onToggleChecklistItem,
    onAddComment,
}: CardDetailDialogProps) {
    const [newChecklistTitle, setNewChecklistTitle] = useState('')
    const [newComment, setNewComment] = useState('')

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = useForm<CartaoInput>({
        resolver: zodResolver(cartaoSchema),
        defaultValues: {
            titulo: cartao?.titulo || '',
            descricao: cartao?.descricao || '',
            prioridade: cartao?.prioridade || 'media',
            data_vencimento: cartao?.data_vencimento || '',
            responsavel_id: cartao?.responsavel_id || '',
            lancamento_id: cartao?.lancamento_id || '',
            etiquetas: cartao?.etiquetas || [],
        },
    })

    const watchPrioridade = watch('prioridade')
    const watchLancamento = watch('lancamento_id')

    // Calculate checklist progress
    const checklistProgress = cartao?.checklists?.reduce(
        (acc, cl) => {
            const total = cl.items.length
            const completed = cl.items.filter((i) => i.concluido).length
            return {
                total: acc.total + total,
                completed: acc.completed + completed,
            }
        },
        { total: 0, completed: 0 }
    ) || { total: 0, completed: 0 }

    const progressPercentage =
        checklistProgress.total > 0
            ? Math.round((checklistProgress.completed / checklistProgress.total) * 100)
            : 0

    const selectedLancamento = lancamentos.find((l) => l.id === watchLancamento)

    const handleAddChecklist = () => {
        if (newChecklistTitle.trim()) {
            onAddChecklist(newChecklistTitle.trim())
            setNewChecklistTitle('')
        }
    }

    const handleAddComment = () => {
        if (newComment.trim()) {
            onAddComment(newComment.trim())
            setNewComment('')
        }
    }

    if (!cartao) return null

    const prioridadeConfig = PRIORIDADE_CARTAO[cartao.prioridade]

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden">
                <DialogHeader>
                    <div className="flex items-start gap-3">
                        <Badge variant="outline" className={prioridadeConfig.textColor}>
                            {prioridadeConfig.label}
                        </Badge>
                        {cartao.lancamento && (
                            <Badge
                                variant={
                                    cartao.lancamento.status === 'atrasado'
                                        ? 'destructive'
                                        : 'secondary'
                                }
                            >
                                <DollarSign className="h-3 w-3 mr-1" />
                                {LANCAMENTO_STATUS[cartao.lancamento.status].label}
                            </Badge>
                        )}
                    </div>
                    <DialogTitle className="text-xl">{cartao.titulo}</DialogTitle>
                </DialogHeader>

                <Tabs defaultValue="details" className="w-full">
                    <TabsList className="w-full justify-start">
                        <TabsTrigger value="details">Detalhes</TabsTrigger>
                        <TabsTrigger value="checklists">
                            Checklists ({checklistProgress.completed}/{checklistProgress.total})
                        </TabsTrigger>
                        <TabsTrigger value="comments">
                            Comentários ({cartao.comentarios?.length || 0})
                        </TabsTrigger>
                        <TabsTrigger value="activity">Atividade</TabsTrigger>
                    </TabsList>

                    <ScrollArea className="h-[400px] mt-4">
                        <TabsContent value="details" className="space-y-6 pr-4">
                            <form onSubmit={handleSubmit(onSave)} className="space-y-4">
                                {/* Title */}
                                <div className="space-y-2">
                                    <Label>Título</Label>
                                    <Input {...register('titulo')} error={errors.titulo?.message} />
                                </div>

                                {/* Description */}
                                <div className="space-y-2">
                                    <Label>Descrição</Label>
                                    <Textarea
                                        {...register('descricao')}
                                        rows={4}
                                        placeholder="Adicione uma descrição..."
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    {/* Priority */}
                                    <div className="space-y-2">
                                        <Label>Prioridade</Label>
                                        <Select
                                            value={watchPrioridade}
                                            onValueChange={(value) =>
                                                setValue('prioridade', value as CartaoInput['prioridade'])
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {Object.entries(PRIORIDADE_CARTAO).map(([key, config]) => (
                                                    <SelectItem key={key} value={key}>
                                                        <div className="flex items-center gap-2">
                                                            <span
                                                                className={`w-2 h-2 rounded-full ${config.color}`}
                                                            />
                                                            {config.label}
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Due Date */}
                                    <div className="space-y-2">
                                        <Label>Data de Vencimento</Label>
                                        <Input type="date" {...register('data_vencimento')} />
                                    </div>

                                    {/* Assignee */}
                                    <div className="space-y-2">
                                        <Label>Responsável</Label>
                                        <Select
                                            value={watch('responsavel_id') || ''}
                                            onValueChange={(value) => setValue('responsavel_id', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecione..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {usuarios.map((user) => (
                                                    <SelectItem key={user.id} value={user.id}>
                                                        <div className="flex items-center gap-2">
                                                            <Avatar className="h-6 w-6">
                                                                <AvatarFallback className="text-xs">
                                                                    {getInitials(user.nome)}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            {user.nome}
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Link to Financial */}
                                    <div className="space-y-2">
                                        <Label>Vincular ao Financeiro</Label>
                                        <Select
                                            value={watch('lancamento_id') || ''}
                                            onValueChange={(value) => setValue('lancamento_id', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecione..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="">Nenhum</SelectItem>
                                                {lancamentos.map((lanc) => (
                                                    <SelectItem key={lanc.id} value={lanc.id}>
                                                        <div className="flex items-center justify-between w-full">
                                                            <span className="truncate">{lanc.descricao}</span>
                                                            <Badge
                                                                variant={
                                                                    lanc.tipo === 'receita' ? 'success' : 'destructive'
                                                                }
                                                                className="ml-2"
                                                            >
                                                                {formatCurrency(lanc.valor)}
                                                            </Badge>
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                {/* Selected Financial Entry Details */}
                                {selectedLancamento && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        className="p-4 rounded-xl bg-muted/50 border"
                                    >
                                        <div className="flex items-center gap-2 mb-2">
                                            <DollarSign className="h-4 w-4" />
                                            <span className="font-medium">Lançamento Vinculado</span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2 text-sm">
                                            <div>
                                                <span className="text-muted-foreground">Valor:</span>{' '}
                                                {formatCurrency(selectedLancamento.valor)}
                                            </div>
                                            <div>
                                                <span className="text-muted-foreground">Status:</span>{' '}
                                                <Badge
                                                    variant="outline"
                                                    className={
                                                        LANCAMENTO_STATUS[selectedLancamento.status].textColor
                                                    }
                                                >
                                                    {LANCAMENTO_STATUS[selectedLancamento.status].label}
                                                </Badge>
                                            </div>
                                            <div>
                                                <span className="text-muted-foreground">Vencimento:</span>{' '}
                                                {formatDate(selectedLancamento.data_vencimento)}
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                <DialogFooter className="gap-2">
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        onClick={onDelete}
                                    >
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Excluir
                                    </Button>
                                    <Button type="submit">Salvar Alterações</Button>
                                </DialogFooter>
                            </form>
                        </TabsContent>

                        <TabsContent value="checklists" className="space-y-4 pr-4">
                            {/* Progress */}
                            {checklistProgress.total > 0 && (
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span>Progresso</span>
                                        <span>{progressPercentage}%</span>
                                    </div>
                                    <Progress value={progressPercentage} />
                                </div>
                            )}

                            {/* Add Checklist */}
                            <div className="flex gap-2">
                                <Input
                                    placeholder="Nova checklist..."
                                    value={newChecklistTitle}
                                    onChange={(e) => setNewChecklistTitle(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleAddChecklist()}
                                />
                                <Button onClick={handleAddChecklist}>
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>

                            {/* Checklists */}
                            <AnimatePresence>
                                {cartao.checklists?.map((checklist) => (
                                    <motion.div
                                        key={checklist.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="space-y-2"
                                    >
                                        <h4 className="font-medium flex items-center gap-2">
                                            <CheckSquare className="h-4 w-4" />
                                            {checklist.titulo}
                                        </h4>
                                        <div className="space-y-1 pl-6">
                                            {checklist.items.map((item) => (
                                                <div
                                                    key={item.id}
                                                    className="flex items-center gap-2 py-1"
                                                >
                                                    <Checkbox
                                                        checked={item.concluido}
                                                        onCheckedChange={() =>
                                                            onToggleChecklistItem(checklist.id, item.id)
                                                        }
                                                    />
                                                    <span
                                                        className={
                                                            item.concluido ? 'line-through text-muted-foreground' : ''
                                                        }
                                                    >
                                                        {item.titulo}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>

                            {(!cartao.checklists || cartao.checklists.length === 0) && (
                                <p className="text-center text-muted-foreground py-8">
                                    Nenhuma checklist adicionada
                                </p>
                            )}
                        </TabsContent>

                        <TabsContent value="comments" className="space-y-4 pr-4">
                            {/* Add Comment */}
                            <div className="flex gap-2">
                                <Textarea
                                    placeholder="Adicionar comentário..."
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    rows={2}
                                />
                                <Button onClick={handleAddComment} className="self-end">
                                    Enviar
                                </Button>
                            </div>

                            <Separator />

                            {/* Comments List */}
                            <AnimatePresence>
                                {cartao.comentarios?.map((comentario, index) => (
                                    <motion.div
                                        key={comentario.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="flex gap-3 p-3 rounded-xl bg-muted/30"
                                    >
                                        <Avatar className="h-8 w-8">
                                            <AvatarFallback className="text-xs">
                                                {comentario.usuario
                                                    ? getInitials(comentario.usuario.nome)
                                                    : 'U'}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium text-sm">
                                                    {comentario.usuario?.nome || 'Usuário'}
                                                </span>
                                                <span className="text-xs text-muted-foreground">
                                                    {formatDateTime(comentario.created_at)}
                                                </span>
                                            </div>
                                            <p className="text-sm mt-1">{comentario.conteudo}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>

                            {(!cartao.comentarios || cartao.comentarios.length === 0) && (
                                <p className="text-center text-muted-foreground py-8">
                                    Nenhum comentário ainda
                                </p>
                            )}
                        </TabsContent>

                        <TabsContent value="activity" className="pr-4">
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Clock className="h-4 w-4" />
                                    <span>Criado em {formatDateTime(cartao.created_at)}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Clock className="h-4 w-4" />
                                    <span>Atualizado em {formatDateTime(cartao.updated_at)}</span>
                                </div>
                            </div>
                        </TabsContent>
                    </ScrollArea>
                </Tabs>
            </DialogContent>
        </Dialog>
    )
}
