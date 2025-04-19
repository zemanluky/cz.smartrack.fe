// components/table/columns.tsx
import { ColumnDef } from "@tanstack/react-table"
import { ProductWithPosition } from "@/lib/types/product"
import { DeleteProduct } from "@/components/actions/DeleteProduct"
import { StockLevelCell } from "./cells/StockLevelCell"

export const columns: ColumnDef<ProductWithPosition>[] = [
    {
        accessorKey: "name",
        header: "Name"
    },
    {
        accessorKey: "price",
        header: "Price",
        cell: ({ row }) => {
            const price = parseFloat(row.getValue("price"))
            return !isNaN(price) ? `$${price.toFixed(2)}` : 'N/A'
        }
    },
    {
        accessorKey: "position",
        header: "Position",
        cell: ({ row }) => {
            const position = row.original.position
            return position ? `Row: ${position.row}, Col: ${position.column}` : 'N/A'
        }
    },
    {
        id: "stockLevel",
        header: "Stock Level",
        cell: ({ row }) => <StockLevelCell row={row} />
    },
    {
        id: "actions",
        header: "",
        cell: ({ row }) => <DeleteProduct product={row.original} />
    }
]