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

// --- Helper Constants (Temporarily Commented Out for Debugging) ---
/*
const emptyStringToUndefinedNumber = z.preprocess(
    (val) => (val === "" ? undefined : val),
    z.number({ invalid_type_error: "Hodnota musí být číslo" }).optional()
);
const requiredNumber = z.preprocess(
    (val) => (val === "" ? undefined : val), 
    z.number({ required_error: "Hodnota je povinná", invalid_type_error: "Hodnota musí být číslo" })
     .min(0, "Hodnota musí být nezáporná")
);
*/

// --- Nested Schemas ---
const shelfPositionSchema = z.object({
    // Use simple optional numbers for debugging
    shelf_id: z.number({ invalid_type_error: "ID musí být číslo" }).optional(),
    row: z.number({ invalid_type_error: "Řádek musí být číslo" }).optional(), 
    column: z.number({ invalid_type_error: "Sloupec musí být číslo" }).optional(),
});

// --- Main Schema ---
export const productFormSchema = z.object({
  // Core Fields
  name: z.string().min(3, "Název musí mít alespoň 3 znaky").max(255, "Název je příliš dlouhý"),
  // Use simple required number for debugging
  price: z.number({ required_error: "Cena je povinná", invalid_type_error: "Cena musí být číslo" }).min(0, "Cena musí být nezáporná"), 
  
  // Percentage Fields (0-100) - Temporarily simplified
  quantity: z.number({ invalid_type_error: "Množství musí být číslo" }).min(0).max(100).optional(),
  low_stock_threshold: z.number({ invalid_type_error: "Limit musí být číslo" }).min(0).max(100).optional(),
  
  // Position Fields
  positionType: z.enum(["nfc", "manual"], { required_error: "Musí být vybrán typ pozice"}).default("manual"), 
  shelf_position: shelfPositionSchema.optional(), 

}); // --- Temporarily remove refine for debugging --- 
/*
.refine(data => {
    if (data.positionType === 'manual') {
      return (
        data.shelf_position && 
        typeof data.shelf_position.shelf_id === 'number' && 
        typeof data.shelf_position.row === 'number' && 
        typeof data.shelf_position.column === 'number'
      );
    }
    return true;
}, {
    message: "Při manuálním zadání musí být vyplněn regál, řádek i sloupec.",
    path: ['shelf_position.shelf_id'], 
});
*/

// --- Inferred Type ---
export type ProductFormData = z.infer<typeof productFormSchema>;