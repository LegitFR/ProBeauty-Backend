# Offers API

## Overview

The Offers API provides endpoints for salon owners to manage promotional offers and for users to discover and validate offers during checkout.

## Salon Owner Endpoints

### Create Offer

**Description:** Create a new promotional offer for a salon, product, or service.

**Endpoint:** `POST /api/v1/offers`

**Authentication:** Required (Bearer token)

**Request Body:**

```json
{
  "salonId": "clh7x8y9z0ab",
  "title": "Summer Special Discount",
  "description": "Get amazing discounts this summer!",
  "offerType": "product",
  "productId": "clh7x8y9z0ac",
  "discountType": "percentage",
  "discountValue": "25",
  "startsAt": "2024-06-01T00:00:00Z",
  "endsAt": "2024-08-31T23:59:59Z"
}
```

**Form Data:** (Optional)

- `image`: File (max 5MB, types: JPEG, PNG, WebP, GIF)

**Success Response (201 Created):**

```json
{
  "message": "Offer created successfully",
  "data": {
    "id": "clh7x8y9z0ad",
    "salonId": "clh7x8y9z0ab",
    "title": "Summer Special Discount",
    "description": "Get amazing discounts this summer!",
    "offerType": "product",
    "productId": "clh7x8y9z0ac",
    "serviceId": null,
    "discountType": "percentage",
    "discountValue": "25.00",
    "startsAt": "2024-06-01T00:00:00.000Z",
    "endsAt": "2024-08-31T23:59:59.000Z",
    "isActive": true,
    "image": "https://res.cloudinary.com/xxx/image/upload/v1234567890/probeauty/offers/xxx.jpg",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z",
    "salon": {
      "id": "clh7x8y9z0ab",
      "name": "Glamour Studio"
    },
    "product": {
      "id": "clh7x8y9z0ac",
      "title": "Premium Hair Serum"
    },
    "service": null
  }
}
```

**cURL Command:**

```bash
curl -X POST http://localhost:5000/api/v1/offers \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "salonId=clh7x8y9z0ab" \
  -F "title=Summer Special Discount" \
  -F "description=Get amazing discounts this summer!" \
  -F "offerType=product" \
  -F "productId=clh7x8y9z0ac" \
  -F "discountType=percentage" \
  -F "discountValue=25" \
  -F "startsAt=2024-06-01T00:00:00Z" \
  -F "endsAt=2024-08-31T23:59:59Z" \
  -F "image=@/path/to/offer-banner.jpg"
```

---

### Update Offer

**Description:** Update an existing offer's details.

**Endpoint:** `PATCH /api/v1/offers/:id`

**Authentication:** Required (Bearer token)

**Request Body:**

```json
{
  "title": "Extended Summer Sale",
  "description": "Extended until September!",
  "endsAt": "2024-09-30T23:59:59Z"
}
```

**Form Data:** (Optional)

- `image`: File (max 5MB, types: JPEG, PNG, WebP, GIF)

**Success Response (200 OK):**

```json
{
  "message": "Offer updated successfully",
  "data": {
    "id": "clh7x8y9z0ad",
    "salonId": "clh7x8y9z0ab",
    "title": "Extended Summer Sale",
    "description": "Extended until September!",
    "offerType": "product",
    "productId": "clh7x8y9z0ac",
    "serviceId": null,
    "discountType": "percentage",
    "discountValue": "25.00",
    "startsAt": "2024-06-01T00:00:00.000Z",
    "endsAt": "2024-09-30T23:59:59.000Z",
    "isActive": true,
    "image": "https://res.cloudinary.com/xxx/image/upload/v1234567890/probeauty/offers/xxx.jpg",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-20T14:15:00.000Z",
    "salon": {
      "id": "clh7x8y9z0ab",
      "name": "Glamour Studio"
    },
    "product": {
      "id": "clh7x8y9z0ac",
      "title": "Premium Hair Serum"
    },
    "service": null
  }
}
```

**cURL Command:**

```bash
curl -X PATCH http://localhost:5000/api/v1/offers/clh7x8y9z0ad \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Extended Summer Sale",
    "description": "Extended until September!",
    "endsAt": "2024-09-30T23:59:59Z"
  }'
```

---

### Toggle Offer Active Status

**Description:** Activate or deactivate an offer.

**Endpoint:** `PATCH /api/v1/offers/:id/toggle`

**Authentication:** Required (Bearer token)

**Request Body:**

