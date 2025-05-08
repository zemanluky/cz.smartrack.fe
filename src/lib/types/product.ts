//lib/types/product.ts

// --- Backend Aligned Types --- 

/**
 * Represents the structure of product data returned by the backend API.
 * Based on cz.smartrack.be/src/model/product.model.ts -> productResponse
 */
// Strictly backend-aligned product types

/**
 * Product entity as returned by backend (productResponse)
 */
export interface Product {
  id: number;
  name: string;
  price: number;
  is_deleted: boolean;
  organization_id?: number;
}

/**
 * Product creation/update payload (saveProductData)
 */
export interface ProductCreate {
  name: string;
  price: number;
  organization_id?: number;
}


// FE-aligned type for product creation (matches backend saveProductData)


