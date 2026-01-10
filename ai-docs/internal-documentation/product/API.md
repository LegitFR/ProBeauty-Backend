# Product API Documentation

Complete reference for product management endpoints in the ProBeauty Backend.

## Overview

- Base path: `/api/v1/products` (see `src/index.ts`)
- Authentication: Protected routes require Bearer token in `Authorization` header
- Validation: All requests validated with Zod (`src/schemas/productSchema.ts`) via `validateRequest`
- Content types:
  - `application/json` for GET responses
  - `multipart/form-data` for create/update with image uploads
- Pagination: Default limit is 10 items per page (handled by service layer)
- ID Format: All product and salon IDs use CUID format

Tip: Replace `http://localhost:5000` with your server URL in examples below.

---

## Data Structures

### Product Object

```json
{
  "id": "prd_xxx123456789",
  "salonId": "clxxx123456789",
  "title": "Argan Oil Shampoo",
  "sku": "ARG-SHAM-250",
  "price": 699,
  "quantity": 25,
  "images": [
    "https://res.cloudinary.com/demo/image/upload/v1/abc.jpg"
  ],
  "createdAt": "2025-01-15T10:30:00.000Z",
  "updatedAt": "2025-01-15T10:30:00.000Z"
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

### 1) Search Products with Fuzzy Matching (Public) — GET `/api/v1/products/search`

Searches products using optimistic fuzzy matching on product title and SKU. Case-insensitive and matches partial strings anywhere in the fields.

Query parameters:
- `q` (required): Search query string (minimum 1 character)
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `salonId` (optional): Filter by salon (`cuid`)
- `minPrice` (optional): Minimum price (number)
- `maxPrice` (optional): Maximum price (number)
- `inStock` (optional): Filter by stock availability ("true" or "false")

Sample success response (200):

```json
{
  "message": "Products search completed successfully",
  "data": [
    {
      "id": "prd_xxx123456789",
      "salonId": "clxxx123456789",
      "title": "Argan Oil Shampoo",
      "sku": "ARG-SHAM-250",
      "price": 699,
      "quantity": 25,
      "images": ["https://.../abc.jpg"],
      "createdAt": "2025-01-15T10:30:00.000Z",
      "updatedAt": "2025-01-15T10:30:00.000Z"
    }
  ],
  "pagination": { "page": 1, "limit": 10, "total": 1, "totalPages": 1 }
}
```

curl examples:

```bash
# Search for "argan" in products
curl -X GET "http://localhost:5000/api/v1/products/search?q=argan" \
  -H "Content-Type: application/json"

# Search with price range and stock filter
curl -X GET "http://localhost:5000/api/v1/products/search?q=shampoo&minPrice=500&maxPrice=1000&inStock=true" \
  -H "Content-Type: application/json"

# Search within a specific salon
curl -X GET "http://localhost:5000/api/v1/products/search?q=oil&salonId=clxxx123456789" \
  -H "Content-Type: application/json"

# Search by SKU (partial match)
curl -X GET "http://localhost:5000/api/v1/products/search?q=ARG-SHAM" \
  -H "Content-Type: application/json"
```

Search behavior:
- Matches substring anywhere in `title` or `sku` fields
- Case-insensitive matching (e.g., "argan" matches "Argan Oil Shampoo")
- Very optimistic: even single characters will return results
- Results ordered alphabetically by title
- Supports all standard filtering (price, salon, stock) in addition to search

Errors: 400 (validation - missing or empty query), 500 (server error)

---

### 2) Get All Products (Public) — GET `/api/v1/products`

Retrieves products with optional pagination and filtering.

Query parameters:
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `salonId` (optional): Filter by salon (`cuid`)
- `minPrice` (optional): Minimum price (number)
- `maxPrice` (optional): Maximum price (number)
- `inStock` (optional): Filter by stock availability ("true" or "false")

Sample success response (200):

```json
{
  "message": "Products retrieved successfully",
  "data": [
    {
      "id": "prd_xxx123456789",
      "salonId": "clxxx123456789",
      "title": "Argan Oil Shampoo",
      "sku": "ARG-SHAM-250",
      "price": 699,
      "quantity": 25,
      "images": ["https://.../abc.jpg"],
      "createdAt": "2025-01-15T10:30:00.000Z",
      "updatedAt": "2025-01-15T10:30:00.000Z"
    }
  ],
  "pagination": { "page": 1, "limit": 10, "total": 1, "totalPages": 1 }
}
```

curl examples:

```bash
# Get all products (default pagination)
curl -X GET "http://localhost:5000/api/v1/products" \
  -H "Content-Type: application/json"

