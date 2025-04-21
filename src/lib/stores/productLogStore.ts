import { create } from 'zustand'
import type { Product } from '@/lib/types/product' // Use the correct Product type

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
    // Update the signature to accept Pick<Product, 'id' | 'name'>
    addLog: (type: ActivityType, productData: Pick<Product, 'id' | 'name'>, details?: string) => void
    getLogs: () => ActivityLog[]
    clearLogs: () => void
}

export const useProductLogStore = create<ProductLogStore>((set, get) => ({
    logs: [],

    addLog: (type, productData, details = '') => {
        const newLog: ActivityLog = {
            id: get().logs.length + 1,
            timestamp: new Date(),
            type,
            // Use data from the passed object
            productId: productData.id ?? 0, // Handle potential undefined id if necessary
            productName: productData.name ?? 'Unknown Product', // Handle potential undefined name
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