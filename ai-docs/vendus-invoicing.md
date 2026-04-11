# Vendus Invoicing

## Trigger

- Order invoices are generated only after the related payment is marked `SUCCEEDED`.
- The trigger runs from `src/services/paymentService.ts`, so both Stripe and If-Then Pay successful callbacks use the same invoice flow.

## Data Source

- Billing/customer details are derived at invoice time from:
  - the order's owning user email
  - the checkout address referenced in `payment.metadata.checkout.addressId`
  - the order items and product catalog data
- No dedicated invoice schema fields are stored in Prisma.

## Vendus Flow

1. Reuse a previously known Vendus client id from recent successful payments for the same user when available.
2. Otherwise create a Vendus client using the checkout address and user email.
3. Create a Vendus document with:
   - document type from `VENDUS_DOCUMENT_TYPE`
   - line items mapped from order items
   - `tx_id` based on the internal payment id
   - `output: pdf_url`
4. Finalize the document with status `F`.
5. Download the PDF and email it to the customer as an attachment.

## Idempotency

- Vendus state is persisted in `payment.metadata.invoice`.
- Repeated success webhooks will not create a second document once `vendusDocumentId` exists.
- If document creation already happened but email sending failed, the next successful retry path will only retry the missing email step.
- If Vendus returns a CloudFront edge block, duplicate webhook retries for the same payment are suppressed for 15 minutes to avoid repeatedly hammering Vendus while the upstream/network block is still active.

## Environment Variables

- `VENDUS_API_KEY`
- `VENDUS_BASE_URL`
- `VENDUS_DOCUMENT_TYPE`
- `VENDUS_MODE`

Local Node/tsx runs load `.env.local` before `.env` so they match Bun's local environment precedence.

## Troubleshooting

- Vendus API validation/auth errors should return JSON.
- A text/html `403` with `server: CloudFront` means the request was blocked by Vendus' edge layer before API authentication was evaluated. Check the runtime network/IP with Vendus support and include the CloudFront request id from the backend error log.
