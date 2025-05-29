import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { createProductDiscount } from '@/api/discountApi';

interface AddDiscountDialogProps {
  productId: number;
  productName: string;
  onDiscountAdded?: () => void;
}

export function AddDiscountDialog({ 
  productId, 
  productName, 
  onDiscountAdded 
}: AddDiscountDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [newPrice, setNewPrice] = useState<string>('');
  const [discountPercent, setDiscountPercent] = useState<string>('');
  const [active, setActive] = useState(true);
  
  // Reset form
  const resetForm = () => {
    setNewPrice('');
    setDiscountPercent('');
    setActive(true);
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    // Validate that at least one of new_price or discount_percent is provided
    if (!newPrice && !discountPercent) {
      toast.error('Musíte zadat buď novou cenu nebo procentuální slevu');
      return;
    }
    
    setIsSubmitting(true);
    try {
      const discountData = {
        new_price: newPrice ? Number(newPrice) : undefined,
        discount_percent: discountPercent ? Number(discountPercent) : undefined,
        valid_from: null,
        valid_until: null,
        active
      };
      
      await createProductDiscount(productId, discountData);
      toast.success('Sleva byla úspěšně vytvořena');
      setOpen(false);
      resetForm();
      if (onDiscountAdded) {
        onDiscountAdded();
      }
    } catch (error: any) {
      toast.error(error.message || 'Nepodařilo se vytvořit slevu');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">Přidat slevu</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Přidat slevu pro produkt {productName}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="new_price">Nová cena (Kč)</Label>
            <Input
              id="new_price"
              type="number"
              placeholder="0"
              value={newPrice}
              onChange={(e) => setNewPrice(e.target.value)}
            />
            <p className="text-sm text-muted-foreground">Zadejte buď novou cenu nebo procentuální slevu</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="discount_percent">Sleva (%)</Label>
            <Input
              id="discount_percent"
              type="number"
              placeholder="0"
              value={discountPercent}
              onChange={(e) => setDiscountPercent(e.target.value)}
            />
          </div>

          <div className="flex items-center space-x-2 rounded-md border p-4">
            <Checkbox
              id="active"
              checked={active}
              onCheckedChange={(checked) => setActive(checked as boolean)}
            />
            <Label htmlFor="active">Aktivní</Label>
          </div>

          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              Zrušit
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Ukládání...' : 'Vytvořit slevu'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
