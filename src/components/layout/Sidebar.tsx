'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import {
    LayoutDashboard,
    DollarSign,
    Kanban,
    Building2,
    Users,
    Settings,
    FileText,
    ChevronLeft,
    ChevronRight,
    LogOut,
    HelpCircle,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'

interface SidebarProps {
    collapsed: boolean
    onToggle: () => void
}

const menuItems = [
    {
        title: 'Principal',
        items: [
            { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
            { icon: DollarSign, label: 'Financeiro', href: '/financeiro' },
            { icon: Kanban, label: 'Kanban', href: '/kanban' },
        ],
    },
    {
        title: 'Gestão',
        items: [
            { icon: Building2, label: 'Unidades', href: '/unidades' },
            { icon: Users, label: 'Usuários', href: '/usuarios' },
            { icon: FileText, label: 'Relatórios', href: '/relatorios' },
        ],
    },
    {
        title: 'Sistema',
        items: [
            { icon: Settings, label: 'Configurações', href: '/configuracoes' },
            { icon: HelpCircle, label: 'Ajuda', href: '/ajuda' },
        ],
    },
]

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
    const pathname = usePathname()
    const { signOut, user } = useAuth()

    return (
        <motion.aside
            initial={false}
            animate={{ width: collapsed ? 80 : 280 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className={cn(
                'fixed left-0 top-0 z-40 h-screen border-r bg-card flex flex-col',
                'shadow-lg'
            )}
        >
            {/* Logo */}
            <div className="flex h-16 items-center justify-between px-4 border-b">
                <Link href="/dashboard" className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 shadow-lg shadow-blue-500/30">
                        <Building2 className="h-5 w-5 text-white" />
                    </div>
                    {!collapsed && (
                        <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="font-bold text-lg bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent"
                        >
                            CondoGest
                        </motion.span>
                    )}
                </Link>
            </div>

            {/* Menu */}
            <ScrollArea className="flex-1 py-4">
                <nav className="space-y-6 px-3">
                    <TooltipProvider delayDuration={0}>
                        {menuItems.map((section) => (
                            <div key={section.title}>
                                {!collapsed && (
                                    <h4 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                        {section.title}
                                    </h4>
                                )}
                                <div className="space-y-1">
                                    {section.items.map((item) => {
                                        const isActive = pathname === item.href
                                        const Icon = item.icon

                                        const linkContent = (
                                            <Link
                                                href={item.href}
                                                className={cn(
                                                    'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
                                                    isActive
                                                        ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25'
                                                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                                                )}
                                            >
                                                <Icon className="h-5 w-5 flex-shrink-0" />
                                                {!collapsed && (
                                                    <motion.span
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        exit={{ opacity: 0 }}
                                                    >
                                                        {item.label}
                                                    </motion.span>
                                                )}
                                            </Link>
                                        )

                                        if (collapsed) {
                                            return (
                                                <Tooltip key={item.href}>
                                                    <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                                                    <TooltipContent side="right" className="font-medium">
                                                        {item.label}
                                                    </TooltipContent>
                                                </Tooltip>
                                            )
                                        }

                                        return <div key={item.href}>{linkContent}</div>
                                    })}
                                </div>
                            </div>
                        ))}
                    </TooltipProvider>
                </nav>
            </ScrollArea>

            {/* Footer */}
            <div className="border-t p-3">
                {!collapsed && user && (
                    <div className="mb-3 px-3 py-2 rounded-xl bg-muted/50">
                        <p className="text-sm font-medium truncate">{user.nome}</p>
                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>
                )}
                <TooltipProvider delayDuration={0}>
                    <div className="flex items-center justify-between gap-2">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="rounded-xl"
                                    onClick={signOut}
                                >
                                    <LogOut className="h-5 w-5" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="top">Sair</TooltipContent>
                        </Tooltip>

                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="rounded-xl"
                                    onClick={onToggle}
                                >
                                    {collapsed ? (
                                        <ChevronRight className="h-5 w-5" />
                                    ) : (
                                        <ChevronLeft className="h-5 w-5" />
                                    )}
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="top">
                                {collapsed ? 'Expandir' : 'Recolher'}
                            </TooltipContent>
                        </Tooltip>
                    </div>
                </TooltipProvider>
            </div>
        </motion.aside>
    )
}
