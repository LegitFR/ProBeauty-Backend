import type { Request, Response, NextFunction } from 'express';
import type Stripe from 'stripe';

import * as stripeService from '@/services/stripeService';

/**
 * Middleware to verify Stripe webhook signature
 * This ensures the webhook request is genuinely from Stripe
 */
export function verifyStripeWebhook(req: Request, res: Response, next: NextFunction): void {
  try {
    const signature = req.headers['stripe-signature'];

    if (!signature || typeof signature !== 'string') {
      res.status(400).json({
        success: false,
        message: 'Missing stripe-signature header',
      });
      return;
    }

    // The raw body is required for signature verification
    // Make sure the body is available as a Buffer or string
    if (!req.body) {
      res.status(400).json({
        success: false,
        message: 'Missing request body',
      });
      return;
    }

    // Verify the webhook signature
    const event: Stripe.Event = stripeService.verifyWebhookSignature(req.body, signature);

    // Attach the verified event to the request object
    req.stripeEvent = event;

    next();
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    res.status(400).json({
      success: false,
      message: 'Invalid signature',
    });
  }
}
