import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Definice typů pro logy produktů
export interface ProductLog {
  id: number;
  productId: number;
  productName: string;
  timestamp: string;
  action: 'create' | 'update' | 'delete' | 'view';
  userId: number;
  userName: string;
  details?: string;
}

interface ProductLogState {
  logs: ProductLog[];
  addLog: (log: Omit<ProductLog, 'id' | 'timestamp'>) => void;
  clearLogs: () => void;
  getLogsByProductId: (productId: number) => ProductLog[];
  getRecentLogs: (limit?: number) => ProductLog[];
}

export const useProductLogStore = create<ProductLogState>()(
  persist(
    (set, get) => ({
      logs: [],
      
      addLog: (logData) => set((state) => {
        const newLog: ProductLog = {
          ...logData,
          id: state.logs.length > 0 ? Math.max(...state.logs.map(log => log.id)) + 1 : 1,
          timestamp: new Date().toISOString(),
        };
        return { logs: [newLog, ...state.logs] };
      }),
      
      clearLogs: () => set({ logs: [] }),
      
      getLogsByProductId: (productId) => {
        return get().logs.filter(log => log.productId === productId);
      },
      
      getRecentLogs: (limit = 10) => {
        return get().logs.slice(0, limit);
      },
    }),
    {
      name: 'product-logs-storage',
    }
  )
);
