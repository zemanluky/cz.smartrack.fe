import { useState } from "react"
import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { DeleteForm } from "@/components/forms/DeleteForm"
import { useNavigate } from "react-router-dom"
import type { ProductWithPosition } from "@/lib/types/product"

interface DeleteProductButtonProps {
    product: ProductWithPosition
    redirectToStock?: boolean
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
    size?: "default" | "sm" | "lg" | "icon"
    className?: string
}

export function DeleteProductButton({
                                        product,
                                        redirectToStock = false,
                                        variant = "outline",
                                        size = "sm",
                                        className = ""
                                    }: DeleteProductButtonProps) {
    const [isOpen, setIsOpen] = useState(false)
    const navigate = useNavigate()

    const handleSuccess = () => {
        setIsOpen(false)

        // Redirect to stock page if requested
        if (redirectToStock) {
            navigate("/stock")
        }
    }

    return (
        <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
            <Button
                variant={variant}
                size={size}
                className={`${className} text-red-500 hover:text-red-700 hover:bg-red-50`}
                onClick={() => setIsOpen(true)}
            >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
            </Button>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Delete Product</AlertDialogTitle>
                </AlertDialogHeader>

                <DeleteForm
                    product={product}
                    onCancel={() => setIsOpen(false)}
                    onSuccess={handleSuccess}
                />
            </AlertDialogContent>
        </AlertDialog>
    )
}