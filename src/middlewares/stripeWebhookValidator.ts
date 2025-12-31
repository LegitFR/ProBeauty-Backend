import type { Request, Response, NextFunction } from 'express';
import type Stripe from 'stripe';

import * as stripeService from '@/services/stripeService';

/**
 * Extended Request type with Stripe event
 */
export interface StripeWebhookRequest extends Request {
  stripeEvent?: Stripe.Event;
}

/**
 * Middleware to validate Stripe webhook signatures
 *
 * This middleware:
 * 1. Extracts the raw body and signature from the request
 * 2. Verifies the webhook signature using Stripe SDK
 * 3. Attaches the verified event to the request object
 * 4. Rejects requests with invalid signatures
 */
export async function stripeWebhookValidator(
  req: StripeWebhookRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const signature = req.headers['stripe-signature'];

  if (!signature || typeof signature !== 'string') {
    res.status(400).json({
      success: false,
      message: 'Missing stripe-signature header',
    });
    return;
  }

  try {
    // The body should be raw (Buffer) for signature verification
    const rawBody = req.body;

    if (!rawBody) {
      res.status(400).json({
        success: false,
        message: 'Missing request body',
      });
      return;
    }

    // Verify the webhook signature
    const event = stripeService.verifyWebhookSignature(rawBody, signature);

    // Attach the verified event to the request
    req.stripeEvent = event;

    next();
  } catch (error) {
    console.error('Stripe webhook signature verification failed:', error);
    res.status(400).json({
      success: false,
      message: 'Invalid webhook signature',
    });
    return;
  }
}
