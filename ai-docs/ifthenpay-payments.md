# If-Then Pay Payments

## Supported Methods

- `CCARD`
- `MBWAY`

## Checkout Endpoints

- `POST /api/v1/orders/checkout`
- `POST /api/v1/bookings/checkout`

Both endpoints accept:

- `paymentMethod` with values `CCARD` or `MBWAY`
- `mobileNumber` when `paymentMethod=MBWAY`

## Sample Order Checkout Requests

### CCARD Order Checkout cURL

```bash
curl -X POST http://localhost:8000/api/v1/orders/checkout \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "addressId": "cmirpfz4900054w066qmhy3ic",
    "paymentMethod": "CCARD"
  }'
```

### CCARD Order Checkout Sample Response

```json
{
  "message": "Order created successfully. Complete payment to confirm.",
  "data": {
    "order": {
      "id": "cmj1order1234567890abc",
      "status": "PAYMENT_PENDING"
    },
    "payment": {
      "provider": "ifthenpay",
      "method": "CCARD",
      "paymentUrl": "https://webkit.lemonway.fr/mb/ifthenpay/prod/?moneyintoken=xxx",
      "reference": "ordy3icab12x9q",
      "requestId": "36jvlEhUYeknQ8PHKprR",
      "status": "pending"
    }
  }
}
```

### MB WAY Order Checkout cURL

```json
{
  "paymentMethod": "MBWAY",
  "mobileNumber": "351#912345678"
}
```

```bash
curl -X POST http://localhost:8000/api/v1/orders/checkout \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "addressId": "cmirpfz4900054w066qmhy3ic",
    "paymentMethod": "MBWAY",
    "mobileNumber": "351#912345678"
  }'
```

### MB WAY Order Checkout Sample Response

```json
{
  "message": "Order created successfully. Complete payment to confirm.",
  "data": {
    "order": {
      "id": "cmj1order1234567890abc",
      "status": "PAYMENT_PENDING"
    },
    "payment": {
      "provider": "ifthenpay",
      "method": "MBWAY",
      "reference": "ordy3icab12x9q",
      "requestId": "i2szvoUfPYBMWdSxqO3n",
      "status": "pending",
      "mobileNumber": "351#912345678",
      "message": "Approve payment in the MB WAY app to complete checkout."
    }
  }
}
```

## Sample Booking Checkout Requests

### MB WAY Booking Checkout cURL

```bash
curl -X POST http://localhost:8000/api/v1/bookings/checkout \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "salonId": "cm8xsalon1234567890ab",
    "serviceIds": ["cm8xservice1234567890a1"],
    "staffId": "cm8xstaff1234567890abc",
    "startTime": "2026-04-02T10:00:00.000Z",
    "paymentMethod": "MBWAY",
    "mobileNumber": "351#912345678"
  }'
```

### MB WAY Booking Checkout Sample Response

```json
{
  "message": "Booking created successfully. Complete payment to confirm.",
  "data": {
    "booking": {
      "id": "cmj1booking123456789ab",
      "status": "PAYMENT_PENDING"
    },
    "payment": {
      "provider": "ifthenpay",
      "method": "MBWAY",
      "reference": "bok90abx12y8pq",
      "requestId": "i2szvoUfPYBMWdSxqO3n",
      "status": "pending",
      "mobileNumber": "351#912345678",
      "message": "Approve payment in the MB WAY app to complete checkout."
    }
  }
}
```

Returned `payment` payload always includes:

- `provider`
- `method`
- `reference`
- `requestId`
- `status`

`CCARD` responses also include `paymentUrl`.

`MBWAY` responses include the normalized `mobileNumber` and a guidance message instead of `paymentUrl`.

## Callback Endpoints

- `GET /api/v1/webhooks/ifthenpay/ccard`
- `GET /api/v1/webhooks/ifthenpay/mbway`

MB WAY callback parameters:

- `key`
- `orderId`
- `requestId`
- `amount`
- `payment_datetime`

Both callback handlers:

- validate `IFTHENPAY_ANTI_PHISHING_KEY`
- verify amount against the stored payment
- reconcile by local merchant reference in `payments.txn_id`
- mark the payment `succeeded`
- confirm the linked order or booking

### CCARD Callback Sample cURL

```bash
curl "http://localhost:8000/api/v1/webhooks/ifthenpay/ccard?key=YOUR_ANTI_PHISHING_KEY&id=ordy3icab12x9q&amount=149.99&payment_datetime=28-10-2021%2010:55:21&payment_method=CCARD"
```

### CCARD Callback Sample Response

```json
{
  "success": true,
  "message": "If-Then Pay callback processed successfully",
  "paymentId": "cmj1pay1234567890abc",
  "txnId": "ordy3icab12x9q"
}
```

### MB WAY Callback Sample cURL

```bash
curl "http://localhost:8000/api/v1/webhooks/ifthenpay/mbway?key=YOUR_ANTI_PHISHING_KEY&orderId=ordy3icab12x9q&amount=149.99&requestId=i2szvoUfPYBMWdSxqO3n&payment_datetime=03-01-2024%2015:15:16"
```

### MB WAY Callback Sample Response

```json
{
  "success": true,
  "message": "If-Then Pay MB WAY callback processed successfully",
  "paymentId": "cmj1pay1234567890abc",
  "txnId": "ordy3icab12x9q"
}
```

## Recovery

Pending MB WAY payments can be refreshed through the backend using the stored `ifthenpayRequestId` and the provider status endpoint:

- `GET https://api.ifthenpay.com/spg/payment/mbway/status`

The current backend performs this recovery when payment details are requested for pending MB WAY payments.

### MB WAY Status Endpoint Example

```bash
curl "https://api.ifthenpay.com/spg/payment/mbway/status?mbWayKey=YOUR_MBWAY_KEY&requestId=i2szvoUfPYBMWdSxqO3n"
```

### MB WAY Status Sample Response

```json
{
  "CreatedAt": "03-01-2024 15:15:06",
  "Message": "Success",
  "RequestId": "i2szvoUfPYBMWdSxqO3n",
  "Status": "000",
  "UpdateAt": "03-01-2024 15:15:16"
}
```

## Compatibility

- Historical Stripe rows remain supported.
- Existing CCARD flow remains supported.
- Existing payment columns are reused for MB WAY:
  - `ifthenpay_request_id`
  - `ifthenpay_method`
  - `ifthenpay_payment_url` for CCARD only
