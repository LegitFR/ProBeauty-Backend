---
name: vendus
description: >
  Use this skill whenever the user wants to work with Cegid Vendus — a Portuguese billing,
  invoicing, and POS software. Covers the full invoice creation workflow: creating customers
  (POST /clients/), creating invoice documents (POST /documents/), building line items inside
  the document body, and finalising/changing document status (PATCH /documents/{id}).
  Trigger this skill for any task involving Vendus API calls, generating invoices in Vendus,
  adding products/lines to a Vendus document, managing Vendus clients, or automating Vendus
  billing workflows. Use proactively whenever the user mentions "Vendus", "fatura", "invoice
  generation", "billing API", or "POS document".
---

# Vendus API Skill

Cegid Vendus is a Portuguese billing and POS platform. Its REST API lives at:

```
Base URL: https://www.vendus.pt/ws/v1.1/
```

All requests must be authenticated and return JSON by default.

---

## Authentication

Every request **must** include your API key. Three methods are supported — pick one:

```bash
# Method 1 — HTTP Bearer (recommended)
Authorization: Bearer <api_key>

# Method 2 — HTTP Basic Auth (API key as username, empty password)
curl -u api_key: https://www.vendus.pt/ws/v1.1/...

# Method 3 — Query param (least preferred)
?api_key=<api_key>
```

**Never** send `fiscal_id` as `999999990` (anonymous consumer); always pass a real fiscal ID when you have one.

---

## HTTP Conventions

| Method   | Purpose               |
|----------|-----------------------|
| GET      | Read / list resources |
| POST     | Create a resource     |
| PATCH    | Partially update      |
| PUT      | Replace / set         |
| DELETE   | Delete                |

- All `POST`, `PUT`, `PATCH` bodies must be **JSON** with `Content-Type: application/json` (otherwise the API returns `415 Unsupported Media Type`).
- Pagination: use `?per_page=N&page=N`. Default is 20 results. Max 1000.
- Responses: `200 OK`, `201 Created`, `204 No Content` = success. `400`, `401`, `403`, `404`, `422`, `429`, `5xx` = errors.
- Rate limiting headers: `Rate-Limit-Limit`, `Rate-Limit-Remaining`, `Rate-Limit-Used`, `Rate-Limit-Reset`.

---

## The Four Core Endpoints

---

### 1. Create Customer — `POST /clients/`

Creates a new client/customer in Vendus. The client `id` returned is used when creating an invoice.

**Endpoint:** `POST https://www.vendus.pt/ws/v1.1/clients/`

**Request body (application/json):**

| Field               | Type    | Required | Description                                         |
|---------------------|---------|----------|-----------------------------------------------------|
| `name`              | string  | ✅        | Full client name                                    |
| `fiscal_id`         | string  | —        | Tax / NIF number. Omit if unknown; **never** send `999999990` |
| `address`           | string  | —        | Street address                                      |
| `postalcode`        | string  | —        | Postal code (e.g. `4100-039`)                       |
| `city`              | string  | —        | City                                                |
| `country`           | string  | —        | ISO 3166-1 alpha-2 country code (e.g. `PT`, `GB`)   |
| `phone`             | string  | —        | Phone number                                        |
| `mobile`            | string  | —        | Mobile / cell number                                |
| `email`             | string  | —        | Email address                                       |
| `website`           | string  | —        | Site URL                                            |
| `external_reference`| string  | —        | Your own reference ID for this client               |
| `notes`             | string  | —        | Internal notes                                      |
| `price_group_id`    | integer | —        | ID of a price group to assign                       |
| `send_email`        | string  | —        | Auto-send invoices: `"yes"` or `"no"` (Não)        |
| `default_pay_due`   | string  | —        | Default payment term. Enum: `"now"`, `"1"`, `"7"`, `"15"`, `"30"`, `"45"`, `"60"`, `"90"` |
| `irs_retention`     | string  | —        | IRS retention: `"yes"` or `"no"`                    |

**Minimal example:**
```json
{
  "name": "Alberto Lopes",
  "fiscal_id": "223098091",
  "address": "Av. Sousa Magalhães, 126",
  "postalcode": "4100-039",
  "city": "Lisboa",
  "country": "PT",
  "phone": "210 192 930",
  "email": "alberto@dominio.pt"
}
```

**Success response — `201 Created`:**
```json
{
  "id": 12345,
  "fiscal_id": "223098091",
  "name": "Alberto Lopes",
  "address": "Av. Sousa Magalhães, 126",
  "postalcode": "4100-039",
  "city": "Lisboa",
  "country": "PT",
  "phone": "210 192 930",
  "mobile": "918 876 546",
  "email": "alberto@dominio.pt",
  "external_reference": "AB892798/19",
  "default_pay_due": "15",
  "send_email": "yes",
  "irs_retention": "no",
  "status": "active",
  "date": "2026-03-29"
}
```

