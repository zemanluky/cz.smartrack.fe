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
import { columns } from "./columns"
import type { Product } from "@/lib/types/product"
import { mockProductService } from "@/lib/services/mockProductService"
import { AddProduct } from "../actions/product/AddProduct"
import { toast } from 'sonner'

export function ProductTable() {
    const [products, setProducts] = React.useState<Product[]>([])
    const [isLoading, setIsLoading] = React.useState<boolean>(true)
    const [error, setError] = React.useState<string | null>(null)
    const navigate = useNavigate()

    const loadProducts = React.useCallback(async () => {
        setIsLoading(true)
        setError(null)
        try {
            const fetchedProducts = await mockProductService.getProducts(false)
            setProducts(fetchedProducts)
        } catch (err) {
            console.error("Failed to load products:", err)
            setError("Nepodařilo se načíst produkty.")
            toast.error("Nepodařilo se načíst produkty.")
        } finally {
            setIsLoading(false)
        }
    }, [])

    React.useEffect(() => {
        loadProducts()
    }, [loadProducts])

    const [sorting, setSorting] = React.useState<SortingState>([
        { id: 'name', desc: false }
    ])

    // Handler to refresh data, needs to be defined before useReactTable
    const handleRefresh = () => {
        loadProducts()
    }

    // Update table hook to use Product type and fetched data
    const table = useReactTable<Product>({
        data: products,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        onSortingChange: setSorting,
        state: {
            sorting,
        },
        enableMultiSort: true,
        // Pass the refresh function via meta
        meta: {
            refreshData: handleRefresh,
        },
    })

    const handleRowClick = (productId: number, e: React.MouseEvent) => {
        if (
            (e.target as HTMLElement).tagName === 'BUTTON' ||
            (e.target as HTMLElement).closest('button') ||
            (e.target as HTMLElement).closest('[data-cell-type="actions"]')
        ) {
            return
        }
        navigate(`/stock/${productId}`)
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold">Skladové zásoby</h2>
                <AddProduct onAddSuccess={handleRefresh} />
            </div>

            {isLoading && (
                <div className="text-center p-4">Načítání produktů...</div>
            )}
            {error && (
                <div className="text-center p-4 text-red-600">{error}</div>
            )}

            {!isLoading && !error && (
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
                                        <div className="absolute inset-0 right-[140px] pointer-events-none bg-transparent"></div>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell
                                        colSpan={columns.length}
                                        className="h-24 text-center"
                                    >
                                        Nebyly nalezeny žádné produkty.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            )}
        </div>
    )
}