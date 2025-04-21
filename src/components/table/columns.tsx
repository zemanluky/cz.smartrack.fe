import { ColumnDef } from "@tanstack/react-table"
import { Edit, ArrowUp, ArrowDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Product } from "@/lib/types/product"
import { DeleteProduct } from "@/components/actions/product/DeleteProduct"
import { EditProductButton } from "@/components/actions/product/EditProductButton"
import { StockLevelCell } from "./cells/StockLevelCell"
import { formatCurrency } from "@/lib/utils/format.ts"

export const columns: ColumnDef<Product>[] = [
    {
        accessorKey: "name",
        header: ({ column }) => {
            const isSorted = column.getIsSorted();
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(isSorted === "asc")}
                    className="p-0 font-medium"
                >
                    Název
                    {isSorted && (
                        <span className="ml-2">
                            {isSorted === "asc" ? (
                                <ArrowUp className="h-4 w-4" />
                            ) : (
                                <ArrowDown className="h-4 w-4" />
                            )}
                        </span>
                    )}
                </Button>
            );
        },
        sortingFn: "alphanumeric"
    },
    {
        accessorKey: "price",
        header: ({ column }) => {
            const isSorted = column.getIsSorted();
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(isSorted === "asc")}
                    className="p-0 font-medium"
                >
                    Cena
                    {isSorted && (
                        <span className="ml-2">
                            {isSorted === "asc" ? (
                                <ArrowUp className="h-4 w-4" />
                            ) : (
                                <ArrowDown className="h-4 w-4" />
                            )}
                        </span>
                    )}
                </Button>
            );
        },
        cell: ({ row }) => {
            const price = row.original.price;
            return formatCurrency(price);
        }
    },
    {
        accessorFn: (row) => row.shelf_position ? 
                            `${row.shelf_position.shelf_id}-${row.shelf_position.row}-${row.shelf_position.column}` : '',
        id: "position",
        header: ({ column }) => {
            const isSorted = column.getIsSorted();
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(isSorted === "asc")}
                    className="p-0 font-medium"
                >
                    Pozice
                    {isSorted && (
                        <span className="ml-2">
                            {isSorted === "asc" ? (
                                <ArrowUp className="h-4 w-4" />
                            ) : (
                                <ArrowDown className="h-4 w-4" />
                            )}
                        </span>
                    )}
                </Button>
            );
        },
        cell: ({ row }) => {
            const position = row.original.shelf_position;
            return position ? `Regál: ${position.shelf_id}, Ř: ${position.row}, S: ${position.column}` : 'Nezadáno';
        },
        sortingFn: (rowA, rowB, columnId) => {
            const posA = rowA.original.shelf_position;
            const posB = rowB.original.shelf_position;
            if (!posA && !posB) return 0;
            if (!posA) return -1;
            if (!posB) return 1;

            if (posA.shelf_id !== posB.shelf_id) return posA.shelf_id - posB.shelf_id;
            if (posA.row !== posB.row) return posA.row - posB.row;
            return posA.column - posB.column;
        }
    },
    {
        accessorKey: "low_stock_threshold",
        header: "Min. stav",
        cell: ({ row }) => row.original.low_stock_threshold ?? '-'
    },
    {
        id: "stockLevel",
        accessorFn: (row) => row.quantity,
        header: "Stav zásob",
        cell: ({ row }) => <StockLevelCell row={row} />
    },
    {
        id: "actions",
        header: "",
        cell: ({ row, table }) => {
            const { refreshData } = table.options.meta as { refreshData?: () => void } || {};
            
            return (
                <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                    <EditProductButton 
                        product={row.original} 
                        onEditSuccess={refreshData}
                    />
                    <DeleteProduct 
                        product={row.original} 
                        onDeleteSuccess={refreshData}
                    />
                </div>
            );
        },
        enableSorting: false,
        meta: {
        }
    }
]