> 💡 **Save the `id`** from the response — you'll need it as `client.id` when creating the invoice.

**PHP cURL example:**
```php
$url    = 'https://www.vendus.pt/ws/v1.1/clients/';
$apiKey = 'YOUR_API_KEY';
$data   = [
    "name"       => "Alberto Lopes",
    "fiscal_id"  => "223098091",
    "city"       => "Lisboa",
    "country"    => "PT",
    "email"      => "alberto@dominio.pt"
];
$curl = curl_init($url);
curl_setopt($curl, CURLOPT_HTTPAUTH, CURLAUTH_BASIC);
curl_setopt($curl, CURLOPT_USERPWD, $apiKey);
curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
curl_setopt($curl, CURLOPT_POST, true);
curl_setopt($curl, CURLOPT_POSTFIELDS, json_encode($data));
curl_setopt($curl, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
$result = curl_exec($curl);
```

---

### 2. Create Invoice — `POST /documents/`

Creates a new fiscal document (invoice, simplified invoice, receipt, etc.).  
The **mandatory** field is `items` — every document must have at least one line.

> ⚠️ **Important rule:** If you provide a `client`, omit `fiscal_id: 999999990`. If the client doesn't exist yet, Vendus will create it automatically. You should only use `client.id` (from Step 1) or `client.fiscal_id` — not both.

**Endpoint:** `POST https://www.vendus.pt/ws/v1.1/documents/`

#### Document `type` values (most common):

| Code | Document Type (PT)          | Use Case                        |
|------|-----------------------------|---------------------------------|
| `FT` | Fatura                      | Standard invoice (B2B)          |
| `FS` | Fatura Simplificada         | Simplified invoice (B2C, retail)|
| `FR` | Fatura-Recibo               | Invoice + Receipt combined      |
| `NC` | Nota de Crédito             | Credit note                     |
| `PF` | Fatura Pró-Forma            | Proforma invoice                |
| `OT` | Orçamento                   | Quote / Estimate                |
| `EC` | Encomenda                   | Purchase Order                  |
| `RG` | Recibo                      | Payment receipt                 |
| `GR` | Guia de Remessa             | Delivery note                   |

#### Request body fields:

| Field                  | Type          | Required | Description                                           |
|------------------------|---------------|----------|-------------------------------------------------------|
| `items`                | array         | ✅        | Line items array — see Section 3 below                |
| `type`                 | string        | —        | Document type code (default: `FT`). See table above   |
| `register_id`          | integer       | —        | POS Register ID (required in POS contexts)            |
| `client`               | object        | —        | Client object (see sub-fields below)                  |
| `date`                 | string        | —        | Document date `YYYY-MM-DD`. Defaults to today         |
| `date_supply`          | string        | —        | Supply/delivery date `YYYY-MM-DD`. Defaults to today  |
| `date_due`             | string        | —        | Payment due date `YYYY-MM-DD`                         |
| `notes`                | string        | —        | Notes / observations printed on document              |
| `external_reference`   | string        | —        | Your own external reference                           |
| `discount_amount`      | string        | —        | Global discount in euros                              |
| `discount_percentage`  | string        | —        | Global discount as percentage                         |
| `payments`             | array         | —        | Payment methods array (see sub-fields below)          |
| `output`               | string        | —        | Desired output format. Enum: `"auto"`, `"pdf_url"`, `"pdf"`, `"html"`, `"escpos"`, `"tpasibs"` |
| `output_template_id`   | integer       | —        | Custom print template ID                              |
| `mode`                 | string        | —        | Working mode: `"normal"` (default) or `"tests"`       |
| `stock_operation`      | string        | —        | Stock adjustment: `"in"`, `"out"`, `"none"`          |
| `errors_full`          | string        | —        | Get full error detail: `"yes"` or `"no"`              |
| `tx_id`                | string        | —        | Unique transaction ID (for idempotency)               |

**`client` sub-object fields:**

| Field         | Description                          |
|---------------|--------------------------------------|
| `id`          | Client ID (from POST /clients/)      |
| `fiscal_id`   | Tax / NIF number                     |
| `name`        | Client name                          |
| `address`     | Address                              |
| `postalcode`  | Postal code                          |
| `city`        | City                                 |
| `country`     | ISO country code                     |
| `email`       | Email address                        |

**`payments` sub-object fields:**

| Field    | Description              |
|----------|--------------------------|
| `id`     | Payment method ID        |
| `amount` | Amount paid              |
| `change` | Change given             |

