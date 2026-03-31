import type Stripe from 'stripe';

import { PAYMENT_PROVIDER, PAYMENT_STATUS } from '@/constants/paymentStatus';
import * as paymentService from '@/services/paymentService';

/**
 * Handle payment_intent.succeeded event
 * This is triggered when a payment is successfully completed
 */
export async function handlePaymentIntentSucceeded(
  event: Stripe.PaymentIntentSucceededEvent
): Promise<void> {
  const paymentIntent = event.data.object;

  console.info(`[Webhook Handler] payment_intent.succeeded received`);
  console.info(`[Webhook Handler] PaymentIntent ID: ${paymentIntent.id}`);
  console.info(
    `[Webhook Handler] Amount: ${paymentIntent.amount / 100} ${paymentIntent.currency.toUpperCase()}`
  );
  console.info(`[Webhook Handler] Customer: ${paymentIntent.customer || 'none'}`);
  console.info(`[Webhook Handler] Metadata:`, paymentIntent.metadata);

  try {
    const payment = await paymentService.markPaymentSucceeded(
      paymentIntent.id,
      event.id,
      PAYMENT_PROVIDER.STRIPE
    );
    console.info(
      `[Webhook Handler] SUCCESS: Payment ${paymentIntent.id} marked as succeeded, DB record ID: ${payment.id}`
    );
  } catch (error) {
    console.error(
      `[Webhook Handler] ERROR handling payment_intent.succeeded for ${paymentIntent.id}:`,
      error
    );
    throw error;
  }
}

/**
 * Handle payment_intent.payment_failed event
 * This is triggered when a payment fails
 */
export async function handlePaymentIntentFailed(
  event: Stripe.PaymentIntentPaymentFailedEvent
): Promise<void> {
  const paymentIntent = event.data.object;

  console.info(`[Webhook Handler] payment_intent.payment_failed received`);
  console.info(`[Webhook Handler] PaymentIntent ID: ${paymentIntent.id}`);
  console.info(
    `[Webhook Handler] Error: ${paymentIntent.last_payment_error?.message || 'Unknown'}`
  );

  try {
    const failureReason =
      paymentIntent.last_payment_error?.message || 'Payment failed without specific reason';

    const payment = await paymentService.markPaymentFailed(
      paymentIntent.id,
      event.id,
      failureReason,
      PAYMENT_PROVIDER.STRIPE
    );
    console.info(
      `[Webhook Handler] SUCCESS: Payment ${paymentIntent.id} marked as failed, DB record ID: ${payment.id}`
    );
  } catch (error) {
    console.error(
      `[Webhook Handler] ERROR handling payment_intent.payment_failed for ${paymentIntent.id}:`,
      error
    );
    throw error;
  }
}

/**
 * Handle payment_intent.canceled event
 * This is triggered when a payment intent is canceled
 */
export async function handlePaymentIntentCanceled(
  event: Stripe.PaymentIntentCanceledEvent
): Promise<void> {
  const paymentIntent = event.data.object;

  console.info(`[Webhook Handler] payment_intent.canceled received`);
  console.info(`[Webhook Handler] PaymentIntent ID: ${paymentIntent.id}`);

  try {
    const payment = await paymentService.markPaymentCanceled(
      paymentIntent.id,
      event.id,
      PAYMENT_PROVIDER.STRIPE
    );
    console.info(
      `[Webhook Handler] SUCCESS: Payment ${paymentIntent.id} marked as canceled, DB record ID: ${payment.id}`
    );
  } catch (error) {
    console.error(
      `[Webhook Handler] ERROR handling payment_intent.canceled for ${paymentIntent.id}:`,
      error
    );
    throw error;
  }
}

/**
 * Handle charge.refunded event
 * This is triggered when a charge is refunded
 */
