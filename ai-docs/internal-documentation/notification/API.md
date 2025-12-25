# Notification API Documentation

## Base URL

```
http://localhost:5000/api/v1
```

## Authentication

All endpoints require authentication via JWT Bearer token.

```bash
Authorization: Bearer <access_token>
```

---

## 1. Register Device Token

Register or update a user's FCM (Firebase Cloud Messaging) device token.

### Endpoint

```
POST /notifications/register-token
```

### Request Headers

```bash
Content-Type: application/json
Authorization: Bearer <access_token>
```

### Request Body

```json
{
  "token": "fcm_token_string_here",
  "platform": "ios"
}
```

**Request Body Schema:**
| Field | Type | Required | Description |
|-------|------|-----------|-------------|
| `token` | string | Yes | FCM registration token from client device |
| `platform` | enum | Yes | Platform: `"ios"`, `"android"`, or `"web"` |

### Example Request

```bash
curl -X POST http://localhost:5000/api/v1/notifications/register-token \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "token": "cLhY3kC-4hXq6gJY5fZ6X:APA91bHj7...",
    "platform": "ios"
  }'
```

### Response

**Success Response (200 OK):**

```json
{
  "message": "Device token registered successfully",
  "deviceToken": {
    "id": "clx123abc456def",
    "userId": "clx789ghi012jkl",
    "fcmToken": "cLhY3kC-4hXq6gJY5fZ6X:APA91bHj7...",
    "platform": "ios",
    "isActive": true,
    "lastSeen": "2025-12-24T12:00:00.000Z",
    "createdAt": "2025-12-24T12:00:00.000Z"
  }
}
```

**Error Responses:**

| Status | Description                                           |
| ------ | ----------------------------------------------------- |
| `400`  | Token already registered to a different user          |
| `401`  | Unauthorized (missing or invalid token)               |
| `422`  | Validation error (invalid platform or missing fields) |

**400 Bad Request Example:**

```json
{
  "success": false,
  "message": "Token is already registered to a different user"
}
```

**401 Unauthorized Example:**

```json
{
  "success": false,
  "message": "Unauthorized"
}
```

---

## 2. Get User Notifications

Fetch paginated list of user's notifications.

### Endpoint

```
GET /notifications
```

### Request Headers

```bash
Authorization: Bearer <access_token>
```

### Query Parameters

| Parameter    | Type    | Required | Default | Description                      |
| ------------ | ------- | -------- | ------- | -------------------------------- |
| `page`       | integer | No       | `1`     | Page number (min: 1)             |
| `limit`      | integer | No       | `20`    | Items per page (min: 1, max: 50) |
| `unreadOnly` | boolean | No       | `false` | Filter only unread notifications |

### Example Request

**Get all notifications (first page):**

```bash
curl -X GET "http://localhost:5000/api/v1/notifications?page=1&limit=20" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Get unread notifications only:**

```bash
curl -X GET "http://localhost:5000/api/v1/notifications?unreadOnly=true" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Response

**Success Response (200 OK):**

```json
{
  "notifications": [
    {
      "id": "clx123abc456def",
      "title": "Booking Confirmed",
      "message": "Your appointment for Haircut at ProBeauty Salon is confirmed",
      "type": "booking",
      "isRead": false,
      "createdAt": "2025-12-24T10:30:00.000Z"
    },
    {
      "id": "clx789ghi012jkl",
      "title": "Order Placed",
      "message": "Your order of ₹1500 from ProBeauty Salon has been placed",
      "type": "order",
      "isRead": true,
      "createdAt": "2025-12-24T09:15:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3
  }
}
```

**Empty Response:**

```json
{
  "notifications": [],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 0,
    "totalPages": 0
  }
}
```

---

## 3. Mark Notification as Read

Mark a specific notification as read.

### Endpoint

```
PUT /notifications/:notificationId/read
```

### Request Headers

```bash
Authorization: Bearer <access_token>
```

### Path Parameters

| Parameter        | Type   | Required | Description            |
| ---------------- | ------ | -------- | ---------------------- |
| `notificationId` | string | Yes      | Notification ID (cuid) |

### Example Request

