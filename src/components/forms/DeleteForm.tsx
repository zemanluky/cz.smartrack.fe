import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useProductStore } from "@/stores/productStore"
import { toast } from "sonner"
import type { ProductWithPosition } from "@/lib/types/product"

interface DeleteFormProps {
    product: ProductWithPosition
    onCancel: () => void
    onSuccess: () => void
}

export function DeleteForm({ product, onCancel, onSuccess }: DeleteFormProps) {
    const deleteProduct = useProductStore((state) => state.deleteProduct)
    const [isDeleting, setIsDeleting] = useState(false)

    const handleDelete = () => {
        setIsDeleting(true)

        try {
            // Delete the product
            deleteProduct(product.id)

            // Show success message
            toast.success(`${product.name} has been deleted`)

            // Call success callback
            onSuccess()
        } catch (error) {
            console.error("Error deleting product:", error)
            toast.error("Failed to delete product")
        } finally {
            setIsDeleting(false)
        }
    }

    return (
        <div className="space-y-4">
            <p className="text-center">
                Are you sure you want to delete <span className="font-bold">{product.name}</span>?
            </p>
            <p className="text-center text-muted-foreground text-sm">
                This action cannot be undone.
            </p>

            <div className="flex justify-end gap-2 pt-2">
                <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                    disabled={isDeleting}
                >
                    Cancel
                </Button>
                <Button
                    type="button"
                    variant="destructive"
                    onClick={handleDelete}
                    disabled={isDeleting}
                >
                    {isDeleting ? "Deleting..." : "Delete"}
                </Button>
            </div>
        </div>
    )
}