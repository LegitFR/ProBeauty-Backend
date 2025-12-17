import { z, type AnyZodObject } from 'zod';

// Schema for creating a new service
export const createServiceSchema: AnyZodObject = z.object({
  salonId: z.string().cuid('Invalid salon ID format'),
  title: z
    .string()
    .min(2, 'Title must be at least 2 characters')
    .max(100, 'Title must not exceed 100 characters'),
  category: z
    .string()
    .min(2, 'Category must be at least 2 characters')
    .max(50, 'Category must not exceed 50 characters')
    .trim(),
  durationMinutes: z
    .union([z.number(), z.string()])
    .transform((val) => (typeof val === 'string' ? parseInt(val, 10) : val))
    .pipe(z.number().int().positive('Duration must be a positive integer')),
  price: z
    .union([z.number(), z.string()])
    .transform((val) => (typeof val === 'string' ? parseFloat(val) : val))
    .pipe(
      z
        .number()
        .nonnegative('Price must be non-negative')
        .refine(
          (val) => {
            // Ensure price has at most 2 decimal places
            return Number.isInteger(val * 100);
          },
          { message: 'Price can have at most 2 decimal places' }
        )
    ),
});

// Schema for updating an existing service
export const updateServiceSchema: AnyZodObject = z.object({
  title: z
    .string()
    .min(2, 'Title must be at least 2 characters')
    .max(100, 'Title must not exceed 100 characters')
    .optional(),
  category: z
    .string()
    .min(2, 'Category must be at least 2 characters')
    .max(50, 'Category must not exceed 50 characters')
    .trim()
    .optional(),
  durationMinutes: z
    .union([z.number(), z.string()])
    .transform((val) => (typeof val === 'string' ? parseInt(val, 10) : val))
    .pipe(z.number().int().positive('Duration must be a positive integer'))
    .optional(),
  price: z
    .union([z.number(), z.string()])
    .transform((val) => (typeof val === 'string' ? parseFloat(val) : val))
    .pipe(
      z
        .number()
        .nonnegative('Price must be non-negative')
        .refine(
          (val) => {
            // Ensure price has at most 2 decimal places
            return Number.isInteger(val * 100);
          },
          { message: 'Price can have at most 2 decimal places' }
        )
    )
    .optional(),
});

// Schema for service ID parameter
export const serviceIdParamsSchema: AnyZodObject = z.object({
  id: z.string().cuid('Invalid service ID format'),
});

// Schema for getting services by salon
export const getServicesBySalonQuerySchema: AnyZodObject = z.object({
  salonId: z.string().cuid('Invalid salon ID format'),
});
