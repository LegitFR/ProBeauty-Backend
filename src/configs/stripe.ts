/**
 * Stripe SDK Configuration
 *
 * Initializes the Stripe client with the secret API key.
 */

import Stripe from 'stripe';

import { envConfig } from '@/configs/env';

// Initialize Stripe with the secret key
export const stripe = new Stripe(envConfig.STRIPE_SECRET_KEY, {
  apiVersion: '2025-12-15.clover',
  typescript: true,
});

// Export webhook secret for signature verification
export const STRIPE_WEBHOOK_SECRET = envConfig.STRIPE_WEBHOOK_SECRET;
