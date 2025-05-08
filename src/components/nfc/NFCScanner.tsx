import { useState } from "react"
import { QrCode } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

// Updated interface with boolean flag for isScanning instead of using any
interface NFCScannerProps {
    setValue: unknown // Still using 'any' for setValue to bypass TypeScript issues
    currentRow: number
    currentColumn: number
    isScanning?: boolean // Added boolean prop for scanning state
}

export function NFCScanner({
                               setValue,
                               currentRow,
                               currentColumn,
                               isScanning: externalScanning
                           }: NFCScannerProps) {
    // Use internal state if external state is not provided
    const [internalIsScanning, setInternalIsScanning] = useState(false)

    // Use either external or internal scanning state
    const isScanning = externalScanning !== undefined ? externalScanning : internalIsScanning

    // Update internal state only if external state is not provided
    const setIsScanning = (value: boolean) => {
        if (externalScanning === undefined) {
            setInternalIsScanning(value)
        }
    }

    // Handle NFC scanning
    const handleStartScan = () => {
        setIsScanning(true)

        // Placeholder for actual NFC scanning logic
        setTimeout(() => {
            // Mock successful scan
            setValue("shelf_position.row", 3)
            setValue("shelf_position.column", 4)
            setIsScanning(false)
            toast.success("NFC tag scanned successfully")
        }, 2000) // Mock 2 second delay
    }

    return (
        <div className="space-y-4 border rounded-md p-4">
            <div className="flex justify-between items-center">
                <div>
                    <h4 className="text-sm font-medium">NFC Tag Position</h4>
                    {isScanning ? (
                        <p className="text-sm text-muted-foreground">Scanning for NFC tag...</p>
                    ) : (
                        <p className="text-sm text-muted-foreground">
                            {currentRow > 0 || currentColumn > 0 ?
                                `Position: Row ${currentRow}, Column ${currentColumn}` :
                                'Scan tag to get position'}
                        </p>
                    )}
                </div>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleStartScan}
                    disabled={isScanning}
                >
                    <QrCode className="h-4 w-4 mr-2" />
                    {isScanning ? "Scanning..." : "Scan Tag"}
                </Button>
            </div>
        </div>
    )
}