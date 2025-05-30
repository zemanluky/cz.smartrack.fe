import React, { useEffect, useState } from "react";
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
import { useShelvesStore } from "@/lib/stores/shelvesStore";
import { useUserStore } from "@/lib/stores/userStore";
import { useOrganizationStore } from "@/lib/stores/organizationsStore";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { Shelf, ShelfDetail, ShelfPosition } from "@/lib/types/shelf";

// Schema pro validaci formuláře
const shelfFormSchema = z.object({
  shelf_name: z.string().min(3, "Název regálu musí mít alespoň 3 znaky"),
  shelf_store_location: z.string().nullable().optional(),
  organization_id: z.number().optional(),
});

type ShelfFormValues = z.infer<typeof shelfFormSchema>;

interface EditShelfDialogProps {
  shelf: Shelf | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const EditShelfDialog: React.FC<EditShelfDialogProps> = ({
  shelf,
  open,
  onOpenChange,
}) => {
  const { updateShelf } = useShelvesStore();
  const { organizations } = useOrganizationStore();
  const currentUser = useUserStore((state) => state.currentUser);
  
  // Stav pro kontrolu změny organizace
  const [showOrgChangeAlert, setShowOrgChangeAlert] = useState(false);
  const [pendingFormData, setPendingFormData] = useState<ShelfFormValues | null>(null);
  const [hasProducts, setHasProducts] = useState(false);

  const form = useForm<ShelfFormValues>({
    resolver: zodResolver(shelfFormSchema),
    defaultValues: {
      shelf_name: "",
      shelf_store_location: "",
      organization_id: undefined,
    },
  });

  // Aktualizujeme hodnoty formuláře, když se změní shelf
  useEffect(() => {
    if (shelf) {
      form.reset({
        shelf_name: shelf.shelf_name,
        shelf_store_location: shelf.shelf_store_location || "",
        organization_id: shelf.organization?.id,
      });
    }
  }, [shelf, form]);

  // Pomocná funkce pro kontrolu, zda regál obsahuje nějaké produkty
  const checkShelfForProducts = (shelf: ShelfDetail): boolean => {
    // Zkontrolujeme, zda některá pozice obsahuje produkt
    return shelf.shelf_positions.some((position: ShelfPosition) => position.product !== null);
  };

  // Funkce pro zpracování změny organizace po potvrzení
  const handleConfirmedSubmit = async (data: ShelfFormValues) => {
    if (!shelf) return;
    
    try {
      // Transformace prázdného řetězce na null pro shelf_store_location
      const formattedData = {
        ...data,
        shelf_store_location: data.shelf_store_location || null,
      };

      await updateShelf(shelf.id, formattedData);
      onOpenChange(false);
      toast.success("Regál byl úspěšně upraven");
      
      // Reset stavů
      setPendingFormData(null);
      setShowOrgChangeAlert(false);
      setHasProducts(false);
    } catch (error: any) {
      console.error('Chyba při úpravě regálu:', error);
      toast.error(error.message || "Nepodařilo se upravit regál");
    }
  };

  const onSubmit = async (data: ShelfFormValues) => {
    if (!shelf) {
      toast.error("Nelze upravit regál, protože nebyl nalezen");
      return;
    }

    try {
      // Kontrola změny organizace, pokud se mění organizace
      if (data.organization_id !== shelf.organization?.id) {
        // Získání aktuálního detailu regálu (s pozicemi)
        const shelfDetail = await useShelvesStore.getState().fetchShelfById(shelf.id);
        
        // Pokud se podařilo načíst detail a regál obsahuje produkty, zobrazíme varování
        if (shelfDetail && checkShelfForProducts(shelfDetail)) {
          // Uložíme data formuláře pro pozdější použití
          setPendingFormData(data);
          setHasProducts(true);
          setShowOrgChangeAlert(true);
          return; // Čekáme na potvrzení
        }
      }

      // Pokud nejsou produkty nebo se nemění organizace, pokračujeme přímo
      await handleConfirmedSubmit(data);
    } catch (error: any) {
      console.error('Chyba při kontrole regálu:', error);
      toast.error(error.message || "Nepodařilo se ověřit stav regálu");
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Upravit regál</DialogTitle>
          <DialogDescription>
            Upravte informace o regálu. Klikněte na Uložit, až budete hotovi.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="shelf_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Název regálu</FormLabel>
                  <FormControl>
                    <Input placeholder="Zadejte název regálu" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="shelf_store_location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Umístění (volitelné)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Zadejte umístění regálu"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {currentUser?.role === "sys_admin" && (
              <FormField
                control={form.control}
                name="organization_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Organizace</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(Number(value))}
                      value={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Vyberte organizaci" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {organizations.map((org) => (
                          <SelectItem key={org.id} value={org.id.toString()}>
                            {org.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Zrušit
              </Button>
              <Button type="submit">Uložit</Button>
            </DialogFooter>
          </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Alert Dialog pro potvrzení změny organizace */}
      <AlertDialog open={showOrgChangeAlert} onOpenChange={setShowOrgChangeAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Pozor: Změna organizace regálu</AlertDialogTitle>
            <AlertDialogDescription>
              <p>Tento regál obsahuje zaskladněné produkty. Změna organizace může způsobit nekonzistenci dat mezi regálem a produkty.</p>
              <p className="mt-2 font-medium text-red-600">
                Upozornění: Produkty z původní organizace zůstanou na pozicích! To může způsobit problémy při následné práci s regálem.
              </p>
              <p className="mt-2">Opravdu chcete změnit organizaci regálu?</p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setShowOrgChangeAlert(false);
              setPendingFormData(null);
            }}>Zrušit</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => pendingFormData && handleConfirmedSubmit(pendingFormData)} 
              className="bg-amber-600 hover:bg-amber-700"
            >
              Ano, změnit organizaci
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
