import { Unidade } from '@/types'

// =====================================================
// Módulo de Rateio Condominial
// =====================================================

export type ModeloRateio = 'igualitario' | 'fracao_ideal' | 'valor_fixo'

export interface RateioInput {
    /** ID da despesa que será rateada */
    despesa_id: string
    /** Valor total da despesa */
    valor_total: number
    /** Modelo de rateio escolhido */
    modelo: ModeloRateio
    /** Data de vencimento das parcelas geradas */
    data_vencimento: string
    /** Categoria para as receitas geradas (ex: "Taxa Condominial") */
    categoria_id: string
    /** Observações sobre o rateio */
    observacoes?: string
    /**
     * Valores manuais por unidade (apenas para modelo 'valor_fixo').
     * Chave: unidade_id, Valor: valor atribuído
     */
    valores_manuais?: Record<string, number>
}

export interface RateioItem {
    unidade_id: string
    unidade_numero: string
    unidade_bloco?: string
    valor: number
    fracao_ideal?: number
}

export interface RateioResult {
    items: RateioItem[]
    total_calculado: number
    diferenca: number
    valido: boolean
    erros: string[]
}

// =====================================================
// Cálculos de Rateio
// =====================================================

/**
 * Calcula rateio igualitário: divide o valor total igualmente entre as unidades.
 */
export function calcularRateioIgualitario(
    valorTotal: number,
    unidades: Unidade[]
): RateioResult {
    const erros: string[] = []

    if (valorTotal <= 0) {
        erros.push('Valor total deve ser maior que zero.')
    }
    if (unidades.length === 0) {
        erros.push('É necessário pelo menos uma unidade para o rateio.')
    }
    if (erros.length > 0) {
        return { items: [], total_calculado: 0, diferenca: valorTotal, valido: false, erros }
    }

    const valorPorUnidade = Math.floor((valorTotal / unidades.length) * 100) / 100
    const totalCalculado = valorPorUnidade * unidades.length
    const diferenca = +(valorTotal - totalCalculado).toFixed(2)

    const items: RateioItem[] = unidades.map((u, index) => ({
        unidade_id: u.id,
        unidade_numero: u.numero,
        unidade_bloco: u.bloco,
        // A última unidade absorve o centavo residual de arredondamento
        valor: index === unidades.length - 1
            ? +(valorPorUnidade + diferenca).toFixed(2)
            : valorPorUnidade,
    }))

    const totalFinal = items.reduce((sum, item) => sum + item.valor, 0)

    return {
        items,
        total_calculado: +totalFinal.toFixed(2),
        diferenca: +(valorTotal - totalFinal).toFixed(2),
        valido: Math.abs(valorTotal - totalFinal) < 0.01,
        erros: [],
    }
}

/**
 * Calcula rateio por fração ideal: cada unidade paga proporcional à sua fração.
 * A fração ideal de cada unidade deve estar preenchida e a soma deve ser ~1.0.
 */
export function calcularRateioFracaoIdeal(
    valorTotal: number,
    unidades: Unidade[]
): RateioResult {
    const erros: string[] = []

    if (valorTotal <= 0) {
        erros.push('Valor total deve ser maior que zero.')
    }
    if (unidades.length === 0) {
        erros.push('É necessário pelo menos uma unidade para o rateio.')
    }

    // Verificar se todas possuem fração ideal
    const unidadesSemFracao = unidades.filter(u => !u.fracao_ideal || u.fracao_ideal <= 0)
    if (unidadesSemFracao.length > 0) {
        erros.push(
            `As seguintes unidades não possuem fração ideal definida: ${unidadesSemFracao.map(u => `${u.bloco || ''}${u.numero}`).join(', ')
            }`
        )
    }

    // Verificar soma das frações
    const somaFracoes = unidades.reduce((sum, u) => sum + (u.fracao_ideal || 0), 0)
    const TOLERANCIA = 0.000001
    if (Math.abs(somaFracoes - 1.0) > TOLERANCIA) {
        erros.push(
            `A soma das frações ideais é ${somaFracoes.toFixed(6)}, mas deveria ser 1.000000. ` +
            `Diferença: ${Math.abs(somaFracoes - 1.0).toFixed(6)}`
        )
    }

    if (erros.length > 0) {
        return { items: [], total_calculado: 0, diferenca: valorTotal, valido: false, erros }
    }

    const items: RateioItem[] = unidades.map(u => ({
        unidade_id: u.id,
        unidade_numero: u.numero,
        unidade_bloco: u.bloco,
        valor: Math.floor(valorTotal * (u.fracao_ideal || 0) * 100) / 100,
        fracao_ideal: u.fracao_ideal,
    }))

    // Ajuste de arredondamento na última unidade
    const totalCalculado = items.reduce((sum, item) => sum + item.valor, 0)
    const diferenca = +(valorTotal - totalCalculado).toFixed(2)

    if (items.length > 0 && diferenca !== 0) {
        items[items.length - 1].valor = +(items[items.length - 1].valor + diferenca).toFixed(2)
    }

    const totalFinal = items.reduce((sum, item) => sum + item.valor, 0)

    return {
        items,
        total_calculado: +totalFinal.toFixed(2),
        diferenca: +(valorTotal - totalFinal).toFixed(2),
        valido: Math.abs(valorTotal - totalFinal) < 0.01,
        erros: [],
    }
}