**Minimal invoice example:**
```json
{
  "type": "FT",
  "client": {
    "id": 12345
  },
  "items": [
    {
      "id": 9001,
      "qty": 2
    }
  ]
}
```

**Full invoice example:**
```json
{
  "type": "FT",
  "date": "2026-03-29",
  "date_due": "2026-04-28",
  "notes": "Obrigado pela preferência",
  "external_reference": "ORD-2026-001",
  "output": "pdf_url",
  "client": {
    "id": 12345,
    "name": "Alberto Lopes",
    "fiscal_id": "223098091",
    "address": "Av. Sousa Magalhães, 126",
    "postalcode": "4100-039",
    "city": "Lisboa",
    "country": "PT"
  },
  "items": [
    {
      "id": 9001,
      "qty": 3,
      "gross_price": "150.00",
      "tax_id": "NOR",
      "title": "Consulting Services",
      "discount_percentage": "5"
    },
    {
      "reference": "PROD-ABC",
      "qty": 1,
      "gross_price": "49.99",
      "tax_id": "NOR",
      "title": "Software License"
    }
  ],
  "payments": [
    {
      "id": 12345,
      "amount": "499.99"
    }
  ]
}
```

**Success response — `201 Created`:**
```json
{
  "id": 12345,
  "type": "FT",
  "subtype": "G",
  "number": "FT 01P2016/220",
  "date": "2026-01-02",
  "date_supply": "2026-01-02",
  "amount_gross": "123.00",
  "amount_net": "100.00",
  "hash": "Bgah",
  "atcud": "JFAAAAAA-123",
  "output": "https://...",
  "output_data": "...",
  "qrcode": "...",
  "status": { "id": "N", "date": "2026-01-02" },
  "client": { ... },
  "items": [ ... ]
}
```

> 💡 **Save the `id`** from the response — you'll need it for PATCH (finalise) in Step 4.

---

### 3. Add Lines (Items) to a Document

Lines are **not** a separate endpoint — they are passed as the `items` array inside the `POST /documents/` body. Each element in `items` represents one invoice line.

**Item object fields:**

| Field                | Type    | Required       | Description                                                    |
|----------------------|---------|----------------|----------------------------------------------------------------|
| `id`                 | integer | ✅ (or reference) | Product ID from Vendus catalogue                           |
| `reference`          | string  | ✅ (or id)     | Product reference/SKU. If product doesn't exist, it is created |
| `qty`                | number  | ✅              | Quantity                                                       |
| `gross_price`        | string  | —              | Unit price **including** tax. If omitted, uses catalogue price |
| `price_without_tax`  | string  | —              | Unit price **excluding** tax                                   |
| `tax_id`             | string  | —              | Tax identifier. Common values: `"NOR"` (23%), `"INT"` (13%), `"RED"` (6%), `"ISE"` (exempt) |
| `title`              | string  | —              | Product name / line description (overrides catalogue name)     |
| `description`        | string  | —              | Additional line description                                    |
| `discount_amount`    | string  | —              | Line-level discount in euros                                   |
| `discount_percentage`| string  | —              | Line-level discount as percentage (e.g. `"10"` for 10%)        |
| `unit_id`            | integer | —              | Unit of measure ID                                             |
| `order`              | integer | —              | Line display order                                             |

> **Rules:**
> - At minimum, every item needs `qty` **and** either `id` or `reference`.
> - If you supply `id`, Vendus looks up the product in your catalogue. Price and tax will be populated from the catalogue unless you override them.
> - If you supply only `reference` (no `id`) and the product doesn't exist, Vendus **creates** it automatically.
> - For **Credit Notes** (`type: NC`): each item must also include `reference_document` with `document_number` and `document_row` fields to identify the original invoice line being credited.

**Single-item minimal:**
```json
{ "id": 9001, "qty": 1 }
```

**Single-item with all pricing:**
```json
{
  "reference": "SVC-001",
  "title": "Design Services",
  "description": "Logo and branding package",
  "qty": 1,
  "gross_price": "500.00",
  "tax_id": "NOR",
  "discount_percentage": "10"
}
```

**Multi-line items array:**
```json
"items": [
  {
    "id": 101,
    "qty": 5,
    "gross_price": "20.00",
    "tax_id": "NOR"
  },
  {
    "reference": "SERV-HR",
    "title": "Hourly Consulting",
    "qty": 8,
    "gross_price": "75.00",
    "tax_id": "NOR",
    "discount_percentage": "5"
  },
  {
    "reference": "SHIP-01",
    "title": "Shipping & Handling",
    "qty": 1,
    "gross_price": "9.99",
    "tax_id": "RED"
  }
]
```

---

