import type { JSX } from "react";
import { useEffect, useState } from "react";
import { useProductActions } from "@/hooks/product/useProductActions.ts";

import { useUserStore } from "@/lib/stores/userStore";
import { useRequireOrganization } from "@/hooks/common/useRequireOrganization";
import type { Product } from "@/lib/types/product";
import AddProductDialog from "@/components/products/AddProductDialog";
import ProductTable from "@/components/products/ProductTable";

const ProductsPage = (): JSX.Element => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { fetch, remove } = useProductActions();

  const user = useUserStore((s) => s.currentUser);
  const loadingOrRedirecting = useRequireOrganization({ includeOrgAdmin: false });
  const selectedOrganizationId = user?.organization?.id ? String(user.organization?.id) : undefined;

  useEffect(() => {
    if (!user || loadingOrRedirecting) return;
    setLoading(true);
    fetch()
      .then((result) => setProducts(result ?? []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [user, selectedOrganizationId, fetch, loadingOrRedirecting]);

  if (!user) {
    return <div>Loading user...</div>;
  }

  if (loadingOrRedirecting) {
    return <div>Loading or redirecting...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col items-start gap-3 mb-4 sm:flex-row sm:items-center sm:justify-between sm:gap-0">
        <h1 className="text-2xl font-bold">Products</h1>
        <AddProductDialog onSuccess={async () => {
          setLoading(true);
          try {
            const result = await fetch();
            setProducts(result ?? []);
          } catch (e: any) {
            setError(e.message);
          } finally {
            setLoading(false);
          }
        }} />
      </div>
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <ProductTable
          products={products}
          onSmazat={async (id: number) => {
            setLoading(true);
            setError(null);
            try {
              await remove(id);
              const result = await fetch();
              setProducts(result ?? []);
            } catch (e: any) {
              setError(e.message);
            } finally {
              setLoading(false);
            }
          }}
          onUpravit={async () => {
            setLoading(true);
            setError(null);
            try {
              const result = await fetch();
              setProducts(result ?? []);
            } catch (e: any) {
              setError(e.message);
            } finally {
              setLoading(false);
            }
          }}
        />
      )}
    </div>
  );
};

export default ProductsPage;
