import { z, type AnyZodObject } from 'zod';

export const addFavouriteSchema: AnyZodObject = z.object({
  type: z.enum(['product', 'salon']),
  itemId: z.string().cuid('Invalid ID format'),
});

export const itemIdParamsSchema: AnyZodObject = z.object({
  id: z.string().cuid('Invalid ID format'),
});

export const favouriteQuerySchema: AnyZodObject = z.object({
  type: z.enum(['product', 'salon']),
  page: z.string().transform(Number).optional(),
  limit: z.string().transform(Number).optional(),
});

export const checkFavouriteParamsSchema: AnyZodObject = z.object({
  id: z.string().cuid('Invalid ID format'),
});

export const checkFavouriteQuerySchema: AnyZodObject = z.object({
  type: z.enum(['product', 'salon']),
});
