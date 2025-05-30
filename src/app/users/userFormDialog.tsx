import { useState, useEffect } from "react";
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
import { useUserStore } from "@/lib/stores/userStore";

export const userFormSchema = z.object({
  name: z
    .string()
    .min(2, "Jméno musí obsahovat alespoň 2 znaky")
    .max(32, "Jméno nesmí přesáhnout 32 znaků"),
  email: z.string().email("Neplatná e-mailová adresa"),
  role: z.string().min(2, "Role musí obsahovat alespoň 2 znaky"),
  active: z.boolean(),
});

export type UserFormValues = z.infer<typeof userFormSchema>;

type UserFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: Partial<UserFormValues>;
  onSubmit: (data: UserFormValues) => Promise<void>;
};

export function UserFormDialog({
  open,
  onOpenChange,
  initialData,
  onSubmit,
}: UserFormDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const currentUser = useUserStore((state) => state.currentUser);
  const userRole = currentUser?.role;

  const isEditMode = !!initialData?.name;

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      name: "",
      email: "",
      role: "org_user",
      active: true,
      ...initialData,
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        name: initialData?.name || "",
        email: initialData?.email || "",
        role: initialData?.role || "org_user",
        active: initialData?.active ?? true,
      });
    }
  }, [open, initialData, form]);

  const handleSubmit = async (data: UserFormValues) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
      toast.success(isEditMode ? "Uživatel byl upraven" : "Uživatel byl přidán");
      form.reset();
      onOpenChange(false);
    } catch (error) {
      console.error(error);
      toast.error(isEditMode ? "Nepodařilo se upravit uživatele" : "Nepodařilo se přidat uživatele");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Upravit uživatele" : "Přidat nového uživatele"}</DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Upravte údaje uživatele níže."
              : "Vyplníte formulář pro přidání nového uživatele."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Jméno</FormLabel>
                  <FormControl>
                    <Input placeholder="Jméno uživatele" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>E-mail</FormLabel>
                  <FormControl>
                    <Input placeholder="E-mail uživatele" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {(userRole === "sys_admin" || userRole === "org_admin") && (
              <>
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role</FormLabel>
                      <FormControl>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Vyberte roli" />
                          </SelectTrigger>
                          <SelectContent>
                            {userRole === "sys_admin" && (
                              <>
                                <SelectItem value="org_user">Uživatel</SelectItem>
                                <SelectItem value="org_admin">
                                  Administrátor organizace
                                </SelectItem>
                                <SelectItem value="sys_admin">
                                  Systémový administrátor
                                </SelectItem>
                              </>
                            )}
                            {userRole === "org_admin" && (
                              <>
                                <SelectItem value="org_user">Uživatel</SelectItem>
                                <SelectItem value="org_admin">
                                  Administrátor organizace
                                </SelectItem>
                              </>
                            )}
                          </SelectContent>
                        </Select>
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
                        onValueChange={(val) => field.onChange(val === "true")}
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
              </>
            )}
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? isEditMode
                  ? "Ukládání..."
                  : "Přidávání..."
                : isEditMode
                ? "Uložit změny"
                : "Přidat uživatele"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