```json
{
  "isActive": false
}
```

**Success Response (200 OK):**

```json
{
  "message": "Offer deactivated successfully",
  "data": {
    "id": "clh7x8y9z0ad",
    "salonId": "clh7x8y9z0ab",
    "title": "Summer Special Discount",
    "description": "Get amazing discounts this summer!",
    "offerType": "product",
    "productId": "clh7x8y9z0ac",
    "serviceId": null,
    "discountType": "percentage",
    "discountValue": "25.00",
    "startsAt": "2024-06-01T00:00:00.000Z",
    "endsAt": "2024-08-31T23:59:59.000Z",
    "isActive": false,
    "image": "https://res.cloudinary.com/xxx/image/upload/v1234567890/probeauty/offers/xxx.jpg",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-20T14:15:00.000Z",
    "salon": {
      "id": "clh7x8y9z0ab",
      "name": "Glamour Studio"
    },
    "product": {
      "id": "clh7x8y9z0ac",
      "title": "Premium Hair Serum"
    },
    "service": null
  }
}
```

**cURL Command:**

```bash
curl -X PATCH http://localhost:5000/api/v1/offers/clh7x8y9z0ad/toggle \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "isActive": false
  }'
```

---

### Delete Offer

**Description:** Delete an offer permanently.

**Endpoint:** `DELETE /api/v1/offers/:id`

**Authentication:** Required (Bearer token)

**Success Response (200 OK):**

```json
{
  "message": "Offer deleted successfully"
}
```

**cURL Command:**

