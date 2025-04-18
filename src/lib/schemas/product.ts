import * as z from "zod"

// Define the position type as a literal union type
const PositionTypeEnum = z.enum(['nfc', 'manual'])
export type PositionType = z.infer<typeof PositionTypeEnum>

// Define the shelf position schema
const ShelfPositionSchema = z.object({
    shelf_id: z.number(),
    row: z.number().min(0, "Row must be positive"),
    column: z.number().min(0, "Column must be positive"),
    low_stock_threshold_percent: z.number()
        .min(0, "Threshold must be positive")
        .max(100, "Threshold cannot exceed 100%")
        .default(20),
    max_current_product_capacity: z.number()
        .min(1, "Capacity must be at least 1")
        .default(100)
})
export type ShelfPosition = z.infer<typeof ShelfPositionSchema>

// Main product form schema
export const productFormSchema = z.object({
    name: z.string()
        .min(2, "Product name must be at least 2 characters")
        .max(255, "Product name is too long")
        .regex(/^[\x20-\x7E]+$/, "Only basic characters are allowed"),

    price: z.number()
        .min(0, "Price must be positive")
        .max(9999.99, "Price cannot exceed 9999.99")
        .refine(
            (val) => /^\d{1,4}\.\d{2}$/.test(val.toFixed(2)),
            "Price must be in format XXXX.XX"
        ),

    position_type: PositionTypeEnum,
    shelf_position: ShelfPositionSchema
})

// Export the type for use in components
export type ProductFormValues = z.infer<typeof productFormSchema>