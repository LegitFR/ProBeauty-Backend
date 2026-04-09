import type { Payment } from '@prisma/client';

import { envConfig } from '@/configs/env';
import { PAYMENT_PROVIDER, PAYMENT_STATUS } from '@/constants/paymentStatus';
import * as paymentService from '@/services/paymentService';

const IFTHENPAY_API_BASE_URL = 'https://api.ifthenpay.com';
const IFTHENPAY_RETURN_BASE_PATH = '/payments/ifthenpay';

export const IFTHENPAY_METHOD = {
  CCARD: 'CCARD',
  MBWAY: 'MBWAY',
} as const;

export type IfthenpayMethod = (typeof IFTHENPAY_METHOD)[keyof typeof IFTHENPAY_METHOD];

interface InitiateIfthenpayPaymentInput {
  amount: number;
  orderId: string;
  entityType: 'order' | 'booking';
  entityId: string;
  method: IfthenpayMethod;
  mobileNumber?: string;
  email?: string;
  description?: string;
}

interface IfthenpayCcardInitResponse {
  Message: string;
  PaymentUrl: string;
  RequestId: string;
  Status: string;
}

interface IfthenpayMbwayInitResponse {
  Amount: number;
  Message: string;
  orderId: string | number;
  RequestId: string;
  Status: string;
}

interface IfthenpayMbwayStatusResponse {
  CreatedAt?: string;
  Message?: string;
  RequestId?: string;
  Status?: string;
  UpdateAt?: string;
}

interface IfthenpayBasePaymentSession {
  provider: typeof PAYMENT_PROVIDER.IFTHENPAY;
  reference: string;
  requestId: string;
  status: typeof PAYMENT_STATUS.PENDING;
  method: IfthenpayMethod;
  rawResponse: Record<string, unknown>;
}

export interface IfthenpayCreditCardPaymentSession extends IfthenpayBasePaymentSession {
  method: typeof IFTHENPAY_METHOD.CCARD;
  paymentUrl: string;
}

export interface IfthenpayMbwayPaymentSession extends IfthenpayBasePaymentSession {
  method: typeof IFTHENPAY_METHOD.MBWAY;
  mobileNumber: string;
  message: string;
}

export type IfthenpayPaymentSession =
  | IfthenpayCreditCardPaymentSession
  | IfthenpayMbwayPaymentSession;

function ensureTrailingSlash(value: string): string {
  return value.endsWith('/') ? value : `${value}/`;
}

function formatAmount(amount: number): string {
  return amount.toFixed(2);
}

function buildCallbackUrl(path: string): string {
  return new URL(path, ensureTrailingSlash(envConfig.BACKEND_PUBLIC_URL)).toString();
}

function buildReturnUrl(
  result: 'success' | 'error' | 'cancel',
  entityType: 'order' | 'booking',
  entityId: string,
  reference: string
): string {
  const url = new URL(
    `${IFTHENPAY_RETURN_BASE_PATH}/${result}`,
    ensureTrailingSlash(envConfig.FRONTEND_APP_URL)
  );
  url.searchParams.set('entityType', entityType);
  url.searchParams.set('entityId', entityId);
  url.searchParams.set('reference', reference);
  return url.toString();
}

function getCreditCardInitEndpoint(): string {
  const path = envConfig.IFTHENPAY_USE_SANDBOX
    ? `/creditcard/sandbox/init/${envConfig.IFTHENPAY_CCARD_KEY}`
    : `/creditcard/init/${envConfig.IFTHENPAY_CCARD_KEY}`;

  return `${IFTHENPAY_API_BASE_URL}${path}`;
}

function getMbwayInitEndpoint(): string {
  return `${IFTHENPAY_API_BASE_URL}/spg/payment/mbway`;
}

function getMbwayStatusEndpoint(requestId: string): string {
  if (!envConfig.IFTHENPAY_MBWAY_KEY) {
    throw new Error('If-Then Pay MB WAY key is not configured');
  }

  const url = new URL(`${IFTHENPAY_API_BASE_URL}/spg/payment/mbway/status`);
  url.searchParams.set('mbWayKey', envConfig.IFTHENPAY_MBWAY_KEY);
  url.searchParams.set('requestId', requestId);
  return url.toString();
}

function validateAuthorizationFailure(
  message: string | undefined,
  status: string | undefined
): never {
  if (message === 'Unauthorized request') {
    throw new Error(
      envConfig.IFTHENPAY_USE_SANDBOX
        ? 'If-Then Pay sandbox authorization failed. Check the configured key for this method.'
        : 'If-Then Pay authorization failed. Check the configured key or sandbox setting for this method.'
    );
  }

  if (status === '999' || message?.toLowerCase() === 'declined') {
    throw new Error('MB WAY payment declined. The phone number may not be registered with MB WAY.');
  }

  throw new Error('Invalid If-Then Pay payment response');
}

async function parseJsonResponse<T>(response: Response): Promise<T> {
  return (await response.json()) as T;
}

function isMbwayStatusSucceeded(response: IfthenpayMbwayStatusResponse): boolean {
  return response.Status === '000' && response.Message?.toLowerCase() === 'success';
}

