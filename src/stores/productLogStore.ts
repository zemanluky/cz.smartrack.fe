import { create } from 'zustand'
import { ProductWithPosition } from '@/lib/types/product'

export type ActivityType = 'add' | 'delete' | 'update'

export interface ActivityLog {
    id: number
    timestamp: Date
    type: ActivityType
    productId: number
    productName: string
    details: string
}

interface ProductLogStore {
    logs: ActivityLog[]
    addLog: (type: ActivityType, product: Partial<ProductWithPosition>, details?: string) => void
    getLogs: () => ActivityLog[]
    clearLogs: () => void
}

export const useProductLogStore = create<ProductLogStore>((set, get) => ({
    logs: [],

    addLog: (type, product, details = '') => {
        const newLog: ActivityLog = {
            id: get().logs.length + 1,
            timestamp: new Date(),
            type,
            productId: product.id || 0,
            productName: product.name || 'Unknown Product',
            details
        }

        set((state) => ({
            logs: [newLog, ...state.logs] // Add to beginning for chronological order
        }))
    },

    getLogs: () => get().logs,

    clearLogs: () => {
        set({ logs: [] })
    }
}))