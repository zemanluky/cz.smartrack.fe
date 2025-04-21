import { useState, useEffect } from "react"
import { toast } from "sonner"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { mockProductService } from "@/lib/services/mockProductService"
import { type ProductFormData } from "@/lib/schemas/product"
import type { Product, MockUpdateProductDTO, MockCreateProductDTO } from "@/lib/types/product"
import { ProductForm } from "@/components/forms/ProductForm"

interface EditProductProps {
    product: Product
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
}

// Helper to prepare form defaults from Product
const prepareEditDefaults = (product: Product): Partial<ProductFormData> => {
    return {
        name: product.name,
        price: product.price,
        quantity: product.quantity,
        low_stock_threshold: product.low_stock_threshold,
        positionType: product.position_type || 'manual', // Default if undefined
        shelf_position: product.shelf_position ? {
            shelf_id: product.shelf_position.shelf_id,
            row: product.shelf_position.row,
            column: product.shelf_position.column,
        } : { shelf_id: undefined, row: undefined, column: undefined }
    }
}

export function EditProduct({ product, isOpen, onClose, onSuccess }: EditProductProps) {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [defaultValues, setDefaultValues] = useState<Partial<ProductFormData>>(() => prepareEditDefaults(product))

    // Update defaults if the product prop changes (e.g., parent re-renders with new data)
    useEffect(() => {
        setDefaultValues(prepareEditDefaults(product))
    }, [product])

    // This handler receives the DTO from ProductForm
    const handleDtoSubmit = async (dtoData: MockCreateProductDTO | MockUpdateProductDTO) => {
        // Type guard to ensure it's an update DTO (or handle create if needed)
        // For simplicity, we'll assume ProductForm correctly prepares MockUpdateProductDTO here
        const updateDto = dtoData as MockUpdateProductDTO
        
        setIsSubmitting(true)
        try {
            // Call the service to update
            await mockProductService.updateProduct(product.id, updateDto)
            toast.success("Produkt úspěšně upraven")
            onSuccess() // Call the success callback
        } catch (error: any) {
            console.error("Chyba při úpravě produktu:", error)
            toast.error(error.message || "Nepodařilo se upravit produkt")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Upravit produkt</DialogTitle>
                </DialogHeader>
                <ProductForm
                    key={product.id} // Add key to force re-mount if product changes
                    defaultValues={defaultValues}
                    product={product} // Pass original product for context if needed by form
                    onSubmit={handleDtoSubmit}
                    onCancel={onClose}
                    isSubmitting={isSubmitting}
                    submitLabel="Uložit změny"
                    showCancelButton={true}
                />
            </DialogContent>
        </Dialog>
    )
}