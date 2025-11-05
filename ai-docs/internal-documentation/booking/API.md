# Booking API

Complete API documentation for the ProBeauty appointment booking system.

---

## Create Booking

**Description:** Create a new appointment booking for a service with automatic confirmation.

**Endpoint:** `POST /api/v1/bookings`

**Authentication:** Required (Bearer token)

**Authorization:** Authenticated users (customer, owner, admin, staff)

**Request Body:**
```json
{
  "salonId": "clw8x9y0z0001abc123def456",
  "serviceId": "clw8x9y0z0002abc123def456",
  "staffId": "clw8x9y0z0003abc123def456",
  "startTime": "2025-11-10T14:00:00.000Z"
}
```

**Success Response (201 Created):**
```json
{
  "message": "Booking created successfully",
  "data": {
    "id": "clw8x9y0z0004abc123def456",
    "userId": "clw8x9y0z0005abc123def456",
    "salonId": "clw8x9y0z0001abc123def456",
    "serviceId": "clw8x9y0z0002abc123def456",
    "staffId": "clw8x9y0z0003abc123def456",
    "startTime": "2025-11-10T14:00:00.000Z",
    "endTime": "2025-11-10T14:30:00.000Z",
    "status": "CONFIRMED",
    "user": {
      "id": "clw8x9y0z0005abc123def456",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+1234567890"
    },
    "salon": {
      "id": "clw8x9y0z0001abc123def456",
      "name": "Beauty Salon",
      "address": "123 Main St"
    },
    "service": {
      "id": "clw8x9y0z0002abc123def456",
      "title": "Haircut",
      "durationMinutes": 30,
      "price": "25.00"
    },
    "staff": {
      "id": "clw8x9y0z0003abc123def456",
      "role": "Stylist",
      "user": {
        "name": "Jane Smith",
        "email": "jane@salon.com"
      }
    }
  }
}
```

**Error Responses:**

- **400 Bad Request** - Invalid request data
  ```json
  {
    "success": false,
    "message": "Validation failed in body",
    "errors": [
      {
        "field": "startTime",
        "message": "Invalid start time format"
      }
    ]
  }
  ```

- **401 Unauthorized** - Missing or invalid token
  ```json
  {
    "message": "Unauthorized"
  }
  ```

- **400 Bad Request** - Slot not available
  ```json
  {
    "message": "Time slot conflicts with existing booking (2025-11-10T14:00:00.000Z - 2025-11-10T14:30:00.000Z)"
  }
  ```

**cURL Command:**
```bash
curl -X POST http://localhost:5000/api/v1/bookings \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "salonId": "clw8x9y0z0001abc123def456",
    "serviceId": "clw8x9y0z0002abc123def456",
    "staffId": "clw8x9y0z0003abc123def456",
    "startTime": "2025-11-10T14:00:00.000Z"
  }'
```

---

## Get All Bookings

**Description:** Retrieve bookings with role-based filtering. Users see their own bookings, salon owners see bookings for their salons, staff see their assigned bookings, and admins see all bookings.

**Endpoint:** `GET /api/v1/bookings`

**Authentication:** Required (Bearer token)

**Authorization:** Authenticated users (role-based filtering applied)

**Query Parameters:**
- `salonId` (string, optional) - Filter by salon ID (owner/admin only)
- `staffId` (string, optional) - Filter by staff ID (owner/admin only)
- `status` (string, optional) - Filter by status (PENDING, CONFIRMED, COMPLETED, CANCELLED, NO_SHOW)
- `startDate` (string, optional) - Filter bookings starting from this date (ISO 8601 format)
- `endDate` (string, optional) - Filter bookings until this date (ISO 8601 format)

**Success Response (200 OK):**
```json
{
  "message": "Bookings retrieved successfully",
  "data": [
    {
      "id": "clw8x9y0z0004abc123def456",
      "userId": "clw8x9y0z0005abc123def456",
      "salonId": "clw8x9y0z0001abc123def456",
      "serviceId": "clw8x9y0z0002abc123def456",
      "staffId": "clw8x9y0z0003abc123def456",
      "startTime": "2025-11-10T14:00:00.000Z",
      "endTime": "2025-11-10T14:30:00.000Z",
      "status": "CONFIRMED",
      "user": {
        "id": "clw8x9y0z0005abc123def456",
        "name": "John Doe",
        "email": "john@example.com",
        "phone": "+1234567890"
      },
      "salon": {
        "id": "clw8x9y0z0001abc123def456",
        "name": "Beauty Salon",
        "address": "123 Main St"
      },
      "service": {
        "id": "clw8x9y0z0002abc123def456",
        "title": "Haircut",
        "durationMinutes": 30,
        "price": "25.00"
      },
      "staff": {
        "id": "clw8x9y0z0003abc123def456",
        "role": "Stylist",
        "user": {
          "name": "Jane Smith",
          "email": "jane@salon.com"
        }
      }
    }
  ]
}
```

