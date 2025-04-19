import { ProductActivityLog } from "@/components/actions/ProductActivityLog"

export default function ReportsPage() {
    return (
        <div className="space-y-6 p-6">
            <h1 className="text-3xl font-bold tracking-tight">Reporty</h1>

            <div className="grid grid-cols-1 gap-6">
                {/* Activity log section */}
                <div>
                    <ProductActivityLog />
                </div>

                {/* You can add more report sections in the future */}
            </div>
        </div>
    )
}