# Review API Documentation

Complete reference for review management endpoints in the ProBeauty Backend.

## Overview

- Base path: `/api/v1/reviews`
- Authentication: Protected routes require Bearer token in `Authorization` header
- Validation: All requests validated with Zod (`src/schemas/reviewSchema.ts`) via `validateRequest`
- Content type: `application/json` for requests and responses
- Pagination: Default limit is 10 items per page
- ID Format: All review IDs use CUID format

---

## Data Structures

### Review Object

```json
{
  "id": "clxxx123456789",
  "userId": "usr_123",
  "salonId": "salon_456",
  "serviceId": "srv_789",
  "productId": null,
  "rating": 5,
  "comment": "Excellent service! Highly recommend.",
  "createdAt": "2025-01-15T10:30:00.000Z",
  "user": {
    "id": "usr_123",
    "name": "John Doe"
  },
  "salon": {
    "id": "salon_456",
    "name": "Glamour Studio"
  },
  "service": {
    "id": "srv_789",
    "title": "Haircut"
  },
  "product": null
}
```

### Pagination Object

```json
{
  "page": 1,
  "limit": 10,
  "total": 45,
  "totalPages": 5
}
```

---

## Endpoints

### 1) Create Review (Protected) — POST `/api/v1/reviews`

Creates a new review for a salon. Requires authentication.

**Request Body:**

```json
{
  "salonId": "salon_456",
  "serviceId": "srv_789",
  "productId": null,
  "rating": 5,
  "comment": "Excellent service! Highly recommend."
}
```

**Fields:**

- `salonId` (required): String, CUID format - The salon being reviewed
- `serviceId` (optional): String, CUID format - Specific service being reviewed
- `productId` (optional): String, CUID format - Specific product being reviewed
- `rating` (required): Integer, 1-5 - Rating score
- `comment` (optional): String, max 1000 characters - Review text

**Success Response (201 Created):**

```json
{
  "message": "Review created successfully",
  "data": {
    "id": "clxxx123456789",
    "userId": "usr_123",
    "salonId": "salon_456",
    "serviceId": "srv_789",
    "productId": null,
    "rating": 5,
    "comment": "Excellent service! Highly recommend.",
    "createdAt": "2025-01-15T10:30:00.000Z",
    "user": {
      "id": "usr_123",
      "name": "John Doe"
    },
    "salon": {
      "id": "salon_456",
      "name": "Glamour Studio"
    },
    "service": {
      "id": "srv_789",
      "title": "Haircut"
    },
    "product": null
  }
}
```

**cURL Command:**

```bash
curl -X POST http://localhost:5000/api/v1/reviews \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "salonId": "salon_456",
    "serviceId": "srv_789",
    "rating": 5,
    "comment": "Excellent service! Highly recommend."
  }'
```

**Errors:**

- 400: Validation error, service/product doesn't belong to salon
- 401: Not authenticated
- 404: Salon, service, or product not found
- 500: Internal server error

---

### 2) Get Review by ID (Public) — GET `/api/v1/reviews/:id`

Retrieves a single review by its ID.

**URL Parameters:**

- `id` (required): String, CUID format - Review ID

**Success Response (200 OK):**

```json
{
  "message": "Review retrieved successfully",
  "data": {
    "id": "clxxx123456789",
    "userId": "usr_123",
    "salonId": "salon_456",
    "serviceId": "srv_789",
    "productId": null,
    "rating": 5,
    "comment": "Excellent service! Highly recommend.",
    "createdAt": "2025-01-15T10:30:00.000Z",
    "user": {
      "id": "usr_123",
      "name": "John Doe"
    },
    "salon": {
      "id": "salon_456",
      "name": "Glamour Studio"
    },
    "service": {
      "id": "srv_789",
      "title": "Haircut"
    },
    "product": null
  }
}
```

**cURL Command:**

```bash
curl -X GET http://localhost:5000/api/v1/reviews/clxxx123456789 \
  -H "Content-Type: application/json"
```

**Errors:**

- 400: Invalid ID format
- 404: Review not found
- 500: Internal server error

---

### 3) Get Reviews by Salon (Public) — GET `/api/v1/reviews/salon/:salonId`

Retrieves all reviews for a specific salon with pagination and average rating.

**URL Parameters:**

- `salonId` (required): String, CUID format - Salon ID

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Success Response (200 OK):**

```json
{
  "message": "Reviews retrieved successfully",
  "data": [
    {
      "id": "clxxx123456789",
      "userId": "usr_123",
      "salonId": "salon_456",
      "serviceId": "srv_789",
      "productId": null,
      "rating": 5,
      "comment": "Excellent service!",
      "createdAt": "2025-01-15T10:30:00.000Z",
      "user": {
        "id": "usr_123",
        "name": "John Doe"
      },
      "service": {
        "id": "srv_789",
        "title": "Haircut"
      },
      "product": null
    }
  ],
  "averageRating": 4.5,
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3
  }
}
```

