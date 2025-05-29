import type { Shelf, ShelfCreate, ShelfDetail, PaginatedResponse } from "@/lib/types/shelf";
import api from "./api";
import { AxiosError } from 'axios';

/**
 * Fetch all shelves with optional filters
 */
export async function fetchShelves(options?: { organization_id?: number, includeUnassigned?: boolean }): Promise<PaginatedResponse<Shelf> | undefined> {
  try {
    // V novém přístupu umožňujeme načítat všechny regály (bez filtru), regály konkrétní organizace,
    // nebo explicitně nepřiřazené regály (includeUnassigned=true)
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
      } else if (typeof responseData === 'string' && responseData.trim() !== '') {
        // If responseData is a simple string (e.g., HTML error page), avoid using it directly if too long.
        // For now, we'll let it fall through to err.message or default.
        // A more sophisticated approach might try to parse a title or summary.
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
    // Pokud vytváříme nepřiřazený regál, můžeme nastavit organization_id na null
    // Dodáváme payload přímo, může obsahovat organization_id jako null nebo konkrétní ID
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
  // Výchozí stav - prázdný objekt pro filtrování
  const filterOptions: { organization_id?: number, includeUnassigned?: boolean } = {};
  
  // Pro sys_admin uživatele
  if (user?.role === 'sys_admin') {
    // Pokud je vybrána organizace, přidáme filtr na ni
    if (selectedOrganizationId) {
      filterOptions.organization_id = Number(selectedOrganizationId);
    }
    
    // Pokud je nastaven příznak pro zobrazení nepřiřazených regálů
    if (showUnassigned) {
      filterOptions.includeUnassigned = true;
      // Odstraníme organization_id, pokud chceme výhradně nepřiřazené regály
      delete filterOptions.organization_id;
    }
    
    // Pokud nejsou nastavené žádné filtry, získáme všechny regály (pro sys_admin)
    return filterOptions;
  }
  
  // Pro org_admin nebo org_user vždy filtrujeme podle jejich organizace
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
