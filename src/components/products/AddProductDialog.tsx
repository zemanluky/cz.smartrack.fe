import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { productCreateSchema } from "@/lib/schemas/product";
import type { ProductCreate } from "@/lib/types/product";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { useProductActions } from "@/hooks/product/useProductActions";
import { useUserStore } from "@/lib/stores/userStore";
import { toast } from "sonner";

export const AddProductDialog: React.FC<{ onSuccess?: () => void }> = ({ onSuccess }) => {
  const [open, setOpen] = React.useState(false);
  const defaultValues: z.infer<typeof productCreateSchema> = { name: '', price: 0, organization_id: undefined };
const form = useForm<z.infer<typeof productCreateSchema>>({
    resolver: zodResolver(productCreateSchema),
    defaultValues
});

  const { create } = useProductActions();

  const onSubmit = async (data: z.infer<typeof productCreateSchema>) => {
    // Always ensure price is a number
    const price = typeof data.price === 'string' ? parseFloat(data.price) : data.price;
    let payload: ProductCreate = {
      name: data.name,
      price,
    };
    try {
      await create(payload);
      form.reset();
      setOpen(false);
      onSuccess?.();
    } catch (e: any) {

      toast.error(e.message || 'Failed to create product');
    }
  };


  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" className="w-full sm:w-auto">Add Product</Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm w-full p-4">
        <DialogHeader>
          <DialogTitle>Add Product</DialogTitle>
          <DialogDescription>Fill out the form to add a new product. All fields are required.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} autoFocus />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" {...field} value={field.value ?? ''} onChange={e => {
  const val = e.target.value;
  field.onChange(val === '' ? undefined : Number(val));
}} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Show organization info if available */}
            {(() => {
              const user = useUserStore.getState().currentUser;
              const org = user?.organization;
              if (user?.role === 'sys_admin') {
                return org ? (
                  <div className="text-sm text-gray-600 mb-2">Selected organization: <strong>{org.name}</strong></div>
                ) : null;
              }
              if (user?.role === 'org_admin' || user?.role === 'org_user') {
                return org ? (
                  <div className="text-sm text-gray-600 mb-2">Your organization: <strong>{org.name}</strong></div>
                ) : null;
              }
              return null;
            })()}
            <DialogFooter>
              <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>Create Product</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddProductDialog;
// Product creation now uses Axios-based API (createProductApi) for consistency and robustness.
