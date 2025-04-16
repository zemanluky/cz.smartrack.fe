import { useState } from "react"
import { Plus } from "lucide-react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
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
import { NFCScanner } from "@/components/nfc/NFCScanner"

function AddProductForm({ onSuccess }: { onSuccess: () => void }) {
    const addProduct = useProductStore((state) => state.addProduct)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [priceInput, setPriceInput] = useState("")

    const form = useForm<ProductFormValues>({
        resolver: zodResolver(productFormSchema) as any,
        defaultValues: {
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

    // Get current position type to determine what to display
    const positionType = form.watch("position_type")
    const currentRow = form.watch("shelf_position.row")
    const currentColumn = form.watch("shelf_position.column")

    function onSubmit(data: ProductFormValues) {
        console.log("Form submitted with data:", data);
        setIsSubmitting(true);

        try {
            // Make sure we have a valid price (defaulting to 0 if conversion fails)
            const formattedData = {
                ...data,
                price: parseFloat(priceInput) || 0,
                shelf_position: {
                    ...data.shelf_position,
                    max_current_product_capacity: 100 // Always set to 100
                }
            };

            // Add the product to the store
            addProduct(formattedData);

            // Show success message
            toast.success("Product added successfully");

            // Reset form and string input
            form.reset();
            setPriceInput("");
            onSuccess();
        } catch (error) {
            console.error("Error adding product:", error);
            toast.error("Failed to add product");
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
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Position Type at the top */}
                <FormField
                    control={form.control}
                    name="position_type"
                    render={({ field }) => (
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

                {/* Position options immediately after position type */}
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
                            render={({ field }) => (
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
                    <NFCScanner
                        setValue={form.setValue}
                        currentRow={currentRow}
                        currentColumn={currentColumn}
                    />
                )}

                {/* Product details after position */}
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
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
                                        const value = e.target.value === "" ? 0 : parseInt(e.target.value, 10);
                                        field.onChange(value);
                                    }}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Hidden input for capacity */}
                <input
                    type="hidden"
                    name="shelf_position.max_current_product_capacity"
                    value="100"
                />

                <Button
                    type="submit"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? "Adding..." : "Add Product"}
                </Button>
            </form>
        </Form>
    )
}

export function AddProduct() {
    const [isOpen, setIsOpen] = useState(false)

    const handleSuccess = () => {
        setIsOpen(false)
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button className="flex items-center gap-2" onClick={() => setIsOpen(true)}>
                    <Plus className="h-4 w-4" />
                    Add Item
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add New Product</DialogTitle>
                </DialogHeader>
                <AddProductForm onSuccess={handleSuccess} />
            </DialogContent>
        </Dialog>
    )
}