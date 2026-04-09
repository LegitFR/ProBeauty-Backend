import { Prisma, type Payment } from '@prisma/client';

import { prisma } from '@/configs/db';
import { envConfig } from '@/configs/env';
import { PAYMENT_STATUS } from '@/constants/paymentStatus';
import { sendOrderInvoiceEmail } from '@/services/emailService';
import {
  createVendusClient,
  createVendusDocument,
  downloadVendusPdf,
  finalizeVendusDocument,
} from '@/services/vendusClient';

type JsonRecord = Prisma.JsonObject;

interface InvoiceMetadata {
  vendusClientId?: number;
  vendusDocumentId?: number;
  vendusDocumentNumber?: string;
  vendusDocumentType?: string;
  vendusPdfUrl?: string;
  finalizedAt?: string;
  emailedAt?: string;
  lastError?: string;
  lastAttemptAt?: string;
}

interface CheckoutMetadata {
  addressId?: string;
}

function isJsonRecord(value: Prisma.JsonValue | null | undefined): value is JsonRecord {
  return !!value && !Array.isArray(value) && typeof value === 'object';
}

function getPaymentMetadata(payment: Payment): JsonRecord {
  return isJsonRecord(payment.metadata) ? { ...payment.metadata } : {};
}

function getCheckoutMetadata(payment: Payment): CheckoutMetadata {
  const metadata = getPaymentMetadata(payment);
  const checkout = metadata.checkout;

  if (!checkout || Array.isArray(checkout) || typeof checkout !== 'object') {
    return {};
  }

  return checkout as CheckoutMetadata;
}

function getInvoiceMetadata(payment: Payment): InvoiceMetadata {
  const metadata = getPaymentMetadata(payment);
  const invoice = metadata.invoice;

  if (!invoice || Array.isArray(invoice) || typeof invoice !== 'object') {
    return {};
  }

  return invoice as InvoiceMetadata;
}

function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function sanitizeOptional(value?: string | null): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

function joinAddressLine(addressLine1: string, addressLine2?: string | null): string {
  return [addressLine1, sanitizeOptional(addressLine2)].filter(Boolean).join(', ');
}

async function updateInvoiceMetadata(
  paymentId: string,
  currentPayment: Payment,
  invoicePatch: Partial<InvoiceMetadata>
): Promise<Payment> {
  const metadata = getPaymentMetadata(currentPayment);
  const nextMetadata = JSON.parse(
    JSON.stringify({
      ...metadata,
      invoice: {
        ...getInvoiceMetadata(currentPayment),
        ...invoicePatch,
        lastAttemptAt: new Date().toISOString(),
      },
    })
  ) as Prisma.InputJsonValue;

  return prisma.payment.update({
    where: { id: paymentId },
    data: {
      metadata: nextMetadata,
    },
  });
}

async function findReusableVendusClientId(
  userId: string,
  currentOrderId: string
): Promise<number | undefined> {
  const payments = await prisma.payment.findMany({
    where: {
      status: PAYMENT_STATUS.SUCCEEDED,
      orderId: {
        not: currentOrderId,
      },
      order: {
        is: {
          userId,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 10,
  });

  for (const payment of payments) {
    const clientId = getInvoiceMetadata(payment).vendusClientId;
    if (typeof clientId === 'number') {
      return clientId;
    }
  }

  return undefined;
}

export async function syncOrderInvoiceForPayment(paymentId: string): Promise<void> {
  const paymentWithOrder = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: {
      order: {
        include: {
          user: true,
          orderItems: {
            include: {
              product: true,
            },
          },
        },
      },
    },
  });

  if (
    !paymentWithOrder ||
    !paymentWithOrder.order ||
    paymentWithOrder.status !== PAYMENT_STATUS.SUCCEEDED
  ) {
    return;
  }

  const order = paymentWithOrder.order;
  let payment: Payment = paymentWithOrder;

  try {
    const checkoutMetadata = getCheckoutMetadata(payment);
    if (!checkoutMetadata.addressId) {
      throw new Error('Missing checkout address for invoice generation');
    }

    const address = await prisma.address.findUnique({
      where: { id: checkoutMetadata.addressId },
    });

    if (!address) {
      throw new Error('Checkout address not found for invoice generation');
    }

    const invoiceMetadata = getInvoiceMetadata(payment);

    let vendusClientId = invoiceMetadata.vendusClientId;
    if (!vendusClientId) {
      vendusClientId =
        (await findReusableVendusClientId(order.userId, order.id)) ||
        (
          await createVendusClient({
            name: address.fullName,
            address: joinAddressLine(address.addressLine1, address.addressLine2),
            postalcode: sanitizeOptional(address.postalCode),
            city: sanitizeOptional(address.city),
            country: sanitizeOptional(address.country),
            phone: sanitizeOptional(address.phone),
            email: sanitizeOptional(order.user.email),
            external_reference: `user:${order.userId}`,
            send_email: 'no',
          })
        ).id;

      payment = await updateInvoiceMetadata(payment.id, payment, {
        vendusClientId,
        lastError: undefined,
      });
    }

    let nextInvoiceMetadata = getInvoiceMetadata(payment);

    if (!nextInvoiceMetadata.vendusDocumentId) {
      const document = await createVendusDocument({
        type: envConfig.VENDUS_DOCUMENT_TYPE,
        client: { id: vendusClientId },
        items: order.orderItems.map((item) => ({
          reference: item.product.sku,
          title: item.product.title,
          qty: item.quantity,
          gross_price: item.unitPrice.toFixed(2),
        })),
        date: formatDate(order.createdAt),
        date_supply: formatDate(order.createdAt),
        notes: `ProBeauty order ${order.id}`,
        external_reference: `order:${order.id}`,
        output: 'pdf_url',
        mode: envConfig.VENDUS_MODE,
        tx_id: `payment:${payment.id}`,
        errors_full: 'yes',
      });

      await finalizeVendusDocument(document.id);

      payment = await updateInvoiceMetadata(payment.id, payment, {
        vendusDocumentId: document.id,
        vendusDocumentNumber: document.number,
        vendusDocumentType: envConfig.VENDUS_DOCUMENT_TYPE,
        vendusPdfUrl: document.output,
        finalizedAt: new Date().toISOString(),
        lastError: undefined,
      });
      nextInvoiceMetadata = getInvoiceMetadata(payment);
    }

    if (!nextInvoiceMetadata.emailedAt) {
      const pdfBuffer = await downloadVendusPdf(
        nextInvoiceMetadata.vendusDocumentId as number,
        nextInvoiceMetadata.vendusPdfUrl
      );

      await sendOrderInvoiceEmail({
        email: order.user.email,
        customerName: address.fullName,
        orderId: order.id,
        invoiceNumber:
          nextInvoiceMetadata.vendusDocumentNumber ||
          `Document ${nextInvoiceMetadata.vendusDocumentId}`,
        invoiceUrl:
          nextInvoiceMetadata.vendusPdfUrl ||
          `${envConfig.VENDUS_BASE_URL.replace(/\/+$/, '')}/documents/${nextInvoiceMetadata.vendusDocumentId}.pdf`,
        attachment: {
          filename: `invoice-${order.id}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf',
        },
      });

      await updateInvoiceMetadata(payment.id, payment, {
        emailedAt: new Date().toISOString(),
        lastError: undefined,
      });
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown Vendus invoice error';
    await updateInvoiceMetadata(payment.id, payment, {
      lastError: message,
    });
    throw error;
  }
}
