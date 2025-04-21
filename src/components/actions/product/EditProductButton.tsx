import { useState } from "react"
import { Edit } from "lucide-react"
import { Button } from "@/components/ui/button"
import { EditProduct } from "./EditProduct"
import type { Product } from "@/lib/types/product"

interface EditProductButtonProps {
    product: Product
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
    size?: "default" | "sm" | "lg" | "icon"
    className?: string
    onEditSuccess?: () => void
    id?: string // Added ID prop for reference
}

export function EditProductButton({
                                      product,
                                      variant = "outline",
                                      size = "sm",
                                      className = "",
                                      onEditSuccess,
                                      id
                                  }: EditProductButtonProps) {
    const [isEditOpen, setIsEditOpen] = useState(false)

    const handleSuccess = () => {
        setIsEditOpen(false)
        if (onEditSuccess) {
            onEditSuccess()
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
                Upravit
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