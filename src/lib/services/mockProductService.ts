import { toast } from 'sonner';
// Import the mock data array and ID generator
import { mockProductDatabase, getNextMockId } from '../data/mockProductData';
// Import all relevant types from the types file
import type { 
    Product, 
    MockCreateProductDTO, 
    MockUpdateProductDTO,
    // BackendProductResponse, // Keep for reference if needed
    // BackendSaveProductData  // Keep for reference if needed
} from '../types/product';
// Import the log store
import { useProductLogStore } from '@/lib/stores/productLogStore'; 
import { formatCurrency } from "@/lib/utils/format"; // For formatting price changes

const delay = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms));

// Use 'let' so the service can modify the imported array reference if needed (e.g., for hard delete)
let productDB = mockProductDatabase;

// Helper function to generate change summary
function generateChangeSummary(oldProduct: Product, newProduct: Product): string {
    const changes: string[] = [];
    const fieldLabels: Record<string, string> = {
        name: "Název",
        price: "Cena",
        quantity: "Množství",
        low_stock_threshold: "Limit nízkého stavu",
        position_type: "Typ pozice",
        shelf_id: "Regál ID",
        row: "Řádek",
        column: "Sloupec",
        is_deleted: "Stav smazání",
        // Add other fields as needed
    };

    // Compare top-level fields (excluding shelf_position object itself)
    for (const key in newProduct) {
        if (key === 'id' || key === 'shelf_position' || key === 'organization_id') continue; // Skip ID, org_id and handle shelf_position separately

        const oldValue = (oldProduct as any)[key];
        const newValue = (newProduct as any)[key];

        if (oldValue !== newValue) {
            const label = fieldLabels[key] || key;
            let oldStr = oldValue ?? '-';
            let newStr = newValue ?? '-';

            if (key === 'price') {
                oldStr = formatCurrency(oldValue);
                newStr = formatCurrency(newValue);
            } else if (key === 'quantity' || key === 'low_stock_threshold') {
                oldStr = `${oldValue ?? '-'}%`;
                newStr = `${newValue ?? '-'}%`;
            } else if (key === 'is_deleted') {
                 oldStr = oldValue ? 'Smazáno' : 'Aktivní';
                 newStr = newValue ? 'Smazáno' : 'Aktivní';
            }

            changes.push(`${label}: ${oldStr} → ${newStr}`);
        }
    }

    // Compare shelf_position fields
    const oldPos = oldProduct.shelf_position;
    const newPos = newProduct.shelf_position;

    if (JSON.stringify(oldPos) !== JSON.stringify(newPos)) { // Simple object comparison
        if (!oldPos && newPos) {
             changes.push(`Pozice: Nezadáno → Regál ${newPos.shelf_id}, Ř ${newPos.row}, S ${newPos.column}`);
        } else if (oldPos && !newPos) {
             changes.push(`Pozice: Regál ${oldPos.shelf_id}, Ř ${oldPos.row}, S ${oldPos.column} → Nezadáno`);
        } else if (oldPos && newPos) {
            for (const key in newPos) {
                 const posKey = key as keyof typeof newPos;
                 if (oldPos[posKey] !== newPos[posKey]) {
                     const label = fieldLabels[posKey] || posKey;
                     changes.push(`${label}: ${oldPos[posKey] ?? '-'} → ${newPos[posKey] ?? '-'}`);
                 }
            }
        }
    }

    return changes.length > 0 ? changes.join(', ') : 'Žádné změny';
}

