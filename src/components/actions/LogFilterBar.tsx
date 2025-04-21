import { useState } from "react"
import { Search, Filter, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { ActivityType } from "@/stores/productLogStore"
import { Badge } from "@/components/ui/badge"

export interface LogFilter {
    search: string
    type: ActivityType | 'all'
    dateRange: {
        from: Date | null
        to: Date | null
    }
    productId?: number | null
}

interface LogFilterBarProps {
    filter: LogFilter
    onFilterChange: (filter: LogFilter) => void
    showProductFilter?: boolean
    productOptions?: { id: number, name: string }[]
}

export function LogFilterBar({
                                 filter,
                                 onFilterChange,
                                 showProductFilter = true,
                                 productOptions = []
                             }: LogFilterBarProps) {
    const [isFilterOpen, setIsFilterOpen] = useState(false)

    // Handle search input changes
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onFilterChange({
            ...filter,
            search: e.target.value
        })
    }

    // Handle activity type selection
    const handleTypeChange = (value: string) => {
        onFilterChange({
            ...filter,
            type: value as ActivityType | 'all'
        })
    }

    // Handle product selection
    const handleProductChange = (value: string) => {
        onFilterChange({
            ...filter,
            productId: value === 'all' ? null : parseInt(value, 10)
        })
    }

    // Reset all filters
    const handleResetFilters = () => {
        onFilterChange({
            search: '',
            type: 'all',
            dateRange: { from: null, to: null },
            productId: null
        })
    }

    // Count active filters (excluding search)
    const activeFilterCount = [
        filter.type !== 'all',
        filter.dateRange.from !== null || filter.dateRange.to !== null,
        filter.productId !== null && filter.productId !== undefined
    ].filter(Boolean).length

    return (
        <div className="flex flex-col space-y-4">
            <div className="flex space-x-2">
                {/* Search input */}
                <div className="relative flex-grow">
                    <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Search logs..."
                        value={filter.search}
                        onChange={handleSearchChange}
                        className="pl-8"
                    />
                    {filter.search && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="absolute right-1 top-1/2 h-6 w-6 -translate-y-1/2 p-0"
                            onClick={() => onFilterChange({ ...filter, search: '' })}
                        >
                            <X className="h-3 w-3" />
                        </Button>
                    )}
                </div>

                {/* Filter popover */}
                <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                    <PopoverTrigger asChild>
                        <Button variant="outline" size="sm" className="h-10 px-3">
                            <Filter className="mr-2 h-4 w-4" />
                            Filters
                            {activeFilterCount > 0 && (
                                <Badge variant="secondary" className="ml-2">
                                    {activeFilterCount}
                                </Badge>
                            )}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-72">
                        <div className="grid gap-4">
                            <div className="space-y-2">
                                <h4 className="font-medium leading-none">Activity Type</h4>
                                <Select
                                    value={filter.type}
                                    onValueChange={handleTypeChange}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Activities</SelectItem>
                                        <SelectItem value="add">Added</SelectItem>
                                        <SelectItem value="update">Updated</SelectItem>
                                        <SelectItem value="delete">Deleted</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Product filter - only show if requested */}
                            {showProductFilter && productOptions.length > 0 && (
                                <div className="space-y-2">
                                    <h4 className="font-medium leading-none">Product</h4>
                                    <Select
                                        value={filter.productId?.toString() || 'all'}
                                        onValueChange={handleProductChange}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select product" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Products</SelectItem>
                                            {productOptions.map((product) => (
                                                <SelectItem key={product.id} value={product.id.toString()}>
                                                    {product.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}

                            {/* TODO: Date range picker could be added here */}

                            {/* Reset button */}
                            {activeFilterCount > 0 && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleResetFilters}
                                >
                                    Reset Filters
                                </Button>
                            )}
                        </div>
                    </PopoverContent>
                </Popover>
            </div>

            {/* Active filters display */}
            {activeFilterCount > 0 && (
                <div className="flex flex-wrap gap-2">
                    {filter.type !== 'all' && (
                        <Badge variant="outline" className="flex items-center gap-1">
                            Type: {filter.type}
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-4 w-4 p-0 ml-1"
                                onClick={() => handleTypeChange('all')}
                            >
                                <X className="h-3 w-3" />
                            </Button>
                        </Badge>
                    )}

                    {filter.productId && (
                        <Badge variant="outline" className="flex items-center gap-1">
                            Product: {productOptions.find(p => p.id === filter.productId)?.name || filter.productId}
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-4 w-4 p-0 ml-1"
                                onClick={() => handleProductChange('all')}
                            >
                                <X className="h-3 w-3" />
                            </Button>
                        </Badge>
                    )}
                </div>
            )}
        </div>
    )
}