import React from "react";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useProductActions } from "@/hooks/product/useProductActions";

interface DeleteProductDialogProps {
  productId: number;
  productName: string;
  onSuccess?: () => void;
  trigger: React.ReactNode;
}

export const DeleteProductDialog: React.FC<DeleteProductDialogProps> = ({ productId, productName, onSuccess, trigger }) => {
  const { remove } = useProductActions();
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const handleDelete = async () => {
    setLoading(true);
    const success = await remove(productId);
    setLoading(false);
    if (success) {
      toast.success("Product deleted successfully.");
      setOpen(false);
      onSuccess?.();
    } else {
      toast.error("Failed to delete product.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-sm w-full p-4">
        <DialogHeader>
          <DialogTitle>Delete Product</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete the product <strong>{productName}</strong>? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>Cancel</Button>
          <Button variant="destructive" onClick={handleDelete} disabled={loading}>
            {loading ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteProductDialog;