```bash
curl -X PUT http://localhost:5000/api/v1/notifications/clx123abc456def/read \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Response

**Success Response (200 OK):**

```json
{
  "message": "Notification marked as read",
  "notification": {
    "id": "clx123abc456def",
    "userId": "clx789ghi012jkl",
    "title": "Booking Confirmed",
    "message": "Your appointment for Haircut at ProBeauty Salon is confirmed",
    "type": "booking",
    "isRead": true,
    "createdAt": "2025-12-24T10:30:00.000Z"
  }
}
```

**Error Responses:**

| Status | Description                                      |
| ------ | ------------------------------------------------ |
| `404`  | Notification not found or doesn't belong to user |
| `401`  | Unauthorized                                     |

**404 Not Found Example:**

```json
{
  "success": false,
  "message": "Notification not found"
}
```

---

## 4. Mark All Notifications as Read

Mark all of the user's notifications as read.

### Endpoint

```
PUT /notifications/read-all
```

### Request Headers

```bash
Authorization: Bearer <access_token>
```

### Example Request

```bash
curl -X PUT http://localhost:5000/api/v1/notifications/read-all \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Response

**Success Response (200 OK):**

```json
{
  "message": "All notifications marked as read",
  "updatedCount": 15
}
```

**Response when no unread notifications:**

```json
{
  "message": "All notifications marked as read",
  "updatedCount": 0
}
```

---

## 5. Delete Notification

Permanently delete a notification.

### Endpoint

```
DELETE /notifications/:notificationId
```

### Request Headers

```bash
Authorization: Bearer <access_token>
```

### Path Parameters

| Parameter        | Type   | Required | Description            |
| ---------------- | ------ | -------- | ---------------------- |
| `notificationId` | string | Yes      | Notification ID (cuid) |

### Example Request

```bash
curl -X DELETE http://localhost:5000/api/v1/notifications/clx123abc456def \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Response

**Success Response (200 OK):**

```json
{
  "message": "Notification deleted successfully"
}
```

**Error Responses:**

| Status | Description                                      |
| ------ | ------------------------------------------------ |
| `404`  | Notification not found or doesn't belong to user |
| `401`  | Unauthorized                                     |

---

## Notification Types

| Type        | Description                   | Data Payload                          |
| ----------- | ----------------------------- | ------------------------------------- |
| `booking`   | Booking-related notifications | `{ bookingId, action, screen }`       |
| `order`     | Order-related notifications   | `{ orderId, status, action, screen }` |
| `promotion` | Promotional offers            | `{ promoId, action, screen }`         |

---

## Error Response Format

All error responses follow this format:

```json
{
  "success": false,
  "message": "Error description here",
  "stack": "Error stack trace (development only)"
}
```

Common HTTP Status Codes:
| Code | Description |
|------|-------------|
| `200` | Success |
| `400` | Bad Request |
| `401` | Unauthorized |
| `404` | Not Found |
| `422` | Validation Error |
| `500` | Internal Server Error |

---

## Rate Limiting

All notification endpoints are rate-limited to prevent abuse.

- **Register Token**: 10 requests per minute
- **Get Notifications**: 60 requests per minute
- **Mark as Read**: 30 requests per minute
- **Delete Notification**: 30 requests per minute

Rate limit headers are included in responses:

```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 59
X-RateLimit-Reset: 1735018800
```

---

## FCM Message Format (Received on Client)

### iOS/APNS Example

```json
{
  "aps": {
    "alert": {
      "title": "Booking Confirmed",
      "body": "Your appointment for Haircut at ProBeauty Salon is confirmed"
    },
    "badge": 1,
    "sound": "default",
    "category": "BOOKING"
  },
  "type": "booking",
  "bookingId": "clx123abc456def",
  "action": "VIEW_BOOKING",
  "screen": "BookingDetails"
}
```

### Android Example

```json
{
  "notification": {
    "title": "Booking Confirmed",
    "body": "Your appointment for Haircut at ProBeauty Salon is confirmed",
    "sound": "default",
    "channel_id": "default"
  },
  "data": {
    "type": "booking",
    "bookingId": "clx123abc456def",
    "action": "VIEW_BOOKING",
    "screen": "BookingDetails"
  }
}
```

### Web (Service Worker) Example

```json
{
  "notification": {
    "title": "Booking Confirmed",
    "body": "Your appointment for Haircut at ProBeauty Salon is confirmed",
    "icon": "/icon-192.png",
    "badge": "/badge-72.png"
  },
  "data": {
    "type": "booking",
    "bookingId": "clx123abc456def",
    "action": "VIEW_BOOKING",
    "screen": "BookingDetails"
  }
}
```
