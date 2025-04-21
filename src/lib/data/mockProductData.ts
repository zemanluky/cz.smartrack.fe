import type { Product } from '../types/product'; // Import the extended frontend Product type

// Use 'let' to allow the array reference to be modified by the mock service
export let mockProductDatabase: Product[] = [
    {
      id: 1,
      organization_id: 1,
      name: 'Laptop Pro X1',
      price: 1250,
      is_deleted: false,
      quantity: 50,
      min_quantity: 10,
      shelf_position: { shelf_id: 1, row: 2, column: 3 },
      position_type: 'manual',
      low_stock_threshold: 15,
      discountPercentage: 10, 
    },
    {
      id: 2,
      organization_id: 1,
      name: 'Wireless Mouse G5',
      price: 28,
      is_deleted: false,
      quantity: 30,
      min_quantity: 50,
      shelf_position: undefined,
      position_type: 'manual',
      low_stock_threshold: 30,
      discountPercentage: 0,
    },
    {
      id: 3,
      organization_id: 1,
      name: 'Mechanical Keyboard K8',
      price: 80,
      is_deleted: false,
      quantity: 100,
      min_quantity: 20,
      shelf_position: { shelf_id: 2, row: 1, column: 5 },
      position_type: 'nfc',
      low_stock_threshold: 25,
      discountPercentage: 5,
    },
     {
      id: 4,
      organization_id: 1,
      name: 'USB-C Hub Mini',
      price: 45,
      is_deleted: true, // Example of a soft-deleted item
      quantity: 0,
      min_quantity: 5,
      shelf_position: { shelf_id: 1, row: 1, column: 1 },
      position_type: 'manual',
      low_stock_threshold: 10,
      discountPercentage: 0,
    },
];

// Helper to get the next ID
export function getNextMockId(): number {
    const maxId = mockProductDatabase.reduce((max, p) => p.id > max ? p.id : max, 0);
    return maxId + 1;
} 