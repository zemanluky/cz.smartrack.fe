//lib/schemas/product.ts
import * as z from "zod"

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

    position_type: z.enum(['nfc', 'manual']),

    shelf_position: z.object({
        shelf_id: z.number(),
        row: z.number().min(0, "Row must be positive"),
        column: z.number().min(0, "Column must be positive"),
        low_stock_threshold_percent: z.number()
            .min(0, "Threshold must be positive")
            .max(100, "Threshold cannot exceed 100%")
            .default(20),
        max_current_product_capacity: z.number()
            .min(1, "Capacity must be at least 1")
    })
});

export type ProductFormValues = z.infer<typeof productFormSchema>