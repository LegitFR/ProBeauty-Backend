# Staff API

Endpoints for managing salon staff members. Salon owners can add, update, and delete staff members. All users can view available staff.

---

## Create Staff

**Description:** Create a new staff member for a salon. Only the salon owner can add staff members to their salon.

**Endpoint:** `POST /api/v1/staff`

**Authentication:** Required (Bearer token)

**Request Body:**
```json
{
  "salonId": "clv1234567890abcdefgh",
  "role": "Hair Stylist",
  "availability": {
    "monday": "09:00-18:00",
    "tuesday": "09:00-18:00",
    "wednesday": "09:00-18:00",
    "thursday": "09:00-18:00",
    "friday": "09:00-18:00",
    "saturday": "10:00-16:00"
  },
  "userId": "clv0987654321zyxwvuts"
}
```

**Request Parameters:**
- `salonId` (string, required) — CUID format salon ID
- `role` (string, required) — Staff role/position, 2+ characters
- `availability` (object, optional) — Availability schedule
- `userId` (string, optional) — CUID format user ID to associate with staff member

**Success Response (201 Created):**
```json
{
  "message": "Staff member created successfully",
  "data": {
    "id": "clv9876543210zyxwvuts",
    "salonId": "clv1234567890abcdefgh",
    "role": "Hair Stylist",
    "availability": {
      "monday": "09:00-18:00",
      "tuesday": "09:00-18:00",
      "wednesday": "09:00-18:00",
      "thursday": "09:00-18:00",
      "friday": "09:00-18:00",
      "saturday": "10:00-16:00"
    },
    "userId": "clv0987654321zyxwvuts",
    "salon": {
      "id": "clv1234567890abcdefgh",
      "name": "Elite Salon"
    },
    "user": {
      "id": "clv0987654321zyxwvuts",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+1234567890"
    }
  }
}
```

**Error Response (403 Forbidden):**
```json
{
  "message": "Unauthorized: You do not own this salon"
}
```

**Error Response (400 Bad Request):**
```json
{
  "message": "User not found"
}
```

**cURL Command:**
```bash
curl -X POST http://localhost:5000/api/v1/staff \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "salonId": "clv1234567890abcdefgh",
    "role": "Hair Stylist",
    "availability": {
      "monday": "09:00-18:00",
      "tuesday": "09:00-18:00",
      "wednesday": "09:00-18:00",
      "thursday": "09:00-18:00",
      "friday": "09:00-18:00",
      "saturday": "10:00-16:00"
    },
    "userId": "clv0987654321zyxwvuts"
  }'
```

---

## Get Single Staff Member

**Description:** Retrieve details of a specific staff member by ID.

**Endpoint:** `GET /api/v1/staff/:id`

**Authentication:** Not required

**URL Parameters:**
- `id` (string, required) — Staff ID in CUID format

**Success Response (200 OK):**
```json
{
  "message": "Staff member fetched successfully",
  "data": {
    "id": "clv9876543210zyxwvuts",
    "salonId": "clv1234567890abcdefgh",
    "role": "Hair Stylist",
    "availability": {
      "monday": "09:00-18:00",
      "tuesday": "09:00-18:00",
      "wednesday": "09:00-18:00",
      "thursday": "09:00-18:00",
      "friday": "09:00-18:00",
      "saturday": "10:00-16:00"
    },
    "userId": "clv0987654321zyxwvuts",
    "salon": {
      "id": "clv1234567890abcdefgh",
      "name": "Elite Salon",
      "address": "123 Main St, Downtown"
    },
    "user": {
      "id": "clv0987654321zyxwvuts",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+1234567890"
    },
    "bookings": [
      {
        "id": "clv1111111111abcdefgh",
        "startTime": "2024-11-15T10:00:00Z",
        "endTime": "2024-11-15T10:30:00Z",
        "status": "completed"
      }
    ]
  }
}
```

**Error Response (404 Not Found):**
```json
{
  "message": "Staff member not found"
}
```

