import type { 
  ShelfPositionDetail, 
  ShelfPositionProductAssign 
} from "@/lib/types/shelf";
import type { Product } from "@/lib/types/product";
import api from "./api";
import { fetchProducts } from "./productApi";

/**
 * API pro mapování produktů na pozice regálů
 */

/**
 * Přiřadí produkt k pozici regálu
 * @param shelfId ID regálu
 * @param positionIdOrTag ID nebo tag pozice
 * @param payload Data produktu k přiřazení
 * @param displayCode Kód pro E-ink displej (volitelný) - bude předán ESP zařízení
 */
export async function assignProductToPosition(
  shelfId: number, 
  positionIdOrTag: number | string, 
  payload: ShelfPositionProductAssign,
  displayCode?: string,
  currentStockPercent?: number | null
): Promise<ShelfPositionDetail> {
  console.log('[assignProductToPosition] Called with:', { shelfId, positionIdOrTag, payload, displayCode, currentStockPercent });
  try {
    // Pokud je display_code definován, přidáme ho jako query parametr
    const options = displayCode 
      ? { params: { display_code: displayCode } }
      : undefined;
    
    // Pro diagnostiku si vypíšeme typy hodnot v payloadu
    console.log('Payload types before validation:', {
      'product_id': typeof payload.product_id,
      'product_id value': payload.product_id,
      'low_stock_threshold_percent': typeof payload.low_stock_threshold_percent,
      'low_stock_threshold_percent value': payload.low_stock_threshold_percent,
      'max_current_product_capacity': typeof payload.max_current_product_capacity,
      'max_current_product_capacity value': payload.max_current_product_capacity
    });
    
    // Ověříme a upravi hodnoty podle validace backendu
    const validatedPayload = {
      // Zaručíme, že product_id je číslo nebo null (ne undefined nebo prostý řetězec)
      product_id: payload.product_id === undefined || payload.product_id === null ? null : Number(payload.product_id),
      
      // low_stock_threshold_percent musí být mezi 0-100 (exkluzivně)
      low_stock_threshold_percent: payload.low_stock_threshold_percent === undefined || 
                                  payload.low_stock_threshold_percent === null || 
                                  Number(payload.low_stock_threshold_percent) <= 0 || 
                                  Number(payload.low_stock_threshold_percent) >= 100 
        ? 20 // výchozí hodnota
        : Number(payload.low_stock_threshold_percent),
      
      // max_current_product_capacity musí být minimálně 1, pokud není null
      max_current_product_capacity: payload.max_current_product_capacity === null || 
                                  payload.max_current_product_capacity === undefined ?
        null :
        (Number(payload.max_current_product_capacity) < 1 ? 
          1 : 
          Number(payload.max_current_product_capacity))
    };
    
    // Kontrola, že všechny hodnoty jsou správných typů
    console.log('Validated payload types:', {
      'product_id': typeof validatedPayload.product_id,
      'product_id value': validatedPayload.product_id,
      'low_stock_threshold_percent': typeof validatedPayload.low_stock_threshold_percent,
      'low_stock_threshold_percent value': validatedPayload.low_stock_threshold_percent,
      'max_current_product_capacity': validatedPayload.max_current_product_capacity === null ? 'null' : typeof validatedPayload.max_current_product_capacity,
      'max_current_product_capacity value': validatedPayload.max_current_product_capacity
    });
    
    console.log('Assigning product to position:', {
      shelfId,
      positionIdOrTag,
      originalPayload: payload,
      validatedPayload,
      displayCode,
      options
    });
    
    const apiUrl = `/shelf/${shelfId}/shelf-position/${positionIdOrTag}/product`;
    console.log('[assignProductToPosition] Sending PATCH request to:', apiUrl, 'with payload:', validatedPayload, 'and options:', options);
    // Získáme nejprve aktuální stav pozice, pokud currentStockPercent není poskytnut
    let positionDetail;
    if (currentStockPercent === undefined) {
      try {
        const response = await api.get(`/shelf/${shelfId}/shelf-position/${positionIdOrTag}`);
        positionDetail = response.data;
        console.log('[assignProductToPosition] Retrieved current position data:', positionDetail);
      } catch (error) {
        console.warn('[assignProductToPosition] Failed to get current position data:', error);
      }
    }
    
    // Použijeme aktuální hodnotu current_stock_percent, pokud je k dispozici
    const apiPayload = {
      ...validatedPayload,
      // Zachováme aktuální stav zásob, pokud je k dispozici
      current_stock_percent: currentStockPercent !== undefined ? currentStockPercent : 
                             (positionDetail?.current_stock_percent !== undefined ? 
                              positionDetail.current_stock_percent : null)
    };
    
    console.log('[assignProductToPosition] Final payload with preserved stock status:', apiPayload);
    
    const { data } = await api.patch(
      apiUrl, 
      apiPayload,
      options
    );
    return data;
  } catch (err: any) {
    console.error("Failed to assign product to shelf position:", err);
    
    // Získáme a vypíšeme detailnější informace o chybě
    if (err.response) {
      console.error("Response data:", err.response.data);
      console.error("Response status:", err.response.status);
      
      // Detailnější výpis obsahu chyby
      if (err.response.data) {
        if (err.response.data.error && typeof err.response.data.error === 'object') {
          console.error("Detailed error (from err.response.data.error object):", JSON.stringify(err.response.data.error, null, 2));
          if (err.response.data.error.message) {
            throw new Error(err.response.data.error.message);
          }
        } else if (typeof err.response.data.message === 'string') {
          console.error("Detailed error (from err.response.data.message string):", err.response.data.message);
          throw new Error(err.response.data.message);
        } else if (typeof err.response.data.error === 'string') { // Další běžný případ
          console.error("Detailed error (from err.response.data.error string):", err.response.data.error);
          throw new Error(err.response.data.error);
        } else {
          console.error("Error response data (unknown structure):", JSON.stringify(err.response.data, null, 2));
        }
      }
    }
    // Fallback error message
    const finalErrorMessage = err.message || "Nepodařilo se přiřadit produkt k pozici regálu";
    console.error("[assignProductToPosition] Throwing final error:", finalErrorMessage);
    throw new Error(finalErrorMessage);
  }
}

