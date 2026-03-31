import { Prisma, type Payment } from '@prisma/client';

import { prisma } from '@/configs/db';
import { BOOKING_STATUS } from '@/constants/bookingStatus';
import { ORDER_STATUS } from '@/constants/orderStatus';
import {
  PAYMENT_PROVIDER,
  PAYMENT_STATUS,
  type PaymentProvider,
  type PaymentStatus,
} from '@/constants/paymentStatus';

type JsonRecord = Record<string, unknown>;

interface CreatePaymentInput {
  orderId?: string;
  bookingId?: string;
  provider: PaymentProvider;
  amount: number;
  txnId: string;
  status: PaymentStatus;
  stripeCustomerId?: string;
  stripeEventId?: string;
  ifthenpayRequestId?: string;
  ifthenpayPaymentUrl?: string;
  ifthenpayMethod?: string;
  metadata?: JsonRecord;
}

interface UpdatePaymentStatusInput {
  txnId: string;
  status: PaymentStatus;
  provider?: PaymentProvider;
  providerEventId?: string;
  failureReason?: string;
  metadata?: JsonRecord;
}

interface PaymentLookupFilters {
  provider?: PaymentProvider;
  ifthenpayMethod?: string;
}

function mergeMetadata(
  currentMetadata: Prisma.JsonValue | null,
  nextMetadata?: JsonRecord
): Prisma.InputJsonValue | undefined {
  if (!nextMetadata) {
    return undefined;
  }

  if (!currentMetadata || Array.isArray(currentMetadata) || typeof currentMetadata !== 'object') {
    return nextMetadata as Prisma.InputJsonValue;
  }

  return {
    ...(currentMetadata as JsonRecord),
    ...nextMetadata,
  } as Prisma.InputJsonValue;
}

function isTerminalStatus(status: string): boolean {
  return (
    status === PAYMENT_STATUS.SUCCEEDED ||
    status === PAYMENT_STATUS.FAILED ||
    status === PAYMENT_STATUS.CANCELED ||
    status === PAYMENT_STATUS.REFUNDED
  );
}

/**
 * Create a payment record in the database.
 * At least one of orderId or bookingId must be provided.
 */
export async function createPayment(data: CreatePaymentInput): Promise<Payment> {
  if (!data.orderId && !data.bookingId) {
    throw new Error('Either orderId or bookingId must be provided');
  }

  if (data.orderId && data.bookingId) {
    throw new Error('Payment cannot be associated with both order and booking');
  }

  try {
    return await prisma.payment.create({
      data: {
        orderId: data.orderId,
        bookingId: data.bookingId,
        provider: data.provider,
        amount: new Prisma.Decimal(data.amount),
        txnId: data.txnId,
        status: data.status,
        stripeCustomerId: data.stripeCustomerId,
        stripeEventId: data.stripeEventId,
        ifthenpayRequestId: data.ifthenpayRequestId,
        ifthenpayPaymentUrl: data.ifthenpayPaymentUrl,
        ifthenpayMethod: data.ifthenpayMethod,
        metadata: data.metadata as Prisma.InputJsonValue | undefined,
      },
    });
  } catch (error) {
    console.error('Error creating payment:', error);
    throw new Error('Failed to create payment record');
  }
}

/**
 * Get payment by transaction ID.
 */
export async function getPaymentByTxnId(
  txnId: string,
  provider?: PaymentProvider,
  ifthenpayMethod?: string
): Promise<Payment | null> {
  try {
    return await prisma.payment.findFirst({
      where: {
        txnId,
        ...(provider ? { provider } : {}),
        ...(ifthenpayMethod ? { ifthenpayMethod } : {}),
      },
      include: {
        order: true,
        booking: true,
      },
    });
  } catch (error) {
    console.error('Error fetching payment by txnId:', error);
    throw new Error('Failed to fetch payment');
  }
}

/**
 * Get payment by Stripe event ID for idempotency.
 */
export async function getPaymentByStripeEventId(stripeEventId: string): Promise<Payment | null> {
  try {
    return await prisma.payment.findUnique({
      where: { stripeEventId },
      include: {
        order: true,
        booking: true,
      },
    });
  } catch (error) {
    console.error('Error fetching payment by stripeEventId:', error);
    throw new Error('Failed to fetch payment');
  }
}

/**
 * Get all payments for an order.
 */
export async function getPaymentsByOrderId(orderId: string): Promise<Payment[]> {
  try {
    return await prisma.payment.findMany({
      where: { orderId },
      orderBy: { createdAt: 'desc' },
    });
  } catch (error) {
    console.error('Error fetching payments for order:', error);
    throw new Error('Failed to fetch payments');
  }
}

/**
 * Get all payments for a booking.
 */
export async function getPaymentsByBookingId(bookingId: string): Promise<Payment[]> {
  try {
    return await prisma.payment.findMany({
      where: { bookingId },
      orderBy: { createdAt: 'desc' },
    });
  } catch (error) {
    console.error('Error fetching payments for booking:', error);
    throw new Error('Failed to fetch payments');
  }
}

/**
 * Update payment status and its related order or booking.
 */
