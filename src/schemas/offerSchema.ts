import { z, type AnyZodObject } from 'zod';

export const createOfferSchema: AnyZodObject = z.object({
  salonId: z.string().cuid('Invalid salon ID format'),
  title: z.string().min(2, 'Offer title must be at least 2 characters'),
  description: z.string().optional(),
  offerType: z.enum(['salon', 'product', 'service'], {
    required_error: 'Offer type is required',
  }),
  productId: z.string().cuid('Invalid product ID format').optional(),
  serviceId: z.string().cuid('Invalid service ID format').optional(),
  discountType: z.enum(['percentage', 'flat'], {
    required_error: 'Discount type is required',
  }),
  discountValue: z
    .string()
    .transform((val) => parseFloat(val))
    .pipe(z.number().positive('Discount value must be a positive number')),
  startsAt: z.string().datetime('Invalid start date format (ISO 8601 required)'),
  endsAt: z.string().datetime('Invalid end date format (ISO 8601 required)'),
});

export const updateOfferSchema: AnyZodObject = z.object({
  title: z.string().min(2, 'Offer title must be at least 2 characters').optional(),
  description: z.string().optional(),
  offerType: z.enum(['salon', 'product', 'service']).optional(),
  productId: z.string().cuid('Invalid product ID format').optional(),
  serviceId: z.string().cuid('Invalid service ID format').optional(),
  discountType: z.enum(['percentage', 'flat']).optional(),
  discountValue: z
    .string()
    .transform((val) => parseFloat(val))
    .pipe(z.number().positive('Discount value must be a positive number'))
    .optional(),
  startsAt: z.string().datetime('Invalid start date format (ISO 8601 required)').optional(),
  endsAt: z.string().datetime('Invalid end date format (ISO 8601 required)').optional(),
});

export const toggleOfferActiveSchema: AnyZodObject = z.object({
  isActive: z.boolean(),
});

export const offerParamsSchema: AnyZodObject = z.object({
  id: z.string().cuid('Invalid offer ID format'),
});

export const listOffersQuerySchema: AnyZodObject = z.object({
  salonId: z.string().cuid('Invalid salon ID format').optional(),
  productId: z.string().cuid('Invalid product ID format').optional(),
  serviceId: z.string().cuid('Invalid service ID format').optional(),
  activeOnly: z
    .string()
    .transform((v) => v === 'true')
    .optional(),
  page: z.string().transform(Number).optional(),
  limit: z.string().transform(Number).optional(),
});

export const getActiveOffersQuerySchema: AnyZodObject = z.object({
  salonId: z.string().cuid('Invalid salon ID format').optional(),
  productId: z.string().cuid('Invalid product ID format').optional(),
  serviceId: z.string().cuid('Invalid service ID format').optional(),
  page: z.string().transform(Number).optional(),
  limit: z.string().transform(Number).optional(),
});

export const validateOfferSchema: AnyZodObject = z.object({
  offerId: z.string().cuid('Invalid offer ID format'),
  amount: z
    .string()
    .transform((val) => parseFloat(val))
    .pipe(z.number().positive('Amount must be a positive number')),
  salonId: z.string().cuid('Invalid salon ID format').optional(),
  productId: z.string().cuid('Invalid product ID format').optional(),
  serviceId: z.string().cuid('Invalid service ID format').optional(),
});