export const mockProductService = {

  /**
   * Fetches products, optionally including soft-deleted ones.
   * Returns copies of the products.
   */
  async getProducts(includeDeleted = false): Promise<Product[]> {
    await delay(300); 
    console.log("Mock Service: Getting products", { includeDeleted });
    const products = includeDeleted ? productDB : productDB.filter(p => !p.is_deleted);
    return products.map(p => ({...p})); // Return copies to prevent direct mutation
  },

  /**
   * Fetches a single product by ID.
   * Returns a copy, including soft-deleted products.
   */
  async getProductById(id: number): Promise<Product | undefined> {
    await delay(150); 
    console.log(`Mock Service: Getting product by ID: ${id}`);
    const product = productDB.find(p => p.id === id);
    return product ? { ...product } : undefined; // Return a copy
  },

  /**
   * Creates a new product with all provided mock fields.
   * Handles basic name duplication check.
   * Returns a copy of the created product.
   */
  async createProduct(data: MockCreateProductDTO): Promise<Product> {
    await delay(400);
    console.log("Mock Service: Creating product", data);
    
    if (productDB.some(p => p.name === data.name && !p.is_deleted)) {
      toast.error(`Produkt s názvem "${data.name}" již existuje.`);
      throw new Error('Product with this name already exists');
    }
    
    const newProduct: Product = {
      id: getNextMockId(),
      is_deleted: false,
      ...data, 
      name: data.name, 
      price: data.price,
      organization_id: data.organization_id,
      position_type: data.position_type ?? 'manual', 
      discountPercentage: data.discountPercentage ?? 0,
    };
    
    productDB.push(newProduct);
    // Log the creation
    const createdProductCopy = { ...newProduct };
    useProductLogStore.getState().addLog('add', createdProductCopy, `Produkt "${createdProductCopy.name}" vytvořen.`);
    return createdProductCopy; 
  },

  /**
   * Updates an existing product.
   * Allows updating all fields defined in MockUpdateProductDTO.
   * Handles name duplication check.
   * Returns a copy of the updated product.
   */
  async updateProduct(id: number, data: MockUpdateProductDTO): Promise<Product> {
    await delay(400);
    console.log(`Mock Service: Updating product ${id}`, data);
    const productIndex = productDB.findIndex(p => p.id === id);
    if (productIndex === -1) {
        toast.error('Produkt nenalezen pro úpravu.');
        throw new Error('Product not found');
    }

    const currentProduct = productDB[productIndex];
    // *** Keep a copy before updating ***
    const oldProductCopy = { ...currentProduct, shelf_position: currentProduct.shelf_position ? { ...currentProduct.shelf_position } : undefined }; 

    if (data.name && data.name !== currentProduct.name && productDB.some(p => p.id !== id && p.name === data.name && !p.is_deleted)) {
      toast.error(`Produkt s názvem "${data.name}" již existuje.`);
      throw new Error('Product with this name already exists');
    }

    // Create the updated product data
    const updatedProduct: Product = { 
        ...currentProduct, 
        ...data,
        // Deep merge shelf_position if it exists in the update data
        shelf_position: data.shelf_position !== undefined ? 
            { ...(currentProduct.shelf_position || {}), ...data.shelf_position } as Product['shelf_position'] 
            : currentProduct.shelf_position,
    };

    productDB[productIndex] = updatedProduct;
    
    // *** Generate change summary ***
    const changeSummary = generateChangeSummary(oldProductCopy, updatedProduct);
    
    // Log the update with detailed summary
    const updatedProductCopyForLog = { ...updatedProduct };
    useProductLogStore.getState().addLog('update', updatedProductCopyForLog, changeSummary);
    
    return { ...updatedProduct }; // Return a copy
  },

  /**
   * Soft-deletes a product by setting is_deleted = true.
   * Returns a copy of the soft-deleted product.
   */
  async deleteProduct(id: number): Promise<Product> {
    await delay(300);
    console.log(`Mock Service: Soft deleting product ${id}`);
    const productIndex = productDB.findIndex(p => p.id === id);
    if (productIndex === -1) {
        toast.error('Produkt nenalezen pro smazání.');
        throw new Error('Product not found');
    }
    if (productDB[productIndex].is_deleted) {
        toast.warning('Produkt je již smazán.')
        return { ...productDB[productIndex] }; 
    }

    const productToDelete = { ...productDB[productIndex] }; // Get copy before modifying
    productDB[productIndex].is_deleted = true;
    // Log the deletion
    useProductLogStore.getState().addLog('delete', productToDelete, `Produkt "${productToDelete.name}" smazán.`);
    return productToDelete; 
  },
  
  /**
   * Restores a soft-deleted product by setting is_deleted = false.
   * Returns a copy of the restored product.
   */
   async restoreProduct(id: number): Promise<Product> {
    await delay(300);
    console.log(`Mock Service: Restoring product ${id}`);
    const productIndex = productDB.findIndex(p => p.id === id);
    if (productIndex === -1) {
        toast.error('Produkt nenalezen pro obnovení.');
        throw new Error('Product not found');
    }
     if (!productDB[productIndex].is_deleted) {
        toast.warning('Produkt není smazán.')
        return { ...productDB[productIndex] }; 
    }
    
    productDB[productIndex].is_deleted = false;
    const restoredProduct = { ...productDB[productIndex] }; // Get copy after modifying
    // Log the restoration
    useProductLogStore.getState().addLog('update', restoredProduct, `Produkt "${restoredProduct.name}" obnoven.`);
    return restoredProduct; 
  },
}; 