import { z, type AnyZodObject } from 'zod';

// Schema for creating a new review
export const createReviewSchema: AnyZodObject = z.object({
  salonId: z.string().cuid('Invalid salon ID format'),
  serviceId: z.string().cuid('Invalid service ID format').optional(),
  productId: z.string().cuid('Invalid product ID format').optional(),
  rating: z
    .number()
    .int('Rating must be an integer')
    .min(1, 'Rating must be at least 1')
    .max(5, 'Rating must be at most 5'),
  comment: z.string().max(1000, 'Comment must not exceed 1000 characters').optional(),
});

// Schema for updating an existing review
export const updateReviewSchema: AnyZodObject = z.object({
  rating: z
    .number()
    .int('Rating must be an integer')
    .min(1, 'Rating must be at least 1')
    .max(5, 'Rating must be at most 5')
    .optional(),
  comment: z.string().max(1000, 'Comment must not exceed 1000 characters').optional(),
});

// Schema for review ID parameter
export const reviewIdParamsSchema: AnyZodObject = z.object({
  id: z.string().cuid('Invalid review ID format'),
});

// Schema for salon ID parameter (for getting reviews by salon)
export const salonIdParamsSchema: AnyZodObject = z.object({
  salonId: z.string().cuid('Invalid salon ID format'),
});

// Schema for pagination query parameters
export const reviewQuerySchema: AnyZodObject = z.object({
  page: z.string().transform(Number).optional(),
  limit: z.string().transform(Number).optional(),
});
