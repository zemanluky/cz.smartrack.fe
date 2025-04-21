import { useState } from "react"
import { Edit } from "lucide-react"
import { Button } from "@/components/ui/button"
import { EditProduct } from "./EditProduct"
import type { ProductWithPosition } from "@/lib/types/product"

interface EditProductButtonProps {
    product: ProductWithPosition
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
    size?: "default" | "sm" | "lg" | "icon"
    className?: string
    onProductUpdate?: (updatedProduct: ProductWithPosition) => void
    id?: string // Added ID prop for reference
}

export function EditProductButton({
                                      product,
                                      variant = "outline",
                                      size = "sm",
                                      className = "",
                                      onProductUpdate,
                                      id
                                  }: EditProductButtonProps) {
    const [isEditOpen, setIsEditOpen] = useState(false)

    const handleSuccess = (updatedProduct: ProductWithPosition) => {
        setIsEditOpen(false)

        // If a callback was provided, call it with the updated product
        if (onProductUpdate) {
            onProductUpdate(updatedProduct)
        }
    }

    return (
        <>
            <Button
                id={id}
                variant={variant}
                size={size}
                className={className}
                onClick={() => setIsEditOpen(true)}
            >
                <Edit className="h-4 w-4 mr-2" />
                Edit
            </Button>

            {isEditOpen && (
                <EditProduct
                    product={product}
                    isOpen={isEditOpen}
                    onClose={() => setIsEditOpen(false)}
                    onSuccess={handleSuccess}
                />
            )}
        </>
    )
}