import React, { useState } from "react"; // Added useState
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button"; // Assuming Button is used or will be for triggers
import type { Product } from "@/lib/types/product";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import EditProductDialog from "@/components/products/EditProductDialog";
import DeleteProductDialog from "@/components/products/DeleteProductDialog";
import { Pagination } from "@/components/ui/pagination"; // Use the project's custom Pagination component
import { InfoIcon } from "lucide-react";

interface ProductTableProps {
  products: Product[];
  onUpravit?: () => void;
  onSmazat?: (id: number) => void;
}

// Define the ProductCardItem component
interface ProductCardItemProps {
  product: Product;
  onUpravit: () => void; 
  onSmazat: (id: number) => void;
}

const ProductCardItem = ({ product, onUpravit, onSmazat }: ProductCardItemProps) => {
  const navigate = useNavigate();
  
  const handleViewDetail = () => {
    navigate(`/products/detail?id=${product.id}`);
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="break-words">{product.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-lg font-semibold break-words">Cena: {product.price} Kč</p>
      </CardContent>
      <CardFooter className="flex flex-col space-y-2 pt-4 sm:flex-row sm:space-y-0 sm:justify-end sm:space-x-2 sm:items-center">
        <Button 
          variant="secondary" 
          size="sm" 
          className="w-full sm:w-auto"
          onClick={handleViewDetail}
        >
          <InfoIcon className="h-4 w-4 mr-1" />
          Detail
        </Button>
        <EditProductDialog 
          product={product} 
          onSuccess={onUpravit} 
          trigger={<Button variant="outline" size="sm" className="w-full sm:w-auto">Upravit</Button>} 
        />
        <DeleteProductDialog
          productId={product.id}
          productName={product.name}
          onSuccess={() => onSmazat(product.id)}
          trigger={<Button variant="destructive" size="sm" className="w-full sm:w-auto">Smazat</Button>}
        />
      </CardFooter>
    </Card>
  );
};

export const ProductTable: React.FC<ProductTableProps> = ({ products, onUpravit, onSmazat }) => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Calculate products for the current page
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = products.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(products.length / itemsPerPage);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  return (
      <>
    {/* Desktop Table View */}
    <div className="hidden min-[950px]:block w-full overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-left">Název</TableHead>
            <TableHead className="text-center">Cena</TableHead>
            <TableHead className="text-center">Možnosti</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {currentProducts.length > 0 ? (
            currentProducts.map((product) => (
              <TableRow key={product.id}>
                <TableCell className="text-left">{product.name}</TableCell>
                <TableCell className="text-center">{product.price} Kč</TableCell>
                <TableCell className="text-center">
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    className="mr-2"
                    onClick={() => navigate(`/products/detail?id=${product.id}`)}
                  >
                    <InfoIcon className="h-4 w-4 mr-1" />
                    Detail
                  </Button>
                  <EditProductDialog product={product} onSuccess={() => onUpravit && onUpravit()} trigger={<Button variant="outline" size="sm" className="mr-2">Upravit</Button>} />
                  <DeleteProductDialog 
                    productId={product.id}
                    productName={product.name}
                    onSuccess={() => onSmazat && onSmazat(product.id)}
                    trigger={<Button variant="destructive" size="sm">Smazat</Button>}
                  />
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={3} className="text-center h-24">
                Žádné produkty nenalezeny.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>

    {/* Mobile Card View */}
    <div className="block min-[950px]:hidden space-y-3">
      {currentProducts.length > 0 ? (
        currentProducts.map((product) => (
          <ProductCardItem 
            key={product.id} 
            product={product} 
            onUpravit={() => onUpravit && onUpravit()} 
            onSmazat={() => onSmazat && onSmazat(product.id)} 
          />
        ))
      ) : (
        <div className="text-center text-muted-foreground p-4 border rounded-md">
          Žádné produkty nenalezeny.
        </div>
      )}
    </div>

    {/* Pagination Controls */}
    {totalPages > 1 && (
        <div className="flex items-center justify-center py-4">
          <Pagination 
            currentPage={currentPage} 
            totalPages={totalPages} 
            onPageChange={handlePageChange} 
          />
        </div>
      )}
  </>
  );
};

export default ProductTable;
