//lib/types/product.ts

// --- Backend Aligned Types --- 

/**
 * Represents the structure of product data returned by the backend API.
 * Based on cz.smartrack.be/src/model/product.model.ts -> productResponse
 */
export interface BackendProductResponse {
    id: number;
    name: string;
    price: number;
    is_deleted: boolean;
    organization_id?: number;
}

/**
 * Represents the structure of data needed to create/update a product via the backend API.
 * Based on cz.smartrack.be/src/model/product.model.ts -> saveProductData
 */
export interface BackendSaveProductData {
    name: string; 
    price: number;
    organization_id?: number;
}

// --- Extended Frontend Product Type ---

/**
 * Represents the full product structure used throughout the frontend UI,
 * including fields mocked until the backend supports them.
 */
export interface Product {
    // Core fields (aligned with BackendProductResponse)
    id: number;
    organization_id?: number; // Keep optional as per backend response
    name: string;
    price: number;
    is_deleted: boolean;

    // --- Frontend / Mock Only Fields --- 
    // Represents current stock level as a percentage (0-100)
    quantity?: number;
    // Represents the low stock warning threshold as a percentage (0-100)
    low_stock_threshold?: number;
    shelf_position?: {
      shelf_id: number;
      row: number;
      column: number;
    };
    position_type?: 'nfc' | 'manual'; // Kept for frontend UI logic
    discountPercentage?: number; // Kept for frontend UI logic
}

// --- DTOs for Mock Service (using extended Product type) ---
// DTO for creating a product via the mock service
export interface MockCreateProductDTO {
  organization_id: number; // Assuming this is required by mock/frontend logic
  name: string;
  price: number;
  // Include all mockable fields
  // Represents current stock level as a percentage (0-100)
  quantity?: number;
  // Represents the low stock warning threshold as a percentage (0-100)
  low_stock_threshold?: number;
  shelf_position?: {
    shelf_id: number;
    row: number;
    column: number;
  };
  position_type?: 'nfc' | 'manual';
  discountPercentage?: number;
}

// DTO for updating a product via the mock service
export type MockUpdateProductDTO = Partial<MockCreateProductDTO> & { is_deleted?: boolean }; 

// --- Keep original types if they are still used elsewhere directly ---
// (You might want to phase these out or map to the new Product type)

// export interface ProductPosition { ... }
// export interface ProductWithPosition extends Product { ... }
// export interface AddProductFormData { ... }

