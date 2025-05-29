import type { Shelf, ShelfCreate, ShelfDetail, PaginatedResponse, ShelfPosition, ShelfPositionCreate } from "@/lib/types/shelf";
import api from "./api";
import { AxiosError } from 'axios';

/**
 * Fetch all shelves with optional filters
 */
export async function fetchShelves(options?: { organization_id?: number, includeUnassigned?: boolean }): Promise<PaginatedResponse<Shelf> | undefined> {
  try {
    const params = options || {};
    const { data } = await api.get("/shelf", { params });
    return data;
  } catch (err: any) {
    console.error("Failed to fetch shelves (raw error object):", err);
    let extractedMessage: string | undefined;

    if (err instanceof AxiosError && err.response?.data) {
      const responseData = err.response.data;
      if (typeof responseData.message === 'string' && responseData.message.trim() !== '') {
        extractedMessage = responseData.message;
      } else if (typeof responseData.error === 'string' && responseData.error.trim() !== '') {
        extractedMessage = responseData.error;
      }
    }

    const finalErrorMessage = extractedMessage || (err.message && typeof err.message === 'string' ? err.message : undefined) || "Nepodařilo se načíst regály";
    console.error("Failed to fetch shelves (processed error message to be thrown):", finalErrorMessage);
    throw new Error(finalErrorMessage);
  }
}

/**
 * Fetch shelf by ID
 */
export async function fetchShelfById(id: number): Promise<ShelfDetail | undefined> {
  try {
    const { data } = await api.get(`/shelf/${id}`);
    return data;
  } catch (err: any) {
    console.error(`Failed to fetch shelf with ID ${id}:`, err);
    throw new Error(err.message || "Nepodařilo se načíst detail regálu");
  }
}

/**
 * Create a new shelf
 */
export async function createShelf(payload: ShelfCreate): Promise<ShelfDetail | undefined> {
  try {
    const { data } = await api.post("/shelf", payload);
    return data;
  } catch (err: any) {
    console.error("Failed to create shelf:", err);
    throw new Error(err.message || "Nepodařilo se vytvořit regál");
  }
}

/**
 * Update an existing shelf
 */
export async function updateShelf(id: number, payload: ShelfCreate): Promise<ShelfDetail> {
  try {
    const { data } = await api.put(`/shelf/${id}`, payload);
    return data;
  } catch (err: any) {
    console.error(`Failed to update shelf with ID ${id}:`, err);
    throw new Error(err.message || "Nepodařilo se aktualizovat regál");
  }
}

/**
 * Delete a shelf
 */
export async function deleteShelf(id: number): Promise<void> {
  try {
    await api.delete(`/shelf/${id}`);
  } catch (err: any) {
    console.error(`Failed to delete shelf with ID ${id}:`, err);
    throw new Error(err.message || "Nepodařilo se odstranit regál");
  }
}

/**
 * Helper to get fetch options for shelves based on user role and selected filters
 */
export function getShelvesFilterOptions(
  user: { role: string; organization?: { id: number } | null },
  selectedOrganizationId: string | null,
  showUnassigned: boolean = false
): { organization_id?: number, includeUnassigned?: boolean } {
  const filterOptions: { organization_id?: number, includeUnassigned?: boolean } = {};
  
  if (user?.role === 'sys_admin') {
    if (selectedOrganizationId) {
      filterOptions.organization_id = Number(selectedOrganizationId);
    }
    
    if (showUnassigned) {
      filterOptions.includeUnassigned = true;
      delete filterOptions.organization_id;
    }
    return filterOptions;
  }
  
  if ((user?.role === 'org_admin' || user?.role === 'org_user') && user.organization?.id) {
    filterOptions.organization_id = user.organization.id;
  }
  
  return filterOptions;
}

/**
 * Legacy helper function for backward compatibility
 * @deprecated Use getShelvesFilterOptions instead
 */
export function getFetchShelvesOrgId(
  user: { role: string; organization?: { id: number } | null },
  selectedOrganizationId: string | null
): number | undefined {
  const options = getShelvesFilterOptions(user, selectedOrganizationId);
  return options.organization_id;
}

/**
 * Create a new shelf position
 */
export async function createShelfPositionApi(
  shelfId: number,
  payload: ShelfPositionCreate
): Promise<ShelfPosition | undefined> {
  try {
    const { data } = await api.post(`/shelf/${shelfId}/shelf-position`, payload);
    return data; // API should return the created shelf position data
  } catch (err: any) {
    console.error(`Failed to create shelf position for shelf ID ${shelfId}:`, err);
    const axiosError = err as AxiosError<any>;
    let errorMessage = `Nepodařilo se vytvořit pozici ${payload.row}-${payload.column} pro regál.`;
    if (axiosError.response?.data?.message) {
        errorMessage = axiosError.response.data.message;
    } else if (err.message) {
        errorMessage = err.message;
    }
    throw new Error(errorMessage);
  }
}
