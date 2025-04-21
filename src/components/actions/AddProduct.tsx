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
import { useProductStore } from "@/stores/productStore"
import { type ProductFormValues } from "@/lib/schemas/product"
import { ProductForm } from "@/components/forms/ProductForm"

function AddProductForm({ onSuccess }: { onSuccess: () => void }) {
    const addProduct = useProductStore((state) => state.addProduct)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = (data: ProductFormValues) => {
        setIsSubmitting(true)

        try {
            // Add the product to the store
            addProduct(data)

            // Show success message
            toast.success("Product added successfully")

            // Call the success callback
            onSuccess()
        } catch (error) {
            console.error("Error adding product:", error)
            toast.error("Failed to add product")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <ProductForm
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            submitLabel="Add Product"
        />
    )
}

export function AddProduct() {
    const [isOpen, setIsOpen] = useState(false)

    const handleSuccess = () => {
        setIsOpen(false)
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button className="flex items-center gap-2" onClick={() => setIsOpen(true)}>
                    <Plus className="h-4 w-4" />
                    Add Item
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add New Product</DialogTitle>
                </DialogHeader>
                <AddProductForm onSuccess={handleSuccess} />
            </DialogContent>
        </Dialog>
    )
}