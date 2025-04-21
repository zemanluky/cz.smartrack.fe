import { ColumnDef } from "@tanstack/react-table"
import { Edit, ArrowUp, ArrowDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ProductWithPosition } from "@/lib/types/product"
import { DeleteProduct } from "@/components/actions/DeleteProduct"
import { EditProductButton } from "@/components/actions/EditProductButton"
import { StockLevelCell } from "./cells/StockLevelCell"

export const columns: ColumnDef<ProductWithPosition>[] = [
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
                    Name
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
        sortingFn: "alphanumeric" // Ensures proper alphabetical sorting
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
                    Price
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
            const price = parseFloat(row.getValue("price"))
            return !isNaN(price) ? `$${price.toFixed(2)}` : 'N/A'
        }
    },
    {
        // Use accessorFn for complex data like position
        accessorFn: (row) => `${row.position.row}-${row.position.column}`,
        id: "position",
        header: ({ column }) => {
            const isSorted = column.getIsSorted();
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(isSorted === "asc")}
                    className="p-0 font-medium"
                >
                    Position
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
            const position = row.original.position
            return position ? `Row: ${position.row}, Col: ${position.column}` : 'N/A'
        },
        sortingFn: (rowA, rowB, columnId) => {
            // Compare rows first, then columns if rows are equal
            const [rowA_row, rowA_col] = rowA.getValue(columnId).split('-').map(Number);
            const [rowB_row, rowB_col] = rowB.getValue(columnId).split('-').map(Number);

            if (rowA_row === rowB_row) {
                return rowA_col - rowB_col;
            }
            return rowA_row - rowB_row;
        }
    },
    {
        // Use accessorFn for stock level percentage
        accessorFn: (row) => row.position.current_amount_percent,
        id: "stockLevel",
        header: ({ column }) => {
            const isSorted = column.getIsSorted();
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(isSorted === "asc")}
                    className="p-0 font-medium"
                >
                    Stock Level
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
        cell: ({ row }) => <StockLevelCell row={row} />
    },
    {
        id: "actions",
        header: "",
        cell: ({ row }) => (
            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                {/* Standard edit button that matches product detail page */}
                <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center"
                    onClick={(e) => {
                        e.stopPropagation();
                        // Create and click a hidden EditProductButton
                        const hiddenButton = document.getElementById(`edit-product-${row.original.id}`);
                        if (hiddenButton) {
                            hiddenButton.click();
                        }
                    }}
                >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                </Button>

                {/* Hidden actual edit button that contains the dialog logic */}
                <div className="hidden">
                    <EditProductButton
                        product={row.original}
                        id={`edit-product-${row.original.id}`}
                    />
                </div>

                {/* Original delete button - unchanged */}
                <DeleteProduct product={row.original} />
            </div>
        ),
        enableSorting: false
    }
]