**cURL Command:**
```bash
# Get all bookings (filtered by role)
curl -X GET http://localhost:5000/api/v1/bookings \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"

# Filter by status
curl -X GET "http://localhost:5000/api/v1/bookings?status=CONFIRMED" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"

# Filter by date range
curl -X GET "http://localhost:5000/api/v1/bookings?startDate=2025-11-10T00:00:00.000Z&endDate=2025-11-15T23:59:59.999Z" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

---

## Get Available Time Slots

**Description:** Retrieve available 30-minute time slots for a specific date, service, and staff member. Considers staff availability, service duration, and existing bookings.

**Endpoint:** `GET /api/v1/bookings/availability`

**Authentication:** Optional (can be used by guests browsing availability)

**Query Parameters:**
- `salonId` (string, required) - Salon ID
- `serviceId` (string, required) - Service ID
- `staffId` (string, required) - Staff member ID
- `date` (string, required) - Date in YYYY-MM-DD format

**Success Response (200 OK):**
```json
{
  "message": "Available slots retrieved successfully",
  "data": {
    "date": "2025-11-10",
    "salon": {
      "id": "clw8x9y0z0001abc123def456",
      "name": "Beauty Salon"
    },
    "service": {
      "id": "clw8x9y0z0002abc123def456",
      "title": "Haircut",
      "durationMinutes": 30
    },
    "staff": {
      "id": "clw8x9y0z0003abc123def456",
      "role": "Stylist"
    },
    "slots": [
      {
        "startTime": "2025-11-10T09:00:00.000Z",
        "endTime": "2025-11-10T09:30:00.000Z",
        "available": true
      },
      {
        "startTime": "2025-11-10T09:30:00.000Z",
        "endTime": "2025-11-10T10:00:00.000Z",
        "available": true
      },
      {
        "startTime": "2025-11-10T10:00:00.000Z",
        "endTime": "2025-11-10T10:30:00.000Z",
        "available": false
      },
      {
        "startTime": "2025-11-10T10:30:00.000Z",
        "endTime": "2025-11-10T11:00:00.000Z",
        "available": true
      }
    ]
  }
}
```

**Error Responses:**

- **400 Bad Request** - Missing required parameters
  ```json
  {
    "message": "salonId, serviceId, staffId, and date are required"
  }
  ```

- **400 Bad Request** - Invalid date format
  ```json
  {
    "success": false,
    "message": "Validation failed in query",
    "errors": [
      {
        "field": "date",
        "message": "Date must be in YYYY-MM-DD format"
      }
    ]
  }
  ```

**cURL Command:**
```bash
curl -X GET "http://localhost:5000/api/v1/bookings/availability?salonId=clw8x9y0z0001abc123def456&serviceId=clw8x9y0z0002abc123def456&staffId=clw8x9y0z0003abc123def456&date=2025-11-10" \
  -H "Content-Type: application/json"
