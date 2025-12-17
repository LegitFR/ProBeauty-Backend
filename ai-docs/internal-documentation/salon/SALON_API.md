# Salon API Documentation

Complete reference for salon management endpoints in the ProBeauty Backend.

## Overview

- Base path: `/api/v1/salons` (see `src/index.ts`)
- Authentication: Protected routes require Bearer token in `Authorization` header
- Validation: All requests validated with Zod (`src/schemas/salonSchema.ts`) via `validateRequest`
- Content type: `application/json` for requests and responses
- Pagination: Default limit is 10 items per page
- ID Format: All salon IDs use CUID format

Tip: Replace `http://localhost:5000` with your server URL in examples below.

---

## Data Structures

### Salon Object

```json
{
  "id": "clxxx123456789",
  "name": "Glamour Studio",
  "address": "123 Fashion Street, Mumbai, Maharashtra 400001",
  "venueType": "everyone",
  "phone": "9876543210",
  "ownerId": "usr_123",
  "verified": false,
  "geo": {
    "latitude": 19.076,
    "longitude": 72.8777
  },
  "hours": {
    "monday": { "open": "09:00", "close": "18:00" },
    "tuesday": { "open": "09:00", "close": "18:00" },
    "wednesday": { "open": "09:00", "close": "18:00" },
    "thursday": { "open": "09:00", "close": "18:00" },
    "friday": { "open": "09:00", "close": "18:00" },
    "saturday": { "open": "10:00", "close": "16:00" },
    "sunday": { "open": "10:00", "close": "16:00" }
  },
  "staff": [
    {
      "id": "staff_456",
      "salonId": "clxxx123456789",
      "userId": "usr_789",
      "availability": {
        "monday": {
          "isAvailable": true,
          "slots": [{ "start": "09:00", "end": "18:00" }]
        },
        "tuesday": {
          "isAvailable": true,
          "slots": [{ "start": "09:00", "end": "18:00" }]
        },
        "sunday": {
          "isAvailable": false
        }
      },
      "user": {
        "id": "usr_789",
        "name": "Sarah Johnson",
        "email": "sarah@example.com"
      }
    }
  ],
  "services": [],
  "products": [],
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

### 1) Get All Salons (Public) — GET `/api/v1/salons`

Retrieves all salons with optional pagination and filtering. Public endpoint accessible without authentication.

Query parameters:

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `verified` (optional): Filter by verification status ("true" or "false")

Sample success response (200):

```json
{
  "message": "All salons retrieved successfully",
  "data": [
    {
      "id": "clxxx123456789",
      "name": "Glamour Studio",
      "address": "123 Fashion Street, Mumbai",
      "phone": "9876543210",
      "ownerId": "usr_123",
      "verified": true,
      "geo": {
        "latitude": 19.076,
        "longitude": 72.8777
      },
      "hours": {
        "monday": { "open": "09:00", "close": "18:00" }
      },
      "owner": {
        "id": "usr_123",
        "name": "John Doe",
        "email": "john@example.com"
      },
      "staff": [],
      "services": [],
      "products": [],
      "createdAt": "2025-01-15T10:30:00.000Z",
      "updatedAt": "2025-01-15T10:30:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "totalPages": 1
  }
}
```

curl examples:

```bash
# Get all salons (default pagination)
curl -X GET "http://localhost:5000/api/v1/salons" \
  -H "Content-Type: application/json"

# Get verified salons only
curl -X GET "http://localhost:5000/api/v1/salons?verified=true" \
  -H "Content-Type: application/json"

# Get salons with custom pagination
curl -X GET "http://localhost:5000/api/v1/salons?page=2&limit=20" \
  -H "Content-Type: application/json"
```

Errors: 500 (server error)

---

### 2) Search Salons (Public) — GET `/api/v1/salons/search`

Performs an advanced search that returns salons along with their relevant services. Every query parameter is optional and can be combined:

- `venueType`: `"male" | "female" | "everyone"`
- `maxPrice`: Number (₹). Includes salons that have at least one service priced at or below this amount.
- `sortBy`: `"top_rated" | "recommended" | "nearest"`.
- `service`: Free-text keywords (e.g., `"hair cut"`). Fuzzy matches each word against service titles.
- `location`: Free-text city / area snippet that matches against the salon address.
- `date`: ISO date (e.g., `2025-12-03`). Used with `time` to keep salons operating during that slot.
- `time`: `"morning" | "afternoon" | "evening" | "night"` mapped to 05:00–12:00, 12:00–17:00, 17:00–21:00, 21:00–24:00.
- `latitude`, `longitude`: Numbers. Required for `sortBy=nearest` so the API can calculate distance.
- `page`, `limit`: Pagination controls (default: 1 / 10).

Example calls:

```bash
# Filter female-only venues with services <= ₹1500 and rank by rating
curl -X GET "http://localhost:5000/api/v1/salons/search?venueType=female&maxPrice=1500&sortBy=top_rated" \
  -H "Content-Type: application/json"

# Typical search box usage: haircut near Mumbai on Saturday evening
curl -X GET "http://localhost:5000/api/v1/salons/search?service=hair%20cut&location=Mumbai&date=2025-12-06&time=evening" \
  -H "Content-Type: application/json"

# Nearest salons around a coordinate (must send latitude & longitude)
curl -X GET "http://localhost:5000/api/v1/salons/search?sortBy=nearest&latitude=19.0760&longitude=72.8777" \
  -H "Content-Type: application/json"
```

Sample success response (200):

```json
{
  "message": "Salon search completed successfully",
  "data": [
    {
      "id": "clxxx123456789",
      "name": "Glamour Studio",
      "venueType": "female",
      "address": "123 Fashion Street, Mumbai, Maharashtra 400001",
      "averageRating": 4.8,
      "distanceKm": 2.1,
      "services": [
        {
          "id": "srv_789",
          "title": "Haircut - Layered",
          "price": 1200.0
        }
      ],
      "geo": {
        "latitude": 19.076,
        "longitude": 72.8777
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "totalPages": 1
  }
}
```

Notes:

- Services in the payload respect the `service` keywords and `maxPrice` filters when provided.
- `averageRating` is derived from existing salon reviews; `distanceKm` is only present when coordinates are supplied.
- When both `date` and `time` are set, only salons whose working hours overlap the time segment return.

---

### 3) Create Salon (Protected) — POST `/api/v1/salons`

Registers a new salon. Requires authentication. The authenticated user becomes the salon owner.

**Content-Type:** `multipart/form-data` (for file uploads) or `application/json` (without files)

**Request Body:**

The request can be sent as JSON or multipart/form-data. If uploading images, use `multipart/form-data`.

**JSON Fields (can be sent as form fields or JSON):**

- `name` (required): String, minimum 2 characters
- `address` (required): String, minimum 5 characters
- `phone` (optional): String, must match Indian phone format (10 digits starting with 6-9)
- `venueType` (optional): `"male" | "female" | "everyone"` (defaults to `"everyone"`)
- `geo` (optional): JSON string or object with `latitude` and `longitude` (both numbers)
  - **Note:** When using `multipart/form-data`, send as JSON string (e.g., `'{"latitude":19.076,"longitude":72.8777}'`). The middleware automatically parses it to an object before validation.
- `hours` (optional): JSON string or object with day names as keys (monday-sunday), each containing `open` and `close` time strings
  - **Note:** When using `multipart/form-data`, send as JSON string (e.g., `'{"monday":{"open":"09:00","close":"18:00"}}'`). The middleware automatically parses it to an object before validation.

**File Upload Fields (multipart/form-data only):**

- `thumbnail` (optional): Single image file for salon thumbnail
- `images` (optional): Multiple image files for salon gallery

**Sample JSON Request:**

```json
{
  "name": "Glamour Studio",
  "address": "123 Fashion Street, Mumbai, Maharashtra 400001",
  "venueType": "female",
  "phone": "9876543210",
  "geo": {
    "latitude": 19.076,
    "longitude": 72.8777
  },
  "hours": {
    "monday": { "open": "09:00", "close": "18:00" },
    "tuesday": { "open": "09:00", "close": "18:00" },
    "wednesday": { "open": "09:00", "close": "18:00" },
    "thursday": { "open": "09:00", "close": "18:00" },
    "friday": { "open": "09:00", "close": "18:00" },
    "saturday": { "open": "10:00", "close": "16:00" },
    "sunday": { "open": "10:00", "close": "16:00" }
  }
}
```

**Sample success response (201):**

```json
{
  "message": "Salon registered successfully",
  "data": {
    "id": "clxxx123456789",
    "name": "Glamour Studio",
    "address": "123 Fashion Street, Mumbai, Maharashtra 400001",
    "venueType": "female",
    "phone": "9876543210",
    "ownerId": "usr_123",
    "verified": false,
    "geo": {
      "latitude": 19.076,
      "longitude": 72.8777
    },
    "hours": {
      "monday": { "open": "09:00", "close": "18:00" },
      "tuesday": { "open": "09:00", "close": "18:00" }
    },
    "thumbnail": "https://cloudinary.com/...",
    "images": ["https://cloudinary.com/...", "https://cloudinary.com/..."],
    "staff": [],
    "services": [],
    "products": [],
    "createdAt": "2025-01-15T10:30:00.000Z"
  }
}
```

**cURL Examples:**

```bash
# Create salon without images (JSON)
curl -X POST "http://localhost:5000/api/v1/salons" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-access-token>" \
  -d '{
    "name": "Glamour Studio",
    "address": "123 Fashion Street, Mumbai, Maharashtra 400001",
    "phone": "9876543210",
    "venueType": "female",
    "geo": {
      "latitude": 19.0760,
      "longitude": 72.8777
    },
    "hours": {
      "monday": { "open": "09:00", "close": "18:00" },
      "tuesday": { "open": "09:00", "close": "18:00" }
    }
  }'

# Create salon with images (multipart/form-data)
curl -X POST "http://localhost:5000/api/v1/salons" \
  -H "Authorization: Bearer <your-access-token>" \
  -F "name=Glamour Studio" \
  -F "address=123 Fashion Street, Mumbai, Maharashtra 400001" \
  -F "phone=9876543210" \
  -F "venueType=female" \
  -F 'geo={"latitude":19.076,"longitude":72.8777}' \
  -F 'hours={"monday":{"open":"09:00","close":"18:00"}}' \
  -F "thumbnail=@/path/to/thumbnail.jpg" \
  -F "images=@/path/to/image1.jpg" \
  -F "images=@/path/to/image2.jpg"
```

Errors:

- **401**: Not authenticated
- **400**: Validation error (invalid request body or missing required fields)
- **413**: Request entity too large (file upload size limit exceeded)
- **500**: Internal server error

---

### 4) Get My Salons (Protected) — GET `/api/v1/salons/my-salons`

Retrieves all salons owned by the authenticated user with optional pagination and filtering.

Query parameters:

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `verified` (optional): Filter by verification status ("true" or "false")

Sample success response (200):

```json
{
  "message": "Salons retrieved successfully",
  "data": [
    {
      "id": "clxxx123456789",
      "name": "Glamour Studio",
      "address": "123 Fashion Street, Mumbai",
      "phone": "9876543210",
      "ownerId": "usr_123",
      "verified": false,
      "geo": {
        "latitude": 19.076,
        "longitude": 72.8777
      },
      "hours": {
        "monday": { "open": "09:00", "close": "18:00" }
      },
      "staff": [],
      "services": [],
      "products": [],
      "createdAt": "2025-01-15T10:30:00.000Z",
      "updatedAt": "2025-01-15T10:30:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "totalPages": 1
  }
}
```

curl examples:

```bash
# Get all your salons
curl -X GET "http://localhost:5000/api/v1/salons/my-salons" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-access-token>"

# Get only verified salons you own
curl -X GET "http://localhost:5000/api/v1/salons/my-salons?verified=true" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-access-token>"

# Get with pagination
curl -X GET "http://localhost:5000/api/v1/salons/my-salons?page=1&limit=5" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-access-token>"
```

Errors:

- 401 (not authenticated)
- 500 (server error)

---

### 5) Get Salon by ID (Public) — GET `/api/v1/salons/:id`

Retrieves a specific salon by its ID. Public endpoint with full salon details including staff, services, and products.

URL parameters:

- `id`: Salon ID in CUID format (e.g., "clxxx123456789")

Sample success response (200):

```json
{
  "message": "Salon fetched successfully",
  "data": {
    "id": "clxxx123456789",
    "name": "Glamour Studio",
    "address": "123 Fashion Street, Mumbai, Maharashtra 400001",
    "phone": "9876543210",
    "ownerId": "usr_123",
    "verified": true,
    "geo": {
      "latitude": 19.076,
      "longitude": 72.8777
    },
    "hours": {
      "monday": { "open": "09:00", "close": "18:00" },
      "tuesday": { "open": "09:00", "close": "18:00" }
    },
    "staff": [
      {
        "id": "staff_456",
        "salonId": "clxxx123456789",
        "userId": "usr_789",
        "availability": {
          "monday": {
            "isAvailable": true,
            "slots": [{ "start": "09:00", "end": "18:00" }]
          },
          "tuesday": {
            "isAvailable": true,
            "slots": [{ "start": "09:00", "end": "18:00" }]
          },
          "wednesday": {
            "isAvailable": true,
            "slots": [{ "start": "09:00", "end": "18:00" }]
          },
          "thursday": {
            "isAvailable": true,
            "slots": [{ "start": "09:00", "end": "18:00" }]
          },
          "friday": {
            "isAvailable": true,
            "slots": [{ "start": "09:00", "end": "18:00" }]
          },
          "saturday": {
            "isAvailable": true,
            "slots": [{ "start": "10:00", "end": "16:00" }]
          },
          "sunday": {
            "isAvailable": false
          }
        },
        "user": {
          "id": "usr_789",
          "name": "Sarah Johnson",
          "email": "sarah@example.com"
        }
      }
    ],
    "services": [
      {
        "id": "srv_789",
        "name": "Haircut",
        "price": 500
      }
    ],
    "products": [],
    "createdAt": "2025-01-15T10:30:00.000Z",
    "updatedAt": "2025-01-15T10:30:00.000Z"
  }
}
```

curl:

```bash
curl -X GET "http://localhost:5000/api/v1/salons/clxxx123456789" \
  -H "Content-Type: application/json"
```

Errors:

- 404 (salon not found)
- 400 (invalid ID format)
- 500 (server error)

---

### 6) Update Salon (Protected) — PATCH `/api/v1/salons/:id`

Updates an existing salon. Only the salon owner can update their salon.

**Content-Type:** `multipart/form-data` (for file uploads) or `application/json` (without files)

**URL parameters:**

- `id`: Salon ID in CUID format

**Request Body (all fields optional):**

Can be sent as JSON or multipart/form-data. If uploading new images, use `multipart/form-data`.

**JSON Fields:**

- `name`: String, minimum 2 characters
- `address`: String, minimum 5 characters
- `phone`: String, must match Indian phone format
- `venueType`: `"male" | "female" | "everyone"`
- `geo`: Object with `latitude` and `longitude`
  - **Note:** When using `multipart/form-data`, send as JSON string. The middleware automatically parses it to an object before validation.
- `hours`: Object with day names and time ranges
  - **Note:** When using `multipart/form-data`, send as JSON string. The middleware automatically parses it to an object before validation.

**File Upload Fields (multipart/form-data only):**

- `thumbnail` (optional): Single image file to update salon thumbnail
- `images` (optional): Multiple image files to update salon gallery

**Sample JSON Request:**

```json
{
  "name": "Glamour Studio Deluxe",
  "address": "456 New Fashion Street, Mumbai, Maharashtra 400001",
  "venueType": "male",
  "phone": "9123456789",
  "geo": {
    "latitude": 19.0761,
    "longitude": 72.8778
  },
  "hours": {
    "monday": { "open": "08:00", "close": "20:00" },
    "tuesday": { "open": "08:00", "close": "20:00" }
  }
}
```

**Sample success response (200):**

```json
{
  "message": "Salon updated successfully",
  "data": {
    "id": "clxxx123456789",
    "name": "Glamour Studio Deluxe",
    "address": "456 New Fashion Street, Mumbai, Maharashtra 400001",
    "venueType": "male",
    "phone": "9123456789",
    "ownerId": "usr_123",
    "verified": false,
    "geo": {
      "latitude": 19.0761,
      "longitude": 72.8778
    },
    "hours": {
      "monday": { "open": "08:00", "close": "20:00" },
      "tuesday": { "open": "08:00", "close": "20:00" }
    },
    "thumbnail": "https://cloudinary.com/...",
    "images": ["https://cloudinary.com/..."],
    "staff": [],
    "services": [],
    "products": [],
    "createdAt": "2025-01-15T10:30:00.000Z"
  }
}
```

**cURL Examples:**

```bash
# Update salon without images (JSON)
curl -X PATCH "http://localhost:5000/api/v1/salons/clxxx123456789" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-access-token>" \
  -d '{
    "name": "Glamour Studio Deluxe",
    "phone": "9123456789",
    "hours": {
      "monday": { "open": "08:00", "close": "20:00" }
    }
  }'

# Update salon with new images (multipart/form-data)
curl -X PATCH "http://localhost:5000/api/v1/salons/clxxx123456789" \
  -H "Authorization: Bearer <your-access-token>" \
  -F "name=Glamour Studio Deluxe" \
  -F "phone=9123456789" \
  -F "thumbnail=@/path/to/new-thumbnail.jpg" \
  -F "images=@/path/to/new-image1.jpg"
```

Errors:

- **401**: Not authenticated
- **403**: Unauthorized - not the salon owner
- **404**: Salon not found
- **400**: Validation error or invalid ID format
- **413**: Request entity too large (file upload size limit exceeded)
- **500**: Internal server error

---

### 7) Delete Salon (Protected) — DELETE `/api/v1/salons/:id`

Deletes a salon. Only the salon owner can delete their salon. This is a destructive operation.

URL parameters:

- `id`: Salon ID in CUID format

Sample success response (200):

```json
{
  "message": "Salon deleted successfully"
}
```

curl:

```bash
curl -X DELETE "http://localhost:5000/api/v1/salons/clxxx123456789" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-access-token>"
```

Errors:

- 401 (not authenticated)
- 403 (unauthorized - not the salon owner)
- 404 (salon not found)
- 400 (invalid ID format)
- 500 (server error)

---

## Validation Rules

### Phone Number Format

- Must be exactly 10 digits
- Must start with 6, 7, 8, or 9 (Indian mobile format)
- Examples: "9876543210", "8123456789"

### ID Format

- All salon IDs use CUID format
- Example: "clxxx123456789"
- Validation error if format is incorrect

### Name Requirements

- Minimum 2 characters
- Required for creation
- Optional for updates

### Address Requirements

- Minimum 5 characters
- Required for creation
- Optional for updates

### Geo Coordinates

- `latitude`: Number (typically between -90 and 90)
- `longitude`: Number (typically between -180 and 180)
- Both fields required if `geo` is provided
- Can be sent as JSON object (in `application/json` requests) or JSON string (in `multipart/form-data` requests)
- **Automatic Parsing:** When sent as JSON string in multipart/form-data, the `parseMultipartJsonFields` middleware automatically converts it to an object before validation

### Hours Format

- Object with day names: "monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"
- Each day is optional
- Each day object must contain "open" and "close" strings
- Time format: "HH:mm" (24-hour format, e.g., "09:00", "18:00")
- Can be sent as JSON object (in `application/json` requests) or JSON string (in `multipart/form-data` requests)
- **Automatic Parsing:** When sent as JSON string in multipart/form-data, the `parseMultipartJsonFields` middleware automatically converts it to an object before validation

### File Uploads

- **Content-Type**: Use `multipart/form-data` when uploading files
- **Fields**:
  - `thumbnail`: Single image file (optional)
  - `images`: Multiple image files (optional, can be sent multiple times)
- **File Size**: Check server configuration for size limits
- **Supported Formats**: JPEG, PNG, WebP (check server configuration)
- Files are uploaded to Cloudinary and URLs are returned in the response

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
- **400**: Bad Request (validation errors, invalid format)
- **401**: Unauthorized (not authenticated)
- **403**: Forbidden (not authorized to access resource)
- **404**: Not Found (salon doesn't exist)
- **500**: Internal Server Error

### Validation Errors

Zod validation errors return detailed messages:

```json
{
  "message": "Validation failed",
  "errors": [
    {
      "field": "name",
      "message": "Salon name must be at least 2 characters"
    }
  ]
}
```

---

## Authentication

Protected endpoints require a valid JWT access token in the Authorization header:

```
Authorization: Bearer <your-access-token>
```

To obtain an access token:

1. Register and verify your account via `/api/v1/auth/signup` and `/api/v1/auth/confirm-registration`
2. Login via `/api/v1/auth/login` to receive access and refresh tokens
3. Use the access token for all protected salon endpoints
4. Refresh the access token using `/api/v1/auth/refresh-token` when it expires

See `AUTH_OVERVIEW.md` for detailed authentication flow.

---

## Ownership and Authorization

### Salon Ownership

- When creating a salon, the authenticated user automatically becomes the owner
- The `ownerId` field is set to the authenticated user's ID
- Ownership cannot be transferred through the API

### Authorization Rules

- **Create**: Any authenticated user can create a salon
- **Read**: Public endpoints (GET all salons, GET salon by ID) don't require authentication
- **My Salons**: Only authenticated users can view their own salons
- **Update**: Only the salon owner can update their salon
- **Delete**: Only the salon owner can delete their salon

### Verification Status

- New salons are created with `verified: false`
- The `verified` field indicates if a salon has been verified by administrators
- Salon owners cannot change the verification status themselves
- Verification is managed through admin-only processes (not covered by these endpoints)

---

## Data Storage Notes

### JSON Fields

The following fields are stored as JSON strings in the database but automatically parsed in API responses:

- `geo`: Geographic coordinates
- `hours`: Business hours
- `staff[].availability`: Staff availability schedule (parsed from JSON string to object)

The API handles serialization/deserialization automatically - always send and receive these as proper JSON objects.

#### Staff Availability Format

Staff availability is returned as a JSON object with the following structure:

```json
{
  "monday": {
    "isAvailable": true,
    "slots": [{ "start": "09:00", "end": "18:00" }]
  },
  "tuesday": {
    "isAvailable": true,
    "slots": [{ "start": "09:00", "end": "18:00" }]
  },
  // ... other days
  "sunday": {
    "isAvailable": false
  }
}
```

Each day can have:

- `isAvailable`: Boolean indicating if staff works on that day
- `slots`: Array of time slots (only present if `isAvailable` is true)
  - Each slot has `start` and `end` times in "HH:mm" format

### Relationships

Each salon includes related data:

- `staff[]`: Array of staff members working at the salon
  - Each staff object includes: `id`, `salonId`, `userId` (nullable), `availability` (parsed JSON object), and `user` (if linked to a user account)
- `services[]`: Array of services offered by the salon
- `products[]`: Array of products available at the salon
- `owner`: Owner information (only in "Get All Salons" endpoint)

These relationships are automatically populated by the API. Staff `availability` is automatically parsed from JSON string to a proper JSON object in all responses.

---

## Implementation References

- **Router**: `src/routes/salonRoute.ts`
- **Controllers**: `src/controllers/salonController.ts`
- **Services**: `src/services/salonService.ts`
- **Schemas**: `src/schemas/salonSchema.ts`
- **Middleware**:
  - `src/middlewares/auth/authenticate.ts` - Authentication
  - `src/middlewares/validateRequest.ts` - Request validation
  - `src/middlewares/uploadMiddleware.ts` - File upload handling (`uploadSalonImages`, `handleMulterError`, `parseMultipartJsonFields`)
    - `parseMultipartJsonFields`: Automatically parses JSON strings for `geo` and `hours` fields in multipart/form-data requests before validation
- **File Upload Service**: `src/services/fileUploadService.ts` - Cloudinary integration
- **Database Model**: `prisma/schema.prisma` (Salon model)

---

## Best Practices

### Creating Salons

1. Always provide complete and accurate information
2. Include phone number for customer contact
3. Add geo coordinates for location-based features
4. Set business hours for customer convenience
5. Upload high-quality images (thumbnail and gallery) for better presentation
6. Use `multipart/form-data` when uploading images, `application/json` otherwise
7. Verify all information before submission

### Updating Salons

1. Only update fields that need to change (all fields are optional)
2. Partial updates are supported - unchanged fields remain the same
3. Use `multipart/form-data` when updating images, `application/json` for text-only updates
4. Uploading new images will replace existing ones
5. Re-validate all information after updates

### Querying Salons

1. Use pagination for large result sets to improve performance
2. Filter by `verified=true` to show only verified salons to end users
3. Cache public salon data when appropriate
4. Use the specific GET by ID endpoint when you know the salon ID

### Security

1. Never share access tokens
2. Always use HTTPS in production
3. Validate and sanitize all user input
4. Implement rate limiting on frontend to prevent abuse
5. Log all salon modifications for audit trails

---

## Complete Usage Example

Here's a complete workflow example:

```bash
# 1. Login to get access token
LOGIN_RESPONSE=$(curl -s -X POST "http://localhost:5000/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "owner@example.com",
    "password": "SecureP@ssw0rd"
  }')

ACCESS_TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.accessToken')

# 2. Create a new salon (without images - JSON)
SALON_RESPONSE=$(curl -s -X POST "http://localhost:5000/api/v1/salons" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -d '{
    "name": "Beauty Paradise",
    "address": "789 Main Street, Delhi 110001",
    "phone": "9876543210",
    "venueType": "everyone",
    "geo": {
      "latitude": 28.6139,
      "longitude": 77.2090
    },
    "hours": {
      "monday": { "open": "09:00", "close": "18:00" },
      "tuesday": { "open": "09:00", "close": "18:00" },
      "wednesday": { "open": "09:00", "close": "18:00" },
      "thursday": { "open": "09:00", "close": "18:00" },
      "friday": { "open": "09:00", "close": "18:00" }
    }
  }')

SALON_ID=$(echo $SALON_RESPONSE | jq -r '.data.id')
echo "Created salon with ID: $SALON_ID"

# 2b. Alternative: Create salon with images (multipart/form-data)
# curl -X POST "http://localhost:5000/api/v1/salons" \
#   -H "Authorization: Bearer $ACCESS_TOKEN" \
#   -F "name=Beauty Paradise" \
#   -F "address=789 Main Street, Delhi 110001" \
#   -F "phone=9876543210" \
#   -F "venueType=everyone" \
#   -F 'geo={"latitude":28.6139,"longitude":77.2090}' \
#   -F 'hours={"monday":{"open":"09:00","close":"18:00"}}' \
#   -F "thumbnail=@/path/to/thumbnail.jpg" \
#   -F "images=@/path/to/image1.jpg" \
#   -F "images=@/path/to/image2.jpg"

# 3. Get the salon details
curl -X GET "http://localhost:5000/api/v1/salons/$SALON_ID" \
  -H "Content-Type: application/json"

# 4. Get all your salons
curl -X GET "http://localhost:5000/api/v1/salons/my-salons" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ACCESS_TOKEN"

# 5. Search salons
curl -X GET "http://localhost:5000/api/v1/salons/search?service=haircut&location=Delhi&maxPrice=1500" \
  -H "Content-Type: application/json"

# 6. Update salon hours (JSON)
curl -X PATCH "http://localhost:5000/api/v1/salons/$SALON_ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -d '{
    "hours": {
      "saturday": { "open": "10:00", "close": "16:00" },
      "sunday": { "open": "10:00", "close": "14:00" }
    }
  }'

# 7. Update salon with new images (multipart/form-data)
# curl -X PATCH "http://localhost:5000/api/v1/salons/$SALON_ID" \
#   -H "Authorization: Bearer $ACCESS_TOKEN" \
#   -F "name=Beauty Paradise Premium" \
#   -F "thumbnail=@/path/to/new-thumbnail.jpg" \
#   -F "images=@/path/to/new-image.jpg"

# 8. Get all public salons with filtering
curl -X GET "http://localhost:5000/api/v1/salons?verified=true&page=1&limit=20" \
  -H "Content-Type: application/json"
```

---

## Future Enhancements

Potential future additions to the Salon API:

- Bulk operations (create/update multiple salons)
- Search and filtering by location radius
- Salon ratings and reviews
- Image uploads for salon photos
- Advanced search with text queries
- Salon statistics and analytics
- Admin endpoints for salon verification
- Salon categories or tags

---

## Support and Feedback

For issues, questions, or suggestions:

- Review the authentication docs: `ai-docs/internal-documentation/auth/AUTH_OVERVIEW.md`
- Check the project guidelines: `CLAUDE.md`
- Verify your request format matches the examples above
- Ensure your access token is valid and not expired
- Check server logs for detailed error messages
