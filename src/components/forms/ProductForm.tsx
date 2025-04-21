import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { NFCScanner } from "@/components/nfc/NFCScanner"
import { productFormSchema, type ProductFormValues } from "@/lib/schemas/product"
import type { ProductWithPosition } from "@/lib/types/product"

interface ProductFormProps {
    defaultValues?: Partial<ProductFormValues>
    product?: ProductWithPosition
    onSubmit: (data: ProductFormValues) => void
    onCancel?: () => void
    isSubmitting: boolean
    submitLabel?: string
    showCancelButton?: boolean
}

export function ProductForm({
                                defaultValues,
                                product,
                                onSubmit,
                                onCancel,
                                isSubmitting,
                                submitLabel = "Submit",
                                showCancelButton = false
                            }: ProductFormProps) {
    const [priceInput, setPriceInput] = useState("")
    const [nameInput, setNameInput] = useState("")
    const [nameError, setNameError] = useState("")

    // Initialize the form with default values
    // @ts-ignore - Ignore TypeScript errors for resolver
    const form = useForm({
        resolver: zodResolver(productFormSchema),
        defaultValues: defaultValues || {
            name: "",
            price: 0,
            position_type: 'manual',
            shelf_position: {
                shelf_id: 1,
                row: 1,
                column: 1,
                low_stock_threshold_percent: 20,
                max_current_product_capacity: 100
            }
        }
    })

    // Initialize controlled inputs when we have a product (for edit mode)
    useEffect(() => {
        if (product) {
            setPriceInput(product.price.toString())
            setNameInput(product.name)
        }
    }, [product])

    // Get current position type to determine what to display
    const positionType = form.watch("position_type")
    const currentRow = form.watch("shelf_position.row")
    const currentColumn = form.watch("shelf_position.column")

    const handleFormSubmit = (data: any) => {
        // Create the final form data with properly formatted values
        const formattedData = {
            ...data,
            price: parseFloat(priceInput) || 0,
        }

        onSubmit(formattedData)
    }

    // Handle price input change with ESP limit (4 digits, exactly 2 decimal places)
    const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value

        // Only allow up to 4 digits before decimal point, decimal point, and up to 2 decimal places
        if (/^(\d{0,4}\.?\d{0,2})$/.test(value)) {
            setPriceInput(value)

            // Update the form value if we have a valid number
            if (value === "" || value === ".") {
                form.setValue("price", 0)
            } else {
                form.setValue("price", parseFloat(value))
            }
        }
    }

    // Handle name input change with validation
    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        setNameInput(value)

        // Validate name - 2-32 basic ASCII characters
        if (!/^[\x20-\x7F]{2,32}$/.test(value) && value.length > 0) {
            if (value.length < 2) {
                setNameError("Name must be at least 2 characters")
            } else if (value.length > 32) {
                setNameError("Name cannot exceed 32 characters")
            } else {
                setNameError("Only basic ASCII characters are allowed")
            }
        } else {
            setNameError("")
        }

        form.setValue("name", value)
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
                {/* Position Type */}
                <FormField
                    control={form.control}
                    name="position_type"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Position Type</FormLabel>
                            <Select
                                onValueChange={(value) => {
                                    field.onChange(value)
                                    if (value === 'nfc') {
                                        // Reset position when switching to NFC
                                        form.setValue("shelf_position.row", 0)
                                        form.setValue("shelf_position.column", 0)
                                    }
                                }}
                                defaultValue={field.value}
                            >
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select position type" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="nfc">NFC Tag</SelectItem>
                                    <SelectItem value="manual">Manual</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Position options depending on position type */}
                {positionType === 'manual' ? (
                    <div className="grid grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="shelf_position.row"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Row</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            min="0"
                                            {...field}
                                            onChange={(e) => {
                                                const value = e.target.value === "" ? 0 : parseInt(e.target.value, 10)
                                                field.onChange(value)
                                            }}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="shelf_position.column"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Column</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            min="0"
                                            {...field}
                                            onChange={(e) => {
                                                const value = e.target.value === "" ? 0 : parseInt(e.target.value, 10)
                                                field.onChange(value)
                                            }}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                ) : (
                    // @ts-ignore
                    <NFCScanner
                        setValue={form.setValue}
                        currentRow={currentRow}
                        currentColumn={currentColumn}
                    />
                )}

                {/* Product Name */}
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="Product name"
                                    value={nameInput}
                                    onChange={handleNameChange}
                                />
                            </FormControl>
                            <FormDescription>
                                2-32 basic ASCII characters
                            </FormDescription>
                            {nameError && (
                                <p className="text-sm text-red-500">{nameError}</p>
                            )}
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Product Price */}
                <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Price</FormLabel>
                            <FormControl>
                                <Input
                                    type="text"
                                    placeholder="0.00"
                                    value={priceInput}
                                    onChange={handlePriceChange}
                                />
                            </FormControl>
                            <FormDescription>
                                Format: XXXX.XX (max 9999.99)
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Low Stock Threshold */}
                <FormField
                    control={form.control}
                    name="shelf_position.low_stock_threshold_percent"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Low Stock Threshold (%)</FormLabel>
                            <FormControl>
                                <Input
                                    type="number"
                                    min="0"
                                    max="100"
                                    {...field}
                                    onChange={(e) => {
                                        const value = e.target.value === "" ? 0 : parseInt(e.target.value, 10)
                                        field.onChange(value)
                                    }}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Max Capacity - only shown in edit mode */}
                {product && (
                    <FormField
                        control={form.control}
                        name="shelf_position.max_current_product_capacity"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Maximum Capacity</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        min="1"
                                        {...field}
                                        onChange={(e) => {
                                            const value = e.target.value === "" ? 1 : parseInt(e.target.value, 10)
                                            field.onChange(value)
                                        }}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                )}

                {/* Current Stock - only shown in edit mode */}
                {product && (
                    <FormItem>
                        <FormLabel>Current Stock Level (%)</FormLabel>
                        <FormControl>
                            <Input
                                type="number"
                                min="0"
                                max="100"
                                defaultValue={product.position.current_amount_percent}
                                onChange={(e) => {
                                    const value = e.target.value === "" ? 0 : parseInt(e.target.value, 10)
                                    // Use direct assignment for this field since it's not part of the form schema
                                    form.setValue("current_amount_percent", value)
                                }}
                            />
                        </FormControl>
                        <FormDescription>
                            Current stock level as percentage of maximum capacity
                        </FormDescription>
                    </FormItem>
                )}

                {/* Hidden input for capacity in add mode */}
                {!product && (
                    <input
                        type="hidden"
                        name="shelf_position.max_current_product_capacity"
                        value="100"
                    />
                )}

                {/* Form buttons */}
                <div className="flex justify-end gap-2">
                    {showCancelButton && onCancel && (
                        <Button type="button" variant="outline" onClick={onCancel}>
                            Cancel
                        </Button>
                    )}
                    <Button
                        type="submit"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? "Submitting..." : submitLabel}
                    </Button>
                </div>
            </form>
        </Form>
    )
}