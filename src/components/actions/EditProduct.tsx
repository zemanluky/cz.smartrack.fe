import { useState } from "react"
import { toast } from "sonner"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { useProductStore } from "@/stores/productStore"
import { type ProductFormValues } from "@/lib/schemas/product"
import { ProductForm } from "@/components/forms/ProductForm"
import type { ProductWithPosition } from "@/lib/types/product"

interface EditProductProps {
    product: ProductWithPosition
    isOpen: boolean
    onClose: () => void
    onSuccess: (updatedProduct: ProductWithPosition) => void
}

export function EditProduct({ product, isOpen, onClose, onSuccess }: EditProductProps) {
    const updateProduct = useProductStore((state) => state.updateProduct)
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Create default form values from the existing product
    const defaultValues: ProductFormValues = {
        name: product.name,
        price: product.price,
        position_type: 'manual', // We default to manual
        shelf_position: {
            shelf_id: product.position.shelf_id,
            row: product.position.row,
            column: product.position.column,
            low_stock_threshold_percent: product.position.low_stock_threshold_percent,
            max_current_product_capacity: product.position.max_current_product_capacity
        }
    }

    const handleSubmit = (data: ProductFormValues) => {
        setIsSubmitting(true)

        try {
            // Create the updated product data
            const updatedProduct: ProductWithPosition = {
                ...product, // Keep existing fields like ID
                name: data.name,
                price: data.price,
                position: {
                    ...product.position,
                    shelf_id: data.shelf_position.shelf_id,
                    row: data.shelf_position.row,
                    column: data.shelf_position.column,
                    low_stock_threshold_percent: data.shelf_position.low_stock_threshold_percent,
                    max_current_product_capacity: data.shelf_position.max_current_product_capacity,
                    // This value comes from outside the schema, but we added it in the form
                    current_amount_percent: data.current_amount_percent as unknown as number ||
                        product.position.current_amount_percent
                }
            }

            // Update the product in the store
            updateProduct(product.id, updatedProduct)

            // Show success message
            toast.success("Product updated successfully")

            // Call the success callback with the updated product
            onSuccess(updatedProduct)
        } catch (error) {
            console.error("Error updating product:", error)
            toast.error("Failed to update product")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Edit Product</DialogTitle>
                </DialogHeader>

                <ProductForm
                    defaultValues={defaultValues}
                    product={product}
                    onSubmit={handleSubmit}
                    onCancel={onClose}
                    isSubmitting={isSubmitting}
                    submitLabel="Save Changes"
                    showCancelButton={true}
                />
            </DialogContent>
        </Dialog>
    )
}