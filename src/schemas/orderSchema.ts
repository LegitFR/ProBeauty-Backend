import { z, type AnyZodObject } from 'zod';

import { ALL_ORDER_STATUSES } from '@/constants/orderStatus';

const ifthenpayPaymentMethodEnum = z.enum(['CCARD', 'MBWAY']);
const mbwayMobileNumberSchema = z
  .string()
  .regex(/^\d{1,4}#\d{6,15}$/, 'mobileNumber must be in countryCode#number format');

/**
 * Schema for creating a new order from cart
 */
export const createOrderSchema = z
  .object({
    addressId: z.string().cuid('Invalid address ID format'),
    notes: z.string().max(500, 'Notes must not exceed 500 characters').optional(),
    paymentMethod: ifthenpayPaymentMethodEnum.optional().default('CCARD'),
    mobileNumber: mbwayMobileNumberSchema.optional(),
  })
  .superRefine((data, ctx) => {
    if (data.paymentMethod === 'MBWAY' && !data.mobileNumber) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['mobileNumber'],
        message: 'mobileNumber is required when paymentMethod is MBWAY',
      });
    }
  });

/**
 * Schema for updating order status
 * Only certain users (admin/salon owner) can update status
 */
export const updateOrderStatusSchema: AnyZodObject = z.object({
  status: z.enum(ALL_ORDER_STATUSES as [string, ...string[]], {
    errorMap: () => ({ message: 'Invalid order status' }),
  }),
});

/**
 * Schema for order ID in URL parameters
 */
export const getOrderParamsSchema: AnyZodObject = z.object({
  id: z.string().cuid('Invalid order ID format'),
});

/**
 * Schema for filtering and paginating orders
 */
export const getOrdersQuerySchema: AnyZodObject = z.object({
  page: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().int().positive())
    .optional(),
  limit: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().int().positive().max(100))
    .optional(),
  status: z.enum(ALL_ORDER_STATUSES as [string, ...string[]]).optional(),
  salonId: z.string().cuid('Invalid salon ID format').optional(),
});
