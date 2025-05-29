import React, { useState } from "react"; // Added useState
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button"; // Assuming Button is used or will be for triggers
import type { Product } from "@/lib/types/product";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import EditProductDialog from "@/components/products/EditProductDialog";
import DeleteProductDialog from "@/components/products/DeleteProductDialog";
import { Pagination } from "@/components/ui/pagination"; // Use the project's custom Pagination component

interface ProductTableProps {
  products: Product[];
  onEdit?: () => void;
  onDelete?: (id: number) => void;
}

// Define the ProductCardItem component
interface ProductCardItemProps {
  product: Product;
  onEdit: () => void; 
  onDelete: (id: number) => void;
}

const ProductCardItem = ({ product, onEdit, onDelete }: ProductCardItemProps) => {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="break-words">{product.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-lg font-semibold break-words">Price: {product.price} Kč</p>
      </CardContent>
      <CardFooter className="flex flex-col space-y-2 pt-4 sm:flex-row sm:space-y-0 sm:justify-end sm:space-x-2 sm:items-center">
        <EditProductDialog 
          product={product} 
          onSuccess={onEdit} 
          trigger={<Button variant="outline" size="sm" className="w-full sm:w-auto">Edit</Button>} 
        />
        <DeleteProductDialog
          productId={product.id}
          productName={product.name}
          onSuccess={() => onDelete(product.id)}
          trigger={<Button variant="destructive" size="sm" className="w-full sm:w-auto">Delete</Button>}
        />
      </CardFooter>
    </Card>
  );
};

export const ProductTable: React.FC<ProductTableProps> = ({ products, onEdit, onDelete }) => {
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
            <TableHead className="text-left">Name</TableHead>
            <TableHead className="text-center">Price</TableHead>
            <TableHead className="text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {currentProducts.length > 0 ? (
            currentProducts.map((product) => (
              <TableRow key={product.id}>
                <TableCell className="text-left">{product.name}</TableCell>
                <TableCell className="text-center">{product.price} Kč</TableCell>
                <TableCell className="text-center">
                  <EditProductDialog product={product} onSuccess={() => onEdit && onEdit()} trigger={<Button variant="outline" size="sm" className="mr-2">Edit</Button>} />
                  <DeleteProductDialog
                    productId={product.id}
                    productName={product.name}
                    onSuccess={() => onDelete && onDelete(product.id)}
                    trigger={<Button variant="destructive" size="sm">Delete</Button>}
                  />
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={3} className="text-center h-24">
                No products found.
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
            onEdit={() => onEdit && onEdit()} 
            onDelete={() => onDelete && onDelete(product.id)} 
          />
        ))
      ) : (
        <div className="text-center text-muted-foreground p-4 border rounded-md">
          No products found.
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
