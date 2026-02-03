'use client'

import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'

interface FluxoCaixaChartProps {
    data: Array<{
        mes: string
        receitas: number
        despesas: number
        saldo: number
    }>
}

export function FluxoCaixaChart({ data }: FluxoCaixaChartProps) {
    return (
        <Card className="col-span-full lg:col-span-2">
            <CardHeader>
                <CardTitle className="text-lg font-semibold">Fluxo de Caixa Mensal</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                            data={data}
                            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                        >
                            <defs>
                                <linearGradient id="receitas" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="despesas" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                            <XAxis
                                dataKey="mes"
                                tick={{ fontSize: 12 }}
                                className="text-muted-foreground"
                            />
                            <YAxis
                                tick={{ fontSize: 12 }}
                                tickFormatter={(value) => `R$${(value / 1000).toFixed(0)}k`}
                                className="text-muted-foreground"
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'hsl(var(--card))',
                                    border: '1px solid hsl(var(--border))',
                                    borderRadius: '12px',
                                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                                }}
                                labelStyle={{ fontWeight: 600, marginBottom: 8 }}
                                formatter={(value) => [formatCurrency(value as number), '']}
                            />
                            <Legend
                                wrapperStyle={{ paddingTop: 20 }}
                                formatter={(value) => (
                                    <span className="text-sm text-muted-foreground capitalize">
                                        {value}
                                    </span>
                                )}
                            />
                            <Area
                                type="monotone"
                                dataKey="receitas"
                                stroke="#10b981"
                                strokeWidth={2}
                                fillOpacity={1}
                                fill="url(#receitas)"
                                name="Receitas"
                            />
                            <Area
                                type="monotone"
                                dataKey="despesas"
                                stroke="#ef4444"
                                strokeWidth={2}
                                fillOpacity={1}
                                fill="url(#despesas)"
                                name="Despesas"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )
}
