import React, { useState, useEffect } from "react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { Shelf } from "@/lib/types/shelf";

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

  const onSubmit = async (data: ShelfFormValues) => {
    if (!shelf) {
      toast.error("Nelze upravit regál, protože nebyl nalezen");
      return;
    }

    try {
      // Transformace prázdného řetězce na null pro shelf_store_location
      const formattedData = {
        ...data,
        shelf_store_location: data.shelf_store_location || null,
      };

      await updateShelf(shelf.id, formattedData);
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || "Nepodařilo se upravit regál");
    }
  };

  return (
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
  );
};
