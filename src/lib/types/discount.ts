import { Product } from './product';

export interface ProductDiscount {
  id: number;
  product_id: number;
  new_price: number;
  discount_percent: number;
  valid_from: Date;
  valid_until: Date;
  active: boolean;
  currently_valid: boolean;
  product?: Product;
}

export interface DiscountData {
  new_price?: number;
  discount_percent?: number;
  valid_from: Date | null;
  valid_until: Date | null;
  active: boolean;
}

export interface PaginatedDiscountsResponse {
  metadata: {
    total: number;
    page: number;
    limit: number;
  };
  items: ProductDiscount[];
}
