import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { cs } from 'date-fns/locale';
import { CheckCircle2, XCircle, PenIcon, Trash2Icon, ToggleLeftIcon, ToggleRightIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { AddDiscountDialog } from './AddDiscountDialog';
import { EditDiscountDialog } from './EditDiscountDialog';
import { DeleteDiscountDialog } from './DeleteDiscountDialog';
import { fetchProductDiscounts, toggleDiscount } from '@/api/discountApi';
import { ProductDiscount } from '@/lib/types/discount';
import { Product } from '@/lib/types/product';

interface DiscountsListProps {
  product: Product;
}

export function DiscountsList({ product }: DiscountsListProps) {
  const [discounts, setDiscounts] = useState<ProductDiscount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isTogglingDiscount, setIsTogglingDiscount] = useState<number | null>(null);

  const fetchDiscounts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetchProductDiscounts(product.id, { 
        page,
        limit: 10
      });
      if (response) {
        setDiscounts(response.items);
        setTotalPages(Math.ceil(response.metadata.total / response.metadata.limit));
      }
    } catch (err: any) {
      setError(err.message || 'Nepodařilo se načíst slevy');
      toast.error(err.message || 'Nepodařilo se načíst slevy');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDiscounts();
  }, [product.id, page]);

  const handleToggleDiscount = async (discountId: number) => {
    setIsTogglingDiscount(discountId);
    try {
      await toggleDiscount(product.id, discountId);
      await fetchDiscounts();
      toast.success('Stav slevy byl úspěšně změněn');
    } catch (err: any) {
      toast.error(err.message || 'Nepodařilo se změnit stav slevy');
    } finally {
      setIsTogglingDiscount(null);
    }
  };

  const formatDiscountLabel = (discount: ProductDiscount) => {
    if (discount.discount_percent) {
      return `${discount.discount_percent}%`;
    }
    if (discount.new_price) {
      return `${discount.new_price} Kč`;
    }
    return 'N/A';
  };

  if (isLoading && discounts.length === 0) {
    return <div className="py-8 text-center">Načítání slev...</div>;
  }

  if (error && discounts.length === 0) {
    return (
      <div className="py-8 text-center text-destructive">
        <p className="mb-4">{error}</p>
        <Button onClick={fetchDiscounts}>Zkusit znovu</Button>
      </div>
    );
  }

  if (discounts.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="mb-4 text-muted-foreground">Tento produkt nemá žádné slevy</p>
        <AddDiscountDialog 
          productId={product.id} 
          productName={product.name}
          onDiscountAdded={fetchDiscounts}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Slevy produktu</h3>
        <AddDiscountDialog 
          productId={product.id} 
          productName={product.name}
          onDiscountAdded={fetchDiscounts}
        />
      </div>

      {/* Mobilní zobrazení */}
      <div className="md:hidden space-y-4">
        {discounts.map((discount) => (
          <Card key={discount.id}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <Badge 
                    variant={discount.active && discount.currently_valid ? "default" : "outline"}
                    className="mb-2"
                  >
                    {discount.active && discount.currently_valid 
                      ? 'Aktivní' 
                      : discount.active
                        ? 'Neplatná'
                        : 'Neaktivní'
                    }
                  </Badge>
                  <h4 className="font-medium">Sleva: {formatDiscountLabel(discount)}</h4>
                </div>
                <div className="flex space-x-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleToggleDiscount(discount.id)}
                    disabled={isTogglingDiscount === discount.id}
                  >
                    {discount.active 
                      ? <ToggleRightIcon className="h-4 w-4" /> 
                      : <ToggleLeftIcon className="h-4 w-4" />
                    }
                  </Button>
                  
                  <EditDiscountDialog
                    productId={product.id}
                    discountId={discount.id}
                    discount={discount}
                    onDiscountUpdated={fetchDiscounts}
                  >
                    <Button variant="ghost" size="icon">
                      <PenIcon className="h-4 w-4" />
                    </Button>
                  </EditDiscountDialog>
                  
                  <DeleteDiscountDialog
                    productId={product.id}
                    discountId={discount.id}
                    discountName={formatDiscountLabel(discount)}
                    onDiscountDeleted={fetchDiscounts}
                  >
                    <Button variant="ghost" size="icon">
                      <Trash2Icon className="h-4 w-4" />
                    </Button>
                  </DeleteDiscountDialog>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-muted-foreground">Platnost od:</p>
                  <p>{format(new Date(discount.valid_from), 'dd. MMMM yyyy', { locale: cs })}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Platnost do:</p>
                  <p>{format(new Date(discount.valid_until), 'dd. MMMM yyyy', { locale: cs })}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Desktop zobrazení */}
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Sleva</TableHead>
              <TableHead>Platnost od</TableHead>
              <TableHead>Platnost do</TableHead>
              <TableHead>Stav</TableHead>
              <TableHead className="text-right">Akce</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {discounts.map((discount) => (
              <TableRow key={discount.id}>
                <TableCell className="font-medium">
                  {formatDiscountLabel(discount)}
                </TableCell>
                <TableCell>
                  {format(new Date(discount.valid_from), 'dd.MM.yyyy')}
                </TableCell>
                <TableCell>
                  {format(new Date(discount.valid_until), 'dd.MM.yyyy')}
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    {discount.active && discount.currently_valid 
                      ? <><CheckCircle2 className="mr-1 h-4 w-4 text-green-500" /> Aktivní</>
                      : discount.active
                        ? <><XCircle className="mr-1 h-4 w-4 text-yellow-500" /> Neplatná</>
                        : <><XCircle className="mr-1 h-4 w-4 text-muted-foreground" /> Neaktivní</>
                    }
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleDiscount(discount.id)}
                      disabled={isTogglingDiscount === discount.id}
                    >
                      {discount.active ? 'Deaktivovat' : 'Aktivovat'}
                    </Button>
                    
                    <EditDiscountDialog
                      productId={product.id}
                      discountId={discount.id}
                      discount={discount}
                      onDiscountUpdated={fetchDiscounts}
                    />
                    
                    <DeleteDiscountDialog
                      productId={product.id}
                      discountId={discount.id}
                      discountName={formatDiscountLabel(discount)}
                      onDiscountDeleted={fetchDiscounts}
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Stránkování */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-4">
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={page === 1 || isLoading}
            >
              Předchozí
            </Button>
            <div className="flex items-center px-2">
              Strana {page} z {totalPages}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={page === totalPages || isLoading}
            >
              Další
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
