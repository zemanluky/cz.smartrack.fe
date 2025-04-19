import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
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
import { useProductStore } from "@/stores/productStore"
import { productFormSchema, type ProductFormValues } from "@/lib/schemas/product"
import type { ProductWithPosition } from "@/lib/types/product"
import { NFCScanner } from "@/components/nfc/NFCScanner"

interface EditProductProps {
    product: ProductWithPosition
    isOpen: boolean
    onClose: () => void
    onSuccess: (updatedProduct: ProductWithPosition) => void
}

export function EditProduct({ product, isOpen, onClose, onSuccess }: EditProductProps) {
    const updateProduct = useProductStore((state) => state.updateProduct)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [priceInput, setPriceInput] = useState(product.price.toString())

    // Create default values from the product
    const defaultValues: ProductFormValues = {
        name: product.name,
        price: product.price,
        position_type: 'manual' as const, // We'll default to manual
        shelf_position: {
            shelf_id: product.position.shelf_id,
            row: product.position.row,
            column: product.position.column,
            low_stock_threshold_percent: product.position.low_stock_threshold_percent,
            max_current_product_capacity: product.position.max_current_product_capacity
        }
    }

    // @ts-ignore - Ignore TypeScript errors for resolver
    const form = useForm({
        resolver: zodResolver(productFormSchema),
        defaultValues
    })

    // Get current position type to determine what to display
    const positionType = form.watch("position_type")
    const currentRow = form.watch("shelf_position.row")
    const currentColumn = form.watch("shelf_position.column")

    function onSubmit(data: any) {
        console.log("Form submitted with data:", data);
        setIsSubmitting(true);

        try {
            // Create the updated product
            const updatedProduct: ProductWithPosition = {
                ...product, // Keep existing fields like ID
                name: data.name,
                price: parseFloat(priceInput) || product.price,
                position: {
                    ...product.position,
                    shelf_id: data.shelf_position.shelf_id,
                    row: data.shelf_position.row,
                    column: data.shelf_position.column,
                    low_stock_threshold_percent: data.shelf_position.low_stock_threshold_percent,
                    max_current_product_capacity: data.shelf_position.max_current_product_capacity,
                }
            };

            // Update the product in the store
            // @ts-ignore - Ignore type checking
            updateProduct(product.id, updatedProduct);

            // Show success message
            toast.success("Product updated successfully");

            // Call the success callback with the updated product
            onSuccess(updatedProduct);
        } catch (error) {
            console.error("Error updating product:", error);
            toast.error("Failed to update product");
        } finally {
            setIsSubmitting(false);
        }
    }

    // Handle price input change
    const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;

        // Only allow digits and at most one decimal point
        if (/^(\d*\.?\d{0,2})?$/.test(value)) {
            setPriceInput(value);

            // Update the form value if we have a valid number
            if (value === "" || value === ".") {
                form.setValue("price", 0);
            } else {
                form.setValue("price", parseFloat(value));
            }
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Edit Product</DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        {/* Position Type */}
                        <FormField
                            control={form.control}
                            name="position_type"
                            render={({ field, fieldState, formState }: any) => (
                                <FormItem>
                                    <FormLabel>Position Type</FormLabel>
                                    <Select
                                        onValueChange={(value) => {
                                            field.onChange(value);
                                            if (value === 'nfc') {
                                                // Reset position when switching to NFC
                                                form.setValue("shelf_position.row", 0);
                                                form.setValue("shelf_position.column", 0);
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

                        {/* Position options based on position type */}
                        {positionType === 'manual' ? (
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="shelf_position.row"
                                    render={({ field, fieldState, formState }: any) => (
                                        <FormItem>
                                            <FormLabel>Row</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    {...field}
                                                    onChange={(e) => {
                                                        const value = e.target.value === "" ? 0 : parseInt(e.target.value, 10);
                                                        field.onChange(value);
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
                                    render={({ field, fieldState, formState }: any) => (
                                        <FormItem>
                                            <FormLabel>Column</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    {...field}
                                                    onChange={(e) => {
                                                        const value = e.target.value === "" ? 0 : parseInt(e.target.value, 10);
                                                        field.onChange(value);
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
                            render={({ field, fieldState, formState }: any) => (
                                <FormItem>
                                    <FormLabel>Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Product name" {...field} />
                                    </FormControl>
                                    <FormDescription>
                                        Use only basic ASCII characters
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Product Price */}
                        <FormField
                            control={form.control}
                            name="price"
                            render={({ field, fieldState, formState }: any) => (
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

                        {/* Low stock threshold */}
                        <FormField
                            control={form.control}
                            name="shelf_position.low_stock_threshold_percent"
                            render={({ field, fieldState, formState }: any) => (
                                <FormItem>
                                    <FormLabel>Low Stock Threshold (%)</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            min="0"
                                            max="100"
                                            {...field}
                                            onChange={(e) => {
                                                const value = e.target.value === "" ? 0 : parseInt(e.target.value, 10);
                                                field.onChange(value);
                                            }}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Stock capacity */}
                        <FormField
                            control={form.control}
                            name="shelf_position.max_current_product_capacity"
                            render={({ field, fieldState, formState }: any) => (
                                <FormItem>
                                    <FormLabel>Maximum Capacity</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            min="1"
                                            {...field}
                                            onChange={(e) => {
                                                const value = e.target.value === "" ? 1 : parseInt(e.target.value, 10);
                                                field.onChange(value);
                                            }}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Current stock level - optional, only in edit form */}
                        <FormItem>
                            <FormLabel>Current Stock Level (%)</FormLabel>
                            <FormControl>
                                <Input
                                    type="number"
                                    min="0"
                                    max="100"
                                    defaultValue={product.position.current_amount_percent}
                                    onChange={(e) => {
                                        const value = e.target.value === "" ? 0 : parseInt(e.target.value, 10);
                                        // Use direct assignment for this field since it's not part of the form schema
                                        form.setValue("current_amount_percent", value);
                                    }}
                                />
                            </FormControl>
                            <FormDescription>
                                Current stock level as percentage of maximum capacity
                            </FormDescription>
                        </FormItem>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={onClose}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? "Saving..." : "Save Changes"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}