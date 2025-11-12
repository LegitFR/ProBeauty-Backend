import Stripe from 'stripe';

import { envConfig } from '@/configs/env';

/**
 * Initialize Stripe client with secret key
 */
export const stripe = new Stripe(envConfig.STRIPE_SECRET_KEY, {
  apiVersion: '2024-11-20.acacia',
  typescript: true,
});

/**
 * Stripe webhook secret for signature verification
 */
export const STRIPE_WEBHOOK_SECRET = envConfig.STRIPE_WEBHOOK_SECRET;
