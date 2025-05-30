import { useState } from "react";
import { Plus } from "lucide-react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useOrganizationStore } from "@/lib/stores/organizationsStore";

const organizationFormSchema = z.object({
  name: z
    .string()
    .min(2, "Název musí mít alespoň 2 znaky")
    .max(32, "Název musí mít maximálně 32 znaků"),
  active: z.boolean(),
});
type OrganizationFormValues = z.infer<typeof organizationFormSchema>;

export function AddOrganization() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addOrganization = useOrganizationStore(
    (state) => state.addOrganization
  );

  const form = useForm<OrganizationFormValues>({
    resolver: zodResolver(organizationFormSchema),
    defaultValues: {
      name: "",
      active: true,
    },
  });

  const onSubmit = (data: OrganizationFormValues) => {
    setIsSubmitting(true);
    try {
      addOrganization(data.name, data.active);
      toast.success("Organizace byla úspěšně přidána");
      form.reset();
      setIsOpen(false);
    } catch (error) {
      console.error("Error adding organization:", error);
      toast.error("Nepodařilo se přidat organizaci");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          className="w-full sm:w-auto flex items-center gap-2"
          onClick={() => setIsOpen(true)}
        >
          <Plus className="h-4 w-4" />
          Přidat organizaci
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Přidat novou organizaci</DialogTitle>
          <DialogDescription>
            Vyplňte formulář pro přidání nové organizace. Všechna pole jsou povinná.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Název</FormLabel>
                  <FormControl>
                    <Input placeholder="Název organizace" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="active"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Stav</FormLabel>
                  <Select
                    value={field.value ? "true" : "false"}
                    onValueChange={(value) => field.onChange(value === "true")}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="true">Aktivní</SelectItem>
                      <SelectItem value="false">Neaktivní</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Přidávání..." : "Add Organization"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
