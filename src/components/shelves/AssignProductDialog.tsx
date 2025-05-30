import { useState, useEffect } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { ShelfPosition } from "@/lib/types/shelf";
import { Product } from "@/lib/types/product";
import { Loader2 } from "lucide-react";

import { 
  assignProductToPosition, 
  removeProductFromPosition, 
  getAvailableProducts 
} from "@/api/productMappingApi";
import { getShelfPositionDetail } from "@/api/shelfPositionApi";
import { useUserStore } from "@/lib/stores/userStore";
import { useOrganizationStore } from "@/lib/stores/organizationsStore";

// Schéma pro validaci formuláře
const assignProductSchema = z.object({
  product_id: z.number({
    required_error: "Vyberte produkt",
    invalid_type_error: "Vyberte platný produkt",
  }).nullable(),
  max_current_product_capacity: z.coerce.number({
    invalid_type_error: "Kapacita musí být číslo",
  }).positive("Kapacita musí být kladné číslo").nullable().or(z.literal('')),
  low_stock_threshold_percent: z.coerce.number({
    required_error: "Zadejte limit docházejících zásob",
    invalid_type_error: "Limit docházejících zásob musí být číslo",
  }).min(0, "Limit musí být mezi 0 a 100").max(100, "Limit musí být mezi 0 a 100"),
  display_code: z.string().optional(),
});

type AssignProductFormValues = z.infer<typeof assignProductSchema>;

interface AssignProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shelfId: number;
  position: ShelfPosition;
  onSuccess?: () => void;
}

