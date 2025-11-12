import type { Request, Response } from 'express';

import { handleStripeWebhook } from '@/services/webhookHandlers/stripeWebhookHandler';

/**
 * Handle Stripe webhook events
 * This endpoint receives webhook events from Stripe
 */
export async function handleStripeWebhookEvent(req: Request, res: Response): Promise<void> {
  try {
    // The stripeEvent is attached by the verifyStripeWebhook middleware
    const event = req.stripeEvent;

    if (!event) {
      res.status(400).json({
        success: false,
        message: 'No Stripe event found',
      });
      return;
    }

    // Process the webhook event
    // Note: We respond with 200 immediately and process asynchronously
    // This prevents Stripe from timing out and retrying
    res.status(200).json({
      success: true,
      message: 'Webhook received',
    });

    // Process the event asynchronously
    try {
      await handleStripeWebhook(event);
      console.log(`Successfully processed webhook event: ${event.id}`);
    } catch (error) {
      console.error(`Error processing webhook event ${event.id}:`, error);
      // We already responded with 200, so we just log the error
      // Stripe will not retry since we acknowledged receipt
    }
  } catch (error) {
    console.error('Error in webhook handler:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
}
