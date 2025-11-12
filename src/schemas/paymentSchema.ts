import { z } from 'zod';

import { PAYMENT_PROVIDER } from '@/constants/paymentStatus';

/**
 * Schema for creating an order with payment
 */
export const createOrderWithPaymentSchema = z.object({
  body: z.object({
    addressId: z.string().min(1, 'Address ID is required'),
    paymentMethod: z
      .enum([PAYMENT_PROVIDER.STRIPE, PAYMENT_PROVIDER.CASH])
      .default(PAYMENT_PROVIDER.STRIPE),
  }),
});

/**
 * Schema for getting payment details by order ID
 */
export const getPaymentByOrderIdSchema = z.object({
  params: z.object({
    orderId: z.string().min(1, 'Order ID is required'),
  }),
});

/**
 * Schema for creating a payment intent (if needed separately)
 */
export const createPaymentIntentSchema = z.object({
  body: z.object({
    orderId: z.string().min(1, 'Order ID is required'),
    amount: z.number().positive('Amount must be positive'),
    currency: z.string().length(3, 'Currency must be a 3-letter code').default('usd'),
  }),
});

export type CreateOrderWithPaymentInput = z.infer<typeof createOrderWithPaymentSchema>;
export type GetPaymentByOrderIdInput = z.infer<typeof getPaymentByOrderIdSchema>;
export type CreatePaymentIntentInput = z.infer<typeof createPaymentIntentSchema>;
