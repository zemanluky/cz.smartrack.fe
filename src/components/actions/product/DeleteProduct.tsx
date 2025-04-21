import { useState } from "react"
import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { DeleteForm } from "@/components/forms/DeleteForm"
import { useNavigate } from "react-router-dom"
import type { Product } from "@/lib/types/product"

interface DeleteProductProps {
    product: Product
    redirectToStock?: boolean
    onDeleteSuccess?: () => void
}

export function DeleteProduct({ product, redirectToStock = false, onDeleteSuccess }: DeleteProductProps) {
    const [isOpen, setIsOpen] = useState(false)
    const navigate = useNavigate()

    const handleSuccess = () => {
        setIsOpen(false)

        if (onDeleteSuccess) {
            onDeleteSuccess()
        }

        if (redirectToStock) {
            navigate("/stock")
        }
    }

    return (
        <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
            <AlertDialogTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="hover:bg-destructive/20 hover:text-destructive h-8 w-8 p-0"
                    aria-label="Odstranit produkt"
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
            </AlertDialogTrigger>
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