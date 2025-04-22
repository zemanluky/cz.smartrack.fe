import { useState, useEffect } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { NFCScanner } from "@/components/nfc/NFCScanner"
import { productFormSchema, ProductFormData } from "@/lib/schemas/product"
import type { Product, MockCreateProductDTO, MockUpdateProductDTO } from "@/lib/types/product"
import { mockProductService } from "@/lib/services/mockProductService"
import { toast } from 'sonner'

interface ProductFormProps {
    defaultValues?: Partial<ProductFormData>
    product?: Product
    onSubmit: (data: MockCreateProductDTO | MockUpdateProductDTO) => Promise<void>
    onCancel?: () => void
    isSubmitting: boolean
    submitLabel?: string
    showCancelButton?: boolean
}

export function ProductForm({
    defaultValues,
    product,
    onSubmit,
    onCancel,
    isSubmitting,
    submitLabel = product ? "Update Product" : "Create Product",
    showCancelButton = true
}: ProductFormProps) {
    const [nfcData, setNfcData] = useState<{ shelf_id: number; row: number; column: number } | null>(null)
    const [isScanningNfc, setIsScanningNfc] = useState(false)

    const form = useForm<ProductFormData>({
        resolver: zodResolver(productFormSchema),
        defaultValues: defaultValues || {
            name: "",
            price: undefined,
            quantity: undefined,
            low_stock_threshold: undefined,
            positionType: 'manual',
            shelf_position: {
                shelf_id: undefined,
                row: undefined,
                column: undefined,
            }
        }
    })

    useEffect(() => {
        if (defaultValues) {
            form.reset(defaultValues)
            setNfcData(null)
            if (product?.position_type) {
                form.setValue('positionType', product.position_type)
            }
            if (product?.shelf_position) {
                form.setValue('shelf_position', product.shelf_position)
            }
        }
    }, [defaultValues, product, form])

    const positionType = form.watch("positionType")

    const handleNfcSuccess = (data: { shelf_id: number; row: number; column: number }) => {
        setNfcData(data)
        toast.success('NFC Tag Scanned')
        setIsScanningNfc(false)
    }
    const handleNfcError = (error: string) => {
        toast.error(`NFC Scan Failed: ${error}`)
        setIsScanningNfc(false)
    }
    const handleNfcScanTrigger = () => {
        setIsScanningNfc(true)
    }

    const handleFormSubmit = async (formData: ProductFormData) => {
        console.log("Form Data Submitted:", formData)

        let shelfPositionDto: { shelf_id: number; row: number; column: number; } | undefined = undefined
        
        if (formData.positionType === 'nfc' && nfcData) {
            shelfPositionDto = nfcData
        } else if (formData.positionType === 'manual' && formData.shelf_position) {
            const shelf_id = typeof formData.shelf_position.shelf_id === 'number' ? formData.shelf_position.shelf_id : undefined
            const row = typeof formData.shelf_position.row === 'number' ? formData.shelf_position.row : undefined
            const column = typeof formData.shelf_position.column === 'number' ? formData.shelf_position.column : undefined
            
            if (shelf_id && row && column) {
                shelfPositionDto = { shelf_id, row, column }
            }
        }
        
        const quantity = typeof formData.quantity === 'number' ? formData.quantity : undefined
        const low_stock_threshold = typeof formData.low_stock_threshold === 'number' ? formData.low_stock_threshold : undefined
        
        const dtoData: MockCreateProductDTO | MockUpdateProductDTO = {
            name: formData.name,
            price: formData.price,
            organization_id: product?.organization_id ?? 1,
            quantity: quantity,
            low_stock_threshold: low_stock_threshold,
            position_type: formData.positionType,
            shelf_position: shelfPositionDto,
            ...(product && { is_deleted: product.is_deleted })
        }
        
        console.log("Prepared DTO:", dtoData)

        await onSubmit(dtoData).catch(error => {
            console.error("Submission Error in Form Component Catched:", error)
        })
    }

    const handleNumberChange = (field: any, e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        field.onChange(value === '' ? undefined : Number(value))
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit<ProductFormData>(handleFormSubmit)} className="space-y-6">
                <FormField
                    control={form.control}
                    name="positionType"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Typ pozice</FormLabel>
                            <Select
                                onValueChange={(value) => {
                                    field.onChange(value)
                                    setNfcData(null)
                                    if (value === 'nfc') {
                                        form.setValue('shelf_position.shelf_id', undefined)
                                        form.setValue('shelf_position.row', undefined)
                                        form.setValue('shelf_position.column', undefined)
                                    }
                                }}
                                defaultValue={field.value}
                            >
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Vyberte typ pozice" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem key="nfc" value="nfc">NFC Tag</SelectItem>
                                    <SelectItem key="manual" value="manual">Manuální zadání</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {positionType === 'manual' && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 border rounded-md">
                        <FormField
                            control={form.control}
                            name="shelf_position.shelf_id"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Regál ID</FormLabel>
                                    <FormControl>
                                        <Input 
                                            type="number" 
                                            placeholder="např. 1" 
                                            {...field} 
                                            onChange={(e) => handleNumberChange(field, e)} 
                                            value={field.value ?? ''}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="shelf_position.row"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Řádek</FormLabel>
                                    <FormControl>
                                        <Input 
                                            type="number" 
                                            placeholder="např. 3" 
                                            {...field} 
                                            onChange={(e) => handleNumberChange(field, e)} 
                                            value={field.value ?? ''}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="shelf_position.column"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Sloupec</FormLabel>
                                    <FormControl>
                                        <Input 
                                            type="number" 
                                            placeholder="např. 5" 
                                            {...field} 
                                            onChange={(e) => handleNumberChange(field, e)} 
                                            value={field.value ?? ''}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                )}

                {positionType === 'nfc' && (
                    <div className="p-4 text-center border rounded-md">
                        <NFCScanner 
                            onScanSuccess={handleNfcSuccess} 
                            onScanError={handleNfcError} 
                            isScanning={isScanningNfc}
                            onScanTrigger={handleNfcScanTrigger}
                        />
                        {nfcData && (
                            <p className="mt-2 text-sm text-green-600">
                                Naskenováno: Regál {nfcData.shelf_id}, Řada {nfcData.row}, Sloupec {nfcData.column}
                            </p>
                        )}
                         {!nfcData && !isScanningNfc && (
                             <p className="mt-2 text-sm text-muted-foreground">
                                 Klikněte na tlačítko výše pro skenování NFC tagu.
                             </p>
                         )}
                    </div>
                )}
                
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Název produktu</FormLabel>
                            <FormControl>
                                <Input placeholder="Zadejte název produktu" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                
                <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Cena (Kč)</FormLabel>
                            <FormControl>
                                <Input 
                                    type="number" 
                                    placeholder="např. 1200.50" 
                                    step="0.01"
                                    {...field} 
                                    onChange={(e) => handleNumberChange(field, e)}
                                    value={field.value ?? ''}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="quantity"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Množství (%)</FormLabel>
                            <FormControl>
                                <Input 
                                    type="number" 
                                    placeholder="např. 75" 
                                    step="1"
                                    min="0"
                                    max="100"
                                    {...field} 
                                    onChange={(e) => handleNumberChange(field, e)}
                                    value={field.value ?? ''}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                
                <FormField
                    control={form.control}
                    name="low_stock_threshold"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Limit nízkého stavu (%)</FormLabel>
                            <FormControl>
                                <Input 
                                    type="number" 
                                    placeholder="např. 20" 
                                    step="1"
                                    min="0"
                                    max="100"
                                    {...field} 
                                    onChange={(e) => handleNumberChange(field, e)}
                                    value={field.value ?? ''}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="flex justify-end space-x-4 pt-4">
                    {showCancelButton && onCancel && (
                        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
                            Zrušit
                        </Button>
                    )}
                    <Button type="submit" disabled={isSubmitting} >
                        {isSubmitting ? "Odesílání..." : submitLabel}
                    </Button>
                </div>
            </form>
        </Form>
    )
}