import * as z from "zod";

// Aligned with backend: cz.smartrack.be/src/model/product.model.ts -> saveProductData
export const productCreateSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters').max(32, 'Name must be at most 32 characters'),
  price: z.number().min(0, 'Price must be at least 0'),
  organization_id: z.number().optional(),
});

export type ProductCreate = z.infer<typeof productCreateSchema>;