**cURL Command:**

```bash
curl -X GET "http://localhost:5000/api/v1/reviews/salon/salon_456?page=1&limit=10" \
  -H "Content-Type: application/json"
```

**Errors:**

- 400: Invalid salon ID format
- 500: Internal server error

---

### 4) Get My Reviews (Protected) — GET `/api/v1/reviews/user/me`

Retrieves all reviews created by the authenticated user.

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Success Response (200 OK):**

```json
{
  "message": "Reviews retrieved successfully",
  "data": [
    {
      "id": "clxxx123456789",
      "userId": "usr_123",
      "salonId": "salon_456",
      "serviceId": "srv_789",
      "productId": null,
      "rating": 5,
      "comment": "Excellent service!",
      "createdAt": "2025-01-15T10:30:00.000Z",
      "salon": {
        "id": "salon_456",
        "name": "Glamour Studio"
      },
      "service": {
        "id": "srv_789",
        "title": "Haircut"
      },
      "product": null
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
curl -X GET "http://localhost:5000/api/v1/reviews/user/me?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

**Errors:**

- 401: Not authenticated
- 500: Internal server error

---

### 5) Update Review (Protected) — PATCH `/api/v1/reviews/:id`

Updates an existing review. Only the review owner can update their review.

**URL Parameters:**

- `id` (required): String, CUID format - Review ID

**Request Body (all fields optional):**

```json
{
  "rating": 4,
  "comment": "Updated comment - still great service!"
}
```

**Success Response (200 OK):**

```json
{
  "message": "Review updated successfully",
  "data": {
    "id": "clxxx123456789",
    "userId": "usr_123",
    "salonId": "salon_456",
    "serviceId": "srv_789",
    "productId": null,
    "rating": 4,
    "comment": "Updated comment - still great service!",
    "createdAt": "2025-01-15T10:30:00.000Z",
    "user": {
      "id": "usr_123",
      "name": "John Doe"
    },
    "salon": {
      "id": "salon_456",
      "name": "Glamour Studio"
    },
    "service": {
      "id": "srv_789",
      "title": "Haircut"
    },
    "product": null
  }
}
```

**cURL Command:**

```bash
curl -X PATCH http://localhost:5000/api/v1/reviews/clxxx123456789 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "rating": 4,
    "comment": "Updated comment - still great service!"
  }'
```

**Errors:**

- 400: Validation error
- 401: Not authenticated
- 403: Unauthorized - not the review owner
- 404: Review not found
- 500: Internal server error

---

### 6) Delete Review (Protected) — DELETE `/api/v1/reviews/:id`

Deletes a review. Only the review owner can delete their review.

**URL Parameters:**

- `id` (required): String, CUID format - Review ID

**Success Response (200 OK):**

```json
{
  "message": "Review deleted successfully"
}
```

**cURL Command:**

```bash
curl -X DELETE http://localhost:5000/api/v1/reviews/clxxx123456789 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

**Errors:**

- 400: Invalid ID format
- 401: Not authenticated
- 403: Unauthorized - not the review owner
- 404: Review not found
- 500: Internal server error

---

## Validation Rules

### Rating

- Must be an integer
- Minimum value: 1
- Maximum value: 5

### Comment

- Optional field
- Maximum length: 1000 characters

### ID Format

- All IDs (review, salon, service, product) use CUID format
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

- **200**: Success (GET, PATCH, DELETE)
- **201**: Created (POST)
- **400**: Bad Request (validation errors)
- **401**: Unauthorized (not authenticated)
- **403**: Forbidden (not authorized to modify resource)
- **404**: Not Found (review/salon/service/product doesn't exist)
- **500**: Internal Server Error

---

## Implementation References

- **Router**: `src/routes/reviewRoute.ts`
- **Controllers**: `src/controllers/reviewController.ts`
- **Services**: `src/services/reviewService.ts`
- **Schemas**: `src/schemas/reviewSchema.ts`
- **Database Model**: `prisma/schema.prisma` (Review model)

---

## Best Practices

### Creating Reviews

1. Always provide a valid salon ID
2. Include service or product ID for more specific reviews
3. Provide meaningful comments for helpful feedback
4. Use the full 1-5 rating scale appropriately

### Querying Reviews

1. Use pagination for large result sets
2. The `averageRating` in salon reviews endpoint provides quick insight
3. Cache public review data when appropriate

### Security

1. Users can only update/delete their own reviews
2. Salon/service/product associations are validated on creation
3. All IDs are validated for proper CUID format