```bash
curl -X DELETE http://localhost:5000/api/v1/offers/clh7x8y9z0ad \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

### List Offers (Salon Owner)

**Description:** List all offers for the salon owner's salons with optional filters.

**Endpoint:** `GET /api/v1/offers`

**Authentication:** Required (Bearer token)

**Query Parameters:**

- `salonId` (string, optional) - Filter by specific salon
- `productId` (string, optional) - Filter by product
- `serviceId` (string, optional) - Filter by service
- `offerType` (string, optional) - Filter by offer type: `salon` | `product` | `service`
- `activeOnly` (boolean, optional) - Show only active offers
- `page` (number, optional) - Page number (default: 1)
- `limit` (number, optional) - Items per page (default: 10)

**Success Response (200 OK):**

```json
{
  "message": "Offers retrieved successfully",
  "data": [
    {
      "id": "clh7x8y9z0ad",
      "salonId": "clh7x8y9z0ab",
      "title": "Summer Special Discount",
      "description": "Get amazing discounts this summer!",
      "offerType": "product",
      "productId": "clh7x8y9z0ac",
      "serviceId": null,
      "discountType": "percentage",
      "discountValue": "25.00",
      "startsAt": "2024-06-01T00:00:00.000Z",
      "endsAt": "2024-08-31T23:59:59.000Z",
      "isActive": true,
      "image": "https://res.cloudinary.com/xxx/image/upload/v1234567890/probeauty/offers/xxx.jpg",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z",
      "salon": {
        "id": "clh7x8y9z0ab",
        "name": "Glamour Studio"
      },
      "product": {
        "id": "clh7x8y9z0ac",
        "title": "Premium Hair Serum"
      },
      "service": null
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 15,
    "totalPages": 2
  }
}
```

**cURL Command:**

```bash
curl -X GET "http://localhost:5000/api/v1/offers?salonId=clh7x8y9z0ab&offerType=product&activeOnly=true&page=1&limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

### Get Offer by ID (Protected)

**Description:** Get a specific offer by ID (salon owner view).

**Endpoint:** `GET /api/v1/offers/:id`

**Authentication:** Required (Bearer token)

**URL Parameters:**

- `id` (string, required) - Offer ID

**Success Response (200 OK):**

```json
{
  "message": "Offer fetched successfully",
  "data": {
    "id": "clh7x8y9z0ad",
    "salonId": "clh7x8y9z0ab",
    "title": "Summer Special Discount",
    "description": "Get amazing discounts this summer!",
    "offerType": "product",
    "productId": "clh7x8y9z0ac",
    "serviceId": null,
    "discountType": "percentage",
    "discountValue": "25.00",
    "startsAt": "2024-06-01T00:00:00.000Z",
    "endsAt": "2024-08-31T23:59:59.000Z",
    "isActive": true,
    "image": "https://res.cloudinary.com/xxx/image/upload/v1234567890/probeauty/offers/xxx.jpg",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z",
    "salon": {
      "id": "clh7x8y9z0ab",
      "name": "Glamour Studio",
      "address": "123 Main Street, New York, NY 10001"
    },
    "product": {
      "id": "clh7x8y9z0ac",
      "title": "Premium Hair Serum",
      "price": "49.99"
    },
    "service": null
  }
}
```

**cURL Command:**

```bash
curl -X GET http://localhost:5000/api/v1/offers/clh7x8y9z0ad \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## Public Endpoints

### Get Active Offers

**Description:** Get all active and currently valid offers with optional filters.

**Endpoint:** `GET /api/v1/offers/public/active`

**Authentication:** Not required

**Query Parameters:**

- `salonId` (string, optional) - Filter by salon
- `productId` (string, optional) - Filter by product
- `serviceId` (string, optional) - Filter by service
- `offerType` (string, optional) - Filter by offer type: `salon` | `product` | `service`
- `page` (number, optional) - Page number (default: 1)
- `limit` (number, optional) - Items per page (default: 10)

**Success Response (200 OK):**

```json
{
  "message": "Active offers retrieved successfully",
  "data": [
    {
      "id": "clh7x8y9z0ad",
      "salonId": "clh7x8y9z0ab",
      "title": "Summer Special Discount",
      "description": "Get amazing discounts this summer!",
      "offerType": "product",
      "productId": "clh7x8y9z0ac",
      "serviceId": null,
      "discountType": "percentage",
      "discountValue": "25.00",
      "startsAt": "2024-06-01T00:00:00.000Z",
      "endsAt": "2024-08-31T23:59:59.000Z",
      "isActive": true,
      "image": "https://res.cloudinary.com/xxx/image/upload/v1234567890/probeauty/offers/xxx.jpg",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z",
      "salon": {
        "id": "clh7x8y9z0ab",
        "name": "Glamour Studio"
      },
      "product": {
        "id": "clh7x8y9z0ac",
        "title": "Premium Hair Serum"
      },
      "service": null
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 8,
    "totalPages": 1
  }
}
```

**cURL Command:**

```bash
curl -X GET "http://localhost:5000/api/v1/offers/public/active?salonId=clh7x8y9z0ab&offerType=product&page=1&limit=10"
```

---

### Get Offer by ID (Public)

**Description:** Get a specific offer by ID (public view).

**Endpoint:** `GET /api/v1/offers/public/:id`

**Authentication:** Not required

**URL Parameters:**

- `id` (string, required) - Offer ID

**Success Response (200 OK):**

```json
{
  "message": "Offer fetched successfully",
  "data": {
    "id": "clh7x8y9z0ad",
    "salonId": "clh7x8y9z0ab",
    "title": "Summer Special Discount",
    "description": "Get amazing discounts this summer!",
    "offerType": "product",
    "productId": "clh7x8y9z0ac",
    "serviceId": null,
    "discountType": "percentage",
    "discountValue": "25.00",
    "startsAt": "2024-06-01T00:00:00.000Z",
    "endsAt": "2024-08-31T23:59:59.000Z",
    "isActive": true,
    "image": "https://res.cloudinary.com/xxx/image/upload/v1234567890/probeauty/offers/xxx.jpg",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z",
    "salon": {
      "id": "clh7x8y9z0ab",
      "name": "Glamour Studio",
      "address": "123 Main Street, New York, NY 10001"
    },
    "product": {
      "id": "clh7x8y9z0ac",
      "title": "Premium Hair Serum",
      "price": "49.99"
    },
    "service": null
  }
}
```

**cURL Command:**

```bash
curl -X GET http://localhost:5000/api/v1/offers/public/clh7x8y9z0ad
```

---

## Checkout Validation

### Validate Offer and Calculate Discount

**Description:** Validate an offer and calculate the discount amount before checkout.

**Endpoint:** `POST /api/v1/offers/validate`

**Authentication:** Not required

**Request Body:**

```json
{
  "offerId": "clh7x8y9z0ad",
  "amount": "49.99",
  "salonId": "clh7x8y9z0ab",
  "productId": "clh7x8y9z0ac"
}
```

**Success Response (200 OK):**

```json
{
  "message": "Offer validated successfully",
  "data": {
    "valid": true,
    "discountAmount": 12.5,
    "finalAmount": 37.49
  }
}
```

**Error Response (400 Bad Request):**

```json
{
  "message": "Offer validation failed",
  "error": "Offer is not applicable to this product",
  "data": {
    "valid": false,
    "discountAmount": 0,
    "finalAmount": 49.99
  }
}
```

**cURL Command:**

```bash
curl -X POST http://localhost:5000/api/v1/offers/validate \
  -H "Content-Type: application/json" \
  -d '{
    "offerId": "clh7x8y9z0ad",
    "amount": "49.99",
    "salonId": "clh7x8y9z0ab",
    "productId": "clh7x8y9z0ac"
  }'
```

---

## Offer Types and Scope

### Offer Types

1. **Salon Offers**

   - Applies to all products and services in a salon
   - Requires: `salonId`
   - Validation: Check if `context.salonId` matches offer's `salonId`

2. **Product Offers**

   - Applies to a specific product in a salon
   - Requires: `salonId` and `productId`
   - Validation: Check if `context.productId` and `context.salonId` match offer's IDs

3. **Service Offers**
   - Applies to a specific service in a salon
   - Requires: `salonId` and `serviceId`
   - Validation: Check if `context.serviceId` and `context.salonId` match offer's IDs

### Discount Types

1. **Percentage**

   - `discountAmount = amount × (discountValue / 100)`
   - Example: 25% off $49.99 = $12.50 discount

2. **Flat**
   - `discountAmount = discountValue`
   - Example: $10 off $49.99 = $10 discount

### Offer Validity

An offer is valid when:

- `isActive` is `true`
- Current time is within `startsAt` and `endsAt` (inclusive)
- The scope matches the checkout context (salon/product/service)

---

## Error Responses

### 400 Bad Request

```json
{
  "success": false,
  "message": "Validation failed in body",
  "errors": [
    {
      "path": "discountValue",
      "message": "Discount value must be a positive number"
    }
  ]
}
```

### 401 Unauthorized

```json
{
  "message": "No token provided"
}
```

### 403 Forbidden

```json
{
  "message": "Unauthorized: You do not own this salon"
}
```

### 404 Not Found

```json
{
  "message": "Offer not found"
}
```

### 500 Internal Server Error

```json
{
  "message": "Internal server error",
  "error": "Error details here"
}
```

---

## Common Use Cases

### 1. Create a salon-wide 20% discount

```bash
curl -X POST http://localhost:5000/api/v1/offers \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "salonId": "clh7x8y9z0ab",
    "title": "20% Off Everything",
    "description": "Special offer on all services and products!",
    "offerType": "salon",
    "discountType": "percentage",
    "discountValue": "20",
    "startsAt": "2024-06-01T00:00:00Z",
    "endsAt": "2024-06-30T23:59:59Z"
  }'
