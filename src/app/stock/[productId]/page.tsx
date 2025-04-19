import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Edit, ArrowLeft, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger
} from "@/components/ui/tabs"
import { useProductStore } from "@/stores/productStore"
import { EditProduct } from "@/components/actions/EditProduct"
import { Badge } from "@/components/ui/badge"
import type { ProductWithPosition } from "@/lib/types/product"

export default function ProductDetailPage() {
    const { productId } = useParams<{ productId: string }>()
    const navigate = useNavigate()
    const [product, setProduct] = useState<ProductWithPosition | null>(null)
    const [isEditOpen, setIsEditOpen] = useState(false)

    // Get products array directly instead of the function
    const products = useProductStore((state) => state.products)
    const deleteProduct = useProductStore((state) => state.deleteProduct)

    // Use products array directly in the effect
    useEffect(() => {
        if (!productId) return

        const id = parseInt(productId, 10)
        const foundProduct = products.find(p => p.id === id)

        if (foundProduct) {
            setProduct(foundProduct)
        } else {
            navigate("/stock")
        }
    }, [productId, products, navigate])

    // Handle deletion with confirmation
    const handleDelete = () => {
        if (!product) return

        if (window.confirm(`Are you sure you want to delete ${product.name}?`)) {
            deleteProduct(product.id)
            navigate("/stock")
        }
    }

    // Render loading state if product isn't loaded yet
    if (!product) {
        return (
            <div className="p-6">
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => navigate("/stock")}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back
                    </Button>
                </div>
                <div className="mt-8 flex justify-center">
                    <p>Loading product details...</p>
                </div>
            </div>
        )
    }

    // Helper function to determine stock status and color
    const getStockStatus = () => {
        const percent = product.position.current_amount_percent
        const threshold = product.position.low_stock_threshold_percent

        if (percent <= threshold) {
            return { label: "Low Stock", color: "bg-red-100 text-red-800 border-red-300" }
        } else if (percent <= threshold * 1.5) {
            return { label: "Medium Stock", color: "bg-yellow-100 text-yellow-800 border-yellow-300" }
        } else {
            return { label: "In Stock", color: "bg-green-100 text-green-800 border-green-300" }
        }
    }

    const stockStatus = getStockStatus()

    return (
        <div className="p-6 space-y-6">
            {/* Header with navigation and actions */}
            <div className="flex items-center justify-between">
                <Button variant="outline" size="sm" onClick={() => navigate("/stock")}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Inventory
                </Button>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsEditOpen(true)}
                    >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={handleDelete}
                    >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                    </Button>
                </div>
            </div>

            {/* Product details */}
            <div>
                <h1 className="text-3xl font-bold">{product.name}</h1>
                <div className="flex items-center gap-3 mt-2">
                    <Badge className={stockStatus.color}>
                        {stockStatus.label}
                    </Badge>
                    <span className="text-sm text-gray-500">
            ID: {product.id}
          </span>
                </div>
            </div>

            {/* Tabs for different sections */}
            <Tabs defaultValue="details" className="w-full">
                <TabsList>
                    <TabsTrigger value="details">Details</TabsTrigger>
                    <TabsTrigger value="position">Position</TabsTrigger>
                    <TabsTrigger value="history">History</TabsTrigger>
                </TabsList>

                {/* Details tab */}
                <TabsContent value="details" className="mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Product Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <h4 className="text-sm font-medium text-gray-500">Price</h4>
                                    <p className="text-2xl font-bold">${product.price.toFixed(2)}</p>
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-gray-500">Organization ID</h4>
                                    <p>{product.organization_id}</p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Inventory Status</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex flex-col gap-2">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-medium text-gray-500">Current Stock</span>
                                        <span className="font-medium">{product.position.current_amount_percent}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                                        <div
                                            className={`h-2.5 rounded-full ${
                                                product.position.current_amount_percent <= product.position.low_stock_threshold_percent
                                                    ? 'bg-red-500'
                                                    : product.position.current_amount_percent <= product.position.low_stock_threshold_percent * 1.5
                                                        ? 'bg-yellow-500'
                                                        : 'bg-green-500'
                                            }`}
                                            style={{ width: `${product.position.current_amount_percent}%` }}
                                        ></div>
                                    </div>
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-gray-500">Low Stock Threshold</h4>
                                    <p>{product.position.low_stock_threshold_percent}%</p>
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-gray-500">Maximum Capacity</h4>
                                    <p>{product.position.max_current_product_capacity} units</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Position tab */}
                <TabsContent value="position" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Shelf Position</CardTitle>
                            <CardDescription>Physical location in the warehouse</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <h4 className="text-sm font-medium text-gray-500">Shelf ID</h4>
                                    <p className="text-lg">{product.position.shelf_id}</p>
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-gray-500">Position</h4>
                                    <p className="text-lg">Row {product.position.row}, Column {product.position.column}</p>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <p className="text-sm text-gray-500">
                                Position can be updated in the edit form
                            </p>
                        </CardFooter>
                    </Card>
                </TabsContent>

                {/* History tab - placeholder for future functionality */}
                <TabsContent value="history" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Activity History</CardTitle>
                            <CardDescription>Recent changes to this product</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-gray-500 italic">History tracking will be implemented in a future update.</p>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Edit modal */}
            {isEditOpen && (
                <EditProduct
                    product={product}
                    isOpen={isEditOpen}
                    onClose={() => setIsEditOpen(false)}
                    onSuccess={(updatedProduct) => {
                        setProduct(updatedProduct)
                        setIsEditOpen(false)
                    }}
                />
            )}
        </div>
    )
}