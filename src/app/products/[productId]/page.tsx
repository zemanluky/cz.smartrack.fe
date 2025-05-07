import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger
} from "@/components/ui/tabs"
import { mockProductService } from "@/lib/services/mockProductService"
import { Badge } from "@/components/ui/badge"
import { EditProductButton } from "@/components/actions/product/EditProductButton"
import { ProductActivityLog } from "@/components/logs/ProductActivityLog"
import type { Product } from "@/lib/types/product"
import { DeleteProductButton } from "@/components/actions/product/DeleteProductButton"
import { toast } from 'sonner'
import { formatCurrency } from "@/lib/utils/format"
import { cn } from "@/lib/utils/format"

export default function ProductDetailPage() {
    const { productId } = useParams<{ productId: string }>()
    const navigate = useNavigate()
    const [product, setProduct] = useState<Product | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!productId) {
            setError("Invalid Product ID")
            setIsLoading(false)
            return
        }
        const id = parseInt(productId, 10)
        if (isNaN(id)) {
            setError("Invalid Product ID format")
            setIsLoading(false)
            return
        }

        const fetchProduct = async () => {
            setIsLoading(true)
            setError(null)
            try {
                const foundProduct = await mockProductService.getProductById(id)
                if (foundProduct) {
                    setProduct(foundProduct)
                } else {
                    setError("Produkt nenalezen.")
                    toast.error("Produkt nenalezen.")
                }
            } catch (err) {
                console.error("Failed to fetch product:", err)
                setError("Nepodařilo se načíst detail produktu.")
                toast.error("Nepodařilo se načíst detail produktu.")
            } finally {
                setIsLoading(false)
            }
        }

        fetchProduct()
    }, [productId, navigate])

    const handleActionSuccess = () => {
        const id = parseInt(productId!, 10)
        if (!isNaN(id)) {
            const fetchProduct = async () => {
                const updatedProduct = await mockProductService.getProductById(id)
                setProduct(updatedProduct || null)
            }
            fetchProduct()
        }
    }

    const handleDeletionAndNavigate = () => {
        toast.success(`Produkt ${product?.name || ''} smazán.`)
        navigate("/stock")
    }

    if (isLoading) {
        return (
            <div className="p-6 text-center">Načítání detailu produktu...</div>
        )
    }
    if (error) {
        return (
            <div className="p-6">
                <Button variant="outline" size="sm" onClick={() => navigate("/stock")}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Zpět do skladu
                </Button>
                <div className="mt-8 text-center text-red-600">{error}</div>
            </div>
        )
    }
    if (!product) {
        return <div className="p-6 text-center">Produkt nebyl nalezen.</div>
    }

    const getStockStatus = () => {
        const quantity = product.quantity
        const threshold = product.low_stock_threshold

        if (quantity === undefined || threshold === undefined) {
            return { label: "Neznámý", color: "bg-gray-100 text-gray-800 border-gray-300" }
        }
        if (quantity <= threshold) {
            return { label: "Nízký stav", color: "bg-red-100 text-red-800 border-red-300" }
        } else if (quantity <= threshold * 1.5) {
            return { label: "Dochází", color: "bg-yellow-100 text-yellow-800 border-yellow-300" }
        } else {
            return { label: "Skladem", color: "bg-green-100 text-green-800 border-green-300" }
        }
    }
    const stockStatus = getStockStatus()

    const getStockStatusColorClass = (currentPercent?: number | null, thresholdPercent?: number | null): string => {
        if (currentPercent === undefined || currentPercent === null || thresholdPercent === undefined || thresholdPercent === null) {
            return "bg-gray-400"; // Default color for unknown
        }
        if (currentPercent <= thresholdPercent) {
            return "bg-red-500";
        } else if (currentPercent <= thresholdPercent * 1.5) {
            return "bg-yellow-500";
        } else {
            return "bg-green-500";
        }
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <Button variant="outline" size="sm" onClick={() => navigate("/stock")}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Zpět do skladu
                </Button>
                <div className="flex gap-2">
                    <EditProductButton
                        product={product}
                        onEditSuccess={handleActionSuccess}
                    />
                    <DeleteProductButton
                        product={product}
                        onDeleteSuccess={handleDeletionAndNavigate}
                    />
                </div>
            </div>

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

            <Tabs defaultValue="details" className="w-full">
                <TabsList>
                    <TabsTrigger value="details">Detaily</TabsTrigger>
                    <TabsTrigger value="position">Pozice</TabsTrigger>
                    <TabsTrigger value="history">Historie</TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Informace o produktu</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <h4 className="text-sm font-medium text-gray-500">Cena</h4>
                                    <p className="text-2xl font-bold">{formatCurrency(product.price)}</p>
                                </div>
                                {product.organization_id && (
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-500">Organizace ID</h4>
                                        <p>{product.organization_id}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Stav zásob (%)</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {product.quantity !== undefined && product.quantity !== null ? (
                                    <div className="flex flex-col gap-2">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-medium text-gray-500">Aktuální stav</span>
                                            <span className="font-medium">{product.quantity}%</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                                            <div
                                                className={cn(
                                                    "h-2.5 rounded-full",
                                                    getStockStatusColorClass(product.quantity, product.low_stock_threshold)
                                                )}
                                                style={{ width: `${product.quantity}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-500">Stav zásob není zadán.</p>
                                )}
                                
                                {product.low_stock_threshold !== undefined && product.low_stock_threshold !== null ? (
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-500">Limit nízkého stavu</h4>
                                        <p>{product.low_stock_threshold}%</p>
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-500">Limit není zadán.</p>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="position" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Pozice na regálu</CardTitle>
                            <CardDescription>Fyzická lokace ve skladu</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {product.shelf_position ? (
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-500">Regál ID</h4>
                                        <p>{product.shelf_position.shelf_id}</p>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-500">Řádek</h4>
                                        <p>{product.shelf_position.row}</p>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-500">Sloupec</h4>
                                        <p>{product.shelf_position.column}</p>
                                    </div>
                                    {product.position_type && (
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-500">Typ pozice</h4>
                                            <p className="capitalize">{product.position_type}</p>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <p>Pozice produktu není zadána.</p>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="history" className="mt-6">
                    <ProductActivityLog
                        productId={product.id}
                        showFilters={false}
                    />
                </TabsContent>
            </Tabs>
        </div>
    )
}