### 4. Finalise Document — `PATCH /documents/{id}`

Changes the status of an existing document. Use this to **finalise** (mark as invoiced), **cancel**, or revert to normal.

**Endpoint:** `PATCH https://www.vendus.pt/ws/v1.1/documents/{id}`

| Path param | Type    | Required | Description              |
|------------|---------|----------|--------------------------|
| `id`       | integer | ✅        | Document ID from Step 2  |

**Request body:**

| Field    | Type    | Required | Description                                                      |
|----------|---------|----------|------------------------------------------------------------------|
| `status` | string  | ✅        | New status. Enum: `"N"` (Normal), `"A"` (Canceled), `"F"` (Invoiced) |
| `id`     | integer | —        | Document ID (can also be passed in body)                         |
| `stock`  | string  | —        | `"true"` to trigger stock adjustment on status change            |
| `mode`   | string  | —        | `"normal"` or `"tests"`                                          |

**Status values:**

| Value | Meaning     | When to use                                        |
|-------|-------------|---------------------------------------------------|
| `"N"` | Normal      | Default draft state; document is open/editable    |
| `"F"` | Invoiced    | Finalise the document — makes it legally binding  |
| `"A"` | Canceled    | Void / annul the document                         |

**Finalise (mark as invoiced):**
```json
{
  "status": "F"
}
```

**Cancel a document:**
```json
{
  "status": "A"
}
```

**Finalise with stock decrement:**
```json
{
  "status": "F",
  "stock": "true"
}
```

**PHP cURL example:**
```php
$docId  = 12345;
$url    = "https://www.vendus.pt/ws/v1.1/documents/{$docId}";
$apiKey = 'YOUR_API_KEY';
$data   = ["status" => "F"];

$curl = curl_init($url);
curl_setopt($curl, CURLOPT_HTTPAUTH, CURLAUTH_BASIC);
curl_setopt($curl, CURLOPT_USERPWD, $apiKey);
curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
curl_setopt($curl, CURLOPT_CUSTOMREQUEST, 'PATCH');
curl_setopt($curl, CURLOPT_POSTFIELDS, json_encode($data));
curl_setopt($curl, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
$result = curl_exec($curl);
```

**Success response — `200 OK`:**
```json
{
  "id": 12345,
  "status": "F"
}
```

---

## Complete End-to-End Workflow

```
Step 1 — Create Customer
POST /clients/
→ Returns client id (e.g. 12345)

Step 2 — Create Invoice (with lines inside)
POST /documents/
  body: { type, client: { id: 12345 }, items: [...] }
→ Returns document id (e.g. 67890), number, amounts

Step 3 — Lines are already inside the POST /documents/ body
  (items array — see Section 3)
  No separate endpoint needed.

Step 4 — Finalise
PATCH /documents/67890
  body: { "status": "F" }
→ Document becomes legally binding
```

---

## Common Patterns & Tips

**Getting a PDF URL back from invoice creation:**
```json
{
  "output": "pdf_url",
  ...other fields
}
```
The response `output` field will contain a direct URL to the PDF.

**Testing without real fiscal data:**
```json
{
  "mode": "tests",
  ...
}
```
Use `mode: "tests"` during development to avoid affecting real fiscal records.

**Checking rate limits:**
Read response headers:
```
Rate-Limit-Limit: 100
Rate-Limit-Remaining: 87
Rate-Limit-Used: 1
Rate-Limit-Reset: 20   ← seconds until reset
```

**Getting document as PDF directly:**
```
GET https://www.vendus.pt/ws/v1.1/documents/12345.pdf
```

**Common error codes:**

| Code | Meaning                          | Fix                                         |
|------|----------------------------------|---------------------------------------------|
| 401  | No/bad API key                   | Check your API key                          |
| 403  | Permission denied / bad params   | Check field values (e.g. badly filled form) |
| 404  | Resource not found               | Check document/client ID                   |
| 415  | Wrong Content-Type               | Add `Content-Type: application/json` header |
| 422  | Validation error                 | Check required/enum fields                  |
| 429  | Rate limit exceeded              | Back off, check `Rate-Limit-Reset` header   |

---

## API Reference Quick-Links

| Resource  | List / Create           | Get / Update / Delete            |
|-----------|-------------------------|----------------------------------|
| Clients   | `GET/POST /clients/`    | `GET/PATCH/DELETE /clients/{id}` |
| Documents | `GET/POST /documents/`  | `GET/PATCH /documents/{id}`      |
| Products  | `GET/POST /products/`   | `GET/PATCH/DELETE /products/{id}`|
| Account   | `GET /account/`         | `GET /account/{id}`              |

Full API docs: `https://www.vendus.pt/ws/v1.1/`