# Get in-stock products only
curl -X GET "http://localhost:5000/api/v1/products?inStock=true" \
  -H "Content-Type: application/json"

# Filter by salon and price range
curl -X GET "http://localhost:5000/api/v1/products?salonId=clxxx123456789&minPrice=500&maxPrice=1000" \
  -H "Content-Type: application/json"
```

Errors: 400 (validation), 500 (server error)

---

### 3) Get Products by Salon (Public) — GET `/api/v1/products/salon/:salonId`

Retrieves all products for a specific salon with optional pagination/filters.

URL parameters:
- `salonId`: Salon ID in CUID format

Query parameters: same as in "Get All Products" (except `salonId` is already in the path)

Sample success response (200):

```json
{
  "message": "Salon products retrieved successfully",
  "data": [
    { "id": "prd_xxx123456789", "salonId": "clxxx123456789", "title": "Argan Oil Shampoo", "sku": "ARG-SHAM-250", "price": 699, "quantity": 25, "images": [] }
  ],
  "pagination": { "page": 1, "limit": 10, "total": 1, "totalPages": 1 }
}
```

curl:

```bash
curl -X GET "http://localhost:5000/api/v1/products/salon/clxxx123456789?page=1&limit=20" \
  -H "Content-Type: application/json"
```

Errors: 400 (invalid ID or validation), 500 (server error)

---

### 4) Get Product by ID (Public) — GET `/api/v1/products/:id`

Retrieves a specific product by its ID.

URL parameters:
- `id`: Product ID in CUID format

Sample success response (200):

```json
{
  "message": "Product fetched successfully",
  "data": {
    "id": "prd_xxx123456789",
    "salonId": "clxxx123456789",
    "title": "Argan Oil Shampoo",
    "sku": "ARG-SHAM-250",
    "price": 699,
    "quantity": 25,
    "images": ["https://.../abc.jpg"],
    "createdAt": "2025-01-15T10:30:00.000Z",
    "updatedAt": "2025-01-15T10:30:00.000Z"
  }
}
```

curl:

```bash
curl -X GET "http://localhost:5000/api/v1/products/prd_xxx123456789" \
  -H "Content-Type: application/json"
```

Errors: 404 (not found), 400 (invalid ID), 500 (server error)

---

### 5) Create Product (Protected) — POST `/api/v1/products`

Creates a new product for a salon owned by the authenticated user. Supports up to 5 image uploads.

Request type: `multipart/form-data`

Form fields:
- `salonId` (required, string cuid)
- `title` (required, string, min 2)
- `sku` (required, string, min 3, unique per system)
- `price` (required, string parsable to positive number)
- `quantity` (required, string parsable to non-negative integer)
- `images` (optional, up to 5 files; JPEG/JPG/PNG/WebP/GIF; max 5MB each)

Sample success response (201):

```json
{
  "message": "Product created successfully",
  "data": {
    "id": "prd_xxx123456789",
    "salonId": "clxxx123456789",
    "title": "Argan Oil Shampoo",
    "sku": "ARG-SHAM-250",
    "price": 699,
    "quantity": 25,
    "images": ["https://res.cloudinary.com/.../abc.jpg"],
    "createdAt": "2025-01-15T10:30:00.000Z",
    "updatedAt": "2025-01-15T10:30:00.000Z"
  }
}
```

curl (example with two images):

```bash
curl -X POST "http://localhost:5000/api/v1/products" \
  -H "Authorization: Bearer <your-access-token>" \
  -H "Content-Type: multipart/form-data" \
  -F "salonId=clxxx123456789" \
  -F "title=Argan Oil Shampoo" \
  -F "sku=ARG-SHAM-250" \
  -F "price=699" \
  -F "quantity=25" \
  -F "images=@/path/to/img1.jpg" \
  -F "images=@/path/to/img2.png"
