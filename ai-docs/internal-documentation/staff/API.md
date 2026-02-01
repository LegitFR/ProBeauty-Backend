# Staff API

Endpoints for managing salon staff members. Salon owners can add, update, and delete staff members. All users can view available staff.

---

## Create Staff

**Description:** Create a new staff member for a salon. Only the salon owner can add staff members to their salon.

**Endpoint:** `POST /api/v1/staff`

**Authentication:** Required (Bearer token)

**Request Body:**

Use `multipart/form-data` for requests with image uploads.

Form fields:

- `salonId` (string, required) — CUID format salon ID
- `serviceId` (string, required) — CUID format service ID that this staff member can perform. Service must belong to the specified salon.
- `availability` (string, optional) — Weekly availability object (JSON string) with keys for each day (`monday`–`sunday`), each containing:
  - `isAvailable` (boolean, required)
  - `slots` (array, optional) — List of time slots with `start` and `end` in `HH:mm` format
- `userId` (string, optional) — CUID format user ID to associate with staff member
- `image` (file, optional) — Staff profile image (JPEG, JPG, PNG, WebP, or GIF; max 5MB)

**Request Parameters (JSON fields):**

```json
{
  "salonId": "clv1234567890abcdefgh",
  "serviceId": "clv1111111111abcdefgh",
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
  "userId": "clv0987654321zyxwvuts"
}
```

**Request Parameters:**

- `salonId` (string, required) — CUID format salon ID
- `serviceId` (string, required) — CUID format service ID that this staff member can perform. Service must belong to the specified salon.
- `availability` (object, optional) — Weekly availability object with keys for each day (`monday`–`sunday`), each containing:
  - `isAvailable` (boolean, required)
  - `slots` (array, optional) — List of time slots with `start` and `end` in `HH:mm` format
- `userId` (string, optional) — CUID format user ID to associate with staff member

**Success Response (201 Created):**

