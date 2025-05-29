import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { productCreateSchema } from "@/lib/schemas/product";
import type { Product, ProductCreate } from "@/lib/types/product";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { useProductActions } from "@/hooks/product/useProductActions";
import { useUserStore } from "@/lib/stores/userStore";
import { toast } from "sonner";

export const EditProductDialog: React.FC<{
  product: Product;
  onSuccess?: () => void;
  trigger?: React.ReactNode;
}> = ({ product, onSuccess, trigger }) => {
  const [open, setOpen] = React.useState(false);
  const defaultValues: z.infer<typeof productCreateSchema> = {
  name: product.name,
  price: product.price,
  organization_id: product.organization_id,
};
const form = useForm<z.infer<typeof productCreateSchema>>({
  resolver: zodResolver(productCreateSchema),
  defaultValues
});

  const { update } = useProductActions();

  const onSubmit = async (data: z.infer<typeof productCreateSchema>) => {
    const price = typeof data.price === "string" ? parseFloat(data.price) : data.price;
    let payload: ProductCreate = {
      name: data.name,
      price,
      organization_id: product.organization_id, // Pass if present, hook will decide
    };
    try {
      await update(product.id, payload);
      form.reset();
      setOpen(false);
      onSuccess?.();
    } catch (e: any) {
      toast.error(e.message || 'Failed to update product');
    }
  };


  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger || <Button variant="secondary" className="px-2 py-1">Edit</Button>}</DialogTrigger>
      <DialogContent className="max-w-sm w-full p-4">
        <DialogHeader>
          <DialogTitle>Edit Product</DialogTitle>
          <DialogDescription>Edit the product details. All fields are required.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Explicitly type FormField for robust type inference */}
<FormField<z.infer<typeof productCreateSchema>, "name">
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
            <FormField<z.infer<typeof productCreateSchema>, "price">
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
              // Use Zustand selector for proper reactivity
              const user = useUserStore(state => state.currentUser);
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
              <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>Save Changes</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EditProductDialog;
