import { create } from 'zustand'
import type { ProductWithPosition } from '@/lib/types/product'
import { type ProductFormValues } from "@/lib/schemas/product"
import { useProductLogStore } from './productLogStore'

// Mock data
const mockProducts: ProductWithPosition[] = [
    {
        id: 1,
        organization_id: 1,
        name: "Dell Laptop XPS 13",
        price: 1299.99,
        deleted_at: null,
        position: {
            shelf_id: 1,
            row: 1,
            column: 1,
            current_amount_percent: 75,
            low_stock_threshold_percent: 20,
            max_current_product_capacity: 100
        }
    },
    {
        id: 2,
        organization_id: 1,
        name: "iPhone 15 Pro",
        price: 999.99,
        deleted_at: null,
        position: {
            shelf_id: 1,
            row: 1,
            column: 2,
            current_amount_percent: 15, // Below threshold
            low_stock_threshold_percent: 25,
            max_current_product_capacity: 100
        }
    },
    {
        id: 3,
        organization_id: 1,
        name: "Sony WH-1000XM4",
        price: 349.99,
        deleted_at: null,
        position: {
            shelf_id: 1,
            row: 2,
            column: 1,
            current_amount_percent: 30, // Near threshold
            low_stock_threshold_percent: 20,
            max_current_product_capacity: 100
        }
    },
    {
        id: 4,
        organization_id: 1,
        name: "iPad Air",
        price: 599.99,
        deleted_at: null,
        position: {
            shelf_id: 1,
            row: 2,
            column: 2,
            current_amount_percent: 90,
            low_stock_threshold_percent: 15,
            max_current_product_capacity: 100
        }
    }
]

interface ProductStore {
    products: ProductWithPosition[]
    addProduct: (data: ProductFormValues) => void
    updateProduct: (id: number, data: Partial<ProductWithPosition>) => void
    getProducts: () => ProductWithPosition[]
    deleteProduct: (id: number) => void
}

export const useProductStore = create<ProductStore>((set, get) => ({
    products: mockProducts,

    addProduct: (data) => {
        const { shelf_position, name, price } = data;

        // Create new product from form data
        const newProduct: ProductWithPosition = {
            id: get().products.length + 1,
            organization_id: 1, // Default organization_id
            name,
            price,
            deleted_at: null,
            position: {
                shelf_id: shelf_position.shelf_id,
                row: shelf_position.row,
                column: shelf_position.column,
                low_stock_threshold_percent: shelf_position.low_stock_threshold_percent,
                max_current_product_capacity: shelf_position.max_current_product_capacity,
                current_amount_percent: 100 // Default full stock
            }
        };

        // Log the add operation
        const logStore = useProductLogStore.getState();
        const positionInfo = `Row: ${shelf_position.row}, Column: ${shelf_position.column}`;
        logStore.addLog('add', newProduct, `Price: $${price.toFixed(2)}, Position: ${positionInfo}`);

        set((state) => ({
            products: [...state.products, newProduct]
        }));
    },

    updateProduct: (id, data) => {
        // Find existing product
        const existingProduct = get().products.find(product => product.id === id);

        if (!existingProduct) {
            console.error(`Product with id ${id} not found`);
            return;
        }

        // Create updated product by merging changes
        const updatedProduct: ProductWithPosition = {
            ...existingProduct,
            ...data,
            // Handle nested position object if present in data
            position: data.position ? {
                ...existingProduct.position,
                ...data.position
            } : existingProduct.position
        };

        // Log the update operation
        const logStore = useProductLogStore.getState();
        logStore.addLog('update', updatedProduct, `Product details updated`);

        // Update product in state
        set((state) => ({
            products: state.products.map(product =>
                product.id === id ? updatedProduct : product
            )
        }));
    },

    getProducts: () => get().products,

    deleteProduct: (id) => {
        // Get the product before deleting it
        const productToDelete = get().products.find(product => product.id === id);

        if (productToDelete) {
            // Log the delete operation
            const logStore = useProductLogStore.getState();
            logStore.addLog('delete', productToDelete, `Removed from inventory`);
        }

        set((state) => ({
            products: state.products.filter(product => product.id !== id)
        }));
    }
}))