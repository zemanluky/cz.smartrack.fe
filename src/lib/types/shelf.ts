// lib/types/shelf.ts

// --- Backend Aligned Types ---

/**
 * Represents a shelf in the system
 * Based on cz.smartrack.be/src/model/shelf.model.ts -> shelfListItemResponse
 */
export interface Shelf {
  id: number;
  shelf_name: string;
  shelf_store_location: string | null;
  shelf_position_count: number;
  organization?: {
    id: number;
    name: string;
    active: boolean;
  };
}

/**
 * Payload for creating or updating a shelf
 * Based on cz.smartrack.be/src/model/shelf.model.ts -> shelfData
 */
export interface ShelfCreate {
  shelf_name: string;
  shelf_store_location: string | null;
  organization_id?: number;
}

/**
 * Represents a position on a shelf
 * Based on cz.smartrack.be/src/model/shelf.model.ts -> shelfPositionItem
 */
export interface ShelfPosition {
  id: number;
  row: number;
  column: number;
  current_stock_percent: number | null;
  estimated_product_amount: number | null;
  max_current_product_capacity: number | null;
  is_low_stock: boolean | null;
  product: {
    id: number;
    name: string;
  } | null;
}

/**
 * Detailed shelf response including positions
 * Based on cz.smartrack.be/src/model/shelf.model.ts -> shelfDetailResponse
 */
export interface ShelfDetail extends Shelf {
  shelf_positions: ShelfPosition[];
}

/**
 * Payload for creating or updating a shelf position
 * Based on cz.smartrack.be/src/model/shelf-position.model.ts -> shelfPositionData
 */
export interface ShelfPositionCreate {
  row: number;
  column: number;
  product_id: number | null;
  low_stock_threshold_percent: number;
  max_current_product_capacity: number | null;
}

/**
 * Payload for assigning a product to a shelf position
 * Based on cz.smartrack.be/src/model/shelf-position.model.ts -> shelfPositionProductData
 */
export interface ShelfPositionProductAssign {
  product_id: number | null;
  low_stock_threshold_percent: number;
  max_current_product_capacity: number | null;
}

/**
 * Log entry for a shelf position
 * Based on cz.smartrack.be/src/model/shelf-position.model.ts -> shelfPositionLogItem
 */
export interface ShelfPositionLog {
  id: number;
  timestamp: string;
  amount_percent: number;
  product: {
    id: number;
    name: string;
  };
}

/**
 * Detailed shelf position response
 * Based on cz.smartrack.be/src/model/shelf-position.model.ts -> shelfPositionResponse
 */
export interface ShelfPositionDetail extends ShelfPosition {
  shelf: Omit<Shelf, 'shelf_position_count'>;
  recent_logs: ShelfPositionLog[];
}

/**
 * Pagination metadata for API responses
 */
export interface PaginationMetadata {
  limit: number;
  page: number;
  current_offset: number;
  has_next_page: boolean;
  total_results: number;
  filtered_total_results: number;
}

/**
 * Paginated response from the API
 */
export interface PaginatedResponse<T> {
  metadata: PaginationMetadata;
  items: T[];
}

/**
 * Options for filtering shelves list
 */
export interface ShelfFilterOptions {
  organization_id?: number; // ID organizace, backend očekává číslo
  unassigned?: boolean; // Zda zobrazit pouze nepřiřazené regály
  // případné další filtry jako search_query, atd.
}
