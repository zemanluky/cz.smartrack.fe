import * as React from "react"
import { useNavigate } from "react-router-dom"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    flexRender,
    getCoreRowModel,
    getSortedRowModel,
    useReactTable,
    type SortingState,
} from "@tanstack/react-table"
import { useProductStore } from "@/stores/productStore"
import { columns } from "./columns"
import type { ProductWithPosition } from "@/lib/types/product"
import { AddProduct } from "../actions/AddProduct"

export function ProductTable() {
    const products = useProductStore((state) => state.products)
    const navigate = useNavigate()

    // Initialize with name sorted ascending by default
    const [sorting, setSorting] = React.useState<SortingState>([
        { id: 'name', desc: false } // Ascending sort for names
    ])

    const table = useReactTable<ProductWithPosition>({
        data: products,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        onSortingChange: setSorting,
        state: {
            sorting,
        },
        // Enable multi-sorting
        enableMultiSort: true,
    })

    const handleRowClick = (productId: number, e: React.MouseEvent) => {
        // Don't navigate if clicking on action buttons (any button or its parent)
        if (
            (e.target as HTMLElement).tagName === 'BUTTON' ||
            (e.target as HTMLElement).closest('button') ||
            // Also check for the actions cell
            (e.target as HTMLElement).closest('[data-cell-type="actions"]')
        ) {
            return
        }

        navigate(`/stock/${productId}`)
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold">Product Inventory</h2>
                <AddProduct />
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <TableHead
                                        key={header.id}
                                        className="px-4 py-3"
                                    >
                                        {flexRender(
                                            header.column.columnDef.header,
                                            header.getContext()
                                        )}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                    className="hover:bg-muted/50 cursor-pointer transition-colors relative"
                                    onClick={(e) => handleRowClick(row.original.id, e)}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell
                                            key={cell.id}
                                            data-cell-type={cell.column.id === "actions" ? "actions" : "default"}
                                            className="px-4 py-3"
                                        >
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </TableCell>
                                    ))}
                                    {/* Visual indicator overlay stops before the actions cell */}
                                    <div className="absolute inset-0 right-[140px] pointer-events-none bg-transparent"></div>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-24 text-center"
                                >
                                    No products found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}