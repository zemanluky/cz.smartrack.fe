import { useUserStore } from "@/lib/stores/userStore.ts";
import { useOrganizationStore } from "@/lib/stores/organizationsStore.ts";
import type { ProductCreate } from "@/lib/types/product.ts";
import { fetchProducts, createProductApi, updateProductApi, deleteProductApi } from "@/api/productApi.ts";
import { toast } from "sonner";

import { useCallback } from "react";

export function useProductActions() {
  const user = useUserStore((s) => s.currentUser);
  const { selectedOrganizationId } = useOrganizationStore();

  // Memoized fetch
  const fetch = useCallback(async () => {
    let orgId: number | undefined = undefined;
    if (user?.role === "sys_admin" && selectedOrganizationId) {
      orgId = Number(selectedOrganizationId);
    } else if ((user?.role === "org_admin" || user?.role === "org_user") && user.organization?.id) {
      orgId = user.organization.id;
    }
    try {
      const products = await fetchProducts(orgId);
      // Extra safety: filter out soft-deleted products, even if backend returns them
      return products?.filter(p => !p.is_deleted);
    } catch (err: any) {
      toast.error("Failed to fetch products: " + (err.message || err));
      return undefined;
    }
  }, [user?.role, user?.organization, selectedOrganizationId]);

  // Memoized create
  const create = useCallback(async (data: ProductCreate) => {
    let payload = { ...data };
    if (user?.role === "sys_admin" && selectedOrganizationId) {
      payload.organization_id = Number(selectedOrganizationId);
    } else if ((user?.role === "org_admin" || user?.role === "org_user") && user.organization?.id) {
      payload.organization_id = user.organization.id;
    } else {
      delete payload.organization_id;
    }
    try {
      const result = await createProductApi(payload);
      toast.success("Product created successfully");
      return result;
    } catch (err: any) {
      toast.error("Failed to create product: " + (err.message || err));
      return undefined;
    }
  }, [user?.role, user?.organization, selectedOrganizationId]);

  // Memoized update
  const update = useCallback(async (id: number, data: ProductCreate) => {
    let payload = { ...data };
    if (user?.role === "sys_admin" && data.organization_id) {
      payload.organization_id = data.organization_id;
    } else if ((user?.role === "org_admin" || user?.role === "org_user") && user.organization?.id) {
      payload.organization_id = user.organization.id;
    } else {
      delete payload.organization_id;
    }
    try {
      const result = await updateProductApi(id, payload);
      toast.success("Product updated successfully");
      return result;
    } catch (err: any) {
      toast.error("Failed to update product: " + (err.message || err));
      return undefined;
    }
  }, [user?.role, user?.organization]);

  // Memoized remove
  const remove = useCallback(async (id: number) => {
    try {
      await deleteProductApi(id);
      toast.success("Product deleted successfully");
      return true;
    } catch (err: any) {
      toast.error("Failed to delete product: " + (err.message || err));
      return false;
    }
  }, []);

  return { fetch, create, update, remove };
}
