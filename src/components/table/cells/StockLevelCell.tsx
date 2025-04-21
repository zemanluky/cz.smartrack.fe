// components/table/cells/StockLevelCell.tsx
import { Row } from "@tanstack/react-table"
import type { Product } from "@/lib/types/product"
import { cn } from "@/lib/utils/format.ts"

interface StockLevelCellProps {
    row: Row<Product>
}

export function StockLevelCell({ row }: StockLevelCellProps) {
    // quantity is now the current percentage (0-100)
    const amount = row.original.quantity
    // low_stock_threshold is now the threshold percentage (0-100)
    const threshold = row.original.low_stock_threshold

    // Handle cases where values might be undefined/null
    const displayAmount = (amount === undefined || amount === null) ? '-' : `${amount}%`
    const displayThreshold = (threshold === undefined || threshold === null) ? 'N/A' : `${threshold}%`
    const numericAmount = (amount === undefined || amount === null) ? -1 : amount // Use -1 to avoid matching threshold if undefined
    const numericThreshold = (threshold === undefined || threshold === null) ? 20 : threshold // Default threshold for coloring if undefined?

    // Determine color based on stock level percentage
    const getStockLevelColor = (currentPercent: number, thresholdPercent: number) => {
        if (currentPercent < 0) return "text-gray-500" // Color for undefined
        if (currentPercent <= thresholdPercent) {
            return "text-red-600 font-medium"
        }
        if (currentPercent <= thresholdPercent * 1.5) { // Keep the medium threshold logic
            return "text-yellow-600"
        }
        return "text-green-600"
    }

    const colorClass = getStockLevelColor(numericAmount, numericThreshold)

    // Revert to displaying the percentage with color
    return (
        <div className="flex items-center gap-2">
            <span className={cn(colorClass)}>
                {displayAmount}
            </span>
            {/* Optionally show threshold again */}
            {/* 
            <span className="text-xs text-muted-foreground">
                (Limit: {displayThreshold})
            </span>
            */}
        </div>
    )
}