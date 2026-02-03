'use client'

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
import { lancamentoSchema, LancamentoInput } from '@/lib/validations'
import { LANCAMENTO_STATUS, TIPO_LANCAMENTO } from '@/lib/constants'
import { Categoria, CentroCusto, Unidade, LancamentoFinanceiro } from '@/types'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface LancamentoFormDialogProps {
    open: boolean
    onClose: () => void
    onSubmit: (data: LancamentoInput) => void
    lancamento?: LancamentoFinanceiro | null
    categorias: Categoria[]
    centrosCusto: CentroCusto[]
    unidades: Unidade[]
}

export function LancamentoFormDialog({
    open,
    onClose,
    onSubmit,
    lancamento,
    categorias,
    centrosCusto,
    unidades,
}: LancamentoFormDialogProps) {
    const isEditing = !!lancamento

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<LancamentoInput>({
        resolver: zodResolver(lancamentoSchema),
        defaultValues: lancamento
            ? {
                tipo: lancamento.tipo,
                descricao: lancamento.descricao,
                valor: lancamento.valor,
                data_vencimento: lancamento.data_vencimento,
                data_pagamento: lancamento.data_pagamento || '',
                status: lancamento.status,
                categoria_id: lancamento.categoria_id,
                centro_custo_id: lancamento.centro_custo_id || '',
                unidade_id: lancamento.unidade_id || '',
                observacoes: lancamento.observacoes || '',
            }
            : {
                tipo: 'despesa',
                descricao: '',
                valor: 0,
                data_vencimento: '',
                data_pagamento: '',
                status: 'pendente',
                categoria_id: '',
                centro_custo_id: '',
                unidade_id: '',
                observacoes: '',
            },
    })

    const watchTipo = watch('tipo')
    const watchStatus = watch('status')

    // Filter categories by type
    const filteredCategorias = categorias.filter((c) => c.tipo === watchTipo)

    const handleFormSubmit = async (data: LancamentoInput) => {
        await onSubmit(data)
        reset()
        onClose()
    }

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>
                        {isEditing ? 'Editar Lançamento' : 'Novo Lançamento'}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
                    {/* Type Tabs */}
                    <Tabs
                        value={watchTipo}
                        onValueChange={(value) =>
                            setValue('tipo', value as LancamentoInput['tipo'])
                        }
                    >
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger
                                value="receita"
                                className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white"
                            >
                                💰 Receita
                            </TabsTrigger>
                            <TabsTrigger
                                value="despesa"
                                className="data-[state=active]:bg-red-500 data-[state=active]:text-white"
                            >
                                📤 Despesa
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>

                    {/* Description */}
                    <div className="space-y-2">
                        <Label htmlFor="descricao">Descrição *</Label>
                        <Input
                            id="descricao"
                            {...register('descricao')}
                            error={errors.descricao?.message}
                            placeholder="Ex: Taxa condominial janeiro"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Value */}
                        <div className="space-y-2">
                            <Label htmlFor="valor">Valor *</Label>
                            <Input
                                id="valor"
                                type="number"
                                step="0.01"
                                {...register('valor', { valueAsNumber: true })}
                                error={errors.valor?.message}
                                placeholder="0,00"
                            />
                        </div>

                        {/* Category */}
                        <div className="space-y-2">
                            <Label>Categoria *</Label>
                            <Select
                                value={watch('categoria_id')}
                                onValueChange={(value) => setValue('categoria_id', value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {filteredCategorias.map((cat) => (
                                        <SelectItem key={cat.id} value={cat.id}>
                                            <div className="flex items-center gap-2">
                                                <span
                                                    className="w-3 h-3 rounded-full"
                                                    style={{ backgroundColor: cat.cor }}
                                                />
                                                {cat.nome}
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.categoria_id && (
                                <p className="text-xs text-destructive">
                                    {errors.categoria_id.message}
                                </p>
                            )}
                        </div>

                        {/* Due Date */}
                        <div className="space-y-2">
                            <Label htmlFor="data_vencimento">Data de Vencimento *</Label>
                            <Input
                                id="data_vencimento"
                                type="date"
                                {...register('data_vencimento')}
                                error={errors.data_vencimento?.message}
                            />
                        </div>

                        {/* Payment Date */}
                        <div className="space-y-2">
                            <Label htmlFor="data_pagamento">Data de Pagamento</Label>
                            <Input
                                id="data_pagamento"
                                type="date"
                                {...register('data_pagamento')}
                            />
                        </div>

                        {/* Status */}
                        <div className="space-y-2">
                            <Label>Status *</Label>
                            <Select
                                value={watchStatus}
                                onValueChange={(value) =>
                                    setValue('status', value as LancamentoInput['status'])
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.entries(LANCAMENTO_STATUS).map(([key, config]) => (
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

                        {/* Cost Center */}
                        <div className="space-y-2">
                            <Label>Centro de Custo</Label>
                            <Select
                                value={watch('centro_custo_id') || ''}
                                onValueChange={(value) => setValue('centro_custo_id', value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Opcional" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">Nenhum</SelectItem>
                                    {centrosCusto
                                        .filter((cc) => cc.ativo)
                                        .map((cc) => (
                                            <SelectItem key={cc.id} value={cc.id}>
                                                {cc.nome}
                                            </SelectItem>
                                        ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Unit (for revenue) */}
                    {watchTipo === 'receita' && (
                        <div className="space-y-2">
                            <Label>Unidade</Label>
                            <Select
                                value={watch('unidade_id') || ''}
                                onValueChange={(value) => setValue('unidade_id', value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Vincular a uma unidade" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">Nenhuma</SelectItem>
                                    {unidades.map((unidade) => (
                                        <SelectItem key={unidade.id} value={unidade.id}>
                                            {unidade.bloco ? `Bloco ${unidade.bloco} - ` : ''}
                                            {unidade.numero}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    {/* Notes */}
                    <div className="space-y-2">
                        <Label htmlFor="observacoes">Observações</Label>
                        <Textarea
                            id="observacoes"
                            {...register('observacoes')}
                            rows={3}
                            placeholder="Observações adicionais..."
                        />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancelar
                        </Button>
                        <Button type="submit" isLoading={isSubmitting}>
                            {isEditing ? 'Salvar Alterações' : 'Criar Lançamento'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
