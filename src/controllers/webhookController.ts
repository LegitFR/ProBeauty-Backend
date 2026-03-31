import type { Request, Response } from 'express';

import type { StripeWebhookRequest } from '@/middlewares/stripeWebhookValidator';
import {
  handleIfthenpayCreditCardCallback,
  handleIfthenpayMbwayCallback,
} from '@/services/webhookHandlers/ifthenpayWebhookHandler';
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

export async function handleIfthenpayCreditCardWebhookController(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const payment = await handleIfthenpayCreditCardCallback({
      key: typeof req.query.key === 'string' ? req.query.key : undefined,
      id: typeof req.query.id === 'string' ? req.query.id : undefined,
      amount: typeof req.query.amount === 'string' ? req.query.amount : undefined,
      payment_datetime:
        typeof req.query.payment_datetime === 'string' ? req.query.payment_datetime : undefined,
      payment_method:
        typeof req.query.payment_method === 'string' ? req.query.payment_method : undefined,
    });

    res.status(200).json({
      success: true,
      message: 'If-Then Pay callback processed successfully',
      paymentId: payment.id,
      txnId: payment.txnId,
    });
  } catch (error) {
    console.error('Error processing If-Then Pay callback:', error);

    res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : 'Invalid callback',
    });
  }
}

export async function handleIfthenpayMbwayWebhookController(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const payment = await handleIfthenpayMbwayCallback({
      key: typeof req.query.key === 'string' ? req.query.key : undefined,
      orderId: typeof req.query.orderId === 'string' ? req.query.orderId : undefined,
      requestId: typeof req.query.requestId === 'string' ? req.query.requestId : undefined,
      amount: typeof req.query.amount === 'string' ? req.query.amount : undefined,
      payment_datetime:
        typeof req.query.payment_datetime === 'string' ? req.query.payment_datetime : undefined,
    });

    res.status(200).json({
      success: true,
      message: 'If-Then Pay MB WAY callback processed successfully',
      paymentId: payment.id,
      txnId: payment.txnId,
    });
  } catch (error) {
    console.error('Error processing If-Then Pay MB WAY callback:', error);

    res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : 'Invalid callback',
    });
  }
}