```

---

## Get Booking by ID

**Description:** Retrieve a specific booking with all details. Access is restricted based on role.

**Endpoint:** `GET /api/v1/bookings/:id`

**Authentication:** Required (Bearer token)

**Authorization:**
- Users can only view their own bookings
- Salon owners can view bookings for their salons
- Staff can view bookings assigned to them
- Admins can view all bookings

**URL Parameters:**
- `id` (string, required) - Booking ID

**Success Response (200 OK):**
```json
{
  "message": "Booking retrieved successfully",
  "data": {
    "id": "clw8x9y0z0004abc123def456",
    "userId": "clw8x9y0z0005abc123def456",
    "salonId": "clw8x9y0z0001abc123def456",
    "serviceId": "clw8x9y0z0002abc123def456",
    "staffId": "clw8x9y0z0003abc123def456",
    "startTime": "2025-11-10T14:00:00.000Z",
    "endTime": "2025-11-10T14:30:00.000Z",
    "status": "CONFIRMED",
    "user": {
      "id": "clw8x9y0z0005abc123def456",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+1234567890"
    },
    "salon": {
      "id": "clw8x9y0z0001abc123def456",
      "name": "Beauty Salon",
      "address": "123 Main St"
    },
    "service": {
      "id": "clw8x9y0z0002abc123def456",
      "title": "Haircut",
      "durationMinutes": 30,
      "price": "25.00"
    },
    "staff": {
      "id": "clw8x9y0z0003abc123def456",
      "role": "Stylist",
      "user": {
        "name": "Jane Smith",
        "email": "jane@salon.com"
      }
    }
  }
}
```

**Error Responses:**

- **404 Not Found** - Booking doesn't exist
  ```json
  {
    "message": "Booking not found"
  }
  ```

- **403 Forbidden** - Access denied
  ```json
  {
    "message": "Access denied"
  }
  ```

**cURL Command:**
```bash
curl -X GET http://localhost:5000/api/v1/bookings/clw8x9y0z0004abc123def456 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

---

## Update Booking

**Description:** Update a booking to reschedule or change staff member. Users can reschedule their own bookings. Salon owners can update bookings for their salons.

**Endpoint:** `PUT /api/v1/bookings/:id`

**Authentication:** Required (Bearer token)

**Authorization:**
- Users can update their own bookings (cannot change status)
- Salon owners can update bookings for their salons
- Admins can update any booking
- Staff cannot update bookings

**URL Parameters:**
- `id` (string, required) - Booking ID

**Request Body:**
```json
{
  "startTime": "2025-11-10T15:00:00.000Z",
  "staffId": "clw8x9y0z0003abc123def456",
  "status": "CONFIRMED"
}
```

**Note:** All fields are optional. `status` can only be changed by salon owners and admins.

**Success Response (200 OK):**
```json
{
  "message": "Booking updated successfully",
  "data": {
    "id": "clw8x9y0z0004abc123def456",
    "userId": "clw8x9y0z0005abc123def456",
    "salonId": "clw8x9y0z0001abc123def456",
    "serviceId": "clw8x9y0z0002abc123def456",
    "staffId": "clw8x9y0z0003abc123def456",
    "startTime": "2025-11-10T15:00:00.000Z",
    "endTime": "2025-11-10T15:30:00.000Z",
    "status": "CONFIRMED",
    "user": {
      "id": "clw8x9y0z0005abc123def456",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+1234567890"
    },
    "salon": {
      "id": "clw8x9y0z0001abc123def456",
      "name": "Beauty Salon",
      "address": "123 Main St"
    },
    "service": {
      "id": "clw8x9y0z0002abc123def456",
      "title": "Haircut",
      "durationMinutes": 30,
      "price": "25.00"
    },
    "staff": {
      "id": "clw8x9y0z0003abc123def456",
      "role": "Stylist",
      "user": {
        "name": "Jane Smith",
        "email": "jane@salon.com"
      }
    }
  }
}
```

**Error Responses:**

- **403 Forbidden** - Access denied or trying to change status as a regular user
  ```json
  {
    "message": "Users cannot change booking status"
  }
  ```

- **400 Bad Request** - Time slot not available
  ```json
  {
    "message": "The requested time slot is not available"
  }
  ```

**cURL Command:**
```bash
curl -X PUT http://localhost:5000/api/v1/bookings/clw8x9y0z0004abc123def456 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "startTime": "2025-11-10T15:00:00.000Z"
  }'
```

---

## Cancel Booking

**Description:** Cancel a booking by setting its status to CANCELLED.

**Endpoint:** `DELETE /api/v1/bookings/:id`

**Authentication:** Required (Bearer token)

**Authorization:**
- Users can cancel their own bookings
- Salon owners can cancel bookings for their salons
- Admins can cancel any booking

**URL Parameters:**
- `id` (string, required) - Booking ID

