import { envConfig } from '@/configs/env';
import { PAYMENT_PROVIDER } from '@/constants/paymentStatus';
import { IFTHENPAY_METHOD } from '@/services/ifthenpayService';
import * as paymentService from '@/services/paymentService';

interface BaseIfthenpayCallback {
  key?: string;
  amount?: string;
  payment_datetime?: string;
}

interface IfthenpayCreditCardCallback extends BaseIfthenpayCallback {
  id?: string;
  payment_method?: string;
}

interface IfthenpayMbwayCallback extends BaseIfthenpayCallback {
  orderId?: string;
  requestId?: string;
}

function parseAmount(value: string): number {
  const parsed = Number.parseFloat(value);
  if (Number.isNaN(parsed)) {
    throw new Error('Invalid callback amount');
  }

  return parsed;
}

function assertValidAntiPhishingKey(key?: string): void {
  if (!key || key !== envConfig.IFTHENPAY_ANTI_PHISHING_KEY) {
    throw new Error('Invalid anti-phishing key');
  }
}

async function getValidatedIfthenpayPayment(txnId: string, amount: string, method: string) {
  const payment = await paymentService.getPaymentByTxnIdWithFilters(txnId, {
    provider: PAYMENT_PROVIDER.IFTHENPAY,
    ifthenpayMethod: method,
  });

  if (!payment) {
    throw new Error('Payment not found');
  }

  const callbackAmount = parseAmount(amount);
  const storedAmount = Number.parseFloat(payment.amount.toString());
  if (Math.abs(callbackAmount - storedAmount) > 0.001) {
    throw new Error('Payment amount mismatch');
  }

  return payment;
}

export async function handleIfthenpayCreditCardCallback(callback: IfthenpayCreditCardCallback) {
  assertValidAntiPhishingKey(callback.key);

  if (!callback.id) {
    throw new Error('Missing payment reference');
  }

  if (!callback.amount) {
    throw new Error('Missing callback amount');
  }

  if ((callback.payment_method || '').toUpperCase() !== IFTHENPAY_METHOD.CCARD) {
    throw new Error('Invalid payment method');
  }

  await getValidatedIfthenpayPayment(callback.id, callback.amount, IFTHENPAY_METHOD.CCARD);

  return paymentService.markPaymentSucceeded(callback.id, undefined, PAYMENT_PROVIDER.IFTHENPAY, {
    ifthenpayCallback: {
      ...callback,
      payment_method: callback.payment_method?.toUpperCase(),
    },
  });
}

export async function handleIfthenpayMbwayCallback(callback: IfthenpayMbwayCallback) {
  assertValidAntiPhishingKey(callback.key);

  if (!callback.orderId) {
    throw new Error('Missing payment reference');
  }

  if (!callback.requestId) {
    throw new Error('Missing requestId');
  }

  if (!callback.amount) {
    throw new Error('Missing callback amount');
  }

  const payment = await getValidatedIfthenpayPayment(
    callback.orderId,
    callback.amount,
    IFTHENPAY_METHOD.MBWAY
  );

  if (payment.ifthenpayRequestId !== callback.requestId) {
    throw new Error('RequestId mismatch');
  }

  return paymentService.markPaymentSucceeded(
    callback.orderId,
    undefined,
    PAYMENT_PROVIDER.IFTHENPAY,
    {
      mbwayCallback: callback,
    }
  );
}
