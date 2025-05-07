import { z } from 'zod';

// Schema for creating/updating a product (from frontend perspective)
// SysAdmin will need to provide organization_id, OrgAdmin will not.
export const productFormSchema = z.object({
  name: z.string().min(3, { message: 'Product name must be at least 3 characters.' }).max(255),
  price: z.number({ invalid_type_error: 'Price must be a number.' }).min(0, { message: 'Price must be a positive number.' }),
  // organization_id is optional here because OrgAdmins don't send it explicitly.
  // The form logic will conditionally show this field for SysAdmins.
  organization_id: z.number({ invalid_type_error: 'Organization ID must be a number.' }).int().positive().optional(),
});

export type ProductFormData = z.infer<typeof productFormSchema>;

// Type for the product object received from the backend API
export interface Product {
  id: number;
  name: string;
  price: number;
  is_deleted: boolean;
  organization_id?: number | null; // Reflects backend's Optional(t.Number())
  // Add any other fields that might be transformed or added by transformProduct
  // For example, if created_at, updated_at are included in the response:
  // created_at?: string;
  // updated_at?: string;
}

// Type for the data sent TO the backend when creating/updating
// This will vary slightly based on role (SysAdmin vs OrgAdmin)
export interface ProductPayload {
  name: string;
  price: number;
  organization_id?: number; // Only included by SysAdmin
}