**Success Response (200 OK):**
```json
{
  "message": "Booking cancelled successfully",
  "data": {
    "id": "clw8x9y0z0004abc123def456",
    "userId": "clw8x9y0z0005abc123def456",
    "salonId": "clw8x9y0z0001abc123def456",
    "serviceId": "clw8x9y0z0002abc123def456",
    "staffId": "clw8x9y0z0003abc123def456",
    "startTime": "2025-11-10T14:00:00.000Z",
    "endTime": "2025-11-10T14:30:00.000Z",
    "status": "CANCELLED",
    "user": {
      "id": "clw8x9y0z0005abc123def456",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+1234567890"
    },
    "salon": {
      "id": "clw8x9y0z0001abc123def456",
      "name": "Beauty Salon",
      "address": "123 Main St"
    },
    "service": {
      "id": "clw8x9y0z0002abc123def456",
      "title": "Haircut",
      "durationMinutes": 30,
      "price": "25.00"
    },
    "staff": {
      "id": "clw8x9y0z0003abc123def456",
      "role": "Stylist",
      "user": {
        "name": "Jane Smith",
        "email": "jane@salon.com"
      }
    }
  }
}
```

**Error Responses:**

- **404 Not Found**
  ```json
  {
    "message": "Booking not found"
  }
  ```

- **400 Bad Request** - Already cancelled
  ```json
  {
    "message": "Booking is already cancelled"
  }
  ```

**cURL Command:**
```bash
curl -X DELETE http://localhost:5000/api/v1/bookings/clw8x9y0z0004abc123def456 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

---

## Confirm Booking

**Description:** Confirm a PENDING booking. Only salon owners and admins can confirm bookings.

**Endpoint:** `POST /api/v1/bookings/:id/confirm`

**Authentication:** Required (Bearer token)

**Authorization:** Salon owners (for their salons) and admins only

**URL Parameters:**
- `id` (string, required) - Booking ID

**Success Response (200 OK):**
```json
{
  "message": "Booking confirmed successfully",
  "data": {
    "id": "clw8x9y0z0004abc123def456",
    "userId": "clw8x9y0z0005abc123def456",
    "salonId": "clw8x9y0z0001abc123def456",
    "serviceId": "clw8x9y0z0002abc123def456",
    "staffId": "clw8x9y0z0003abc123def456",
    "startTime": "2025-11-10T14:00:00.000Z",
    "endTime": "2025-11-10T14:30:00.000Z",
    "status": "CONFIRMED",
    "user": {
      "id": "clw8x9y0z0005abc123def456",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+1234567890"
    },
    "salon": {
      "id": "clw8x9y0z0001abc123def456",
      "name": "Beauty Salon",
      "address": "123 Main St"
    },
    "service": {
      "id": "clw8x9y0z0002abc123def456",
      "title": "Haircut",
      "durationMinutes": 30,
      "price": "25.00"
    },
    "staff": {
      "id": "clw8x9y0z0003abc123def456",
      "role": "Stylist",
      "user": {
        "name": "Jane Smith",
        "email": "jane@salon.com"
      }
    }
  }
}
```

**Error Responses:**

- **403 Forbidden** - Not a salon owner or admin
  ```json
  {
    "message": "Only salon owners can confirm bookings"
  }
  ```

- **400 Bad Request** - Already confirmed
  ```json
  {
    "message": "Booking is already confirmed"
  }
  ```

**cURL Command:**
```bash
curl -X POST http://localhost:5000/api/v1/bookings/clw8x9y0z0004abc123def456/confirm \
  -H "Authorization: Bearer SALON_OWNER_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

---

## Complete Booking

**Description:** Mark a booking as COMPLETED. Only salon owners and admins can complete bookings.

**Endpoint:** `POST /api/v1/bookings/:id/complete`

**Authentication:** Required (Bearer token)

**Authorization:** Salon owners (for their salons) and admins only

**URL Parameters:**
- `id` (string, required) - Booking ID

**Success Response (200 OK):**
```json
{
  "message": "Booking marked as completed",
  "data": {
    "id": "clw8x9y0z0004abc123def456",
    "userId": "clw8x9y0z0005abc123def456",
    "salonId": "clw8x9y0z0001abc123def456",
    "serviceId": "clw8x9y0z0002abc123def456",
    "staffId": "clw8x9y0z0003abc123def456",
    "startTime": "2025-11-10T14:00:00.000Z",
    "endTime": "2025-11-10T14:30:00.000Z",
    "status": "COMPLETED",
    "user": {
      "id": "clw8x9y0z0005abc123def456",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+1234567890"
    },
    "salon": {
      "id": "clw8x9y0z0001abc123def456",
      "name": "Beauty Salon",
      "address": "123 Main St"
    },
    "service": {
      "id": "clw8x9y0z0002abc123def456",
      "title": "Haircut",
      "durationMinutes": 30,
      "price": "25.00"
    },
    "staff": {
      "id": "clw8x9y0z0003abc123def456",
      "role": "Stylist",
      "user": {
        "name": "Jane Smith",
        "email": "jane@salon.com"
      }
    }
  }
}
```

