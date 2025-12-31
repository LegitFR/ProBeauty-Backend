import type { Response } from 'express';

import type { StripeWebhookRequest } from '@/middlewares/stripeWebhookValidator';
import { handleStripeWebhook } from '@/services/webhookHandlers/stripeWebhookHandler';

/**
 * Handle incoming Stripe webhooks
 *
 * This controller:
 * 1. Receives verified Stripe events from the middleware
 * 2. Routes them to the appropriate handler
 * 3. Returns 200 OK to acknowledge receipt (prevents Stripe retries)
 */
export async function handleStripeWebhookController(
  req: StripeWebhookRequest,
  res: Response
): Promise<void> {
  const event = req.stripeEvent;

  if (!event) {
    res.status(400).json({
      success: false,
      message: 'No Stripe event found in request',
    });
    return;
  }

  try {
    // Process the webhook event
    await handleStripeWebhook(event);

    // Return 200 immediately to acknowledge receipt
    res.status(200).json({
      success: true,
      message: 'Webhook received successfully',
      eventId: event.id,
      eventType: event.type,
    });
  } catch (error) {
    console.error('Error processing Stripe webhook:', error);

    // Still return 200 to prevent Stripe retries
    // The error is logged for debugging
    res.status(200).json({
      success: true,
      message: 'Webhook received (processing error logged)',
      eventId: event.id,
      eventType: event.type,
    });
  }
}
