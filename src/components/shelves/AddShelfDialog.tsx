import React, { useState } from "react";
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
  DialogTrigger,
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
import { PlusIcon } from "lucide-react";
import { useShelvesStore } from "@/lib/stores/shelvesStore";
import { useUserStore } from "@/lib/stores/userStore";
import { useOrganizationStore } from "@/lib/stores/organizationsStore";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

// Schema for the form validation
const shelfFormSchema = z.object({
  shelf_name: z.string().min(3, "Název regálu musí mít alespoň 3 znaky"),
  shelf_store_location: z.string().nullable().optional(),
  organization_id: z.number().optional(),
  numRows: z.coerce.number().min(1, "Počet řádků musí být alespoň 1").optional(),
  numCols: z.coerce.number().min(1, "Počet sloupců musí být alespoň 1").optional(),
});

type ShelfFormValues = z.infer<typeof shelfFormSchema>;

export const AddShelfDialog: React.FC = () => {
  const { addShelf, addShelfPosition } = useShelvesStore(); // Předpokládáme, že addShelfPosition existuje nebo ho přidáme
  const { organizations } = useOrganizationStore();
  const currentUser = useUserStore((state) => state.currentUser);
  const [open, setOpen] = useState(false);

  const form = useForm<ShelfFormValues>({
    resolver: zodResolver(shelfFormSchema),
    defaultValues: {
      shelf_name: "",
      shelf_store_location: "",
      organization_id:
        currentUser?.role !== "sys_admin" && currentUser?.organization?.id
          ? currentUser.organization.id
          : undefined,
      numRows: 1,
      numCols: 4,
    },
  });

  const onSubmit = async (data: ShelfFormValues) => {
    try {
      // Použijeme výchozí hodnoty, pokud numRows nebo numCols nejsou definovány (což by nemělo nastat díky defaultValues ve useForm, ale pro jistotu)
      const currentNumRows = data.numRows || 1;
      const currentNumCols = data.numCols || 4;
      const { numRows, numCols, ...shelfBaseData } = data;

      const formattedShelfBaseData = {
        ...shelfBaseData,
        shelf_store_location: shelfBaseData.shelf_store_location || null,
      };

      // 1. Vytvořit regál
      const newShelf = await addShelf(formattedShelfBaseData);

      if (!newShelf || !newShelf.id) {
        toast.error("Nepodařilo se získat ID nového regálu po jeho vytvoření.");
        return;
      }

      // 2. Vytvořit pozice
      const positionPromises = [];
      for (let r = 1; r <= currentNumRows; r++) {
        for (let c = 1; c <= currentNumCols; c++) {
          const positionData = {
            row: r,
            column: c,
            product_id: null,
            max_current_product_capacity: null,
            low_stock_threshold_percent: 20,
          };
          positionPromises.push(addShelfPosition(newShelf.id, positionData));
        }
      }

      await Promise.all(positionPromises);

      toast.success(`Regál "${newShelf.shelf_name}" a jeho ${currentNumRows * currentNumCols} pozic bylo úspěšně vytvořeno.`);
      form.reset();
      setOpen(false);
    } catch (error: any) {
      console.error("Chyba při vytváření regálu nebo pozic:", error);
      toast.error(error.message || "Nepodařilo se přidat regál nebo jeho pozice");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-1">
          <PlusIcon className="h-4 w-4" />
          <span>Přidat regál</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Přidat nový regál</DialogTitle>
          <DialogDescription>
            Vyplňte informace o novém regálu. Klikněte na Uložit, až budete hotovi.
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

            <FormField
              control={form.control}
              name="numRows"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Počet řádků</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="Zadejte počet řádků" {...field} onChange={event => field.onChange(+event.target.value)} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="numCols"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Počet sloupců</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="Zadejte počet sloupců" {...field} onChange={event => field.onChange(+event.target.value)} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Zrušit
              </Button>
              <Button type="submit">Uložit</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
