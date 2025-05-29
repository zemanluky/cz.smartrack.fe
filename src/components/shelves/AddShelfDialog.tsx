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
});

type ShelfFormValues = z.infer<typeof shelfFormSchema>;

export const AddShelfDialog: React.FC = () => {
  const { addShelf } = useShelvesStore();
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
    },
  });

  const onSubmit = async (data: ShelfFormValues) => {
    try {
      // Transformace prázdného řetězce na null pro shelf_store_location
      const formattedData = {
        ...data,
        shelf_store_location: data.shelf_store_location || null,
      };

      await addShelf(formattedData);
      form.reset();
      setOpen(false);
    } catch (error: any) {
      toast.error(error.message || "Nepodařilo se přidat regál");
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
