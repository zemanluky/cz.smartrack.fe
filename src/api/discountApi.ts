import api from './api';
import type { DiscountData, PaginatedDiscountsResponse, ProductDiscount } from '@/lib/types/discount';

// Získání slev pro produkt
export async function fetchProductDiscounts(
  productId: number,
  params: { page?: number; limit?: number; active?: boolean } = {}
): Promise<PaginatedDiscountsResponse | undefined> {
  try {
    const { data } = await api.get(`/product/${productId}/discount`, { params });
    return data;
  } catch (err: any) {
    console.error(`Failed to fetch discounts for product ${productId}:`, err);
    throw new Error(err.response?.data?.message || 'Nepodařilo se načíst slevy produktu');
  }
}

// Získání detailu konkrétní slevy
export async function fetchProductDiscount(
  productId: number,
  discountId: number
): Promise<ProductDiscount | undefined> {
  try {
    const { data } = await api.get(`/product/${productId}/discount/${discountId}`);
    return data;
  } catch (err: any) {
    console.error(`Failed to fetch discount ${discountId}:`, err);
    throw new Error(err.response?.data?.message || 'Nepodařilo se načíst detail slevy');
  }
}

// Vytvoření slevy pro produkt
export async function createProductDiscount(
  productId: number,
  discountData: DiscountData
): Promise<ProductDiscount | undefined> {
  try {
    // Zajištění, že datum je ve správném formátu nebo null
    const formattedData = {
      ...discountData,
      // valid_from a valid_until mohou být null podle Swaggeru
      valid_from: discountData.valid_from ? discountData.valid_from : null,
      valid_until: discountData.valid_until ? discountData.valid_until : null
    };
    
    const { data } = await api.post(`/product/${productId}/discount`, formattedData);
    return data;
  } catch (err: any) {
    console.error(`Failed to create discount for product ${productId}:`, err);
    throw new Error(err.response?.data?.message || 'Nepodařilo se vytvořit slevu');
  }
}

// Aktualizace slevy
export async function updateProductDiscount(
  productId: number,
  discountId: number,
  discountData: DiscountData
): Promise<ProductDiscount | undefined> {
  try {
    const { data } = await api.put(`/product/${productId}/discount/${discountId}`, discountData);
    return data;
  } catch (err: any) {
    console.error(`Failed to update discount ${discountId}:`, err);
    throw new Error(err.response?.data?.message || 'Nepodařilo se aktualizovat slevu');
  }
}

// Aktivace/deaktivace slevy
export async function toggleDiscount(
  productId: number,
  discountId: number
): Promise<ProductDiscount | undefined> {
  try {
    const { data } = await api.patch(`/product/${productId}/discount/${discountId}/toggle`);
    return data;
  } catch (err: any) {
    console.error(`Failed to toggle discount ${discountId}:`, err);
    throw new Error(err.response?.data?.message || 'Nepodařilo se změnit stav slevy');
  }
}

// Smazání slevy
export async function deleteProductDiscount(
  productId: number,
  discountId: number
): Promise<void> {
  try {
    await api.delete(`/product/${productId}/discount/${discountId}`);
  } catch (err: any) {
    console.error(`Failed to delete discount ${discountId}:`, err);
    throw new Error(err.response?.data?.message || 'Nepodařilo se smazat slevu');
  }
}