```

Errors:
- 401 (not authenticated)
- 403 (unauthorized — user does not own the salon)
- 400 (validation error or upload errors: type/size/count)
- 500 (server error)

---

### 6) Update Product (Protected) — PATCH `/api/v1/products/:id`

Updates an existing product. Only the salon owner can update their product. Supports optional image uploads to add/replace images.

Request type: `multipart/form-data` (when uploading images) or `application/json` (for fields only)

URL parameters:
- `id`: Product ID in CUID format

Form fields (all optional):
- `title` (string, min 2)
- `sku` (string, min 3)
- `price` (string parsable to positive number)
- `quantity` (string parsable to non-negative integer)
- `images` (optional files; same constraints as create — field name `images`)

Sample success response (200):

```json
{
  "message": "Product updated successfully",
  "data": {
    "id": "prd_xxx123456789",
    "salonId": "clxxx123456789",
    "title": "Argan Oil Shampoo — New",
    "sku": "ARG-SHAM-250",
    "price": 749,
    "quantity": 30,
    "images": ["https://res.cloudinary.com/.../new.jpg"],
    "createdAt": "2025-01-15T10:30:00.000Z",
    "updatedAt": "2025-01-15T12:45:00.000Z"
  }
}
```

curl (update fields only):

```bash
curl -X PATCH "http://localhost:5000/api/v1/products/prd_xxx123456789" \
  -H "Authorization: Bearer <your-access-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Argan Oil Shampoo — New",
    "price": "749",
    "quantity": "30"
  }'
```

curl (update with images):

```bash
curl -X PATCH "http://localhost:5000/api/v1/products/prd_xxx123456789" \
  -H "Authorization: Bearer <your-access-token>" \
  -H "Content-Type: multipart/form-data" \
  -F "title=Argan Oil Shampoo — New" \
  -F "images=@/path/to/new1.jpg"
```

Errors:
- 401 (not authenticated)
- 403 (unauthorized — not the owner)
- 400 (validation error, `SKU already exists`, or upload errors)
- 404 (product not found — if service enforces existence before owner check)
- 500 (server error)

---

### 7) Delete Product (Protected) — DELETE `/api/v1/products/:id`

Deletes a product. Only the salon owner can delete their product.

URL parameters:
- `id`: Product ID in CUID format

Sample success response (200):

```json
{ "message": "Product deleted successfully" }
```

curl:

```bash
curl -X DELETE "http://localhost:5000/api/v1/products/prd_xxx123456789" \
  -H "Authorization: Bearer <your-access-token>"
