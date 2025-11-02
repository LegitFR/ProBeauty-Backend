import { z, type AnyZodObject } from 'zod';

// Schema for creating a new service
export const createServiceSchema: AnyZodObject = z.object({
  salonId: z.string().cuid('Invalid salon ID format'),
  title: z
    .string()
    .min(2, 'Title must be at least 2 characters')
    .max(100, 'Title must not exceed 100 characters'),
  durationMinutes: z.number().int().positive('Duration must be a positive integer'),
  price: z
    .number()
    .nonnegative('Price must be non-negative')
    .refine(
      (val) => {
        // Ensure price has at most 2 decimal places
        return Number.isInteger(val * 100);
      },
      { message: 'Price can have at most 2 decimal places' }
    ),
});

// Schema for updating an existing service
export const updateServiceSchema: AnyZodObject = z.object({
  title: z
    .string()
    .min(2, 'Title must be at least 2 characters')
    .max(100, 'Title must not exceed 100 characters')
    .optional(),
  durationMinutes: z.number().int().positive('Duration must be a positive integer').optional(),
  price: z
    .number()
    .nonnegative('Price must be non-negative')
    .refine(
      (val) => {
        // Ensure price has at most 2 decimal places
        return Number.isInteger(val * 100);
      },
      { message: 'Price can have at most 2 decimal places' }
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
