import { Prisma, type Payment } from '@prisma/client';

import { prisma } from '@/configs/db';
import { ORDER_STATUS } from '@/constants/orderStatus';
import { PAYMENT_STATUS, PAYMENT_PROVIDER, type PaymentStatus } from '@/constants/paymentStatus';

/**
 * Create a payment record in the database
 */
export async function createPayment(data: {
  orderId: string;
  provider: string;
  amount: number;
  txnId: string;
  status: PaymentStatus;
  stripeCustomerId?: string;
  metadata?: Record<string, unknown>;
}): Promise<Payment> {
  try {
    const payment = await prisma.payment.create({
      data: {
        orderId: data.orderId,
        provider: data.provider,
        amount: new Prisma.Decimal(data.amount),
        txnId: data.txnId,
        status: data.status,
        stripeCustomerId: data.stripeCustomerId,
        metadata: data.metadata as Prisma.InputJsonValue | undefined,
      },
    });

    return payment;
  } catch (error) {
    console.error('Error creating payment:', error);
    throw new Error('Failed to create payment record');
  }
}

/**
 * Get payment by transaction ID (PaymentIntent ID)
 */
export async function getPaymentByTxnId(txnId: string): Promise<Payment | null> {
  try {
    const payment = await prisma.payment.findFirst({
      where: { txnId },
      include: {
        order: true,
      },
    });

    return payment;
  } catch (error) {
    console.error('Error fetching payment by txnId:', error);
    throw new Error('Failed to fetch payment');
  }
}

/**
 * Get payment by Stripe event ID (for idempotency)
 */
export async function getPaymentByStripeEventId(stripeEventId: string): Promise<Payment | null> {
  try {
    const payment = await prisma.payment.findUnique({
      where: { stripeEventId },
      include: {
        order: true,
      },
    });

    return payment;
  } catch (error) {
    console.error('Error fetching payment by stripeEventId:', error);
    throw new Error('Failed to fetch payment');
  }
}

/**
 * Get all payments for an order
 */
export async function getPaymentsByOrderId(orderId: string): Promise<Payment[]> {
  try {
    const payments = await prisma.payment.findMany({
      where: { orderId },
      orderBy: { createdAt: 'desc' },
    });

    return payments;
  } catch (error) {
    console.error('Error fetching payments for order:', error);
    throw new Error('Failed to fetch payments');
  }
}

/**
 * Update payment status and related order status
 * This is called by webhook handlers
 */
export async function updatePaymentStatus(
  txnId: string,
  status: PaymentStatus,
  stripeEventId: string,
  failureReason?: string
): Promise<Payment> {
  console.info(
    `[Payment] Updating payment status for txnId: ${txnId}, new status: ${status}, eventId: ${stripeEventId}`
  );

  try {
    // Check if this event has already been processed (idempotency)
    const existingPayment = await getPaymentByStripeEventId(stripeEventId);
    if (existingPayment) {
      console.info(`[Payment] Event ${stripeEventId} already processed. Skipping duplicate.`);
      return existingPayment;
    }

    // First, verify the payment exists before attempting update
    const existingPaymentByTxn = await getPaymentByTxnId(txnId);
    if (!existingPaymentByTxn) {
      console.error(`[Payment] No payment found with txnId: ${txnId}. Cannot update status.`);
      throw new Error(
        `Payment with txnId ${txnId} not found. Ensure the payment was created during checkout.`
      );
    }

    console.info(
      `[Payment] Found payment record: id=${existingPaymentByTxn.id}, orderId=${existingPaymentByTxn.orderId}, currentStatus=${existingPaymentByTxn.status}`
    );

    // Update payment and order in a transaction
    const payment = await prisma.$transaction(async (tx) => {
      // Update payment using findFirst + update pattern to handle unique constraint properly
      const paymentToUpdate = await tx.payment.findFirst({
        where: { txnId },
      });

      if (!paymentToUpdate) {
        throw new Error(`Payment with txnId ${txnId} not found in transaction`);
      }

      // Update the specific payment record by ID
      const updatedPayment = await tx.payment.update({
        where: { id: paymentToUpdate.id },
        data: {
          status,
          stripeEventId,
          failureReason,
          updatedAt: new Date(),
        },
      });

      console.info(
        `[Payment] Payment ${updatedPayment.id} updated: status=${status}, stripeEventId=${stripeEventId}`
      );

      // Update order status based on payment status
      let orderStatus: string | undefined;

      if (status === PAYMENT_STATUS.SUCCEEDED) {
        orderStatus = ORDER_STATUS.CONFIRMED;
      } else if (status === PAYMENT_STATUS.FAILED) {
        orderStatus = ORDER_STATUS.PAYMENT_FAILED;
      } else if (status === PAYMENT_STATUS.CANCELED) {
        orderStatus = ORDER_STATUS.CANCELLED;
      }

      if (orderStatus) {
        const updatedOrder = await tx.order.update({
          where: { id: updatedPayment.orderId },
          data: { status: orderStatus },
        });
        console.info(`[Payment] Order ${updatedOrder.id} status updated to: ${orderStatus}`);
      }

      return updatedPayment;
    });

    console.info(`[Payment] Successfully processed payment update for txnId: ${txnId}`);
    return payment;
  } catch (error) {
    console.error(`[Payment] Error updating payment status for txnId ${txnId}:`, error);
    throw error;
  }
}

/**
 * Mark payment as succeeded
 */
export async function markPaymentSucceeded(txnId: string, stripeEventId: string): Promise<Payment> {
  return updatePaymentStatus(txnId, PAYMENT_STATUS.SUCCEEDED, stripeEventId);
}

/**
 * Mark payment as failed
 */
export async function markPaymentFailed(
  txnId: string,
  stripeEventId: string,
  failureReason?: string
): Promise<Payment> {
  return updatePaymentStatus(txnId, PAYMENT_STATUS.FAILED, stripeEventId, failureReason);
}

/**
 * Mark payment as canceled
 */
export async function markPaymentCanceled(txnId: string, stripeEventId: string): Promise<Payment> {
  return updatePaymentStatus(txnId, PAYMENT_STATUS.CANCELED, stripeEventId);
}

/**
 * Mark payment as refunded
 */
export async function markPaymentRefunded(txnId: string, stripeEventId: string): Promise<Payment> {
  return updatePaymentStatus(txnId, PAYMENT_STATUS.REFUNDED, stripeEventId);
}

/**
 * Check if payment is successful
 */
export function isPaymentSuccessful(payment: Payment): boolean {
  return payment.status === PAYMENT_STATUS.SUCCEEDED;
}

/**
 * Check if payment can be refunded
 */
export function canBeRefunded(payment: Payment): boolean {
  return (
    payment.status === PAYMENT_STATUS.SUCCEEDED && payment.provider === PAYMENT_PROVIDER.STRIPE
  );
}
