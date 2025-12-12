# Service API

Endpoints for managing salon services. Salon owners can create, update, and delete services. All users can view available services.

---

## Create Service

**Description:** Create a new service for a salon. Only the salon owner can create services for their salon.

**Endpoint:** `POST /api/v1/services`

**Authentication:** Required (Bearer token)

**Request Body:**

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
- `durationMinutes` (number, required) — Duration in minutes, must be positive integer
- `price` (number, required) — Price in dollars, max 2 decimal places, must be non-negative

**Success Response (201 Created):**

```json
{
  "message": "Service created successfully",
  "data": {
    "id": "clv9876543210zyxwvuts",
    "salonId": "clv1234567890abcdefgh",
    "title": "Men's Haircut",
    "category": "Haircut",
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

**cURL Command:**

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

**Description:** Retrieve all services offered by a specific salon.

**Endpoint:** `GET /api/v1/services/salon/:salonId`

**Authentication:** Not required

**URL Parameters:**

- `salonId` (string, required) — Salon ID in CUID format

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
      "durationMinutes": 30,
      "price": "25.99"
    },
    {
      "id": "clv9876543210zyxwvuta",
      "salonId": "clv1234567890abcdefgh",
      "title": "Women's Haircut",
      "category": "Haircut",
      "durationMinutes": 60,
      "price": "45.50"
    }
  ]
}
```

**cURL Command:**

```bash
curl -X GET http://localhost:5000/api/v1/services/salon/clv1234567890abcdefgh \
  -H "Content-Type: application/json"
```

---

## Get All Services

**Description:** Retrieve all services across all salons.

**Endpoint:** `GET /api/v1/services`

**Authentication:** Not required

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

**Description:** Update service details. Only the salon owner can update their salon's services.

**Endpoint:** `PUT /api/v1/services/:id`

**Authentication:** Required (Bearer token)

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
- `durationMinutes` (number, optional) — New duration in minutes, must be positive integer
- `price` (number, optional) — New price, max 2 decimal places, must be non-negative

**Success Response (200 OK):**

```json
{
  "message": "Service updated successfully",
  "data": {
    "id": "clv9876543210zyxwvuts",
    "salonId": "clv1234567890abcdefgh",
    "title": "Premium Hair Cutting",
    "category": "Haircut",
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

**cURL Command:**

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
- **price**: Must be non-negative with maximum 2 decimal places
- **id (in URL)**: Must be a valid CUID format

## Authentication Notes

- Use JWT tokens obtained from the authentication endpoint
- Include token in `Authorization: Bearer <TOKEN>` header
- Token claims must include user ID for ownership verification
- Only salon owners can create, update, or delete services for their salons