```json
{
  "message": "Staff member created successfully",
  "data": {
    "id": "clv9876543210zyxwvuts",
    "salonId": "clv1234567890abcdefgh",
    "name": "John Doe",
    "image": "https://res.cloudinary.com/demo/image/upload/v1/staff.jpg",
    "services": [
      {
        "id": "clv1111111111abcdefgh",
        "service": {
          "id": "clv1111111111abcdefgh",
          "title": "Haircut",
          "price": 500
        }
      },
      {
        "id": "clv2222222222abcdefgh",
        "service": {
          "id": "clv2222222222abcdefgh",
          "title": "Hair Styling",
          "price": 800
        }
      }
    ],
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
    "salonId": "cmiplyw1n0002li2gbggmr85q",
    "serviceId": "clv1111111111abcdefgh",
    "availability": {
      "monday":   { "isAvailable": true,  "slots": [ { "start": "09:00", "end": "18:00" } ] },
      "tuesday":  { "isAvailable": true,  "slots": [ { "start": "09:00", "end": "18:00" } ] },
      "wednesday":{ "isAvailable": true,  "slots": [ { "start": "09:00", "end": "18:00" } ] },
      "thursday": { "isAvailable": true,  "slots": [ { "start": "09:00", "end": "18:00" } ] },
      "friday":   { "isAvailable": true,  "slots": [ { "start": "09:00", "end": "18:00" } ] },
      "saturday": { "isAvailable": true,  "slots": [ { "start": "10:00", "end": "16:00" } ] },
      "sunday":   { "isAvailable": false }
    }
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
    "name": "John Doe",
    "image": "https://res.cloudinary.com/demo/image/upload/v1/staff.jpg",
    "services": [
      {
        "id": "clv1111111111abcdefgh",
        "service": {
          "id": "clv1111111111abcdefgh",
          "title": "Haircut",
          "price": 500
        }
      },
      {
        "id": "clv2222222222abcdefgh",
        "service": {
          "id": "clv2222222222abcdefgh",
          "title": "Hair Styling",
          "price": 800
        }
      }
    ],
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

**Success Response (200 OK):**

```json
{
  "message": "Salon staff retrieved successfully",
  "data": [
    {
      "id": "clv9876543210zyxwvuts",
      "salonId": "clv1234567890abcdefgh",
      "name": "John Doe",
      "image": "https://res.cloudinary.com/demo/image/upload/v1/staff.jpg",
      "services": [
        {
          "id": "clv1111111111abcdefgh",
          "service": {
            "id": "clv1111111111abcdefgh",
            "title": "Haircut",
            "price": 500
          }
        }
      ],
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
      "name": "Jane Smith",
      "image": null,
      "services": [
        {
          "id": "clv4444444444abcdefgh",
          "service": {
            "id": "clv4444444444abcdefgh",
            "title": "Manicure",
            "price": 600
          }
        }
      ],
      "availability": {
        "monday": {
          "isAvailable": true,
          "slots": [{ "start": "10:00", "end": "19:00" }]
        },
        "tuesday": {
          "isAvailable": true,
          "slots": [{ "start": "10:00", "end": "19:00" }]
        },
        "wednesday": {
          "isAvailable": false
        },
        "thursday": {
          "isAvailable": true,
          "slots": [{ "start": "10:00", "end": "19:00" }]
        },
        "friday": {
          "isAvailable": true,
          "slots": [{ "start": "10:00", "end": "19:00" }]
        },
        "saturday": {
          "isAvailable": true,
          "slots": [{ "start": "10:00", "end": "17:00" }]
        },
        "sunday": {
          "isAvailable": false
        }
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
curl -X GET "http://localhost:5000/api/v1/staff/salon/clv1234567890abcdefgh?page=1&limit=10" \
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

**Success Response (200 OK):**

```json
{
  "message": "Staff members retrieved successfully",
  "data": [
    {
      "id": "clv9876543210zyxwvuts",
      "salonId": "clv1234567890abcdefgh",
      "name": "John Doe",
      "image": "https://res.cloudinary.com/demo/image/upload/v1/staff.jpg",
      "services": [
        {
          "id": "clv1111111111abcdefgh",
          "service": {
            "id": "clv1111111111abcdefgh",
            "title": "Haircut",
            "price": 500
          }
        }
      ],
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
curl -X GET "http://localhost:5000/api/v1/staff?page=1&limit=10&salonId=clv1234567890abcdefgh" \
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

Use `multipart/form-data` for requests with image uploads, or `application/json` for field updates only.

Form fields:

- `serviceId` (string, optional) — CUID format service ID that this staff member can perform. Service must belong to the staff member's salon.
- `availability` (string, optional) — Weekly availability object (JSON string) with keys for each day (`monday`–`sunday`), same structure as in Create Staff
- `userId` (string, optional) — New user ID to associate with staff member
- `image` (file, optional) — Staff profile image (JPEG, JPG, PNG, WebP, or GIF; max 5MB)

**Request Parameters (JSON fields):**

```json
{
  "serviceId": "clv1111111111abcdefgh",
  "availability": {
    "monday": {
      "isAvailable": true,
      "slots": [{ "start": "08:00", "end": "18:00" }]
    },
    "tuesday": {
      "isAvailable": true,
      "slots": [{ "start": "08:00", "end": "18:00" }]
    },
    "wednesday": {
      "isAvailable": true,
      "slots": [{ "start": "08:00", "end": "18:00" }]
    },
    "thursday": {
      "isAvailable": true,
      "slots": [{ "start": "08:00", "end": "18:00" }]
    },
    "friday": {
      "isAvailable": true,
      "slots": [{ "start": "08:00", "end": "18:00" }]
    },
    "saturday": {
      "isAvailable": true,
      "slots": [{ "start": "10:00", "end": "17:00" }]
    },
    "sunday": {
      "isAvailable": false
    }
  },
  "userId": "clv0987654321zyxwvuts"
}
```

**Success Response (200 OK):**

```json
{
  "message": "Staff member updated successfully",
  "data": {
    "id": "clv9876543210zyxwvuts",
    "salonId": "clv1234567890abcdefgh",
    "name": "John Doe",
    "image": "https://res.cloudinary.com/demo/image/upload/v1/staff.jpg",
    "services": [
      {
        "id": "clv1111111111abcdefgh",
        "service": {
          "id": "clv1111111111abcdefgh",
          "title": "Haircut",
          "price": 500
        }
      }
    ],
    "availability": {
      "monday": {
        "isAvailable": true,
        "slots": [{ "start": "08:00", "end": "18:00" }]
      },
      "tuesday": {
        "isAvailable": true,
        "slots": [{ "start": "08:00", "end": "18:00" }]
      },
      "wednesday": {
        "isAvailable": true,
        "slots": [{ "start": "08:00", "end": "18:00" }]
      },
      "thursday": {
        "isAvailable": true,
        "slots": [{ "start": "08:00", "end": "18:00" }]
      },
      "friday": {
        "isAvailable": true,
        "slots": [{ "start": "08:00", "end": "18:00" }]
      },
      "saturday": {
        "isAvailable": true,
        "slots": [{ "start": "10:00", "end": "17:00" }]
      },
      "sunday": {
        "isAvailable": false
      }
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

**cURL Command (update fields only):**

```bash
curl -X PATCH http://localhost:5000/api/v1/staff/clv9876543210zyxwvuts \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "serviceId": "clv1111111111abcdefgh",
    "availability": {
      "monday": {
        "isAvailable": true,
        "slots": [
          { "start": "08:00", "end": "18:00" }
        ]
      },
      "tuesday": {
        "isAvailable": true,
        "slots": [
          { "start": "08:00", "end": "18:00" }
        ]
      },
      "wednesday": {
        "isAvailable": true,
        "slots": [
          { "start": "08:00", "end": "18:00" }
        ]
      },
      "thursday": {
        "isAvailable": true,
        "slots": [
          { "start": "08:00", "end": "18:00" }
        ]
      },
      "friday": {
        "isAvailable": true,
        "slots": [
          { "start": "08:00", "end": "18:00" }
        ]
      },
      "saturday": {
        "isAvailable": true,
        "slots": [
          { "start": "10:00", "end": "17:00" }
        ]
      },
      "sunday": {
        "isAvailable": false
      }
    }
  }'
```

**cURL Command (update with image):**

```bash
curl -X PATCH http://localhost:5000/api/v1/staff/clv9876543210zyxwvuts \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: multipart/form-data" \
  -F "image=@/path/to/new-staff-photo.jpg"
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

## Get Available Staff by Date

**Description:** Get all staff members available on a specific date for a salon. Useful for the first step of booking flow to show users which staff are available on their desired date.

**Endpoint:** `GET /api/v1/staff/available-on-date`

**Authentication:** Not required

**Query Parameters:**

- `salonId` (string, required) — Salon ID in CUID format
- `serviceId` (string, optional) — Filter by service ID (only show staff who can perform this service)
- `date` (string, required) — Date in ISO format (e.g., `2024-12-22`)

**Success Response (200 OK):**

```json
{
  "success": true,
  "message": "Available staff retrieved successfully",
  "data": {
    "date": "2024-12-22",
    "dayOfWeek": "sunday",
    "staff": [
      {
        "id": "clv9876543210zyxwvuts",
        "name": "John Doe",
        "image": "https://res.cloudinary.com/demo/image/upload/v1/staff.jpg",
        "user": {
          "id": "clv0987654321zyxwvuts",
          "name": "John Doe",
          "email": "john@example.com"
        },
        "services": [
          {
            "id": "clv1111111111abcdefgh",
            "title": "Haircut",
            "price": 500,
            "durationMinutes": 30
          }
        ],
        "availability": {
          "isAvailable": true,
          "slots": [{ "start": "09:00", "end": "18:00" }]
        }
      },
      {
        "id": "clv9876543210zyxwvuta",
        "name": "Jane Smith",
        "image": null,
        "user": {
          "id": "clv0987654321zyxwvuta",
          "name": "Jane Smith",
          "email": "jane@example.com"
        },
        "services": [
          {
            "id": "clv1111111111abcdefgh",
            "title": "Haircut",
            "price": 500,
            "durationMinutes": 30
          }
        ],
        "availability": {
          "isAvailable": true,
          "slots": [{ "start": "10:00", "end": "17:00" }]
        }
      }
    ]
  }
}
```

**Response Notes:**

- Returns only staff members whose weekly availability shows `isAvailable: true` for the day of the week corresponding to the requested date
- The `availability` field in the response contains only the day-specific availability (not the full week)
- If `serviceId` is provided, only staff who can perform that service are returned

**cURL Command:**

```bash
curl -X GET "http://localhost:5000/api/v1/staff/available-on-date?salonId=clv1234567890abcdefgh&date=2025-12-22" \
  -H "Content-Type: application/json"
```

**cURL Command with Service Filter:**

```bash
curl -X GET "http://localhost:5000/api/v1/staff/available-on-date?salonId=cmiqyjrxl00025e07y9cwa5gs&serviceId=cmitr1up800018107wgproh82&date=2025-12-22" \
  -H "Content-Type: application/json"
```

---

## Get Staff Availability for Date

**Description:** Get a specific staff member's availability for a date along with their existing bookings. Useful for the second step of booking flow after a user selects a staff member.

**Endpoint:** `GET /api/v1/staff/:staffId/availability-for-date`

**Authentication:** Not required

**URL Parameters:**

- `staffId` (string, required) — Staff ID in CUID format

**Query Parameters:**

- `date` (string, required) — Date in ISO format (e.g., `2024-12-22`)

**Success Response (200 OK):**

```json
{
  "success": true,
  "message": "Staff availability retrieved successfully",
  "data": {
    "staff": {
      "id": "clv9876543210zyxwvuts",
      "name": "John Doe",
      "image": "https://res.cloudinary.com/demo/image/upload/v1/staff.jpg",
      "user": {
        "id": "clv0987654321zyxwvuts",
        "name": "John Doe",
        "email": "john@example.com"
      },
      "services": [
        {
          "id": "clv1111111111abcdefgh",
          "title": "Haircut",
          "price": 500,
          "durationMinutes": 30
        }
      ]
    },
    "date": "2024-12-22",
    "dayOfWeek": "sunday",
    "availability": {
      "isAvailable": true,
      "slots": [{ "start": "09:00", "end": "18:00" }]
    },
    "bookings": [
      {
        "id": "clvbooking1111111111",
        "start": "09:00",
        "end": "10:00",
        "status": "CONFIRMED"
      },
      {
        "id": "clvbooking2222222222",
        "start": "14:00",
        "end": "15:00",
        "status": "CONFIRMED"
      }
    ]
  }
}
```

**Response Notes:**

- `availability` contains the staff's working hours for that day of the week
- `bookings` contains all existing bookings for that staff on the requested date (excludes CANCELLED and NO_SHOW bookings)
- Booking times are in `HH:mm` format for easy comparison with availability slots
- Use this information to show available time slots to the user by subtracting booked times from availability slots

**Error Response (404 Not Found):**

```json
{
  "success": false,
  "message": "Staff member not found"
}
```

**cURL Command:**

```bash
curl -X GET "http://localhost:5000/api/v1/staff/cmj8pklqi00019w0716gmlnrp/availability-for-date?date=2025-12-22" \
  -H "Content-Type: application/json"
```

---

## Staff Reviews

Staff reviews allow users to rate staff members after completing a booking. One rating per user per staff (enforced by unique constraint). Only review owners can update or delete their ratings.

**Base path:** `/api/v1/staff-reviews`

### Create Staff Review

**Description:** Create a staff review. User must have a **COMPLETED** booking with the given staff. One review per user per staff.

**Endpoint:** `POST /api/v1/staff-reviews`

**Authentication:** Required (Bearer token)

**Request Body:**

- `staffId` (string, required) — CUID format staff ID
- `bookingId` (string, required) — CUID format booking ID (must be user's completed booking for this staff)
- `rating` (number, required) — Integer 1–5
- `comment` (string, optional) — Max 1000 characters

**Success (201):** `{ "message": "Staff review created successfully", "data": { ... } }`

**Errors:** 404 (booking not found/unauthorized/does not belong), 400 (already reviewed, or booking not COMPLETED)

---

### Get Staff Review by ID

**Endpoint:** `GET /api/v1/staff-reviews/:id`

**Authentication:** Not required

**Success (200):** `{ "message": "Staff review retrieved successfully", "data": { ... } }`

**Error (404):** Staff review not found

---

### Get Reviews by Staff ID

**Description:** List reviews for a staff member with pagination and staff aggregate rating.

**Endpoint:** `GET /api/v1/staff-reviews/staff/:staffId`

**Query:** `page`, `limit` (optional)

**Success (200):** `{ "message": "Staff reviews retrieved successfully", "data": [...], "averageRating": 4.5, "totalRatings": 12, "pagination": { ... } }`

---

### Get Current User's Staff Reviews

**Endpoint:** `GET /api/v1/staff-reviews/user/me`

**Authentication:** Required

**Query:** `page`, `limit` (optional)

**Success (200):** `{ "message": "Staff reviews retrieved successfully", "data": [...], "pagination": { ... } }`

---

### Update Staff Review

**Endpoint:** `PATCH /api/v1/staff-reviews/:id`

**Authentication:** Required (owner only)

**Request Body:** `rating` (number 1–5, optional), `comment` (string, optional, max 1000)

**Success (200):** `{ "message": "Staff review updated successfully", "data": { ... } }`

**Errors:** 404 (review not found), 403 (not owner)

---

### Delete Staff Review

**Endpoint:** `DELETE /api/v1/staff-reviews/:id`

**Authentication:** Required (owner only)

**Success (200):** `{ "message": "Staff review deleted successfully" }`

**Errors:** 404 (review not found), 403 (not owner)

---

## Validation Rules

- **salonId**: Must be a valid CUID format, supplied in the request body
- **serviceId**: Must be a valid CUID format. Service must belong to the specified salon.
- **availability**: Weekly availability object with:
  - Keys for each day of the week: `monday`, `tuesday`, `wednesday`, `thursday`, `friday`, `saturday`, `sunday`
  - For each day:
    - `isAvailable`: boolean (required)
    - `slots`: optional array of `{ "start": "HH:mm", "end": "HH:mm" }` objects
- **userId**: Optional; when provided, must be a valid CUID format and reference an existing user
- **image**: Optional file upload for staff profile photo
  - Allowed file types: JPEG, JPG, PNG, WebP, GIF
  - Maximum file size: 5MB
  - Uploaded to Cloudinary and stored as URL
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
