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
import type { Product } from "@/lib/types/product"

interface DeleteProductButtonProps {
    product: Product
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
    size?: "default" | "sm" | "lg" | "icon"
    className?: string
    onDeleteSuccess?: () => void
}

export function DeleteProductButton({
                                        product,
                                        variant = "outline",
                                        size = "sm",
                                        className = "",
                                        onDeleteSuccess
                                    }: DeleteProductButtonProps) {
    const [isOpen, setIsOpen] = useState(false)

    const handleSuccess = () => {
        setIsOpen(false)
        if (onDeleteSuccess) {
            onDeleteSuccess()
        }
    }

    return (
        <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
            <Button
                variant={variant}
                size={size}
                className={`${className} text-red-500 hover:text-red-700 hover:bg-red-50`}
                onClick={() => setIsOpen(true)}
                aria-label="Odstranit produkt"
            >
                <Trash2 className="h-4 w-4 mr-2" />
                Odstranit
            </Button>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Odstranit produkt?</AlertDialogTitle>
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