# If-Then Pay API

## Overview

The If-Then Pay integration now supports two checkout methods for new order and booking payments:

- `CCARD`
- `MBWAY`

Both methods use the same local payment model and the same checkout endpoints. The backend creates a pending local payment first and only confirms the order or booking after If-Then Pay callback verification or MB WAY status recovery.

## Environment Variables

- `IFTHENPAY_CCARD_KEY` - required for CCARD initialization
- `IFTHENPAY_MBWAY_KEY` - required for MB WAY initialization and status lookup
- `IFTHENPAY_ANTI_PHISHING_KEY` - required for callback verification
- `IFTHENPAY_USE_SANDBOX` - used by the CCARD flow
- `BACKEND_PUBLIC_URL` - used to build callback URLs
- `FRONTEND_APP_URL` - used to build CCARD redirect URLs

Stripe env vars remain optional for historical compatibility:

- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`

## Customer Checkout Endpoints

### Create Order Checkout Session

**Description:** Create an order from the authenticated user's cart, create a pending If-Then Pay payment, and return a method-aware payment payload.

**Endpoint:** `POST /api/v1/orders/checkout`

**Authentication:** Required (Bearer token)

**Request Body:**

```json
{
  "addressId": "cm8x1234567890abcdef1234",
  "paymentMethod": "MBWAY",
  "mobileNumber": "351#912345678"
}
```

**Success Response (201 Created) for CCARD:**

```json
{
  "message": "Order created successfully. Complete payment to confirm.",
  "data": {
    "order": {
      "id": "cm8xorder1234567890abcd",
      "status": "PAYMENT_PENDING"
    },
    "payment": {
      "provider": "ifthenpay",
      "method": "CCARD",
      "paymentUrl": "https://webkit.lemonway.fr/mb/ifthenpay/prod/?moneyintoken=xxx",
      "reference": "ordhy3iabc12345",
      "requestId": "36jvlEhUYeknQ8PHKprR",
      "status": "pending"
    }
  }
}
```

**Success Response (201 Created) for MB WAY:**

```json
{
  "message": "Order created successfully. Complete payment to confirm.",
  "data": {
    "order": {
      "id": "cm8xorder1234567890abcd",
      "status": "PAYMENT_PENDING"
    },
    "payment": {
      "provider": "ifthenpay",
      "method": "MBWAY",
      "reference": "ordhy3iabc12345",
      "requestId": "i2szvoUfPYBMWdSxqO3n",
      "status": "pending",
      "mobileNumber": "351#912345678",
      "message": "Approve payment in the MB WAY app to complete checkout."
    }
  }
}
```

---

### Create Booking Checkout Session

**Description:** Create a booking in `PAYMENT_PENDING`, create a pending If-Then Pay payment, and return a method-aware payment payload.

**Endpoint:** `POST /api/v1/bookings/checkout`

**Authentication:** Required (Bearer token)

**Request Body:**

```json
{
  "salonId": "cm8xsalon1234567890ab",
  "serviceIds": ["cm8xservice1234567890a1"],
  "staffId": "cm8xstaff1234567890abc",
  "startTime": "2026-04-02T10:00:00.000Z",
  "paymentMethod": "CCARD"
}
```

**Behavior:**

- `paymentMethod` defaults to `CCARD`
- `mobileNumber` is required only when `paymentMethod=MBWAY`
- `mobileNumber` format must be `countryCode#number`

## Payment Detail Endpoints

### Get Order Payment Details

**Endpoint:** `GET /api/v1/orders/:id/payment`

Returns persisted payments for the order. If any pending payment is `MBWAY`, the backend attempts a provider status refresh before returning the response.

### Get Booking Payment Details

**Endpoint:** `GET /api/v1/bookings/:id/payment`

Returns persisted payments for the booking. If any pending payment is `MBWAY`, the backend attempts a provider status refresh before returning the response.

## Webhook / Callback Endpoints

### Credit Card Callback

**Endpoint:** `GET /api/v1/webhooks/ifthenpay/ccard`

**Query Parameters:**

- `key`
- `id`
- `amount`
- `payment_datetime`
- `payment_method`

**Behavior:**

- validates anti-phishing key
- requires `payment_method=CCARD`
- matches `id` to `payments.txn_id`
- verifies amount
- marks the payment as succeeded

---

### MB WAY Callback

**Endpoint:** `GET /api/v1/webhooks/ifthenpay/mbway`

**Query Parameters:**

- `key`
- `orderId`
- `requestId`
- `amount`
- `payment_datetime`

**Behavior:**

- validates anti-phishing key
- matches `orderId` to `payments.txn_id`
- requires `requestId` to match stored `ifthenpayRequestId`
- verifies amount
- marks the payment as succeeded

## Internal Flow

### CCARD

1. Checkout selects `paymentMethod=CCARD` or omits the field.
2. Backend initializes `POST /creditcard/init/{CCARD_KEY}` or the sandbox equivalent.
3. Provider returns `PaymentUrl` and `RequestId`.
4. Backend stores:
   - `provider=ifthenpay`
   - `ifthenpayMethod=CCARD`
   - `ifthenpayRequestId`
   - `ifthenpayPaymentUrl`
5. Callback to `/api/v1/webhooks/ifthenpay/ccard` confirms the payment.

### MB WAY

1. Checkout selects `paymentMethod=MBWAY`.
2. Client supplies `mobileNumber` in `countryCode#number` format.
3. Backend initializes `POST https://api.ifthenpay.com/spg/payment/mbway`.
4. Provider returns `RequestId`, `Status=000`, and a pending message.
5. Backend stores:
   - `provider=ifthenpay`
   - `ifthenpayMethod=MBWAY`
   - `ifthenpayRequestId`
   - `metadata.mobileNumber`
6. Callback to `/api/v1/webhooks/ifthenpay/mbway` confirms the payment.
7. If callback is delayed, backend checks `GET /spg/payment/mbway/status` using the stored `requestId`.

## Persistence Model

The MB WAY flow reuses the existing If-Then Pay columns:

- `ifthenpay_request_id`
- `ifthenpay_method`
- `ifthenpay_payment_url` remains populated only for `CCARD`

The mobile number and raw provider payloads are stored in `payments.metadata`.

## Validation Rules

- `paymentMethod` must be `CCARD` or `MBWAY`
- `mobileNumber` is required only for `MBWAY`
- `mobileNumber` must match `^\d{1,4}#\d{6,15}$`

## Recovery Behavior

Pending MB WAY payments are refreshed through the backend using the stored `ifthenpayRequestId`. A status response of:

- `Status = "000"`
- `Message = "Success"`

is treated as a successful payment and finalizes the linked order or booking.

## Notes

- Historical Stripe rows remain supported.
- Existing CCARD flow remains supported.
- No new client polling endpoint is required for MB WAY in this phase.
