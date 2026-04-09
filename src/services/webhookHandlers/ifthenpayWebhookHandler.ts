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

async function getValidatedCcardPayment(txnId: string, amount: string) {
  const payment = await paymentService.getPaymentByTxnIdWithFilters(txnId, {
    provider: PAYMENT_PROVIDER.IFTHENPAY,
    ifthenpayMethod: IFTHENPAY_METHOD.CCARD,
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

async function getValidatedMbwayPayment(requestId: string, amount?: string) {
  // MBWay: look up by requestId — ifthenpay sends back their own orderId in the
  // callback which does not match the txnId we stored, so requestId is the only
  // reliable identifier.
  const payment = await paymentService.getPaymentByIfthenpayRequestId(
    requestId,
    IFTHENPAY_METHOD.MBWAY
  );

  if (!payment) {
    throw new Error('Payment not found');
  }

  // Validate amount only when ifthenpay includes it in the callback.
  // Ifthenpay may send amounts with a comma decimal separator (e.g. "1,50"),
  // so normalise before parsing. Skip the check if still unparseable.
  if (amount) {
    const normalised = amount.replace(',', '.');
    const callbackAmount = Number.parseFloat(normalised);
    if (!Number.isNaN(callbackAmount)) {
      const storedAmount = Number.parseFloat(payment.amount.toString());
      if (Math.abs(callbackAmount - storedAmount) > 0.001) {
        throw new Error('Payment amount mismatch');
      }
    } else {
      console.warn('[IfthenpayWebhook] Could not parse MBWay callback amount:', amount);
    }
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

  await getValidatedCcardPayment(callback.id, callback.amount);

  return paymentService.markPaymentSucceeded(callback.id, undefined, PAYMENT_PROVIDER.IFTHENPAY, {
    ifthenpayCallback: {
      ...callback,
      payment_method: callback.payment_method?.toUpperCase(),
    },
  });
}

export async function handleIfthenpayMbwayCallback(callback: IfthenpayMbwayCallback) {
  assertValidAntiPhishingKey(callback.key);

  if (!callback.requestId) {
    throw new Error('Missing requestId');
  }

  const payment = await getValidatedMbwayPayment(callback.requestId, callback.amount);

  return paymentService.markPaymentSucceeded(payment.txnId, undefined, PAYMENT_PROVIDER.IFTHENPAY, {
    mbwayCallback: callback,
  });
}
