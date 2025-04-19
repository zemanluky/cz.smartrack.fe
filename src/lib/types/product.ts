//lib/types/product.ts
export interface Product {
    id: number;
    organization_id: number;
    name: string;
    price: number;
    deleted_at: null | string;
}

export interface ProductPosition {
    shelf_id: number;
    row: number;
    column: number;
    low_stock_threshold_percent: number;
    max_current_product_capacity: number;
    current_amount_percent: number;
}
export interface ProductWithPosition extends Product {
    position: ProductPosition;
}

export interface AddProductFormData {
    name: string;
    price: number;
    organization_id: number;
}

