import type { 
  ShelfPositionCreate, 
  ShelfPositionDetail, 
  ShelfPositionProductAssign, 
  ShelfPositionLog,
  PaginatedResponse
} from "@/lib/types/shelf";
import api from "./api";

/**
 * Create a new shelf position
 */
export async function createShelfPosition(
  shelfId: number, 
  payload: ShelfPositionCreate
): Promise<ShelfPositionDetail | undefined> {
  try {
    const { data } = await api.post(`/shelf/${shelfId}/shelf-position`, payload);
    return data;
  } catch (err: any) {
    console.error("Failed to create shelf position:", err);
    throw new Error(err.message || "Nepodařilo se vytvořit pozici regálu");
  }
}

/**
 * Get shelf position detail by ID or tag
 */
export async function getShelfPositionDetail(
  shelfId: number, 
  positionIdOrTag: number | string
): Promise<ShelfPositionDetail | undefined> {
  try {
    const { data } = await api.get(`/shelf/${shelfId}/shelf-position/${positionIdOrTag}`);
    return data;
  } catch (err: any) {
    console.error(`Failed to fetch shelf position detail:`, err);
    throw new Error(err.message || "Nepodařilo se načíst detail pozice regálu");
  }
}

/**
 * Update a shelf position
 */
export async function updateShelfPosition(
  shelfId: number, 
  positionIdOrTag: number | string, 
  payload: ShelfPositionCreate
): Promise<ShelfPositionDetail> {
  try {
    const { data } = await api.put(`/shelf/${shelfId}/shelf-position/${positionIdOrTag}`, payload);
    return data;
  } catch (err: any) {
    console.error("Failed to update shelf position:", err);
    throw new Error(err.message || "Nepodařilo se aktualizovat pozici regálu");
  }
}

/**
 * Delete a shelf position
 */
export async function deleteShelfPosition(
  shelfId: number, 
  positionIdOrTag: number | string
): Promise<void> {
  try {
    await api.delete(`/shelf/${shelfId}/shelf-position/${positionIdOrTag}`);
  } catch (err: any) {
    console.error("Failed to delete shelf position:", err);
    throw new Error(err.message || "Nepodařilo se odstranit pozici regálu");
  }
}

/**
 * Assign product to a shelf position
 */
export async function assignProductToShelfPosition(
  shelfId: number, 
  positionIdOrTag: number | string, 
  payload: ShelfPositionProductAssign
): Promise<ShelfPositionDetail> {
  try {
    const { data } = await api.patch(`/shelf/${shelfId}/shelf-position/${positionIdOrTag}/product`, payload);
    return data;
  } catch (err: any) {
    console.error("Failed to assign product to shelf position:", err);
    throw new Error(err.message || "Nepodařilo se přiřadit produkt k pozici regálu");
  }
}

/**
 * Get position logs
 */
export async function getShelfPositionLogs(
  shelfId: number, 
  positionIdOrTag: number | string,
  page: number = 1,
  limit: number = 10
): Promise<PaginatedResponse<ShelfPositionLog>> {
  try {
    const { data } = await api.get(`/shelf/${shelfId}/shelf-position/${positionIdOrTag}/log`, {
      params: { page, limit }
    });
    return data;
  } catch (err: any) {
    console.error("Failed to fetch shelf position logs:", err);
    throw new Error(err.message || "Nepodařilo se načíst historii pozice regálu");
  }
}
