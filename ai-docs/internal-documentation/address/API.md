# Address API

Address management endpoints for storing and managing user shipping/billing addresses.

---

## Create Address

**Description:** Create a new address for the authenticated user. If this is the user's first address or `isDefault` is set to true, it will be set as the default address.

**Endpoint:** `POST /api/v1/addresses`

**Authentication:** Required (Bearer token)

**Request Body:**
```json
{
  "fullName": "John Doe",
  "phone": "+1-555-0123",
  "addressLine1": "123 Main Street",
  "addressLine2": "Apt 4B",
  "city": "New York",
  "state": "NY",
  "postalCode": "10001",
  "country": "USA",
  "isDefault": false
}
```

**Field Validations:**
- `fullName`: 2-100 characters
- `phone`: 10-15 digits, accepts +, -, spaces, ()
- `addressLine1`: 5-200 characters (required)
- `addressLine2`: max 200 characters (optional)
- `city`: 2-100 characters
- `state`: 2-100 characters
- `postalCode`: 3-10 characters, alphanumeric
- `country`: 2-100 characters
- `isDefault`: boolean (optional, defaults to false)

**Success Response (201 Created):**
```json
{
  "message": "Address created successfully",
  "data": {
    "id": "clx1a2b3c4d5e6f7g8h9i0j1",
    "userId": "clx9876543210abcdefghijk",
    "fullName": "John Doe",
    "phone": "+1-555-0123",
    "addressLine1": "123 Main Street",
    "addressLine2": "Apt 4B",
    "city": "New York",
    "state": "NY",
    "postalCode": "10001",
    "country": "USA",
    "isDefault": true,
    "createdAt": "2025-11-02T10:30:00.000Z",
    "updatedAt": "2025-11-02T10:30:00.000Z"
  }
}
```

**cURL Command:**
```bash
curl -X POST http://localhost:5000/api/v1/addresses \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "John Doe",
    "phone": "+1-555-0123",
    "addressLine1": "123 Main Street",
    "addressLine2": "Apt 4B",
    "city": "New York",
    "state": "NY",
    "postalCode": "10001",
    "country": "USA",
    "isDefault": false
  }'
```

---

## Get All Addresses

**Description:** Retrieve all addresses for the authenticated user, ordered by default status and creation date.

**Endpoint:** `GET /api/v1/addresses`

**Authentication:** Required (Bearer token)

**Success Response (200 OK):**
```json
{
  "message": "Addresses retrieved successfully",
  "data": [
    {
      "id": "clx1a2b3c4d5e6f7g8h9i0j1",
      "userId": "clx9876543210abcdefghijk",
      "fullName": "John Doe",
      "phone": "+1-555-0123",
      "addressLine1": "123 Main Street",
      "addressLine2": "Apt 4B",
      "city": "New York",
      "state": "NY",
      "postalCode": "10001",
      "country": "USA",
      "isDefault": true,
      "createdAt": "2025-11-02T10:30:00.000Z",
      "updatedAt": "2025-11-02T10:30:00.000Z"
    },
    {
      "id": "clx2b3c4d5e6f7g8h9i0j1k2",
      "userId": "clx9876543210abcdefghijk",
      "fullName": "Jane Doe",
      "phone": "+1-555-0456",
      "addressLine1": "456 Oak Avenue",
      "addressLine2": null,
      "city": "Brooklyn",
      "state": "NY",
      "postalCode": "11201",
      "country": "USA",
      "isDefault": false,
      "createdAt": "2025-11-01T14:20:00.000Z",
      "updatedAt": "2025-11-01T14:20:00.000Z"
    }
  ]
}
```

**cURL Command:**
```bash
curl -X GET http://localhost:5000/api/v1/addresses \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

---

## Get Address by ID

**Description:** Retrieve a specific address by its ID. User must own the address.

**Endpoint:** `GET /api/v1/addresses/:id`

**Authentication:** Required (Bearer token)

**URL Parameters:**
- `id` (string, required) — Address ID (CUID format)

**Success Response (200 OK):**
```json
{
  "message": "Address retrieved successfully",
  "data": {
    "id": "clx1a2b3c4d5e6f7g8h9i0j1",
    "userId": "clx9876543210abcdefghijk",
    "fullName": "John Doe",
    "phone": "+1-555-0123",
    "addressLine1": "123 Main Street",
    "addressLine2": "Apt 4B",
    "city": "New York",
    "state": "NY",
    "postalCode": "10001",
    "country": "USA",
    "isDefault": true,
    "createdAt": "2025-11-02T10:30:00.000Z",
    "updatedAt": "2025-11-02T10:30:00.000Z"
  }
}
```

**Error Responses:**
- **404 Not Found:** Address doesn't exist
- **403 Forbidden:** User doesn't own this address

**cURL Command:**
```bash
curl -X GET http://localhost:5000/api/v1/addresses/clx1a2b3c4d5e6f7g8h9i0j1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

