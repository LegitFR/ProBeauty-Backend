/**
 * Payment Status Constants
 *
 * Defines the lifecycle states for payments in the system.
 * Payments progress through these states based on provider callbacks/webhooks.
 */

export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  SUCCEEDED: 'succeeded',
  FAILED: 'failed',
  CANCELED: 'canceled',
  REFUNDED: 'refunded',
} as const;

export type PaymentStatus = (typeof PAYMENT_STATUS)[keyof typeof PAYMENT_STATUS];

/**
 * Payment provider constants
 */
export const PAYMENT_PROVIDER = {
  STRIPE: 'stripe',
  IFTHENPAY: 'ifthenpay',
  CASH: 'cash',
} as const;

export type PaymentProvider = (typeof PAYMENT_PROVIDER)[keyof typeof PAYMENT_PROVIDER];

/**
 * All valid payment statuses as an array
 */
export const ALL_PAYMENT_STATUSES = Object.values(PAYMENT_STATUS);

/**
 * All valid payment providers as an array
 */
export const ALL_PAYMENT_PROVIDERS = Object.values(PAYMENT_PROVIDER);
