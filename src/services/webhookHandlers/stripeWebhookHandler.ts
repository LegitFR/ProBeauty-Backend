import type Stripe from 'stripe';

import * as paymentService from '@/services/paymentService';

/**
 * Handle payment_intent.succeeded event
 * This is triggered when a payment is successfully completed
 */
export async function handlePaymentIntentSucceeded(
  event: Stripe.PaymentIntentSucceededEvent
): Promise<void> {
  const paymentIntent = event.data.object;

  console.log(`Payment succeeded: ${paymentIntent.id}`);

  try {
    await paymentService.markPaymentSucceeded(paymentIntent.id, event.id);
    console.log(`Payment ${paymentIntent.id} marked as succeeded`);
  } catch (error) {
    console.error(`Error handling payment_intent.succeeded for ${paymentIntent.id}:`, error);
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

  console.log(`Payment failed: ${paymentIntent.id}`);

  try {
    const failureReason =
      paymentIntent.last_payment_error?.message || 'Payment failed without specific reason';

    await paymentService.markPaymentFailed(paymentIntent.id, event.id, failureReason);
    console.log(`Payment ${paymentIntent.id} marked as failed`);
  } catch (error) {
    console.error(`Error handling payment_intent.payment_failed for ${paymentIntent.id}:`, error);
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

  console.log(`Payment canceled: ${paymentIntent.id}`);

  try {
    await paymentService.markPaymentCanceled(paymentIntent.id, event.id);
    console.log(`Payment ${paymentIntent.id} marked as canceled`);
  } catch (error) {
    console.error(`Error handling payment_intent.canceled for ${paymentIntent.id}:`, error);
    throw error;
  }
}

/**
 * Handle charge.refunded event
 * This is triggered when a charge is refunded
 */
export async function handleChargeRefunded(event: Stripe.ChargeRefundedEvent): Promise<void> {
  const charge = event.data.object;

  console.log(`Charge refunded: ${charge.id}`);

  try {
    // Get the payment intent ID from the charge
    const paymentIntentId =
      typeof charge.payment_intent === 'string' ? charge.payment_intent : charge.payment_intent?.id;

    if (!paymentIntentId) {
      console.error('No payment intent ID found for refunded charge');
      return;
    }

    await paymentService.markPaymentRefunded(paymentIntentId, event.id);
    console.log(`Payment ${paymentIntentId} marked as refunded`);
  } catch (error) {
    console.error(`Error handling charge.refunded for ${charge.id}:`, error);
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

  console.log(`Payment processing: ${paymentIntent.id}`);

  try {
    // Get the existing payment
    const payment = await paymentService.getPaymentByTxnId(paymentIntent.id);

    if (!payment) {
      console.error(`Payment not found for payment intent: ${paymentIntent.id}`);
      return;
    }

    // Update to processing status if needed
    await paymentService.updatePaymentStatus(paymentIntent.id, 'processing', event.id);
    console.log(`Payment ${paymentIntent.id} marked as processing`);
  } catch (error) {
    console.error(`Error handling payment_intent.processing for ${paymentIntent.id}:`, error);
    // Don't throw error for processing events as they're informational
  }
}

/**
 * Main webhook event router
 * Routes events to their respective handlers
 */
export async function handleStripeWebhook(event: Stripe.Event): Promise<void> {
  console.log(`Received Stripe webhook event: ${event.type}`);

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

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
  } catch (error) {
    console.error(`Error handling webhook event ${event.type}:`, error);
    throw error;
  }
}