---

## Update Address

**Description:** Update an existing address. All fields are optional.

**Endpoint:** `PATCH /api/v1/addresses/:id`

**Authentication:** Required (Bearer token)

**URL Parameters:**
- `id` (string, required) — Address ID

**Request Body (all fields optional):**
```json
{
  "fullName": "John Smith",
  "phone": "+1-555-9999",
  "addressLine1": "789 New Street",
  "city": "Manhattan"
}
```

**Success Response (200 OK):**
```json
{
  "message": "Address updated successfully",
  "data": {
    "id": "clx1a2b3c4d5e6f7g8h9i0j1",
    "userId": "clx9876543210abcdefghijk",
    "fullName": "John Smith",
    "phone": "+1-555-9999",
    "addressLine1": "789 New Street",
    "addressLine2": "Apt 4B",
    "city": "Manhattan",
    "state": "NY",
    "postalCode": "10001",
    "country": "USA",
    "isDefault": true,
    "createdAt": "2025-11-02T10:30:00.000Z",
    "updatedAt": "2025-11-02T11:45:00.000Z"
  }
}
```

**cURL Command:**
```bash
curl -X PATCH http://localhost:5000/api/v1/addresses/clx1a2b3c4d5e6f7g8h9i0j1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "John Smith",
    "phone": "+1-555-9999",
    "addressLine1": "789 New Street",
    "city": "Manhattan"
  }'
```

---

## Delete Address

**Description:** Delete an address. If the deleted address was the default, the next most recent address automatically becomes the default.

**Endpoint:** `DELETE /api/v1/addresses/:id`

**Authentication:** Required (Bearer token)

**URL Parameters:**
- `id` (string, required) — Address ID

**Success Response (200 OK):**
```json
{
  "message": "Address deleted successfully"
}
```

**cURL Command:**
```bash
curl -X DELETE http://localhost:5000/api/v1/addresses/clx1a2b3c4d5e6f7g8h9i0j1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

---

## Set Default Address

**Description:** Set a specific address as the default address. All other addresses will be marked as non-default.

**Endpoint:** `PATCH /api/v1/addresses/:id/set-default`

**Authentication:** Required (Bearer token)

**URL Parameters:**
- `id` (string, required) — Address ID

**Success Response (200 OK):**
```json
{
  "message": "Default address set successfully",
  "data": {
    "id": "clx1a2b3c4d5e6f7g8h9i0j1",
    "userId": "clx9876543210abcdefghijk",
    "fullName": "John Doe",
    "phone": "+1-555-0123",
    "addressLine1": "123 Main Street",
    "addressLine2": "Apt 4B",
    "city": "New York",
    "state": "NY",
    "postalCode": "10001",
    "country": "USA",
    "isDefault": true,
    "createdAt": "2025-11-02T10:30:00.000Z",
    "updatedAt": "2025-11-02T12:00:00.000Z"
  }
}
```

**cURL Command:**
```bash
curl -X PATCH http://localhost:5000/api/v1/addresses/clx1a2b3c4d5e6f7g8h9i0j1/set-default \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

---

## Common Error Responses

**401 Unauthorized:**
```json
{
  "message": "User not authenticated"
}
```

**403 Forbidden:**
```json
{
  "message": "Unauthorized: You do not own this address"
}
```

**404 Not Found:**
```json
{
  "message": "Address not found"
}
```

**400 Bad Request (Validation):**
```json
{
  "success": false,
  "message": "Validation failed in body",
  "errors": [
    {
      "field": "phone",
      "message": "Invalid phone number format"
    }
  ]
}
```

**500 Internal Server Error:**
```json
{
  "message": "Failed to create address",
  "error": "Error details"
}
```
