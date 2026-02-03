'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Card } from '@/components/ui/card'
import { LucideIcon } from 'lucide-react'

interface MetricCardProps {
    title: string
    value: string | number
    subtitle?: string
    icon: LucideIcon
    trend?: {
        value: number
        isPositive: boolean
    }
    variant?: 'default' | 'success' | 'warning' | 'danger' | 'info'
    className?: string
}

const variantStyles = {
    default: {
        icon: 'bg-primary/10 text-primary',
        trend: 'text-muted-foreground',
    },
    success: {
        icon: 'bg-emerald-500/10 text-emerald-500',
        trend: 'text-emerald-500',
    },
    warning: {
        icon: 'bg-amber-500/10 text-amber-500',
        trend: 'text-amber-500',
    },
    danger: {
        icon: 'bg-red-500/10 text-red-500',
        trend: 'text-red-500',
    },
    info: {
        icon: 'bg-blue-500/10 text-blue-500',
        trend: 'text-blue-500',
    },
}

export function MetricCard({
    title,
    value,
    subtitle,
    icon: Icon,
    trend,
    variant = 'default',
    className,
}: MetricCardProps) {
    const styles = variantStyles[variant]

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <Card className={cn('p-6 hover:shadow-lg transition-shadow', className)}>
                <div className="flex items-start justify-between">
                    <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">{title}</p>
                        <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-bold tracking-tight">{value}</span>
                            {trend && (
                                <span
                                    className={cn(
                                        'text-sm font-medium',
                                        trend.isPositive ? 'text-emerald-500' : 'text-red-500'
                                    )}
                                >
                                    {trend.isPositive ? '+' : ''}{trend.value}%
                                </span>
                            )}
                        </div>
                        {subtitle && (
                            <p className="text-xs text-muted-foreground">{subtitle}</p>
                        )}
                    </div>
                    <div className={cn('p-3 rounded-xl', styles.icon)}>
                        <Icon className="h-6 w-6" />
                    </div>
                </div>
            </Card>
        </motion.div>
    )
}
