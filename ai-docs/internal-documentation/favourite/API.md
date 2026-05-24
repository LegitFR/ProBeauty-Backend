# Favourite API Documentation

Complete reference for favourite/wishlist management endpoints in the ProBeauty Backend.

## Overview

- Base path: `/api/v1/favourites`
- Authentication: All routes require Bearer token in `Authorization` header
- Validation: All requests validated with Zod (`src/schemas/favouriteSchema.ts`) via `validateRequest`
- Content type: `application/json` for requests and responses
- Pagination: Default limit is 10 items per page
- ID Format: All IDs use CUID format

The favourites API is unified — the `type` field/query param controls whether the operation targets a **product** or a **salon**. Both share the same four endpoints.

---

## Data Structures

### Product Favourite Object

```json
{
  "id": "clxxx123456789",
  "userId": "usr_123",
  "productId": "prod_456",
  "createdAt": "2025-01-15T10:30:00.000Z",
  "product": {
    "id": "prod_456",
    "salonId": "salon_789",
    "title": "Hair Serum",
    "sku": "HS-001",
    "price": "499.00",
    "quantity": 50,
    "images": ["https://cloudinary.com/..."],
    "salon": {
      "id": "salon_789",
      "name": "Glamour Studio"
    }
  }
}
```

### Salon Favourite Object

```json
{
  "id": "clxxx987654321",
  "userId": "usr_123",
  "salonId": "salon_789",
  "createdAt": "2025-01-15T10:30:00.000Z",
  "salon": {
    "id": "salon_789",
    "name": "Glamour Studio",
    "address": "123 Main St",
    "thumbnail": "https://cloudinary.com/...",
    "images": ["https://cloudinary.com/..."],
    "venueType": "everyone",
    "verified": true,
    "geo": { "latitude": 12.9716, "longitude": 77.5946 },
    "hours": { "monday": { "open": "09:00", "close": "20:00" } }
  }
}
```

### Pagination Object

```json
{
  "page": 1,
  "limit": 10,
  "total": 25,
  "totalPages": 3
}
```

---

## Endpoints

### 1) Add to Favourites (Protected) — POST `/api/v1/favourites`

Adds a product or salon to the user's favourites list.

**Request Body:**

```json
{ "type": "product", "itemId": "prod_456" }
```

```json
{ "type": "salon", "itemId": "salon_789" }
```

**Fields:**

| Field    | Required | Type                    | Description                     |
| -------- | -------- | ----------------------- | ------------------------------- |
| `type`   | Yes      | `"product"` \| `"salon"` | Which kind of item to favourite |
| `itemId` | Yes      | String (CUID)           | ID of the product or salon      |

**Success Response (201 Created):**

```json
{
  "message": "Salon added to favourites",
  "data": { ...SalonFavouriteObject }
}
```

**cURL — Add product:**

```bash
curl -X POST http://localhost:5000/api/v1/favourites \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "type": "product", "itemId": "prod_456" }'
```

**cURL — Add salon:**

```bash
curl -X POST http://localhost:5000/api/v1/favourites \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "type": "salon", "itemId": "salon_789" }'
```

**Errors:**

| Status | Reason                                      |
| ------ | ------------------------------------------- |
| 401    | Not authenticated                           |
| 404    | Product / Salon not found                   |
| 409    | Product / Salon already in favourites       |
| 422    | Validation error (invalid type or CUID)     |
| 500    | Internal server error                       |

---

### 2) Get User's Favourites (Protected) — GET `/api/v1/favourites`

Retrieves all favourites of a given type for the authenticated user, with pagination.

**Query Parameters:**

| Param   | Required | Default | Description                             |
| ------- | -------- | ------- | --------------------------------------- |
| `type`  | Yes      | —       | `"product"` or `"salon"`               |
| `page`  | No       | `1`     | Page number                             |
| `limit` | No       | `10`    | Items per page                          |

**Success Response (200 OK):**

```json
{
  "message": "Favourites retrieved successfully",
  "data": [ ...FavouriteObjects ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 5,
    "totalPages": 1
  }
}
```

**cURL — Product favourites:**

```bash
curl -X GET "http://localhost:5000/api/v1/favourites?type=product&page=1&limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**cURL — Salon favourites:**

```bash
curl -X GET "http://localhost:5000/api/v1/favourites?type=salon&page=1&limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Errors:**

| Status | Reason                   |
| ------ | ------------------------ |
| 401    | Not authenticated        |
| 422    | Missing or invalid type  |
| 500    | Internal server error    |

---

### 3) Check Favourite Status (Protected) — GET `/api/v1/favourites/check/:id`

Checks if a specific product or salon is in the user's favourites.

**URL Parameters:**

- `id` (required): CUID of the product or salon

**Query Parameters:**

- `type` (required): `"product"` or `"salon"`

**Success Response (200 OK):**

