import { z, type AnyZodObject } from 'zod';

// Schema for adding a product to favourites
export const addFavouriteSchema: AnyZodObject = z.object({
  productId: z.string().cuid('Invalid product ID format'),
});

// Schema for product ID parameter
export const productIdParamsSchema: AnyZodObject = z.object({
  productId: z.string().cuid('Invalid product ID format'),
});

// Schema for pagination query parameters
export const favouriteQuerySchema: AnyZodObject = z.object({
  page: z.string().transform(Number).optional(),
  limit: z.string().transform(Number).optional(),
});