export async function initiateCreditCardPayment(
  input: Omit<InitiateIfthenpayPaymentInput, 'method' | 'mobileNumber'>
): Promise<IfthenpayCreditCardPaymentSession> {
  const response = await fetch(getCreditCardInitEndpoint(), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      orderId: input.orderId,
      amount: formatAmount(input.amount),
      successUrl: buildReturnUrl('success', input.entityType, input.entityId, input.orderId),
      errorUrl: buildReturnUrl('error', input.entityType, input.entityId, input.orderId),
      cancelUrl: buildReturnUrl('cancel', input.entityType, input.entityId, input.orderId),
      callbackUrl: buildCallbackUrl('/api/v1/webhooks/ifthenpay/ccard'),
      language: 'en',
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('[IfThenPay] Failed to initiate CCARD payment:', errorText);
    throw new Error('Failed to initialize If-Then Pay payment');
  }

  const data = await parseJsonResponse<Partial<IfthenpayCcardInitResponse>>(response);

  if (
    data.Status !== '0' ||
    typeof data.PaymentUrl !== 'string' ||
    typeof data.RequestId !== 'string'
  ) {
    console.error('[IfThenPay] Invalid CCARD initiation response:', data);
    validateAuthorizationFailure(data.Message, data.Status);
  }

  return {
    provider: PAYMENT_PROVIDER.IFTHENPAY,
    paymentUrl: data.PaymentUrl,
    reference: input.orderId,
    requestId: data.RequestId,
    status: PAYMENT_STATUS.PENDING,
    method: IFTHENPAY_METHOD.CCARD,
    rawResponse: {
      Message: data.Message ?? 'Success',
      PaymentUrl: data.PaymentUrl,
      RequestId: data.RequestId,
      Status: data.Status,
    },
  };
}

export async function initiateMbwayPayment(
  input: Omit<InitiateIfthenpayPaymentInput, 'method'>
): Promise<IfthenpayMbwayPaymentSession> {
  if (!envConfig.IFTHENPAY_MBWAY_KEY) {
    throw new Error('If-Then Pay MB WAY key is not configured');
  }

  if (!input.mobileNumber) {
    throw new Error('MB WAY mobile number is required');
  }

  const response = await fetch(getMbwayInitEndpoint(), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      mbWayKey: envConfig.IFTHENPAY_MBWAY_KEY,
      orderId: input.orderId,
      amount: formatAmount(input.amount),
      mobileNumber: input.mobileNumber,
      ...(input.email ? { email: input.email } : {}),
      ...(input.description ? { description: input.description.slice(0, 100) } : {}),
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('[IfThenPay] Failed to initiate MB WAY payment:', errorText);
    throw new Error('Failed to initialize If-Then Pay payment');
  }

  const data = await parseJsonResponse<Partial<IfthenpayMbwayInitResponse>>(response);

  if (data.Status !== '000' || typeof data.RequestId !== 'string') {
    console.error('[IfThenPay] Invalid MB WAY initiation response:', data);
    validateAuthorizationFailure(data.Message, data.Status);
  }

  return {
    provider: PAYMENT_PROVIDER.IFTHENPAY,
    reference: input.orderId,
    requestId: data.RequestId,
    status: PAYMENT_STATUS.PENDING,
    method: IFTHENPAY_METHOD.MBWAY,
    mobileNumber: input.mobileNumber,
    message: 'Approve payment in the MB WAY app to complete checkout.',
    rawResponse: {
      Amount: data.Amount ?? input.amount,
      Message: data.Message ?? 'Pending',
      orderId: data.orderId ?? input.orderId,
      RequestId: data.RequestId,
      Status: data.Status,
    },
  };
}

export async function initiateIfthenpayPayment(
  input: InitiateIfthenpayPaymentInput
): Promise<IfthenpayPaymentSession> {
  if (input.method === IFTHENPAY_METHOD.MBWAY) {
    return initiateMbwayPayment(input);
  }

  return initiateCreditCardPayment(input);
}

export async function getMbwayPaymentStatus(
  requestId: string
): Promise<IfthenpayMbwayStatusResponse> {
  const response = await fetch(getMbwayStatusEndpoint(requestId));

  if (!response.ok) {
    const errorText = await response.text();
    console.error('[IfThenPay] Failed to read MB WAY payment status:', errorText);
    throw new Error('Failed to retrieve MB WAY payment status');
  }

  return parseJsonResponse<IfthenpayMbwayStatusResponse>(response);
}

export async function refreshPendingMbwayPayment(payment: Payment): Promise<Payment> {
  if (
    payment.provider !== PAYMENT_PROVIDER.IFTHENPAY ||
    payment.ifthenpayMethod !== IFTHENPAY_METHOD.MBWAY ||
    payment.status !== PAYMENT_STATUS.PENDING
  ) {
    return payment;
  }

  if (!payment.ifthenpayRequestId) {
    return payment;
  }

  const statusResponse = await getMbwayPaymentStatus(payment.ifthenpayRequestId);

  if (!isMbwayStatusSucceeded(statusResponse)) {
    return payment;
  }

  return paymentService.markPaymentSucceeded(payment.txnId, undefined, PAYMENT_PROVIDER.IFTHENPAY, {
    mbwayStatusCheck: statusResponse,
  });
}
