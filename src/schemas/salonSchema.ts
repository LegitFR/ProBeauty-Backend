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
  venueType: z.enum(['male', 'female', 'everyone']).optional(),
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
  venueType: z.enum(['male', 'female', 'everyone']).optional(),
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

export const salonSearchQuerySchema: AnyZodObject = z.object({
  page: z.string().transform(Number).optional(),
  limit: z.string().transform(Number).optional(),
  venueType: z.enum(['male', 'female', 'everyone']).optional(),
  maxPrice: z
    .string()
    .transform(Number)
    .refine((val) => !Number.isNaN(val) && val >= 0, 'maxPrice must be a positive number')
    .optional(),
  sortBy: z.enum(['top_rated', 'recommended', 'nearest']).optional(),
  service: z.string().min(1).optional(),
  location: z.string().min(1).optional(),
  date: z
    .string()
    .refine((value) => !Number.isNaN(Date.parse(value)), 'date must be a valid ISO date')
    .optional(),
  time: z.enum(['morning', 'afternoon', 'evening', 'night']).optional(),
  latitude: z
    .string()
    .transform(Number)
    .refine((val) => !Number.isNaN(val), 'latitude must be a number')
    .optional(),
  longitude: z
    .string()
    .transform(Number)
    .refine((val) => !Number.isNaN(val), 'longitude must be a number')
    .optional(),
});