```

### 2. Create a $10 flat discount on a specific product

```bash
curl -X POST http://localhost:5000/api/v1/offers \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "salonId": "clh7x8y9z0ab",
    "title": "$10 Off Hair Serum",
    "description": "Get $10 off our premium hair serum!",
    "offerType": "product",
    "productId": "clh7x8y9z0ac",
    "discountType": "flat",
    "discountValue": "10",
    "startsAt": "2024-06-01T00:00:00Z",
    "endsAt": "2024-06-30T23:59:59Z"
  }'
```

### 3. Get all active offers for a salon

```bash
curl -X GET "http://localhost:5000/api/v1/offers/public/active?salonId=clh7x8y9z0ab"
```

### 3a. Get only product offers for a salon

```bash
curl -X GET "http://localhost:5000/api/v1/offers/public/active?salonId=clh7x8y9z0ab&offerType=product"
```

### 3b. Get only salon-wide offers

```bash
curl -X GET "http://localhost:5000/api/v1/offers/public/active?offerType=salon"
```

### 4. Validate offer before booking checkout

```bash
curl -X POST http://localhost:5000/api/v1/offers/validate \
  -H "Content-Type: application/json" \
  -d '{
    "offerId": "clh7x8y9z0ad",
    "amount": "80.00",
    "salonId": "clh7x8y9z0ab",
    "serviceId": "clh7x8y9z0ae"
  }'
```

### 5. Validate offer before order checkout

```bash
curl -X POST http://localhost:5000/api/v1/offers/validate \
  -H "Content-Type: application/json" \
  -d '{
    "offerId": "clh7x8y9z0ad",
    "amount": "49.99",
    "salonId": "clh7x8y9z0ab",
    "productId": "clh7x8y9z0ac"
  }'
```