**cURL Command:**
```bash
curl -X GET http://localhost:5000/api/v1/staff/clv9876543210zyxwvuts \
  -H "Content-Type: application/json"
```

---

## Get Staff by Salon

**Description:** Retrieve all staff members for a specific salon.

**Endpoint:** `GET /api/v1/staff/salon/:salonId`

**Authentication:** Not required

**URL Parameters:**
- `salonId` (string, required) — Salon ID in CUID format

**Query Parameters:**
- `page` (number, optional) — Page number for pagination (default: 1)
- `limit` (number, optional) — Number of results per page (default: 10)
- `role` (string, optional) — Filter by staff role

**Success Response (200 OK):**
```json
{
  "message": "Salon staff retrieved successfully",
  "data": [
    {
      "id": "clv9876543210zyxwvuts",
      "salonId": "clv1234567890abcdefgh",
      "role": "Hair Stylist",
      "availability": {
        "monday": "09:00-18:00",
        "tuesday": "09:00-18:00",
        "wednesday": "09:00-18:00",
        "thursday": "09:00-18:00",
        "friday": "09:00-18:00",
        "saturday": "10:00-16:00"
      },
      "userId": "clv0987654321zyxwvuts",
      "salon": {
        "id": "clv1234567890abcdefgh",
        "name": "Elite Salon"
      },
      "user": {
        "id": "clv0987654321zyxwvuts",
        "name": "John Doe",
        "email": "john@example.com"
      }
    },
    {
      "id": "clv9876543210zyxwvuta",
      "salonId": "clv1234567890abcdefgh",
      "role": "Nail Technician",
      "availability": {
        "monday": "10:00-19:00",
        "tuesday": "10:00-19:00",
        "wednesday": "off",
        "thursday": "10:00-19:00",
        "friday": "10:00-19:00",
        "saturday": "10:00-17:00"
      },
      "userId": "clv0987654321zyxwvua",
      "salon": {
        "id": "clv1234567890abcdefgh",
        "name": "Elite Salon"
      },
      "user": {
        "id": "clv0987654321zyxwvua",
        "name": "Jane Smith",
        "email": "jane@example.com"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 2,
    "totalPages": 1
  }
}
```

**cURL Command:**
```bash
curl -X GET http://localhost:5000/api/v1/staff/salon/clv1234567890abcdefgh \
  -H "Content-Type: application/json"
```

**cURL Command with Query Parameters:**
```bash
curl -X GET "http://localhost:5000/api/v1/staff/salon/clv1234567890abcdefgh?page=1&limit=10&role=Hair%20Stylist" \
  -H "Content-Type: application/json"
```

---

## Get All Staff

**Description:** Retrieve all staff members across all salons.

**Endpoint:** `GET /api/v1/staff`

**Authentication:** Not required

**Query Parameters:**
- `page` (number, optional) — Page number for pagination (default: 1)
- `limit` (number, optional) — Number of results per page (default: 10)
- `salonId` (string, optional) — Filter by salon ID
- `role` (string, optional) — Filter by staff role

**Success Response (200 OK):**
```json
{
  "message": "Staff members retrieved successfully",
  "data": [
    {
      "id": "clv9876543210zyxwvuts",
      "salonId": "clv1234567890abcdefgh",
      "role": "Hair Stylist",
      "availability": {
        "monday": "09:00-18:00",
        "tuesday": "09:00-18:00",
        "wednesday": "09:00-18:00",
        "thursday": "09:00-18:00",
        "friday": "09:00-18:00",
        "saturday": "10:00-16:00"
      },
      "userId": "clv0987654321zyxwvuts",
      "salon": {
        "id": "clv1234567890abcdefgh",
        "name": "Elite Salon"
      },
      "user": {
        "id": "clv0987654321zyxwvuts",
        "name": "John Doe",
        "email": "john@example.com"
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

**cURL Command:**
```bash
curl -X GET http://localhost:5000/api/v1/staff \
  -H "Content-Type: application/json"
