import { z, type AnyZodObject } from 'zod';

export const createSalonSchema: AnyZodObject = z.object({
  name: z.string().min(2, 'Salon name must be at least 2 characters'),
  address: z.string().min(5, 'Address must be at least 5 characters'),
  phone: z
    .string()
    .regex(/^[6-9]\d{9}$/, 'Invalid phone number')
    .optional(),
  geo: z
    .object({
      latitude: z.number(),
      longitude: z.number(),
    })
    .optional(),
  hours: z
    .object({
      monday: z.object({ open: z.string(), close: z.string() }).optional(),
      tuesday: z.object({ open: z.string(), close: z.string() }).optional(),
      wednesday: z.object({ open: z.string(), close: z.string() }).optional(),
      thursday: z.object({ open: z.string(), close: z.string() }).optional(),
      friday: z.object({ open: z.string(), close: z.string() }).optional(),
      saturday: z.object({ open: z.string(), close: z.string() }).optional(),
      sunday: z.object({ open: z.string(), close: z.string() }).optional(),
    })
    .optional(),
  // Note: thumbnail and images are handled as file uploads via multer, not in body
});

export const updateSalonSchema: AnyZodObject = z.object({
  name: z.string().min(2, 'Salon name must be at least 2 characters').optional(),
  address: z.string().min(5, 'Address must be at least 5 characters').optional(),
  phone: z
    .string()
    .regex(/^[6-9]\d{9}$/, 'Invalid phone number')
    .optional(),
  geo: z
    .object({
      latitude: z.number(),
      longitude: z.number(),
    })
    .optional(),
  hours: z
    .object({
      monday: z.object({ open: z.string(), close: z.string() }).optional(),
      tuesday: z.object({ open: z.string(), close: z.string() }).optional(),
      wednesday: z.object({ open: z.string(), close: z.string() }).optional(),
      thursday: z.object({ open: z.string(), close: z.string() }).optional(),
      friday: z.object({ open: z.string(), close: z.string() }).optional(),
      saturday: z.object({ open: z.string(), close: z.string() }).optional(),
      sunday: z.object({ open: z.string(), close: z.string() }).optional(),
    })
    .optional(),
  // Note: thumbnail and images are handled as file uploads via multer, not in body
});

export const getSalonParamsSchema: AnyZodObject = z.object({
  id: z.string().cuid('Invalid salon ID format'),
});

export const getSalonQuerySchema: AnyZodObject = z.object({
  page: z.string().transform(Number).optional(),
  limit: z.string().transform(Number).optional(),
  verified: z
    .string()
    .transform((v) => v === 'true')
    .optional(),
});