**Error Responses:**

- **403 Forbidden** - Not a salon owner or admin
  ```json
  {
    "message": "Only salon owners can mark bookings as completed"
  }
  ```

- **400 Bad Request** - Already completed
  ```json
  {
    "message": "Booking is already completed"
  }
  ```

**cURL Command:**
```bash
curl -X POST http://localhost:5000/api/v1/bookings/clw8x9y0z0004abc123def456/complete \
  -H "Authorization: Bearer SALON_OWNER_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

---

## Booking Status Flow

```
PENDING → CONFIRMED → COMPLETED
             ↓
         CANCELLED
             ↓
          NO_SHOW
```

- **PENDING**: Booking awaiting confirmation (not used in current implementation - all bookings start as CONFIRMED)
- **CONFIRMED**: Booking is confirmed and scheduled
- **COMPLETED**: Service has been provided
- **CANCELLED**: Booking was cancelled by user or salon
- **NO_SHOW**: Customer did not show up (can be set by salon owner)

---

## Staff Availability Structure

Staff availability is stored as JSON in the database. The expected format is:

```json
{
  "monday": {
    "isAvailable": true,
    "slots": [
      { "start": "09:00", "end": "12:00" },
      { "start": "13:00", "end": "17:00" }
    ]
  },
  "tuesday": {
    "isAvailable": true,
    "slots": [
      { "start": "09:00", "end": "17:00" }
    ]
  },
  "wednesday": {
    "isAvailable": false,
    "slots": []
  },
  "thursday": {
    "isAvailable": true,
    "slots": [
      { "start": "10:00", "end": "18:00" }
    ]
  },
  "friday": {
    "isAvailable": true,
    "slots": [
      { "start": "09:00", "end": "17:00" }
    ]
  },
  "saturday": {
    "isAvailable": true,
    "slots": [
      { "start": "10:00", "end": "16:00" }
    ]
  },
  "sunday": {
    "isAvailable": false,
    "slots": []
  }
}
```

**Notes:**
- Time format is HH:mm (24-hour)
- Each day must have the `isAvailable` boolean and `slots` array
- If `isAvailable` is false, slots can be empty
- Multiple time slots per day are supported for breaks

---

## Time Slot Generation Logic

The system generates available time slots based on:

1. **Fixed 30-minute intervals** - Slots are generated at 30-minute intervals (e.g., 09:00, 09:30, 10:00, etc.)
2. **Staff availability** - Only generates slots during staff's available hours
3. **Service duration** - Ensures enough time remains for the service
4. **Existing bookings** - Excludes slots that conflict with confirmed bookings

**Example:**
- Staff available: 09:00 - 17:00
- Service duration: 45 minutes
- Existing booking: 10:00 - 10:30

Generated slots:
- 09:00 - 09:30 ✅ Available
- 09:30 - 10:00 ✅ Available
- 10:00 - 10:30 ❌ Booked
- 10:30 - 11:00 ✅ Available
- ... continues until 16:30

---

## Role-Based Access Summary

| Endpoint | User | Staff | Owner | Admin |
|----------|------|-------|-------|-------|
| Create Booking | Own bookings | ✅ | ✅ | ✅ |
| Get Bookings | Own bookings | Own assigned | Own salons | All |
| Get Availability | ✅ (Public) | ✅ (Public) | ✅ (Public) | ✅ (Public) |
| Get Booking | Own only | Assigned only | Own salons | All |
| Update Booking | Own only | ❌ | Own salons | All |
| Cancel Booking | Own only | ❌ | Own salons | All |
| Confirm Booking | ❌ | ❌ | Own salons | All |
| Complete Booking | ❌ | ❌ | Own salons | All |

---

## Related Models

### Booking Model
```typescript
{
  id: string (cuid)
  userId: string
  salonId: string
  serviceId: string
  staffId: string
  startTime: DateTime
  endTime: DateTime
  status: string
}
```

### Service Model (referenced)
```typescript
{
  id: string
  salonId: string
  title: string
  durationMinutes: number
  price: Decimal
}
```

### Staff Model (referenced)
```typescript
{
  id: string
  salonId: string
  role: string
  availability: JSON
  userId?: string
}
```
