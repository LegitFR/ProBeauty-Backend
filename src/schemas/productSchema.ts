import { z, type AnyZodObject } from 'zod';

export const createProductSchema: AnyZodObject = z.object({
  salonId: z.string().cuid('Invalid salon ID format'),
  title: z.string().min(2, 'Product title must be at least 2 characters'),
  sku: z.string().min(3, 'SKU must be at least 3 characters'),
  price: z
    .string()
    .transform((val) => parseFloat(val))
    .pipe(z.number().positive('Price must be a positive number')),
  quantity: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().int().nonnegative('Quantity must be a non-negative integer')),
});

export const updateProductSchema: AnyZodObject = z.object({
  title: z.string().min(2, 'Product title must be at least 2 characters').optional(),
  sku: z.string().min(3, 'SKU must be at least 3 characters').optional(),
  price: z
    .string()
    .transform((val) => parseFloat(val))
    .pipe(z.number().positive('Price must be a positive number'))
    .optional(),
  quantity: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().int().nonnegative('Quantity must be a non-negative integer'))
    .optional(),
});

export const getProductParamsSchema: AnyZodObject = z.object({
  id: z.string().cuid('Invalid product ID format'),
});

export const getProductQuerySchema: AnyZodObject = z.object({
  page: z.string().transform(Number).optional(),
  limit: z.string().transform(Number).optional(),
  salonId: z.string().cuid('Invalid salon ID format').optional(),
  minPrice: z.string().transform(Number).optional(),
  maxPrice: z.string().transform(Number).optional(),
  inStock: z
    .string()
    .transform((v) => v === 'true')
    .optional(),
});

export const getSalonProductsParamsSchema: AnyZodObject = z.object({
  salonId: z.string().cuid('Invalid salon ID format'),
});

export const searchProductsQuerySchema: AnyZodObject = z.object({
  q: z.string().min(1, 'Search query must be at least 1 character'),
  page: z.string().transform(Number).optional(),
  limit: z.string().transform(Number).optional(),
  salonId: z.string().cuid('Invalid salon ID format').optional(),
  minPrice: z.string().transform(Number).optional(),
  maxPrice: z.string().transform(Number).optional(),
  inStock: z
    .string()
    .transform((v) => v === 'true')
    .optional(),
});
