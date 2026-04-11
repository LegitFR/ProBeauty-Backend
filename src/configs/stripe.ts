/**
 * Stripe SDK Configuration
 *
 * Initializes the Stripe client with the secret API key.
 */

import Stripe from 'stripe';

import { envConfig } from '@/configs/env';

// Keep Stripe optional so historical webhook/payment reads still work after CCARD cutover.
export const stripe = envConfig.STRIPE_SECRET_KEY
  ? new Stripe(envConfig.STRIPE_SECRET_KEY, {
      apiVersion: '2026-02-25.clover',
      typescript: true,
    })
  : null;

// Export webhook secret for signature verification
export const STRIPE_WEBHOOK_SECRET = envConfig.STRIPE_WEBHOOK_SECRET;
