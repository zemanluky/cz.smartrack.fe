import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { updateProductDiscount, fetchProductDiscount } from '@/api/discountApi';
import { ProductDiscount } from '@/lib/types/discount';

// Validační schéma pro slevu
const discountSchema = z
  .object({
    new_price: z.number().min(0).optional(),
    discount_percent: z.number().min(1).max(100).optional(),
    valid_from: z.date(),
    valid_until: z.date(),
    active: z.boolean(),
  })
  .refine(
    (data) => data.new_price !== undefined || data.discount_percent !== undefined,
    {
      message: 'Musíte zadat buď novou cenu nebo procentuální slevu',
      path: ['new_price'],
    }
  )
  .refine(
    (data) => data.valid_until.getTime() > data.valid_from.getTime(),
    {
      message: 'Datum konce slevy musí být později než datum začátku',
      path: ['valid_until'],
    }
  );

type DiscountFormValues = z.infer<typeof discountSchema>;

interface EditDiscountDialogProps {
  productId: number;
  discountId: number;
  discount?: ProductDiscount;
  children?: React.ReactNode;
  onDiscountUpdated?: () => void;
}

export function EditDiscountDialog({ 
  productId, 
  discountId, 
  discount,
  children, 
  onDiscountUpdated 
}: EditDiscountDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [discountData, setDiscountData] = useState<ProductDiscount | null>(discount || null);

  const form = useForm<DiscountFormValues>({
    resolver: zodResolver(discountSchema),
    defaultValues: {
      new_price: discountData?.new_price,
      discount_percent: discountData?.discount_percent,
      valid_from: discountData ? new Date(discountData.valid_from) : new Date(),
      valid_until: discountData ? new Date(discountData.valid_until) : new Date(new Date().setMonth(new Date().getMonth() + 1)),
      active: discountData?.active || true,
    },
  });

  // Načtení dat slevy, pokud nejsou předána jako prop
  useEffect(() => {
    if (open && !discount && !discountData) {
      const loadDiscountData = async () => {
        setIsLoading(true);
        try {
          const fetchedDiscount = await fetchProductDiscount(productId, discountId);
          if (fetchedDiscount) {
            setDiscountData(fetchedDiscount);
            form.reset({
              new_price: fetchedDiscount.new_price,
              discount_percent: fetchedDiscount.discount_percent,
              valid_from: new Date(fetchedDiscount.valid_from),
              valid_until: new Date(fetchedDiscount.valid_until),
              active: fetchedDiscount.active,
            });
          }
        } catch (error: any) {
          toast.error(error.message || 'Nepodařilo se načíst data slevy');
          setOpen(false);
        } finally {
          setIsLoading(false);
        }
      };

      loadDiscountData();
    } else if (discount && !discountData) {
      setDiscountData(discount);
      form.reset({
        new_price: discount.new_price,
        discount_percent: discount.discount_percent,
        valid_from: new Date(discount.valid_from),
        valid_until: new Date(discount.valid_until),
        active: discount.active,
      });
    }
  }, [discount, discountData, form, open, productId, discountId]);

  async function onSubmit(values: DiscountFormValues) {
    setIsSubmitting(true);
    try {
      await updateProductDiscount(productId, discountId, values);
      toast.success('Sleva byla úspěšně aktualizována');
      setOpen(false);
      if (onDiscountUpdated) {
        onDiscountUpdated();
      }
    } catch (error: any) {
      toast.error(error.message || 'Nepodařilo se aktualizovat slevu');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || <Button variant="outline" size="sm">Upravit</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Upravit slevu</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="py-8 text-center">Načítání dat slevy...</div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
              <FormField
                control={form.control}
                name="new_price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nová cena (Kč)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0"
                        value={field.value ?? ''}
                        onChange={(e) => {
                          const value = e.target.value;
                          field.onChange(value ? Number(value) : undefined);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="discount_percent"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sleva (%)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0"
                        value={field.value ?? ''}
                        onChange={(e) => {
                          const value = e.target.value;
                          field.onChange(value ? Number(value) : undefined);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="valid_from"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Platnost od</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className="w-full pl-3 text-left font-normal flex justify-between items-center"
                          >
                            {field.value ? (
                              format(field.value, 'dd.MM.yyyy')
                            ) : (
                              <span>Vyberte datum</span>
                            )}
                            <CalendarIcon className="h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="valid_until"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Platnost do</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className="w-full pl-3 text-left font-normal flex justify-between items-center"
                          >
                            {field.value ? (
                              format(field.value, 'dd.MM.yyyy')
                            ) : (
                              <span>Vyberte datum</span>
                            )}
                            <CalendarIcon className="h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => 
                            date < form.getValues().valid_from
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="active"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Aktivní</FormLabel>
                    </div>
                  </FormItem>
                )}
              />

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
                  {isSubmitting ? 'Ukládání...' : 'Uložit změny'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
