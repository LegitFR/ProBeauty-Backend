# Service API

Endpoints for managing salon services. Salon owners can create, update, and delete services. All users can view available services.

---

## Create Service

**Description:** Create a new service for a salon. Only the salon owner can create services for their salon. Supports optional image upload.

**Endpoint:** `POST /api/v1/services`

**Authentication:** Required (Bearer token)

**Content-Type:** `multipart/form-data` (for file uploads) or `application/json` (without files)

**Request Body (Form Data or JSON):**

```json
{
  "salonId": "clv1234567890abcdefgh",
  "title": "Men's Haircut",
  "category": "Haircut",
  "durationMinutes": 30,
  "price": 25.99
}
```

**Request Parameters:**

- `salonId` (string, required) — CUID format salon ID
- `title` (string, required) — Service name, 2-100 characters
- `category` (string, required) — Service category (e.g., "Haircut", "Manicure", "Facial"), 2-50 characters
- `durationMinutes` (number or string, required) — Duration in minutes, must be positive integer
  - **Note:** When using `multipart/form-data`, can be sent as string (e.g., `"30"`). The schema automatically converts it to a number.
- `price` (number or string, required) — Price in dollars, max 2 decimal places, must be non-negative
  - **Note:** When using `multipart/form-data`, can be sent as string (e.g., `"25.99"`). The schema automatically converts it to a number.
- `image` (file, optional) — Single image file for service (multipart/form-data only). Supported formats: JPEG, PNG, WebP, GIF. Max size: 5MB

**Success Response (201 Created):**

```json
{
  "message": "Service created successfully",
  "data": {
    "id": "clv9876543210zyxwvuts",
    "salonId": "clv1234567890abcdefgh",
    "title": "Men's Haircut",
    "category": "Haircut",
    "image": "https://cloudinary.com/...",
    "durationMinutes": 30,
    "price": "25.99"
  }
}
```

**Error Response (403 Forbidden):**

```json
{
  "message": "You do not have permission to create services for this salon"
}
```

**cURL Commands:**

Without image (JSON):

```bash
curl -X POST http://localhost:5000/api/v1/services \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "salonId": "clv1234567890abcdefgh",
    "title": "Men'\''s Haircut",
    "category": "Haircut",
    "durationMinutes": 30,
    "price": 25.99
  }'
```

With image (multipart/form-data):

```bash
curl -X POST http://localhost:5000/api/v1/services \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "salonId=clv1234567890abcdefgh" \
  -F "title=Men's Haircut" \
  -F "category=Haircut" \
  -F "durationMinutes=30" \
  -F "price=25.99" \
  -F "image=@/path/to/service-image.jpg"
```

### How to Add Image in Multipart Form-Data

When using `multipart/form-data` to upload an image:

1. **Use the `-F` flag** instead of `-d` (this tells curl to use multipart encoding)
2. **For text fields**: Use `-F "fieldName=value"` (without @ symbol)
3. **For image/file fields**: Use `-F "fieldName=@/path/to/file"` (with @ symbol pointing to file path)

**Example breakdown:**

```bash
curl -X POST http://localhost:5000/api/v1/services \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "salonId=clv1234567890abcdefgh" \           # Text field
  -F "title=Men's Haircut" \                      # Text field
  -F "category=Haircut" \                         # Text field
  -F "durationMinutes=30" \                       # Numeric field (as text)
  -F "price=25.99" \                              # Numeric field (as text)
  -F "image=@/Users/username/Pictures/salon.jpg" # Image file with @ symbol
```

**Key Points:**

- Replace `/Users/username/Pictures/salon.jpg` with your actual image file path
- Supported image formats: JPEG, PNG, WebP, GIF
- Maximum file size: 5MB
- Field name for image **must be** `image` (singular, not `images`)
- The `@` symbol is crucial - it tells curl to read the file from disk
- Do NOT include `Content-Type: application/json` header when using `-F` flags (curl sets the correct boundary automatically)
- **Numeric Fields:** `durationMinutes` and `price` can be sent as strings in multipart/form-data (e.g., `"30"`, `"25.99"`). The schema automatically converts them to numbers before validation.

---

## Get Single Service

**Description:** Retrieve details of a specific service by ID.

**Endpoint:** `GET /api/v1/services/:id`

**Authentication:** Not required

**URL Parameters:**

