import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { createShelfPosition } from "@/api/shelfPositionApi";
import { useShelvesStore } from "@/lib/stores/shelvesStore";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Product } from "@/lib/types/product";
import { fetchProducts, getFetchProductsOrgId } from "@/api/productApi";
import { useUserStore } from "@/lib/stores/userStore";
import { useOrganizationStore } from "@/lib/stores/organizationsStore";

const FormSchema = z.object({
  row: z.coerce.number().int().min(1, "Řádek musí být minimálně 1"),
  column: z.coerce.number().int().min(1, "Sloupec musí být minimálně 1"),
  product_id: z.union([
    z.string().transform((val) => (val ? Number(val) : null)),
    z.null(),
  ]),
  low_stock_threshold_percent: z.coerce.number().min(1).max(99),
  max_current_product_capacity: z.union([
    z.coerce.number().int().min(1),
    z.null(),
  ]),
});

type FormValues = z.infer<typeof FormSchema>;

interface AddShelfPositionDialogProps {
  shelfId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AddShelfPositionDialog = ({
  shelfId,
  open,
  onOpenChange,
}: AddShelfPositionDialogProps) => {
  const { fetchShelfById } = useShelvesStore();
  const [products, setProducts] = useState<Product[]>([]);
  const currentUser = useUserStore((state) => state.currentUser);
  const { selectedOrganizationId } = useOrganizationStore();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      row: 1,
      column: 1,
      product_id: null,
      low_stock_threshold_percent: 20,
      max_current_product_capacity: null,
    },
  });

  useEffect(() => {
    const loadProducts = async () => {
      if (currentUser) {
        try {
          const orgId = getFetchProductsOrgId(currentUser, selectedOrganizationId);
          const fetchedProducts = await fetchProducts(orgId);
          if (fetchedProducts) {
            setProducts(fetchedProducts);
          }
        } catch (error) {
          console.error("Chyba při načítání produktů:", error);
        }
      }
    };

    if (open) {
      loadProducts();
    }
  }, [open, currentUser, selectedOrganizationId]);

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    try {
      await createShelfPosition(shelfId, {
        row: data.row,
        column: data.column,
        product_id: data.product_id,
        low_stock_threshold_percent: data.low_stock_threshold_percent,
        max_current_product_capacity: data.max_current_product_capacity,
      });

      // Aktualizace detailu regálu pro zobrazení nové pozice
      await fetchShelfById(shelfId);
      
      form.reset();
      onOpenChange(false);
      toast.success("Pozice regálu byla úspěšně vytvořena");
    } catch (error: any) {
      toast.error(error.message || "Nepodařilo se vytvořit pozici regálu");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Přidat novou pozici regálu</DialogTitle>
          <DialogDescription>
            Vyplňte údaje pro novou pozici. Souřadnice definují umístění pozice v mřížce regálu.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="row"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Řádek</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="column"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sloupec</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="product_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Produkt (volitelné)</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value ? field.value.toString() : ""}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Vyberte produkt pro tuto pozici" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="">Žádný produkt</SelectItem>
                      {products.map((product) => (
                        <SelectItem key={product.id} value={product.id.toString()}>
                          {product.name} ({product.price} Kč)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="low_stock_threshold_percent"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Limit nízkého stavu (%)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="1"
                      max="99"
                      placeholder="20"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="max_current_product_capacity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Maximální kapacita položek (volitelné)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="1"
                      placeholder="Počet položek, které se vejdou na tuto pozici"
                      value={field.value === null ? "" : field.value}
                      onChange={(e) => {
                        const value = e.target.value ? parseInt(e.target.value) : null;
                        field.onChange(value);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Zrušit
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Ukládání..." : "Uložit"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
