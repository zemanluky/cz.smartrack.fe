// components/table/cells/StockLevelCell.tsx
import { Row } from "@tanstack/react-table"
import { ProductWithPosition } from "@/lib/types/product"
import { cn } from "@/lib/utils/format.ts"

interface StockLevelCellProps {
    row: Row<ProductWithPosition>
}

export function StockLevelCell({ row }: StockLevelCellProps) {
    const amount = row.original.position?.current_amount_percent ?? 0
    const threshold = row.original.position?.low_stock_threshold_percent ?? 20

    // Determine color based on stock level
    const getStockLevelColor = (amount: number, threshold: number) => {
        if (amount <= threshold) {
            return "text-red-600 font-medium"
        }
        if (amount <= threshold * 1.5) {
            return "text-yellow-600"
        }
        return "text-green-600"
    }

    const colorClass = getStockLevelColor(amount, threshold)

    return (
        <div className="flex items-center gap-2">
            <span className={cn(colorClass)}>
                {amount}%
            </span>
            <span className="text-xs text-muted-foreground">
                (Threshold: {threshold}%)
            </span>
        </div>
    )
}