```json
{
  "message": "Favourite status retrieved",
  "data": {
    "id": "salon_789",
    "type": "salon",
    "isFavourited": true
  }
}
```

**cURL — Check product:**

```bash
curl -X GET "http://localhost:5000/api/v1/favourites/check/prod_456?type=product" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**cURL — Check salon:**

```bash
curl -X GET "http://localhost:5000/api/v1/favourites/check/salon_789?type=salon" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Errors:**

| Status | Reason                           |
| ------ | -------------------------------- |
| 401    | Not authenticated                |
| 422    | Invalid ID format or missing type|
| 500    | Internal server error            |

---

### 4) Remove from Favourites (Protected) — DELETE `/api/v1/favourites/:id`

Removes a product or salon from the user's favourites list.

**URL Parameters:**

- `id` (required): CUID of the product or salon

**Query Parameters:**

- `type` (required): `"product"` or `"salon"`

**Success Response (200 OK):**

```json
{ "message": "Salon removed from favourites" }
```

**cURL — Remove product:**

```bash
curl -X DELETE "http://localhost:5000/api/v1/favourites/prod_456?type=product" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**cURL — Remove salon:**

```bash
curl -X DELETE "http://localhost:5000/api/v1/favourites/salon_789?type=salon" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Errors:**

| Status | Reason                           |
| ------ | -------------------------------- |
| 401    | Not authenticated                |
| 404    | Favourite not found              |
| 422    | Invalid ID format or missing type|
| 500    | Internal server error            |

---

## Validation Rules

| Field / Param | Rule                                           |
| ------------- | ---------------------------------------------- |
| `type`        | Must be exactly `"product"` or `"salon"`       |
| `itemId` / `id` | Must be a valid CUID (e.g. `clxxx123456789`) |
| `page`        | Positive integer, defaults to 1               |
| `limit`       | Positive integer, defaults to 10              |

---

## Error Handling

### Common Error Response Format

```json
{
  "message": "Error description here",
  "error": "Detailed error message"
}
```

### HTTP Status Codes

| Code | Meaning                                           |
| ---- | ------------------------------------------------- |
| 200  | Success (GET, DELETE)                             |
| 201  | Created (POST)                                    |
| 401  | Unauthorized                                      |
| 404  | Not found (item or favourite doesn't exist)       |
| 409  | Conflict (item already in favourites)             |
| 422  | Validation error (bad type, invalid CUID, etc.)   |
| 500  | Internal server error                             |

---

## Database Constraints

### Product Favourites — `favourites` table

```prisma
@@unique([userId, productId])
```

### Salon Favourites — `salon_favourites` table

```prisma
@@unique([userId, salonId])
```

Both tables cascade-delete when the referenced user, product, or salon is deleted.

---

## Implementation References

| Layer      | File                                          |
| ---------- | --------------------------------------------- |
| Router     | `src/routes/favouriteRoute.ts`                |
| Controller | `src/controllers/favouriteController.ts`      |
| Service    | `src/services/favouriteService.ts`            |
| Schema     | `src/schemas/favouriteSchema.ts`              |
| DB Models  | `prisma/schema.prisma` — `Favourite`, `SalonFavourite` |

---

## Best Practices

### Frontend Integration

1. Always pass `type` — the API will reject requests without it
2. Use the `/check/:id?type=` endpoint to display favourite toggle state on listings
3. Implement optimistic UI updates; roll back on 4xx errors
4. Use `type=salon` on the salon detail/listing pages, `type=product` on product pages

### Performance

1. Use pagination when fetching favourites
2. Results are ordered by `createdAt` descending (most recent first)
3. Salon and product details are included in list/add responses — no extra calls needed

---

## Complete Usage Example

```bash
ACCESS_TOKEN="YOUR_JWT_TOKEN"

# Add a salon to favourites
curl -X POST "http://localhost:5000/api/v1/favourites" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "type": "salon", "itemId": "salon_789" }'

# Add a product to favourites
curl -X POST "http://localhost:5000/api/v1/favourites" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "type": "product", "itemId": "prod_456" }'

# List favourite salons
curl -X GET "http://localhost:5000/api/v1/favourites?type=salon&page=1&limit=10" \
  -H "Authorization: Bearer $ACCESS_TOKEN"

# List favourite products
curl -X GET "http://localhost:5000/api/v1/favourites?type=product&page=1&limit=10" \
  -H "Authorization: Bearer $ACCESS_TOKEN"

# Check if a salon is favourited
curl -X GET "http://localhost:5000/api/v1/favourites/check/salon_789?type=salon" \
  -H "Authorization: Bearer $ACCESS_TOKEN"

# Remove a salon from favourites
curl -X DELETE "http://localhost:5000/api/v1/favourites/salon_789?type=salon" \
  -H "Authorization: Bearer $ACCESS_TOKEN"

# Remove a product from favourites
curl -X DELETE "http://localhost:5000/api/v1/favourites/prod_456?type=product" \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```
