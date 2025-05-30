import { useState } from "react";
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

const FormSchema = z.object({
  row: z.coerce.number().int().min(1, "Řádek musí být minimálně 1"),
  column: z.coerce.number().int().min(1, "Sloupec musí být minimálně 1"),
});

type FormInputs = {
  row: number;
  column: number;
};

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
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormInputs>({
    resolver: zodResolver(FormSchema) as any,
    defaultValues: {
      row: 1,
      column: 1,
    },
  });

  const addShelfPosition = useShelvesStore(state => state.addShelfPosition);

  const onSubmit = async (data: FormInputs) => {
    setIsLoading(true);
    try {
      await addShelfPosition(shelfId, {
        row: data.row,
        column: data.column,
        product_id: null,
        low_stock_threshold_percent: 20, // výchozí hodnota
        max_current_product_capacity: null,
      });

      toast.success("Pozice byla úspěšně přidána");
      form.reset();
      onOpenChange(false);
    } catch (error) {
      console.error("Chyba při vytváření pozice:", error);
      toast.error("Při vytváření pozice došlo k chybě");
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
            <div className="md:grid md:grid-cols-2 gap-4 space-y-4 md:space-y-0">
              <FormField
                control={form.control}
                name="row"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Řádek</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        inputMode="numeric"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                    <p className="text-xs text-muted-foreground">
                      Určuje svislou pozici v mřížce (1 = horní řádek)
                    </p>
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
                      <Input
                        type="number"
                        min="1"
                        inputMode="numeric"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                    <p className="text-xs text-muted-foreground">
                      Určuje vodorovnou pozici v mřížce (1 = levý sloupec)
                    </p>
                  </FormItem>
                )}
              />
            </div>

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
