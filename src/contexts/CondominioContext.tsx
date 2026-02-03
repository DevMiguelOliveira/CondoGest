'use client'

import { createContext, useContext, useState, ReactNode, useCallback } from 'react'
import { Condominio } from '@/types'

interface CondominioContextType {
    condominio: Condominio | null
    setCondominio: (condominio: Condominio | null) => void
    isLoading: boolean
    setIsLoading: (loading: boolean) => void
}

const CondominioContext = createContext<CondominioContextType | undefined>(undefined)

export function CondominioProvider({ children }: { children: ReactNode }) {
    const [condominio, setCondominioState] = useState<Condominio | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    const setCondominio = useCallback((cond: Condominio | null) => {
        setCondominioState(cond)
        if (cond) {
            localStorage.setItem('condominio_id', cond.id)
        } else {
            localStorage.removeItem('condominio_id')
        }
    }, [])

    return (
        <CondominioContext.Provider value={{ condominio, setCondominio, isLoading, setIsLoading }}>
            {children}
        </CondominioContext.Provider>
    )
}

export function useCondominio() {
    const context = useContext(CondominioContext)
    if (context === undefined) {
        throw new Error('useCondominio must be used within a CondominioProvider')
    }
    return context
}
