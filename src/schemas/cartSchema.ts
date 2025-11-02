import { z, type AnyZodObject } from 'zod';

/**
 * Schema for adding an item to the cart
 */
export const addToCartSchema: AnyZodObject = z.object({
  productId: z.string().cuid('Invalid product ID format'),
  quantity: z.number().int('Quantity must be an integer').positive('Quantity must be at least 1'),
});

/**
 * Schema for updating a cart item quantity
 */
export const updateCartItemSchema: AnyZodObject = z.object({
  quantity: z.number().int('Quantity must be an integer').positive('Quantity must be at least 1'),
});

/**
 * Schema for validating product ID in URL parameters
 */
export const cartItemParamsSchema: AnyZodObject = z.object({
  productId: z.string().cuid('Invalid product ID format'),
});
