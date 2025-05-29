import { useState } from 'react';
import { toast } from 'sonner';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { deleteProductDiscount } from '@/api/discountApi';

interface DeleteDiscountDialogProps {
  productId: number;
  discountId: number;
  discountName: string;
  children?: React.ReactNode;
  onDiscountDeleted?: () => void;
}

export function DeleteDiscountDialog({
  productId,
  discountId,
  discountName,
  children,
  onDiscountDeleted,
}: DeleteDiscountDialogProps) {
  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteProductDiscount(productId, discountId);
      toast.success('Sleva byla úspěšně smazána');
      setOpen(false);
      if (onDiscountDeleted) {
        onDiscountDeleted();
      }
    } catch (error: any) {
      toast.error(error.message || 'Nepodařilo se smazat slevu');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        {children || (
          <Button variant="destructive" size="sm">
            Smazat
          </Button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Opravdu chcete smazat slevu?</AlertDialogTitle>
          <AlertDialogDescription>
            Chystáte se smazat slevu {discountName}. Tato akce je nevratná.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Zrušit</AlertDialogCancel>
          <AlertDialogAction 
            onClick={(e) => {
              e.preventDefault();
              handleDelete();
            }}
            disabled={isDeleting}
          >
            {isDeleting ? 'Mazání...' : 'Smazat'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