- `id` (string, required) — Service ID in CUID format

**Success Response (200 OK):**

```json
{
  "message": "Service retrieved successfully",
  "data": {
    "id": "clv9876543210zyxwvuts",
    "salonId": "clv1234567890abcdefgh",
    "title": "Men's Haircut",
    "category": "Haircut",
    "image": "https://cloudinary.com/...",
    "durationMinutes": 30,
    "price": "25.99",
    "salon": {
      "id": "clv1234567890abcdefgh",
      "name": "Elite Salon",
      "address": "123 Main St, Downtown"
    }
  }
}
```

**Error Response (404 Not Found):**

```json
{
  "message": "Service not found"
}
```

**cURL Command:**

```bash
curl -X GET http://localhost:5000/api/v1/services/clv9876543210zyxwvuts \
  -H "Content-Type: application/json"
```

---

## Get Services by Salon

**Description:** Retrieve all services offered by a specific salon. This uses the same endpoint as "Get All Services" with an optional query parameter.

**Endpoint:** `GET /api/v1/services?salonId=xxx`

**Authentication:** Not required

**Query Parameters:**

- `salonId` (string, optional) — Salon ID in CUID format. If provided, returns only services for that salon. If omitted, returns all services.

**Success Response (200 OK):**

```json
{
  "message": "Services retrieved successfully",
  "data": [
    {
      "id": "clv9876543210zyxwvuts",
      "salonId": "clv1234567890abcdefgh",
      "title": "Men's Haircut",
      "category": "Haircut",
      "image": "https://cloudinary.com/...",
      "durationMinutes": 30,
      "price": "25.99"
    },
    {
      "id": "clv9876543210zyxwvuta",
      "salonId": "clv1234567890abcdefgh",
      "title": "Women's Haircut",
      "category": "Haircut",
      "image": null,
      "durationMinutes": 60,
      "price": "45.50"
    }
  ]
}
```

**cURL Command:**

```bash
curl -X GET "http://localhost:5000/api/v1/services?salonId=clv1234567890abcdefgh" \
  -H "Content-Type: application/json"
```

---

## Get All Services

**Description:** Retrieve all services across all salons. Optionally filter by salon using the `salonId` query parameter.

**Endpoint:** `GET /api/v1/services`

**Authentication:** Not required

**Query Parameters:**

- `salonId` (string, optional) — Salon ID in CUID format. If provided, returns only services for that salon. If omitted, returns all services across all salons.

**Success Response (200 OK):**

```json
{
  "message": "All services retrieved successfully",
  "data": [
    {
      "id": "clv9876543210zyxwvuts",
      "salonId": "clv1234567890abcdefgh",
      "title": "Men's Haircut",
      "category": "Haircut",
      "image": "https://cloudinary.com/...",
      "durationMinutes": 30,
      "price": "25.99",
      "salon": {
        "id": "clv1234567890abcdefgh",
        "name": "Elite Salon",
        "address": "123 Main St, Downtown"
      }
    },
    {
      "id": "clv9876543210zyxwvuta",
      "salonId": "clv1111111111abcdefgh",
      "title": "Classic Manicure",
      "category": "Manicure",
      "image": null,
      "durationMinutes": 45,
      "price": "35.00",
      "salon": {
        "id": "clv1111111111abcdefgh",
        "name": "Beauty Haven",
        "address": "456 Oak Ave, Uptown"
      }
    }
  ]
}
```

**cURL Command:**

```bash
curl -X GET http://localhost:5000/api/v1/services \
  -H "Content-Type: application/json"
```

---

## Update Service

**Description:** Update service details. Only the salon owner can update their salon's services. Supports optional image upload.

**Endpoint:** `PUT /api/v1/services/:id`

**Authentication:** Required (Bearer token)

**Content-Type:** `multipart/form-data` (for file uploads) or `application/json` (without files)

**URL Parameters:**

- `id` (string, required) — Service ID in CUID format

**Request Body (all fields optional):**

```json
{
  "title": "Premium Hair Cutting",
  "category": "Haircut",
  "durationMinutes": 45,
  "price": 35.99
}
```

**Request Parameters:**

- `title` (string, optional) — New service name, 2-100 characters
- `category` (string, optional) — Service category (e.g., "Haircut", "Manicure", "Facial"), 2-50 characters
- `durationMinutes` (number or string, optional) — New duration in minutes, must be positive integer
  - **Note:** When using `multipart/form-data`, can be sent as string. The schema automatically converts it to a number.