export async function handleChargeRefunded(event: Stripe.ChargeRefundedEvent): Promise<void> {
  const charge = event.data.object;

  console.info(`[Webhook Handler] charge.refunded received`);
  console.info(`[Webhook Handler] Charge ID: ${charge.id}`);

  try {
    // Get the payment intent ID from the charge
    const paymentIntentId =
      typeof charge.payment_intent === 'string' ? charge.payment_intent : charge.payment_intent?.id;

    if (!paymentIntentId) {
      console.error('[Webhook Handler] No payment intent ID found for refunded charge');
      return;
    }

    console.info(`[Webhook Handler] Associated PaymentIntent ID: ${paymentIntentId}`);

    const payment = await paymentService.markPaymentRefunded(
      paymentIntentId,
      event.id,
      PAYMENT_PROVIDER.STRIPE
    );
    console.info(
      `[Webhook Handler] SUCCESS: Payment ${paymentIntentId} marked as refunded, DB record ID: ${payment.id}`
    );
  } catch (error) {
    console.error(`[Webhook Handler] ERROR handling charge.refunded for ${charge.id}:`, error);
    throw error;
  }
}

/**
 * Handle payment_intent.processing event
 * This is triggered when a payment is being processed
 */
export async function handlePaymentIntentProcessing(
  event: Stripe.PaymentIntentProcessingEvent
): Promise<void> {
  const paymentIntent = event.data.object;

  console.info(`[Webhook Handler] payment_intent.processing received`);
  console.info(`[Webhook Handler] PaymentIntent ID: ${paymentIntent.id}`);

  try {
    // Get the existing payment
    const payment = await paymentService.getPaymentByTxnId(
      paymentIntent.id,
      PAYMENT_PROVIDER.STRIPE
    );

    if (!payment) {
      console.error(`[Webhook Handler] Payment not found for payment intent: ${paymentIntent.id}`);
      console.error(
        `[Webhook Handler] This may indicate the payment record was not created during checkout.`
      );
      return;
    }

    // Update to processing status if needed
    await paymentService.updatePaymentStatus({
      txnId: paymentIntent.id,
      status: PAYMENT_STATUS.PROCESSING,
      providerEventId: event.id,
      provider: PAYMENT_PROVIDER.STRIPE,
    });
    console.info(`[Webhook Handler] SUCCESS: Payment ${paymentIntent.id} marked as processing`);
  } catch (error) {
    console.error(
      `[Webhook Handler] ERROR handling payment_intent.processing for ${paymentIntent.id}:`,
      error
    );
    // Don't throw error for processing events as they're informational
  }
}

/**
 * Main webhook event router
 * Routes events to their respective handlers
 */
export async function handleStripeWebhook(event: Stripe.Event): Promise<void> {
  console.info(`\n${'='.repeat(60)}`);
  console.info(`[Webhook Router] Received Stripe event`);
  console.info(`[Webhook Router] Event Type: ${event.type}`);
  console.info(`[Webhook Router] Event ID: ${event.id}`);
  console.info(`[Webhook Router] Created: ${new Date(event.created * 1000).toISOString()}`);
  console.info(`${'='.repeat(60)}`);

  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event);
        break;

      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event);
        break;

      case 'payment_intent.canceled':
        await handlePaymentIntentCanceled(event);
        break;

      case 'payment_intent.processing':
        await handlePaymentIntentProcessing(event);
        break;

      case 'charge.refunded':
        await handleChargeRefunded(event);
        break;

      case 'payment_intent.created':
        console.info(
          `[Webhook Router] payment_intent.created received (informational, no action needed)`
        );
        break;

      case 'charge.succeeded':
        console.info(
          `[Webhook Router] charge.succeeded received (informational, handled via payment_intent.succeeded)`
        );
        break;

      default:
        console.info(
          `[Webhook Router] Unhandled event type: ${event.type} (no handler configured)`
        );
    }

    console.info(`[Webhook Router] Event ${event.id} processing completed`);
    console.info(`${'='.repeat(60)}\n`);
  } catch (error) {
    console.error(`[Webhook Router] ERROR processing event ${event.type}:`, error);
    console.info(`${'='.repeat(60)}\n`);
    throw error;
  }
}