```

Errors:
- 401 (not authenticated)
- 403 (unauthorized — not the owner)
- 404 (product not found)
- 400 (invalid ID format)
- 500 (server error)

---

## Validation Rules

- `q` (search query): String, min 1 character (required for search endpoint)
- `salonId`: CUID string (required for create; optional filter on GET all and search)
- `title`: String, min 2 (required for create; optional for update)
- `sku`: String, min 3, must be unique (required for create; optional for update)
- `price`: String that parses to positive number (required for create; optional for update)
- `quantity`: String that parses to non-negative integer (required for create; optional for update)
- `inStock` (query): String "true" or "false" (parsed to boolean)
- `page`, `limit`, `minPrice`, `maxPrice`: Strings parsed to numbers
- `id` (params): CUID string for product

File upload constraints (enforced by middleware):
- Field name: `images`
- Max files: 5
- Max size: 5MB per file
- Allowed types: JPEG, JPG, PNG, WebP, GIF

---

## Error Handling

### Common Error Response Format

```json
{
  "message": "Error description here",
  "error": "Detailed error message"
}
```

### Notable Error Messages
- 403: "Unauthorized: You do not own this salon" (create) / "Unauthorized: You do not own this product" (update/delete)
- 400: "SKU already exists"
- 400: Multer errors (file size/type/count) returned as descriptive messages

### HTTP Status Codes
- **200**: Success (GET, PATCH, DELETE)
- **201**: Created (POST)
- **400**: Bad Request (validation/upload errors, invalid format)
- **401**: Unauthorized (not authenticated)
- **403**: Forbidden (not authorized to access resource)
- **404**: Not Found (resource doesn't exist)
- **500**: Internal Server Error

---

## Authentication

Protected endpoints require a valid JWT access token in the Authorization header:

```
Authorization: Bearer <your-access-token>
```

See `ai-docs/internal-documentation/auth/AUTH_OVERVIEW.md` for the full authentication flow.

---

## Data Storage Notes

### JSON Fields
- `images`: Stored as a JSON string in the database and automatically parsed to an array in API responses (`src/controllers/productController.ts`).

### Upload & Storage
- Images are received via Multer memory storage and uploaded to Cloudinary (`src/services/fileUploadService.ts`).
- Upload field: `images` (array). Middleware: `uploadProductImages` with `handleMulterError`.

---

## Implementation References

- **Router**: `src/routes/productRoute.ts`
- **Controllers**: `src/controllers/productController.ts`
- **Services**: `src/services/productService.ts`
- **Schemas**: `src/schemas/productSchema.ts`
- **Middleware**: `src/middlewares/auth/authenticate.ts`, `src/middlewares/validateRequest.ts`, `src/middlewares/uploadMiddleware.ts`
- **Database Model**: `prisma/schema.prisma` (Product model)

---

## Best Practices

### Creating Products
1. Ensure `sku` uniqueness to avoid conflicts
2. Include high-quality images (optimize size and format)
3. Validate price and quantity before submission

### Updating Products
1. Only send fields that need to change (partial updates supported)
2. Re-validate all information after updates
3. If replacing images, ensure the correct files are sent under `images`

### Querying Products
1. Use pagination for large result sets
2. Filter by `inStock=true` to show only available products
3. Use the salon-specific endpoint when listing for a known salon
4. Use the `/search` endpoint for user-driven product searches with fuzzy matching
5. Combine search with filters (price, salon, stock) for refined results

### Security
1. Never share access tokens
2. Always use HTTPS in production
3. Validate and sanitize all user input
4. Apply rate limiting on sensitive endpoints

---

## Complete Usage Example

```bash
# 1. Login to get access token
LOGIN_RESPONSE=$(curl -s -X POST "http://localhost:5000/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "owner@example.com",
    "password": "SecureP@ssw0rd"
  }')

ACCESS_TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.accessToken')

# 2. Create a new product with images
curl -X POST "http://localhost:5000/api/v1/products" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: multipart/form-data" \
  -F "salonId=clxxx123456789" \
  -F "title=Argan Oil Shampoo" \
  -F "sku=ARG-SHAM-250" \
  -F "price=699" \
  -F "quantity=25" \
  -F "images=@/path/to/img1.jpg" \
  -F "images=@/path/to/img2.jpg"

# 3. Search for products containing "argan"
curl -X GET "http://localhost:5000/api/v1/products/search?q=argan&inStock=true" \
  -H "Content-Type: application/json"

# 4. Get all products (in stock)
curl -X GET "http://localhost:5000/api/v1/products?inStock=true" \
  -H "Content-Type: application/json"

# 5. Update product price
curl -X PATCH "http://localhost:5000/api/v1/products/prd_xxx123456789" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "price": "749" }'

# 6. Delete product
curl -X DELETE "http://localhost:5000/api/v1/products/prd_xxx123456789" \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

---

## Support and Feedback

For issues, questions, or suggestions:
- Review the authentication docs: `ai-docs/internal-documentation/auth/AUTH_OVERVIEW.md`
- Check the project guidelines: `CLAUDE.md`
- Verify your request format matches the examples above
- Ensure your access token is valid and not expired
- Check server logs for detailed error messages