```

**cURL Command with Filters:**
```bash
curl -X GET "http://localhost:5000/api/v1/staff?page=1&limit=10&salonId=clv1234567890abcdefgh&role=Hair%20Stylist" \
  -H "Content-Type: application/json"
```

---

## Update Staff

**Description:** Update staff member details. Only the salon owner can update their salon's staff members.

**Endpoint:** `PATCH /api/v1/staff/:id`

**Authentication:** Required (Bearer token)

**URL Parameters:**
- `id` (string, required) — Staff ID in CUID format

**Request Body (all fields optional):**
```json
{
  "role": "Senior Hair Stylist",
  "availability": {
    "monday": "08:00-18:00",
    "tuesday": "08:00-18:00",
    "wednesday": "08:00-18:00",
    "thursday": "08:00-18:00",
    "friday": "08:00-18:00",
    "saturday": "10:00-17:00"
  },
  "userId": "clv0987654321zyxwvuts"
}
```

**Request Parameters:**
- `role` (string, optional) — New staff role, 2+ characters
- `availability` (object, optional) — Updated availability schedule
- `userId` (string, optional) — New user ID to associate with staff member

**Success Response (200 OK):**
```json
{
  "message": "Staff member updated successfully",
  "data": {
    "id": "clv9876543210zyxwvuts",
    "salonId": "clv1234567890abcdefgh",
    "role": "Senior Hair Stylist",
    "availability": {
      "monday": "08:00-18:00",
      "tuesday": "08:00-18:00",
      "wednesday": "08:00-18:00",
      "thursday": "08:00-18:00",
      "friday": "08:00-18:00",
      "saturday": "10:00-17:00"
    },
    "userId": "clv0987654321zyxwvuts",
    "salon": {
      "id": "clv1234567890abcdefgh",
      "name": "Elite Salon"
    },
    "user": {
      "id": "clv0987654321zyxwvuts",
      "name": "John Doe",
      "email": "john@example.com"
    }
  }
}
```

**Error Response (403 Forbidden):**
```json
{
  "message": "Unauthorized: You do not own this staff member"
}
```

**Error Response (400 Bad Request):**
```json
{
  "message": "User not found"
}
```

**cURL Command:**
```bash
curl -X PATCH http://localhost:5000/api/v1/staff/clv9876543210zyxwvuts \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "role": "Senior Hair Stylist",
    "availability": {
      "monday": "08:00-18:00",
      "tuesday": "08:00-18:00",
      "wednesday": "08:00-18:00",
      "thursday": "08:00-18:00",
      "friday": "08:00-18:00",
      "saturday": "10:00-17:00"
    }
  }'
```

---

## Delete Staff

**Description:** Delete a staff member. Only the salon owner can delete their salon's staff members.

**Endpoint:** `DELETE /api/v1/staff/:id`

**Authentication:** Required (Bearer token)

**URL Parameters:**
- `id` (string, required) — Staff ID in CUID format

**Success Response (200 OK):**
```json
{
  "message": "Staff member deleted successfully"
}
```

**Error Response (403 Forbidden):**
```json
{
  "message": "Unauthorized: You do not own this staff member"
}
```

**Error Response (404 Not Found):**
```json
{
  "message": "Staff member not found"
}
```

**cURL Command:**
```bash
curl -X DELETE http://localhost:5000/api/v1/staff/clv9876543210zyxwvuts \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

---

## Validation Rules

- **salonId**: Must be a valid CUID format
- **role**: Minimum 2 characters
- **availability**: JSON object with optional schedule data
- **userId**: Must be a valid CUID format and exist in database
- **id (in URL)**: Must be a valid CUID format

## Authentication Notes

- Use JWT tokens obtained from the authentication endpoint
- Include token in `Authorization: Bearer <TOKEN>` header
- Token claims must include user ID for ownership verification
- Only salon owners can create, update, or delete staff members for their salons

## Pagination Notes

- Default page size is 10 items
- Page numbering starts at 1
- Total count is included in response for proper pagination UI