- `price` (number or string, optional) — New price, max 2 decimal places, must be non-negative
  - **Note:** When using `multipart/form-data`, can be sent as string. The schema automatically converts it to a number.
- `image` (file, optional) — Single image file for service (multipart/form-data only). Supported formats: JPEG, PNG, WebP, GIF. Max size: 5MB. When provided, replaces existing image.

**Success Response (200 OK):**

```json
{
  "message": "Service updated successfully",
  "data": {
    "id": "clv9876543210zyxwvuts",
    "salonId": "clv1234567890abcdefgh",
    "title": "Premium Hair Cutting",
    "category": "Haircut",
    "image": "https://cloudinary.com/...",
    "durationMinutes": 45,
    "price": "35.99"
  }
}
```

**Error Response (403 Forbidden):**

```json
{
  "message": "You do not have permission to update this service"
}
```

**Error Response (404 Not Found):**

```json
{
  "message": "Service not found"
}
```

**cURL Commands:**

Without image (JSON):

```bash
curl -X PUT http://localhost:5000/api/v1/services/clv9876543210zyxwvuts \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Premium Hair Cutting",
    "category": "Haircut",
    "durationMinutes": 45,
    "price": 35.99
  }'
```

With image (multipart/form-data):

```bash
curl -X PUT http://localhost:5000/api/v1/services/clv9876543210zyxwvuts \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "title=Premium Hair Cutting" \
  -F "category=Haircut" \
  -F "durationMinutes=45" \
  -F "price=35.99" \
  -F "image=@/path/to/new-service-image.jpg"
```

---

## Delete Service

**Description:** Delete a service. Only the salon owner can delete their salon's services.

**Endpoint:** `DELETE /api/v1/services/:id`

**Authentication:** Required (Bearer token)

**URL Parameters:**

- `id` (string, required) — Service ID in CUID format

**Success Response (200 OK):**

```json
{
  "message": "Service deleted successfully"
}
```

**Error Response (403 Forbidden):**

```json
{
  "message": "You do not have permission to delete this service"
}
```

**Error Response (404 Not Found):**

```json
{
  "message": "Service not found"
}
```

**cURL Command:**

```bash
curl -X DELETE http://localhost:5000/api/v1/services/clv9876543210zyxwvuts \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

---

## Validation Rules

- **salonId**: Must be a valid CUID format
- **title**: Minimum 2 characters, maximum 100 characters
- **category**: Minimum 2 characters, maximum 50 characters (required for creation, optional for updates)
- **durationMinutes**: Must be a positive integer
  - **Automatic Conversion:** When sent as string in multipart/form-data, automatically converted to number before validation
- **price**: Must be non-negative with maximum 2 decimal places
  - **Automatic Conversion:** When sent as string in multipart/form-data, automatically converted to number before validation
- **id (in URL)**: Must be a valid CUID format
- **image**: Optional file upload. Supported formats: JPEG, PNG, WebP, GIF. Maximum file size: 5MB per file

## File Upload

### Image Requirements

- **Supported Formats**: JPEG (.jpg, .jpeg), PNG (.png), WebP (.webp), GIF (.gif)
- **Maximum Size**: 5MB per file
- **Content-Type**: Use `multipart/form-data` when uploading images
- **Upload Service**: Images are automatically uploaded to Cloudinary and stored as URLs
- **Field Name**: Use `image` as the form field name for single image

### Image Handling

- When creating a service without an image, the `image` field will be `null`
- When updating a service with a new image, it replaces the existing image
- When updating a service without providing an image, the existing image is preserved
- Images are automatically optimized by Cloudinary for web delivery

## Authentication Notes

- Use JWT tokens obtained from the authentication endpoint
- Include token in `Authorization: Bearer <TOKEN>` header
- Token claims must include user ID for ownership verification
- Only salon owners can create, update, or delete services for their salons

## Content-Type Notes

- Use `application/json` for requests without file uploads
- Use `multipart/form-data` for requests with image uploads
- Do not use `Content-Type: application/json` header when sending files - let the browser/client set the boundary parameter
- **Automatic Type Conversion:** When using `multipart/form-data`, numeric fields (`durationMinutes`, `price`) can be sent as strings and are automatically converted to numbers by the validation schema
