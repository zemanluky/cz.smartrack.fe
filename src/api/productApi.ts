import type { Product, ProductCreate } from "@/lib/types/product";
import api from "./api";

// All product API calls now use the shared Axios instance `api` for consistent base URL, token, and error handling.
// Fetch all products
export async function fetchProducts(organization_id?: number): Promise<Product[] | undefined> {
  try {
    const params = { ...(organization_id ? { organization_id } : {}), is_deleted: false };
    const { data } = await api.get("/product", { params });
    if (!data.items) throw new Error('Malformed response: missing items');
    return data.items;
  } catch (err: any) {
    if (err.response && typeof err.response.data === 'string' && (err.response.data.startsWith('<!doctype') || err.response.data.startsWith('<html'))) {
      throw new Error('API returned HTML instead of JSON. Check your backend URL and authentication.');
    }
    throw new Error(err.message || 'Failed to fetch products');
  }
}

// Create a product
export async function createProductApi(payload: ProductCreate): Promise<Product | undefined> {
  try {
    const { data } = await api.post("/product", payload);
    return data;
  } catch (err: any) {
    if (err.response && typeof err.response.data === 'string' && (err.response.data.startsWith('<!doctype') || err.response.data.startsWith('<html'))) {
      throw new Error('API returned HTML instead of JSON. Check your backend URL and authentication.');
    }
    return undefined;
  }
}

// Helper for FE to decide org_id param
// Helper for FE to decide org_id param based on new userStore structure
export function getFetchProductsOrgId(user: { role: string; organization?: { id: number } | null }, selectedOrganizationId: string | null): number | undefined {
  if (user?.role === 'sys_admin' && selectedOrganizationId) {
    return Number(selectedOrganizationId);
  }
  if ((user?.role === 'org_admin' || user?.role === 'org_user') && user.organization?.id) {
    return user.organization.id;
  }
  return undefined;
}

// Delete a product
export async function deleteProductApi(id: number): Promise<void> {
  await api.delete(`/product/${id}`);
}

// Update a product
export async function updateProductApi(id: number, payload: ProductCreate): Promise<Product> {
  const { data } = await api.put(`/product/${id}`, payload);
  return data;
}



