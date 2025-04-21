
export type DiscountType = 'percentage' | 'fixed';

export interface Discount {
    id: number;
    productId: number;
    name: string;
    type: DiscountType;
    value: number; // Percentage (0-100) or fixed amount
    startDate: Date;
    endDate: Date | null; // null means no end date
    isActive: boolean;
    createdAt: Date;
}

export interface DiscountFormValues {
    name: string;
    type: DiscountType;
    value: number;
    startDate: Date | string;
    endDate: Date | string | null;
}