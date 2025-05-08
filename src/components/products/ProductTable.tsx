import React from "react";
import type { Product } from "@/lib/types/product";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import EditProductDialog from "@/components/products/EditProductDialog";
import DeleteProductDialog from "@/components/products/DeleteProductDialog";

interface ProductTableProps {
  products: Product[];
  onEdit?: () => void;
  onDelete?: (id: number) => void;
}

export const ProductTable: React.FC<ProductTableProps> = ({ products, onEdit, onDelete }) => {
  return (
    <div className="w-full overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-left">Name</TableHead>
            <TableHead className="text-center">Price</TableHead>
            <TableHead className="text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product.id}>
              <TableCell className="text-left">{product.name}</TableCell>
              <TableCell className="text-center">{product.price}</TableCell>
              <TableCell className="text-center">
                <EditProductDialog product={product} onSuccess={() => onEdit && onEdit()} trigger={<button className="px-2 py-1 bg-blue-500 text-white rounded mr-2">Edit</button>} />
                <DeleteProductDialog
                  productId={product.id}
                  productName={product.name}
                  onSuccess={() => onDelete && onDelete(product.id)}
                  trigger={<button className="px-2 py-1 bg-red-500 text-white rounded">Delete</button>}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ProductTable;