export function AssignProductDialog({
  open,
  onOpenChange,
  shelfId,
  position,
  onSuccess
}: AssignProductDialogProps) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [isRemovingProduct, setIsRemovingProduct] = useState<boolean>(false);

  // Inicializace formuláře
  const { register, handleSubmit, formState: { errors }, setValue, watch, reset } = useForm<AssignProductFormValues>({
    resolver: zodResolver(assignProductSchema),
    defaultValues: {
      product_id: position.product?.id || null,
      max_current_product_capacity: position.max_current_product_capacity || null,
      low_stock_threshold_percent: 20, // Výchozí hodnota
      display_code: ""
    }
  });

  // Sledujeme vybraný produkt
  const selectedProductId = watch("product_id");

  // Při otevření dialogu načteme produkty a nastavíme výchozí hodnoty
  useEffect(() => {
    if (open) {
      loadProducts();
      
      // Nastavíme výchozí hodnoty podle vybrané pozice
      setValue("product_id", position.product?.id || null);
      setValue("max_current_product_capacity", position.max_current_product_capacity || null);
      setValue("low_stock_threshold_percent", position.is_low_stock !== null ? 20 : 20); // Placeholder, backend to nevrací
    }
  }, [open, position, setValue]);

  // Přístup k datům uživatele a organizace
  const currentUser = useUserStore(state => state.currentUser);
  const { selectedOrganizationId } = useOrganizationStore();

  // Získání ID organizace podle role uživatele
  const getOrganizationId = (): number | null => {
    if (!currentUser) return null;
    
    // Systémový administrátor nepotřebuje organizaci
    if (currentUser.role === 'sys_admin') {
      // Pokud je vybrána nějaká organizace, použijeme ji
      if (selectedOrganizationId) {
        return Number(selectedOrganizationId);
      }
      // V opačném případě může sys_admin přistupovat ke všem datům
      return 0; // Znamená všechny organizace
    }
    
    // Pokud je uživatel správce organizace a má vybranou organizaci
    if (currentUser.role === 'org_admin' && selectedOrganizationId) {
      return Number(selectedOrganizationId);
    }
    
    // Pokud je uživatel člen organizace
    if ((currentUser.role === 'org_admin' || currentUser.role === 'org_user') && 
        currentUser.organization?.id) {
      return currentUser.organization.id;
    }
    
    return null;
  };

  // Načtení dostupných produktů
  const loadProducts = async () => {
    try {
      let orgId = getOrganizationId();
      
      // Pro sys_admina bez vybrané organizace použijeme organizaci regálu
      if (orgId === null && currentUser?.role === 'sys_admin') {
        try {
          // Načtení detailů pozice regálu, abychom zjistili jeho organizaci
          const shelfPositionDetails = await getShelfPositionDetail(shelfId, position.id);
          if (shelfPositionDetails?.shelf?.organization?.id) {
            orgId = shelfPositionDetails.shelf.organization.id;
            console.log(`[AssignProductDialog] Sys_admin bez vybrané organizace - používám organizaci regálu: ${orgId}`);
          } else {
            console.warn('[AssignProductDialog] Nepodařilo se získat organizaci regálu');
          }
        } catch (error) {
          console.error('[AssignProductDialog] Chyba při získávání detailů pozice:', error);
        }
      }
      
      // Pro ostatní role musí být organizace určena
      if (orgId === null && currentUser?.role !== 'sys_admin') {
        toast.error("Nelze načíst produkty: Chybí ID organizace");
        return;
      }
      
      // Načtení produktů pro zvolenou organizaci
      // Pokud je orgId stále null, použijeme 0 (všechny organizace), ale to by se mělo stát jen výjimečně
      const fetchedProducts = await getAvailableProducts(orgId || 0);
      setProducts(fetchedProducts);
      console.log(`Načteno ${fetchedProducts.length} produktů${orgId ? ` pro organizaci ${orgId}` : ''}`);
    } catch (error: any) {
      console.error('Chyba při načítání produktů:', error);
      toast.error(`Chyba při načítání produktů: ${error.message}`);
    }
  };

  // Zpracování odeslání formuláře
  const onSubmit = async (data: AssignProductFormValues) => {
    setIsLoading(true);
    try {
      console.log('Form data before processing:', data);
      
      // Přesná konverze dat pro backend podle dokumentace
      // 1. product_id musí být číslo nebo null
      const productId = data.product_id === undefined || data.product_id === null 
        ? null 
        : Number(data.product_id);
      
      // 2. max_current_product_capacity musí být null nebo alespoň 1
      let maxCapacity = null;
      if (data.max_current_product_capacity !== "" && 
          data.max_current_product_capacity !== undefined && 
          data.max_current_product_capacity !== null) {
        const numValue = Number(data.max_current_product_capacity);
        if (!isNaN(numValue)) {
          maxCapacity = Math.max(1, numValue); // Zajistíme minimální hodnotu 1
        }
      }
      
      // 3. low_stock_threshold_percent musí být mezi 0-100 (exkluzivně)
      const lowStockThreshold = data.low_stock_threshold_percent === undefined || 
                              data.low_stock_threshold_percent === null || 
                              isNaN(Number(data.low_stock_threshold_percent))
        ? 20 // Výchozí hodnota
        : Math.min(Math.max(1, Number(data.low_stock_threshold_percent)), 99);
      
      // Vytvoříme data pro přiřazení produktu
      const assignData = {
        product_id: productId,
        max_current_product_capacity: maxCapacity,
        low_stock_threshold_percent: lowStockThreshold
      };

      // Kontrola organizace - načtení detailů pozice regálu
      const shelfPositionDetails = await getShelfPositionDetail(shelfId, position.id);
      if (!shelfPositionDetails) {
        toast.error("Nepodařilo se načíst detaily pozice regálu.");
        setIsLoading(false);
        return;
      }

      // Získání aktuálního stavu
    const { currentUser } = useUserStore.getState();

      // Pro sys_admina nekontrolujeme organizaci, může přiřazovat produkty ke všem regálům
      // Pro ostatní role musíme ověřit, že organizace regálu odpovídá organizaci uživatele
      if (currentUser?.role !== 'sys_admin') {
        const userOrgId = currentUser?.organization?.id;
        const shelfOrgId = shelfPositionDetails.shelf.organization?.id;
        
        // Kontrola, zda regál patří do organizace uživatele
        if (userOrgId !== shelfOrgId) {
          toast.error("Nemáte oprávnění upravovat pozice tohoto regálu.");
          setIsLoading(false);
          return;
        }
      }
      
      console.log('[AssignProductDialog] PŘED VOLÁNÍM API:', { 
        shelfId,
        positionId: position.id,
        assignData,
        displayCode: data.display_code || undefined,
        currentStockPercent: position.current_stock_percent
      }); 

      // Voláme API pro přiřazení produktu s volitelným display_code a zachováním aktuálního stavu zásob
      const result = await assignProductToPosition(
        shelfId, 
        position.id, 
        assignData, 
        data.display_code || undefined,
        position.current_stock_percent // Předáváme aktuální hodnotu z ultrazvukových senzorů
      );
      
      console.log('Odpověď z API:', result);
      toast.success("Produkt byl úspěšně přiřazen k pozici");
      
      // Reset formuláře a zavření dialogu
      reset();
      onOpenChange(false);
      
      // Callback pro aktualizaci rodičovské komponenty
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      console.error('Chyba při přiřazování produktu:', error);
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
        console.error('Response headers:', error.response.headers);
      }
      toast.error(`Chyba při přiřazování produktu: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Odstranění produktu z pozice
  const handleRemoveProduct = async () => {
    setIsRemovingProduct(true);
    try {
      console.log('Removing product from position:', shelfId, position.id);
      await removeProductFromPosition(shelfId, position.id);
      
      toast.success("Produkt byl úspěšně odebrán z pozice");
      
      // Reset formuláře a zavření dialogu
      reset();
      onOpenChange(false);
      
      // Callback pro aktualizaci rodičovské komponenty
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      console.error('Error removing product:', error);
      toast.error(`Chyba při odebírání produktu: ${error.message}`);
    } finally {
      setIsRemovingProduct(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Přiřadit produkt k pozici</DialogTitle>
          <DialogDescription>
            Pozice [{position.row}, {position.column}]
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="product_id">Produkt</Label>
            <Select
              onValueChange={(value) => setValue("product_id", value === "none" ? null : Number(value))}
              defaultValue={position.product?.id ? String(position.product.id) : "none"}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Vyberte produkt" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Žádný produkt</SelectItem>
                {products.map((product) => (
                  <SelectItem key={product.id} value={String(product.id)}>
                    {product.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.product_id && <p className="text-sm text-destructive">{errors.product_id.message}</p>}
          </div>
          
          {selectedProductId && (
            <>
              <div className="space-y-2">
                <Label htmlFor="max_current_product_capacity">
                  Maximální kapacita
                  <span className="text-muted-foreground text-xs ml-1">(volitelné)</span>
                </Label>
                <Input
                  {...register("max_current_product_capacity")}
                  type="number"
                  id="max_current_product_capacity"
                  placeholder="Zadejte maximální kapacitu"
                  disabled={isLoading}
                />
                {errors.max_current_product_capacity && (
                  <p className="text-sm text-destructive">{errors.max_current_product_capacity.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="low_stock_threshold_percent">
                  Limit docházející zásoby (%)
                </Label>
                <Input
                  {...register("low_stock_threshold_percent")}
                  type="number"
                  id="low_stock_threshold_percent"
                  placeholder="Např. 20%"
                  min={0}
                  max={100}
                  disabled={isLoading}
                />
                {errors.low_stock_threshold_percent && (
                  <p className="text-sm text-destructive">{errors.low_stock_threshold_percent.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="display_code">
                  Kód pro E-ink displej
                  <span className="text-muted-foreground text-xs ml-1">(volitelné)</span>
                </Label>
                <Input
                  {...register("display_code")}
                  type="text"
                  id="display_code"
                  placeholder="Např. PROD123"
                  disabled={isLoading}
                />
                {errors.display_code && (
                  <p className="text-sm text-destructive">{errors.display_code.message}</p>
                )}
              </div>
            </>
          )}
          
          <DialogFooter className="flex flex-col sm:flex-row gap-2 mt-4">
            {position.product && (
              <Button
                type="button"
                variant="destructive"
                onClick={handleRemoveProduct}
                disabled={isLoading || isRemovingProduct}
                className="sm:mr-auto"
              >
                {isRemovingProduct ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Odebírám...</>
                ) : (
                  "Odebrat produkt"
                )}
              </Button>
            )}
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Zrušit
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Ukládám...</>
              ) : (
                "Uložit"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
