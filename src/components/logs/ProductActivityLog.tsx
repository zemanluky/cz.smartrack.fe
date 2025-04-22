import { useState, useMemo, useEffect } from "react"
import { useProductLogStore, type ActivityType } from "@/lib/stores/productLogStore"
import { mockProductService } from "@/lib/services/mockProductService"
import { PlusCircle, MinusCircle, RefreshCw } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { LogFilterBar, type LogFilter } from "./LogFilterBar"

interface ProductActivityLogProps {
    productId?: number  // Optional: when provided, only show logs for this product
    showFilters?: boolean // Whether to show the filter UI
}

export function ProductActivityLog({ productId, showFilters = true }: ProductActivityLogProps) {
    const logs = useProductLogStore((state) => state.logs)
    const [productOptions, setProductOptions] = useState<{ id: number; name: string }[]>([])
    const [isLoadingProducts, setIsLoadingProducts] = useState(false)

    // Fetch product names for the filter dropdown
    useEffect(() => {
        const fetchProductNames = async () => {
            setIsLoadingProducts(true)
            try {
                const products = await mockProductService.getProducts()
                setProductOptions(products.map(p => ({ id: p.id, name: p.name })))
            } catch (error) {
                console.error("Failed to load product names for log filter:", error)
                // Handle error appropriately, maybe show a message
            } finally {
                setIsLoadingProducts(false)
            }
        }
        // Only fetch if filters are shown and product filter might be needed
        if (showFilters && !productId) {
            fetchProductNames()
        }
    }, [showFilters, productId])

    // Set up initial filter state
    const [filter, setFilter] = useState<LogFilter>({
        search: '',
        type: 'all',
        dateRange: { from: null, to: null },
        productId: productId || null
    })

    // Apply filters to logs
    const filteredLogs = useMemo(() => {
        return logs.filter(log => {
            // Filter by product ID if specified
            if (filter.productId !== null && log.productId !== filter.productId) {
                return false
            }

            // Filter by activity type
            if (filter.type !== 'all' && log.type !== filter.type) {
                return false
            }

            // Filter by search term
            if (filter.search && !log.productName.toLowerCase().includes(filter.search.toLowerCase()) &&
                !log.details.toLowerCase().includes(filter.search.toLowerCase())) {
                return false
            }

            // Date range filtering could be added here

            return true
        })
    }, [logs, filter])

    // Format timestamp to be more readable
    const formatTime = (date: Date) => {
        return new Intl.DateTimeFormat('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        }).format(date instanceof Date ? date : new Date(date))
    }

    // Get appropriate icon and color for activity type
    const getActivityIcon = (type: ActivityType) => {
        switch (type) {
            case 'add':
                return <PlusCircle className="h-4 w-4 text-green-500" />
            case 'delete':
                return <MinusCircle className="h-4 w-4 text-red-500" />
            case 'update':
                return <RefreshCw className="h-4 w-4 text-blue-500" />
        }
    }

    const getActivityBadge = (type: ActivityType) => {
        switch (type) {
            case 'add':
                return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Added</Badge>
            case 'delete':
                return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Deleted</Badge>
            case 'update':
                return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Updated</Badge>
        }
    }

    return (
        <Card>
            <CardHeader className="pb-3">
                <div className="flex justify-between items-center mb-2">
                    <div>
                        <CardTitle>Log Aktivity</CardTitle>
                        <CardDescription>Nedávné aktivity inventáře produktů</CardDescription>
                    </div>
                </div>

                {/* Only show filter UI if requested */}
                {showFilters && (
                    <LogFilterBar
                        filter={filter}
                        onFilterChange={setFilter}
                        showProductFilter={!productId} // Only show product filter if not in product detail view
                        productOptions={productOptions}
                        isLoadingProducts={isLoadingProducts}
                    />
                )}
            </CardHeader>

            <CardContent className="pt-0">
                {filteredLogs.length === 0 ? (
                    <div className="text-center py-4 text-gray-500">
                        Nebyly nalezeny žádné záznamy aktivity
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredLogs.map((log) => (
                            <div key={log.id} className="flex items-start gap-3 border-b pb-3 last:border-0">
                                <div className="mt-1">{getActivityIcon(log.type)}</div>
                                <div className="flex-1 space-y-1">
                                    <div className="flex items-center justify-between">
                                        <div className="font-medium flex items-center gap-2">
                                            {log.productName}
                                            {getActivityBadge(log.type)}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            {formatTime(log.timestamp)}
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-600">{log.details}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}