/**
 * Valida um rateio manual (valor fixo por unidade).
 * O síndico atribui valores manualmente e o sistema valida que a soma = total.
 */
export function validarRateioManual(
    valorTotal: number,
    valoresPorUnidade: Record<string, number>,
    unidades: Unidade[]
): RateioResult {
    const erros: string[] = []

    if (valorTotal <= 0) {
        erros.push('Valor total deve ser maior que zero.')
    }

    if (Object.keys(valoresPorUnidade).length === 0) {
        erros.push('Nenhum valor atribuído às unidades.')
        return { items: [], total_calculado: 0, diferenca: valorTotal, valido: false, erros }
    }

    // Verificar valores negativos ou zero
    for (const [unidadeId, valor] of Object.entries(valoresPorUnidade)) {
        if (valor <= 0) {
            const unidade = unidades.find(u => u.id === unidadeId)
            erros.push(
                `Valor inválido para unidade ${unidade?.bloco || ''}${unidade?.numero || unidadeId}: R$ ${valor}`
            )
        }
    }

    // Verificar que todas as unidades com valor existem
    const unidadeIds = new Set(unidades.map(u => u.id))
    for (const unidadeId of Object.keys(valoresPorUnidade)) {
        if (!unidadeIds.has(unidadeId)) {
            erros.push(`Unidade com ID ${unidadeId} não encontrada.`)
        }
    }

    const totalCalculado = Object.values(valoresPorUnidade).reduce((sum, v) => sum + v, 0)
    const diferenca = +(valorTotal - totalCalculado).toFixed(2)

    if (Math.abs(diferenca) > 0.01) {
        erros.push(
            `A soma dos valores (R$ ${totalCalculado.toFixed(2)}) difere do total da despesa ` +
            `(R$ ${valorTotal.toFixed(2)}). Diferença: R$ ${Math.abs(diferenca).toFixed(2)}`
        )
    }

    const items: RateioItem[] = Object.entries(valoresPorUnidade).map(([unidadeId, valor]) => {
        const unidade = unidades.find(u => u.id === unidadeId)
        return {
            unidade_id: unidadeId,
            unidade_numero: unidade?.numero || 'N/A',
            unidade_bloco: unidade?.bloco,
            valor: +valor.toFixed(2),
        }
    })

    return {
        items,
        total_calculado: +totalCalculado.toFixed(2),
        diferenca,
        valido: erros.length === 0,
        erros,
    }
}

/**
 * Função principal: calcula o rateio com base no modelo escolhido.
 */
export function calcularRateio(
    input: RateioInput,
    unidades: Unidade[]
): RateioResult {
    switch (input.modelo) {
        case 'igualitario':
            return calcularRateioIgualitario(input.valor_total, unidades)

        case 'fracao_ideal':
            return calcularRateioFracaoIdeal(input.valor_total, unidades)

        case 'valor_fixo':
            if (!input.valores_manuais) {
                return {
                    items: [],
                    total_calculado: 0,
                    diferenca: input.valor_total,
                    valido: false,
                    erros: ['Modelo "valor_fixo" requer valores manuais por unidade.'],
                }
            }
            return validarRateioManual(input.valor_total, input.valores_manuais, unidades)

        default:
            return {
                items: [],
                total_calculado: 0,
                diferenca: input.valor_total,
                valido: false,
                erros: [`Modelo de rateio inválido: ${input.modelo}`],
            }
    }
}
