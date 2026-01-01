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
  console.info('[Webhook] Incoming Stripe webhook request received');

  const signature = req.headers['stripe-signature'];

  if (!signature || typeof signature !== 'string') {
    console.error('[Webhook] Missing stripe-signature header');
    res.status(400).json({
      success: false,
      message: 'Missing stripe-signature header',
    });
    return;
  }

  console.info(`[Webhook] Stripe signature header present: ${signature.substring(0, 50)}...`);

  try {
    // The body should be raw (Buffer) for signature verification
    const rawBody = req.body;

    if (!rawBody) {
      console.error(
        '[Webhook] Missing request body - ensure webhook route uses express.raw() middleware'
      );
      res.status(400).json({
        success: false,
        message: 'Missing request body',
      });
      return;
    }

    // Log body type for debugging
    const bodyType = Buffer.isBuffer(rawBody) ? 'Buffer' : typeof rawBody;
    const bodyLength = Buffer.isBuffer(rawBody) ? rawBody.length : JSON.stringify(rawBody).length;
    console.info(`[Webhook] Request body type: ${bodyType}, length: ${bodyLength}`);

    // If body is not a Buffer, it means express.json() was applied before express.raw()
    if (!Buffer.isBuffer(rawBody) && typeof rawBody === 'object') {
      console.error(
        '[Webhook] Body is parsed JSON instead of raw Buffer. Check middleware order in index.ts.'
      );
      console.error('[Webhook] Webhook route must be registered BEFORE express.json() middleware.');
      res.status(400).json({
        success: false,
        message: 'Invalid body format - raw body required for signature verification',
      });
      return;
    }

    // Verify the webhook signature
    const event = stripeService.verifyWebhookSignature(rawBody, signature);

    console.info(
      `[Webhook] Signature verified successfully. Event: ${event.type}, ID: ${event.id}`
    );

    // Attach the verified event to the request
    req.stripeEvent = event;

    next();
  } catch (error) {
    console.error('[Webhook] Stripe webhook signature verification failed:', error);
    console.error('[Webhook] Common causes:');
    console.error('  1. STRIPE_WEBHOOK_SECRET in .env does not match the CLI/Dashboard secret');
    console.error(
      '  2. If using Stripe CLI, ensure the secret from "stripe listen" output is in .env'
    );
    console.error('  3. Restart the server after updating .env');
    res.status(400).json({
      success: false,
      message: 'Invalid webhook signature',
    });
    return;
  }
}