export async function updatePaymentStatus(input: UpdatePaymentStatusInput): Promise<Payment> {
  const { txnId, status, provider, providerEventId, failureReason, metadata } = input;

  console.info(
    `[Payment] Updating payment status for txnId=${txnId}, provider=${provider || 'any'}, status=${status}, eventId=${providerEventId || 'none'}`
  );

  try {
    if (providerEventId && provider === PAYMENT_PROVIDER.STRIPE) {
      const existingPayment = await getPaymentByStripeEventId(providerEventId);
      if (existingPayment) {
        console.info(`[Payment] Stripe event ${providerEventId} already processed. Skipping.`);
        return existingPayment;
      }
    }

    const existingPayment = await getPaymentByTxnId(txnId, provider);
    if (!existingPayment) {
      throw new Error(
        `Payment with txnId ${txnId} not found. Ensure the payment was created during checkout.`
      );
    }

    if (
      status === PAYMENT_STATUS.SUCCEEDED &&
      existingPayment.status === PAYMENT_STATUS.SUCCEEDED
    ) {
      console.info(`[Payment] Payment ${existingPayment.id} already succeeded. Treating as no-op.`);
      return existingPayment;
    }

    if (isTerminalStatus(existingPayment.status) && existingPayment.status !== status) {
      console.info(
        `[Payment] Payment ${existingPayment.id} is already terminal (${existingPayment.status}). Skipping transition to ${status}.`
      );
      return existingPayment;
    }

    const payment = await prisma.$transaction(async (tx) => {
      const paymentToUpdate = await tx.payment.findFirst({
        where: {
          txnId,
          ...(provider ? { provider } : {}),
        },
      });

      if (!paymentToUpdate) {
        throw new Error(`Payment with txnId ${txnId} not found in transaction`);
      }

      const updatedPayment = await tx.payment.update({
        where: { id: paymentToUpdate.id },
        data: {
          status,
          failureReason,
          updatedAt: new Date(),
          ...(provider === PAYMENT_PROVIDER.STRIPE && providerEventId
            ? { stripeEventId: providerEventId }
            : {}),
          ...(metadata ? { metadata: mergeMetadata(paymentToUpdate.metadata, metadata) } : {}),
        },
      });

      if (updatedPayment.orderId) {
        let orderStatus: string | undefined;

        if (status === PAYMENT_STATUS.SUCCEEDED) {
          orderStatus = ORDER_STATUS.CONFIRMED;
        } else if (status === PAYMENT_STATUS.FAILED) {
          orderStatus = ORDER_STATUS.PAYMENT_FAILED;
        } else if (status === PAYMENT_STATUS.CANCELED) {
          orderStatus = ORDER_STATUS.CANCELLED;
        }

        if (orderStatus) {
          await tx.order.update({
            where: { id: updatedPayment.orderId },
            data: { status: orderStatus },
          });
        }
      } else if (updatedPayment.bookingId) {
        let bookingStatus: string | undefined;

        if (status === PAYMENT_STATUS.SUCCEEDED) {
          bookingStatus = BOOKING_STATUS.CONFIRMED;
        } else if (status === PAYMENT_STATUS.FAILED) {
          bookingStatus = BOOKING_STATUS.PAYMENT_FAILED;
        } else if (status === PAYMENT_STATUS.CANCELED) {
          bookingStatus = BOOKING_STATUS.CANCELLED;
        }

        if (bookingStatus) {
          await tx.booking.update({
            where: { id: updatedPayment.bookingId },
            data: { status: bookingStatus },
          });
        }
      }

      return updatedPayment;
    });

    console.info(`[Payment] Successfully processed payment update for txnId=${txnId}`);
    return payment;
  } catch (error) {
    console.error(`[Payment] Error updating payment status for txnId ${txnId}:`, error);
    throw error;
  }
}

export async function getPaymentByTxnIdWithFilters(
  txnId: string,
  filters: PaymentLookupFilters
): Promise<Payment | null> {
  return getPaymentByTxnId(txnId, filters.provider, filters.ifthenpayMethod);
}

export async function markPaymentSucceeded(
  txnId: string,
  providerEventId?: string,
  provider?: PaymentProvider,
  metadata?: JsonRecord
): Promise<Payment> {
  return updatePaymentStatus({
    txnId,
    status: PAYMENT_STATUS.SUCCEEDED,
    providerEventId,
    provider,
    metadata,
  });
}

export async function markPaymentFailed(
  txnId: string,
  providerEventId?: string,
  failureReason?: string,
  provider?: PaymentProvider,
  metadata?: JsonRecord
): Promise<Payment> {
  return updatePaymentStatus({
    txnId,
    status: PAYMENT_STATUS.FAILED,
    providerEventId,
    failureReason,
    provider,
    metadata,
  });
}

export async function markPaymentCanceled(
  txnId: string,
  providerEventId?: string,
  provider?: PaymentProvider,
  metadata?: JsonRecord
): Promise<Payment> {
  return updatePaymentStatus({
    txnId,
    status: PAYMENT_STATUS.CANCELED,
    providerEventId,
    provider,
    metadata,
  });
}

export async function markPaymentRefunded(
  txnId: string,
  providerEventId?: string,
  provider?: PaymentProvider,
  metadata?: JsonRecord
): Promise<Payment> {
  return updatePaymentStatus({
    txnId,
    status: PAYMENT_STATUS.REFUNDED,
    providerEventId,
    provider,
    metadata,
  });
}

export function isPaymentSuccessful(payment: Payment): boolean {
  return payment.status === PAYMENT_STATUS.SUCCEEDED;
}

export function canBeRefunded(payment: Payment): boolean {
  return (
    payment.status === PAYMENT_STATUS.SUCCEEDED && payment.provider === PAYMENT_PROVIDER.STRIPE
  );
}
