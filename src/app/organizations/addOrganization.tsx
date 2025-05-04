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
import { useOrganizationStore } from "@/stores/organizationsStore";

const organizationFormSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(32, "Name must be 32 characters or fewer"),
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
      const newOrg = {
        id: Date.now(), // temporary
        ...data,
      };
      addOrganization(newOrg);
      toast.success("Organization added successfully");
      form.reset();
      setIsOpen(false);
    } catch (error) {
      console.error("Error adding organization:", error);
      toast.error("Failed to add organization");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          className="flex items-center gap-2"
          onClick={() => setIsOpen(true)}
        >
          <Plus className="h-4 w-4" />
          Add Organization
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Organization</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Organization name" {...field} />
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
                  <FormLabel>Status</FormLabel>
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
                      <SelectItem value="true">Active</SelectItem>
                      <SelectItem value="false">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Adding..." : "Add Organization"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
