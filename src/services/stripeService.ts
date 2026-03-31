import type Stripe from 'stripe';

import { stripe, STRIPE_WEBHOOK_SECRET } from '@/configs/stripe';

function requireStripe(): Stripe {
  if (!stripe) {
    throw new Error('Stripe is not configured');
  }

  return stripe;
}

/**
 * Create a Stripe PaymentIntent
 * @param amount - Amount in dollars (will be converted to cents)
 * @param currency - Currency code (default: 'usd')
 * @param metadata - Additional metadata to attach to the PaymentIntent
 * @param customerId - Optional Stripe Customer ID to associate with the payment
 */
export async function createPaymentIntent(
  amount: number,
  currency = 'usd',
  metadata: Record<string, string> = {},
  customerId?: string
): Promise<Stripe.PaymentIntent> {
  try {
    const stripeClient = requireStripe();
    const paymentIntentParams: Stripe.PaymentIntentCreateParams = {
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      metadata,
      automatic_payment_methods: {
        enabled: true,
      },
    };

    // Associate the PaymentIntent with a Stripe Customer if provided
    if (customerId) {
      paymentIntentParams.customer = customerId;
    }

    const paymentIntent = await stripeClient.paymentIntents.create(paymentIntentParams);

    console.info(
      `[Stripe] PaymentIntent created: ${paymentIntent.id}, amount: ${amount}, customer: ${customerId || 'none'}`
    );

    return paymentIntent;
  } catch (error) {
    console.error('Error creating Stripe PaymentIntent:', error);
    throw new Error('Failed to create payment intent');
  }
}

/**
 * Retrieve a Stripe PaymentIntent by ID
 */
export async function retrievePaymentIntent(
  paymentIntentId: string
): Promise<Stripe.PaymentIntent> {
  try {
    const stripeClient = requireStripe();
    const paymentIntent = await stripeClient.paymentIntents.retrieve(paymentIntentId);
    return paymentIntent;
  } catch (error) {
    console.error('Error retrieving Stripe PaymentIntent:', error);
    throw new Error('Failed to retrieve payment intent');
  }
}

/**
 * Cancel a Stripe PaymentIntent
 */
export async function cancelPaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
  try {
    const stripeClient = requireStripe();
    const paymentIntent = await stripeClient.paymentIntents.cancel(paymentIntentId);
    return paymentIntent;
  } catch (error) {
    console.error('Error canceling Stripe PaymentIntent:', error);
    throw new Error('Failed to cancel payment intent');
  }
}

/**
 * Verify Stripe webhook signature
 */
export function verifyWebhookSignature(payload: string | Buffer, signature: string): Stripe.Event {
  try {
    const stripeClient = requireStripe();

    if (!STRIPE_WEBHOOK_SECRET) {
      throw new Error('Stripe webhook secret is not configured');
    }

    const event = stripeClient.webhooks.constructEvent(payload, signature, STRIPE_WEBHOOK_SECRET);
    return event;
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    throw new Error('Invalid webhook signature');
  }
}

/**
 * Create a Stripe Refund
 */
export async function createRefund(
  paymentIntentId: string,
  amount?: number,
  reason?: Stripe.RefundCreateParams.Reason
): Promise<Stripe.Refund> {
  try {
    const stripeClient = requireStripe();
    const refundParams: Stripe.RefundCreateParams = {
      payment_intent: paymentIntentId,
    };

    if (amount) {
      refundParams.amount = Math.round(amount * 100);
    }

    if (reason) {
      refundParams.reason = reason;
    }

    const refund = await stripeClient.refunds.create(refundParams);
    return refund;
  } catch (error) {
    console.error('Error creating Stripe refund:', error);
    throw new Error('Failed to create refund');
  }
}

/**
 * Retrieve a Stripe Customer
 */
export async function retrieveCustomer(customerId: string): Promise<Stripe.Customer> {
  try {
    const stripeClient = requireStripe();
    const customer = await stripeClient.customers.retrieve(customerId);
    return customer as Stripe.Customer;
  } catch (error) {
    console.error('Error retrieving Stripe customer:', error);
    throw new Error('Failed to retrieve customer');
  }
}

/**
 * Create a Stripe Customer
 */
export async function createCustomer(
  email: string,
  name?: string,
  metadata?: Record<string, string>
): Promise<Stripe.Customer> {
  try {
    const stripeClient = requireStripe();
    const customerParams: Stripe.CustomerCreateParams = {
      email,
    };

    if (name) {
      customerParams.name = name;
    }

    if (metadata) {
      customerParams.metadata = metadata;
    }

    const customer = await stripeClient.customers.create(customerParams);
    console.info(`[Stripe] Customer created: ${customer.id}, email: ${email}`);
    return customer;
  } catch (error) {
    console.error('Error creating Stripe customer:', error);
    throw new Error('Failed to create customer');
  }
}

/**
 * Get or create a Stripe Customer by email
 * First searches for existing customer, creates new one if not found
 */
export async function getOrCreateCustomer(
  email: string,
  name?: string,
  metadata?: Record<string, string>
): Promise<Stripe.Customer> {
  try {
    const stripeClient = requireStripe();
    // Search for existing customer by email
    const existingCustomers = await stripeClient.customers.list({
      email,
      limit: 1,
    });

    if (existingCustomers.data.length > 0) {
      const existingCustomer = existingCustomers.data[0];
      console.info(`[Stripe] Found existing customer: ${existingCustomer.id}, email: ${email}`);
      return existingCustomer;
    }

    // Create new customer if not found
    return createCustomer(email, name, metadata);
  } catch (error) {
    console.error('Error getting or creating Stripe customer:', error);
    throw new Error('Failed to get or create customer');
  }
}
