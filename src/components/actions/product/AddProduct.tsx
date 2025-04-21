import { useState } from "react"
import { Plus } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { mockProductService } from "@/lib/services/mockProductService"
import type { MockCreateProductDTO, MockUpdateProductDTO } from "@/lib/types/product"
import { ProductForm } from "@/components/forms/ProductForm"

interface AddProductFormProps {
    onSuccess: () => void
}

function AddProductForm({ onSuccess }: AddProductFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleDtoSubmit = async (dtoData: MockCreateProductDTO | MockUpdateProductDTO) => {
        if (!dtoData || typeof dtoData !== 'object' || !('name' in dtoData) || !('price' in dtoData)) {
            console.error("Invalid data received by AddProductForm handler:", dtoData)
            toast.error("Nastala neočekávaná chyba.")
            return
        }
        const createDto = dtoData as MockCreateProductDTO

        setIsSubmitting(true)
        try {
            await mockProductService.createProduct(createDto)
            toast.success("Produkt úspěšně přidán")
            onSuccess()
        } catch (error: any) {
            console.error("Chyba při přidávání produktu:", error)
            toast.error(error.message || "Nepodařilo se přidat produkt")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <ProductForm
            onSubmit={handleDtoSubmit}
            isSubmitting={isSubmitting}
            submitLabel="Přidat produkt"
            defaultValues={{
                name: "",
                price: undefined,
                quantity: undefined,
                low_stock_threshold: undefined,
                positionType: 'manual',
                shelf_position: { shelf_id: undefined, row: undefined, column: undefined }
            }}
        />
    )
}

interface AddProductProps {
    onAddSuccess?: () => void
}

export function AddProduct({ onAddSuccess }: AddProductProps) {
    const [isOpen, setIsOpen] = useState(false)

    const handleSuccess = () => {
        setIsOpen(false)
        if (onAddSuccess) {
            onAddSuccess()
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button className="flex items-center gap-2" onClick={() => setIsOpen(true)}>
                    <Plus className="h-4 w-4" />
                    Naskladnit zboží
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Naskladnit nové zboží</DialogTitle>
                </DialogHeader>
                <AddProductForm onSuccess={handleSuccess} />
            </DialogContent>
        </Dialog>
    )
}