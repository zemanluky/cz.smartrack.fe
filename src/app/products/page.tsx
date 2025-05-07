import { ProductTable } from "@/components/table/ProductTable"


export default function StockPage() {
    return (
        <div className="space-y-6 p-6">
            <h1 className="text-3xl font-bold tracking-tight">Stock Management</h1>

            <div>
                <ProductTable />
            </div>
        </div>
    )
}