/**
 * Odstraní produkt z pozice regálu
 * @param shelfId ID regálu
 * @param positionIdOrTag ID nebo tag pozice
 */
export async function removeProductFromPosition(
  shelfId: number, 
  positionIdOrTag: number | string
): Promise<ShelfPositionDetail> {
  try {
    console.log(`Removing product from shelf ${shelfId}, position ${positionIdOrTag}`);
    
    // Podle validace backendu, low_stock_threshold_percent musí být mezi 0-100 (exkluzivně)
    // a max_current_product_capacity musí být minimálně 1, pokud není null
    const { data } = await api.patch(
      `/shelf/${shelfId}/shelf-position/${positionIdOrTag}/product`, 
      { 
        product_id: null,
        low_stock_threshold_percent: 20, // default hodnota podle modelu (mezi 0-100)
        max_current_product_capacity: null
      }
    );
    return data;
  } catch (err: any) {
    console.error("Failed to remove product from shelf position:", err);
    
    // Získáme a vypíšeme detailnější informace o chybě
    if (err.response) {
      console.error("Response data:", err.response.data);
      console.error("Response status:", err.response.status);
      
      // Detailnější výpis obsahu chyby
      if (err.response.data && err.response.data.error) {
        console.error("Detailed error:", JSON.stringify(err.response.data.error, null, 2));
        
        // Pokud máme podrobné chybové hlášení, použijeme ho
        if (err.response.data.error.message) {
          throw new Error(err.response.data.error.message);
        }
      }
    }
    
    throw new Error(err.message || "Nepodařilo se odstranit produkt z pozice regálu");
  }
}

/**
 * Načte dostupné produkty pro přiřazení k pozici
 * Využívá existující funkci fetchProducts
 * @param organizationId ID organizace
 */
export async function getAvailableProducts(organizationId: number): Promise<Product[]> {
  try {
    const products = await fetchProducts(organizationId);
    return products || [];
  } catch (err: any) {
    console.error("Failed to fetch available products:", err);
    throw new Error(err.message || "Nepodařilo se načíst dostupné produkty");
  }
}
