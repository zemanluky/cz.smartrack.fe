import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DiscountsList } from '@/components/products/DiscountsList';
import { getProductById } from '@/api/productApi';
import { Product } from '@/lib/types/product';

export default function ProductDetailPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('info');

  // Získání ID produktu z URL query parametrů
  const searchParams = new URLSearchParams(location.search);
  const productId = Number(searchParams.get('id'));

  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId || isNaN(productId)) {
        setError('Neplatné ID produktu');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const data = await getProductById(productId);
        setProduct(data);
      } catch (err: any) {
        setError(err.message || 'Nepodařilo se načíst detail produktu');
        toast.error(err.message || 'Nepodařilo se načíst detail produktu');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  const goBack = () => {
    navigate('/products');
  };

  if (isLoading) {
    return (
      <div className="container py-4">
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="icon" onClick={goBack} className="mr-2">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="h-8 w-48 bg-gray-200 animate-pulse rounded"></div>
        </div>
        
        <div className="space-y-4">
          <div className="h-10 w-full bg-gray-200 animate-pulse rounded"></div>
          <div className="h-32 w-full bg-gray-200 animate-pulse rounded"></div>
          <div className="h-64 w-full bg-gray-200 animate-pulse rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container py-4">
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="icon" onClick={goBack} className="mr-2">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Chyba</h1>
        </div>
        
        <div className="py-8 text-center">
          <p className="text-destructive mb-4">{error || 'Produkt nebyl nalezen'}</p>
          <Button onClick={goBack}>Zpět na seznam produktů</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="icon" onClick={goBack} className="mr-2">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">Detail produktu</h1>
      </div>

      <Tabs 
        value={activeTab} 
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="info">Informace</TabsTrigger>
          <TabsTrigger value="discounts">Slevy</TabsTrigger>
          <TabsTrigger value="positions">Pozice</TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <h2 className="text-lg font-medium mb-2">Základní informace</h2>
              <dl className="space-y-2">
                <div className="grid grid-cols-2">
                  <dt className="font-medium">ID:</dt>
                  <dd>{product.id}</dd>
                </div>
                <div className="grid grid-cols-2">
                  <dt className="font-medium">Název:</dt>
                  <dd>{product.name}</dd>
                </div>
                <div className="grid grid-cols-2">
                  <dt className="font-medium">Cena:</dt>
                  <dd>{product.price} Kč</dd>
                </div>
                <div className="grid grid-cols-2">
                  <dt className="font-medium">Smazáno:</dt>
                  <dd>{product.is_deleted ? 'Ano' : 'Ne'}</dd>
                </div>
                {product.organization_id && (
                  <div className="grid grid-cols-2">
                    <dt className="font-medium">ID organizace:</dt>
                    <dd>{product.organization_id}</dd>
                  </div>
                )}
              </dl>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="discounts">
          <DiscountsList product={product} />
        </TabsContent>

        <TabsContent value="positions">
          <div className="py-8 text-center text-muted-foreground">
            <p>Informace o pozicích produktu na regálech</p>
            <p className="text-sm mt-2">Tato sekce bude implementována později</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
