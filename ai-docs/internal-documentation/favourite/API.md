# Favourite API Documentation

Complete reference for favourite/wishlist management endpoints in the ProBeauty Backend.

## Overview

- Base path: `/api/v1/favourites`
- Authentication: All routes require Bearer token in `Authorization` header
- Validation: All requests validated with Zod (`src/schemas/favouriteSchema.ts`) via `validateRequest`
- Content type: `application/json` for requests and responses
- Pagination: Default limit is 10 items per page
- ID Format: All IDs use CUID format

---

## Data Structures

### Favourite Object

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

Adds a product to the user's favourites list.

**Request Body:**

```json
{
  "productId": "prod_456"
}
```

**Fields:**

- `productId` (required): String, CUID format - The product to add to favourites

**Success Response (201 Created):**

```json
{
  "message": "Product added to favourites",
  "data": {
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
}
```

**cURL Command:**

```bash
curl -X POST http://localhost:5000/api/v1/favourites \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "prod_456"
  }'
```

**Errors:**

- 400: Product already in favourites, validation error
- 401: Not authenticated
- 404: Product not found
- 500: Internal server error

---

### 2) Get User's Favourites (Protected) — GET `/api/v1/favourites`

Retrieves all products in the user's favourites list with pagination.

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Success Response (200 OK):**

```json
{
  "message": "Favourites retrieved successfully",
  "data": [
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
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 5,
    "totalPages": 1
  }
}
```

**cURL Command:**

```bash
curl -X GET "http://localhost:5000/api/v1/favourites?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

**Errors:**

- 401: Not authenticated
- 500: Internal server error

---

### 3) Check Favourite Status (Protected) — GET `/api/v1/favourites/check/:productId`

Checks if a specific product is in the user's favourites.

**URL Parameters:**

- `productId` (required): String, CUID format - Product ID to check

**Success Response (200 OK):**

```json
{
  "message": "Favourite status retrieved",
  "data": {
    "productId": "prod_456",
    "isFavourited": true
  }
}
```

**cURL Command:**

```bash
curl -X GET http://localhost:5000/api/v1/favourites/check/prod_456 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

**Errors:**

- 400: Invalid product ID format
- 401: Not authenticated
- 500: Internal server error

---

### 4) Remove from Favourites (Protected) — DELETE `/api/v1/favourites/:productId`

Removes a product from the user's favourites list.

**URL Parameters:**

- `productId` (required): String, CUID format - Product ID to remove

**Success Response (200 OK):**

```json
{
  "message": "Product removed from favourites"
}
```

**cURL Command:**

```bash
curl -X DELETE http://localhost:5000/api/v1/favourites/prod_456 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

**Errors:**

- 400: Invalid product ID format
- 401: Not authenticated
- 404: Favourite not found (product not in favourites)
- 500: Internal server error

---

## Validation Rules

### Product ID

- Must be a valid CUID format
- Example: "clxxx123456789"

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

- **200**: Success (GET, DELETE)
- **201**: Created (POST)
- **400**: Bad Request (validation errors, already favourited)
- **401**: Unauthorized (not authenticated)
- **404**: Not Found (product or favourite doesn't exist)
- **500**: Internal Server Error

---

## Database Constraints

### Unique Constraint

Each user can only favourite a product once. The database enforces a unique constraint on the combination of `userId` and `productId`:

```prisma
@@unique([userId, productId])
```

Attempting to add the same product twice will return a 400 error.

### Cascade Deletion

- If a user is deleted, all their favourites are automatically removed
- If a product is deleted, all favourites referencing it are automatically removed

---

## Implementation References

- **Router**: `src/routes/favouriteRoute.ts`
- **Controllers**: `src/controllers/favouriteController.ts`
- **Services**: `src/services/favouriteService.ts`
- **Schemas**: `src/schemas/favouriteSchema.ts`
- **Database Model**: `prisma/schema.prisma` (Favourite model)

---

## Best Practices

### Frontend Integration

1. Use the check endpoint to display favourite status on product listings
2. Implement optimistic UI updates for better user experience
3. Cache favourite status locally to reduce API calls
4. Handle the "already favourited" error gracefully

### Performance

1. Use pagination when fetching favourites
2. The favourites are ordered by `createdAt` descending (most recent first)
3. Product details are included in the response to avoid additional API calls

### User Experience

1. Provide visual feedback when adding/removing favourites
2. Allow users to easily access their favourites list
3. Show product availability (quantity) in the favourites list
4. Consider implementing a "move to cart" feature from favourites

---

## Complete Usage Example

```bash
# 1. Login to get access token
LOGIN_RESPONSE=$(curl -s -X POST "http://localhost:5000/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "user@example.com",
    "password": "SecureP@ssw0rd"
  }')

ACCESS_TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.accessToken')

# 2. Add a product to favourites
curl -X POST "http://localhost:5000/api/v1/favourites" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "prod_456"
  }'

# 3. Check if a product is favourited
curl -X GET "http://localhost:5000/api/v1/favourites/check/prod_456" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json"

# 4. Get all favourites
curl -X GET "http://localhost:5000/api/v1/favourites?page=1&limit=20" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json"

# 5. Remove a product from favourites
curl -X DELETE "http://localhost:5000/api/v1/favourites/prod_456" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json"
```

