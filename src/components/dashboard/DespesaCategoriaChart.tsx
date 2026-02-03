'use client'

import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip,
    Legend,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'

interface DespesaCategoriaChartProps {
    data: Array<{
        categoria: string
        valor: number
        percentual: number
        cor: string
    }>
}

export function DespesaCategoriaChart({ data }: DespesaCategoriaChartProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg font-semibold">Despesas por Categoria</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="valor"
                                nameKey="categoria"
                            >
                                {data.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={entry.cor}
                                        className="stroke-background"
                                        strokeWidth={2}
                                    />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'hsl(var(--card))',
                                    border: '1px solid hsl(var(--border))',
                                    borderRadius: '12px',
                                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                                }}
                                formatter={(value: number) => formatCurrency(value)}
                            />
                            <Legend
                                layout="vertical"
                                align="right"
                                verticalAlign="middle"
                                formatter={(value, entry) => {
                                    const item = data.find(d => d.categoria === value)
                                    return (
                                        <span className="text-sm">
                                            {value} <span className="text-muted-foreground">({item?.percentual}%)</span>
                                        </span>
                                    )
                                }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )
}
