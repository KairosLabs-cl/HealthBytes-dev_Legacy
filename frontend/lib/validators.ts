import { z } from 'zod';

/**
 * Product Schema - Runtime validation for product data
 */
export const ProductSchema = z.object({
  id: z.union([z.string(), z.number()]).transform((val: string | number) => String(val)),
  name: z.string().min(1, 'El nombre del producto es requerido'),
  description: z.string().optional(),
  price: z.number().positive('El precio debe ser mayor a 0'),
  image: z.string().url('La imagen debe ser una URL válida'),
  allergens: z.array(z.string()).optional().default([]),
  dietary_tags: z.array(z.string()).optional().default([]),
  stock: z.number().int().nonnegative().optional().default(0),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
});

/**
 * Product List Schema - Array of products
 */
export const ProductListSchema = z.array(ProductSchema);

/**
 * Order Item Schema
 */
export const OrderItemSchema = z.object({
  product_id: z.union([z.string(), z.number()]),
  quantity: z.number().int().positive('La cantidad debe ser mayor a 0'),
  price: z.number().positive().optional(),
});

/**
 * Order Schema
 */
export const OrderSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  total: z.number().positive(),
  status: z.enum(['pending', 'confirmed', 'delivered', 'cancelled']),
  items: z.array(OrderItemSchema).min(1, 'La orden debe tener al menos un producto'),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime().optional(),
});

/**
 * User Schema
 */
export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email('Email inválido'),
  name: z.string().min(1, 'El nombre es requerido').optional(),
  role: z.enum(['customer', 'seller', 'admin']).default('customer'),
  clerk_id: z.string().optional(),
  address: z.string().optional(),
  created_at: z.string().datetime().optional(),
});

/**
 * Cart Item Schema
 */
export const CartItemSchema = z.object({
  product: ProductSchema,
  quantity: z.number().int().positive(),
});

/**
 * Search Query Schema
 */
export const SearchQuerySchema = z.object({
  term: z.string().min(1).optional(),
  category: z.string().optional(),
  minPrice: z.number().positive().optional(),
  maxPrice: z.number().positive().optional(),
  allergens: z.array(z.string()).optional(),
  dietary_tags: z.array(z.string()).optional(),
});

// Export inferred types
export type Product = z.infer<typeof ProductSchema>;
export type ProductList = z.infer<typeof ProductListSchema>;
export type Order = z.infer<typeof OrderSchema>;
export type OrderItem = z.infer<typeof OrderItemSchema>;
export type User = z.infer<typeof UserSchema>;
export type CartItem = z.infer<typeof CartItemSchema>;
export type SearchQuery = z.infer<typeof SearchQuerySchema>;

/**
 * Validate and parse product data
 * Throws ZodError if validation fails
 */
export function validateProduct(data: unknown): Product {
  return ProductSchema.parse(data);
}

/**
 * Validate product data safely
 * Returns { success: true, data } or { success: false, error }
 */
export function safeValidateProduct(data: unknown) {
  return ProductSchema.safeParse(data);
}

/**
 * Validate product list
 */
export function validateProductList(data: unknown): ProductList {
  return ProductListSchema.parse(data);
}

/**
 * Validate order data
 */
export function validateOrder(data: unknown): Order {
  return OrderSchema.parse(data);
}
