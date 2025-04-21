import { useState } from "react"
import { Button } from "@/components/ui/button"
import { mockProductService } from "@/lib/services/mockProductService"
import { toast } from "sonner"
import type { Product } from "@/lib/types/product"

interface DeleteFormProps {
    product: Product
    onCancel: () => void
    onSuccess: () => void
}

export function DeleteForm({ product, onCancel, onSuccess }: DeleteFormProps) {
    const [isDeleting, setIsDeleting] = useState(false)

    const handleDelete = async () => {
        setIsDeleting(true)

        try {
            // Call the service to delete
            await mockProductService.deleteProduct(product.id)
            // Toast is now handled by the service call or the parent component
            // toast.success(`${product.name} byl smazán`); 
            onSuccess() // Call success callback
        } catch (error: any) {
            console.error("Chyba při mazání produktu:", error)
            toast.error(error.message || "Nepodařilo se smazat produkt")
            // Optionally call onCancel or keep dialog open on error?
        } finally {
            setIsDeleting(false)
        }
    }

    return (
        <div className="space-y-4">
            <p className="text-center">
                Opravdu si přejete smazat <span className="font-bold">{product.name}</span>?
            </p>
            <p className="text-center text-muted-foreground text-sm">
                Tato akce nemůže být vrácena.
            </p>

            <div className="flex justify-end gap-2 pt-2">
                <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                    disabled={isDeleting}
                >
                    Zrušit
                </Button>
                <Button
                    type="button"
                    variant="destructive"
                    onClick={handleDelete}
                    disabled={isDeleting}
                >
                    {isDeleting ? "Mazání..." : "Smazat"}
                </Button>
            </div>
        </div>
    )
}