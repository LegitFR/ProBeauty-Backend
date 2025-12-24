# Push Notification System Architecture

## Overview

The ProBeauty push notification system implements an **event-driven architecture** that decouples business logic from notification delivery. This ensures that notifications are sent asynchronously and can be easily extended without modifying core services.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              Frontend Apps                                   │
│                   (iOS, Android, Web)                                      │
└────────────────────────┬────────────────────────────────────────────────────────┘
                         │ 1. Register FCM Token
                         ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                        API Layer (Express)                                   │
│  ┌───────────────────────────────────────────────────────────────────────────┐  │
│  │  notificationController                                                │  │
│  │  ├─ registerDeviceToken()                                            │  │
│  │  ├─ getUserNotifications()                                            │  │
│  │  ├─ markAsRead()                                                     │  │
│  │  └─ deleteNotification()                                              │  │
│  └───────────────────────────────────────────────────────────────────────────┘  │
└────────────────────────┬────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                     Service Layer                                            │
│  ┌───────────────────────────────────────────────────────────────────────────┐  │
│  │  notificationService                                                   │  │
│  │  ├─ registerDeviceToken()          → Prisma                           │  │
│  │  ├─ sendToUser()                 → Firebase + Prisma                  │  │
│  │  ├─ sendToUsers()                → Firebase + Prisma                  │  │
│  │  ├─ fetchActiveTokens()           → Prisma                           │  │
│  │  ├─ sendMulticast()              → Firebase (chunks 500)             │  │
│  │  └─ handleInvalidTokens()         → Prisma (mark inactive)             │  │
│  └───────────────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│  ┌───────────────────────────────────────────────────────────────────────────┐  │
│  │  bookingService                                                      │  │
│  │  ├─ createBooking()       → emit BOOKING_CREATED                        │  │
│  │  ├─ updateBooking()       → emit BOOKING_RESCHEDULED                     │  │
│  │  ├─ cancelBooking()       → emit BOOKING_CANCELLED                      │  │
│  │  └─ completeBooking()     → emit BOOKING_COMPLETED                     │  │
│  └───────────────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│  ┌───────────────────────────────────────────────────────────────────────────┐  │
│  │  orderService                                                        │  │
│  │  ├─ createOrderFromCart()  → emit ORDER_CREATED                       │  │
│  │  ├─ updateOrderStatus()    → emit ORDER_STATUS_CHANGED                  │  │
│  │  └─ cancelOrder()          → emit ORDER_CANCELLED                      │  │
│  └───────────────────────────────────────────────────────────────────────────┘  │
└────────────────────────┬────────────────────────────────────────────────────────┘
                         │ emit
                         ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                     Event System (EventEmitter)                               │
│  ┌───────────────────────────────────────────────────────────────────────────┐  │
│  │  notificationEventListeners                                            │  │
│  │  ├─ on(BOOKING_CREATED)          → sendToUser()                       │  │
│  │  ├─ on(BOOKING_RESCHEDULED)     → sendToUser()                       │  │
│  │  ├─ on(BOOKING_CANCELLED)       → sendToUser()                       │  │
│  │  ├─ on(BOOKING_COMPLETED)       → sendToUser()                       │  │
│  │  ├─ on(ORDER_CREATED)           → sendToUser()                       │  │
│  │  ├─ on(ORDER_STATUS_CHANGED)    → sendToUser()                       │  │
│  │  └─ on(ORDER_CANCELLED)         → sendToUser()                       │  │
│  └───────────────────────────────────────────────────────────────────────────┘  │
└────────────────────────┬────────────────────────────────────────────────────────┘
                         │
         ┌───────────────┴───────────────┐
         │                               │
         ▼                               ▼
┌──────────────────────┐      ┌──────────────────────┐
│   Prisma (PostgreSQL)│      │ Firebase Cloud       │
│                      │      │ Messaging (FCM)      │
│  ┌────────────────┐  │      │                      │
│  │ Notification   │  │      │  ┌────────────────┐  │
│  │   table       │  │      │  │  Multicast     │  │
│  └────────────────┘  │      │  │   (500/chunk) │  │
│                      │      │  └────────────────┘  │
│  ┌────────────────┐  │      │                      │
│  │ DeviceToken    │  │      │  ┌────────────────┐  │
│  │   table       │  │      │  │ Android/APNS   │  │
│  └────────────────┘  │      │  │   Push         │  │
│                      │      │  └────────────────┘  │
└──────────────────────┘      └──────────────────────┘
         │                               │
         │                               │
         ▼                               ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                          Push Notifications                                 │
│                   (to user devices)                                          │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## Core Components

### 1. EventEmitter (`src/utils/eventEmitter.ts`)

Singleton EventEmitter that provides a central event bus for notification triggers.

**Events:**
| Event Name | Trigger | Payload |
|------------|---------|---------|
| `booking.created` | New booking confirmed | `{ userId, bookingId, salonName, serviceName, startTime }` |
| `booking.rescheduled` | Booking time changed | `{ userId, bookingId, salonName, newStartTime }` |
| `booking.cancelled` | Booking cancelled | `{ userId, bookingId, salonName }` |
| `booking.completed` | Booking completed | `{ userId, bookingId, salonName }` |
| `order.created` | Order placed | `{ userId, orderId, total, salonName }` |
| `order.status_changed` | Order status updated | `{ userId, orderId, status, salonName }` |
| `order.cancelled` | Order cancelled | `{ userId, orderId, salonName }` |

### 2. NotificationService (`src/services/notificationService.ts`)

Core business logic for notification delivery.

**Key Methods:**

| Method                                                  | Purpose                          | Returns                  |
| ------------------------------------------------------- | -------------------------------- | ------------------------ |
| `registerDeviceToken(userId, token, platform)`          | Register/update FCM token        | `DeviceToken`            |
| `unregisterDeviceToken(token)`                          | Remove device token              | `{ deletedCount }`       |
| `sendToUser(userId, data)`                              | Send notification to single user | `Promise<void>`          |
| `sendToUsers(userIds, data)`                            | Send to multiple users           | `Promise<void>`          |
| `getUserNotifications(userId, page, limit, unreadOnly)` | Fetch notifications              | `PaginatedNotifications` |
| `markAsRead(userId, notificationId)`                    | Mark single as read              | `Notification`           |
| `markAllAsRead(userId)`                                 | Mark all as read                 | `{ updatedCount }`       |
| `deleteNotification(userId, notificationId)`            | Delete notification              | `{ message }`            |
| `cleanupInvalidTokens()`                                | Batch cleanup inactive tokens    | `{ deletedCount }`       |

**Internal Helpers:**

- `fetchActiveTokens(userId)` - Get user's active FCM tokens
- `buildFcmPayload(data)` - Construct FCM message with platform configs
- `sendMulticast(tokens, payload)` - Firebase multicast (max 500 per request)
- `handleInvalidTokens(response, tokens)` - Mark invalid tokens inactive
- `createNotificationRecord(userId, title, message, type)` - Store in DB
- `chunkArray(array, size)` - Split arrays for batching

### 3. NotificationEventListeners (`src/services/notificationEventListeners.ts`)

Event handlers that subscribe to EventEmitter and call NotificationService.

**Listeners:**

- `BOOKING_CREATED` → "Booking Confirmed"
- `BOOKING_RESCHEDULED` → "Booking Rescheduled"
- `BOOKING_CANCELLED` → "Booking Cancelled"
- `BOOKING_COMPLETED` → "Booking Completed"
- `ORDER_CREATED` → "Order Placed"
- `ORDER_STATUS_CHANGED` → "Order Status Updated"
- `ORDER_CANCELLED` → "Order Cancelled"

### 4. NotificationController (`src/controllers/notificationController.ts`)

HTTP request handlers that validate, authenticate, and delegate to services.

### 5. NotificationRoutes (`src/routes/notificationRoute.ts`)

Express route definitions with middleware (auth, rate limiting, validation).

## Data Flow

### Token Registration Flow

```
Frontend                     Backend
    │                            │
    │ POST /notifications/        │
    │ register-token             │
    │ { token, platform }        │
    ├───────────────────────────>│
    │                            │
    │                            ├─ Check if token exists
    │                            ├─ If exists: update platform, lastSeen
    │                            ├─ If new: create token record
    │                            └─ Return deviceToken
    │                            │
    │<───────────────────────────┤
    │ { message, deviceToken }   │
    │                            │
```

### Notification Sending Flow

```
Business Service              EventEmitter         NotificationService        Firebase/Prisma
      │                           │                    │                    │
      │ emit(EVENT, payload)       │                    │                    │
      ├─────────────────────────>  │                    │                    │
      │                           │                    │                    │
      │                           │ on(EVENT)          │                    │
      │                           ├───────────────────>│                    │
      │                           │                    │                    │
      │                           │                    ├─ Create Notification │
      │                           │                    │   ──────────────────>│
      │                           │                    │                    │
      │                           │                    ├─ Fetch Active      │
      │                           │                    │   Tokens ──────────>│
      │                           │                    │                    │
      │                           │                    ├─ Build FCM Payload │
      │                           │                    │                    │
      │                           │                    ├─ Chunk (500)       │
      │                           │                    │                    │
      │                           │                    ├─ sendMulticast() ──>│
      │                           │                    │                    │
      │                           │                    │<─── Send to devices─│
      │                           │                    │                    │
      │                           │                    ├─ Handle Invalid     │
      │                           │                    │   Tokens            │
      │                           │                    │                    │
```

## FCM Message Structure

### Android Payload

```typescript
android: {
  priority: 'high' | 'normal',
  notification: {
    channelId: 'default',
    sound: 'default'
  }
}
```

### iOS/APNS Payload

```typescript
apns: {
  payload: {
    aps: {
      badge: 1,
      sound: 'default',
      category: 'BOOKING' | 'ORDER' | 'PROMOTION'
    }
  }
}
```

### Data Payload (Cross-platform)

```typescript
{
  type: string,
  bookingId?: string,
  orderId?: string,
  action: string,
  screen: string,
  ...customData
}
```

## Invalid Token Handling

1. Firebase returns error codes:

   - `messaging/registration-token-not-registered`
   - `messaging/invalid-registration-token`

2. Backend marks tokens as `isActive: false`

3. Cleanup job (scheduled) deletes inactive tokens older than 30 days

## Database Schema

### Notification Table

| Column      | Type          | Description                                   |
| ----------- | ------------- | --------------------------------------------- |
| `id`        | String (cuid) | Primary key                                   |
| `userId`    | String        | Foreign key to users                          |
| `title`     | String        | Notification title                            |
| `message`   | String        | Notification message                          |
| `type`      | String        | Notification type (booking, order, promotion) |
| `isRead`    | Boolean       | Read status                                   |
| `createdAt` | DateTime      | Creation timestamp                            |

### DeviceToken Table

| Column      | Type          | Description                  |
| ----------- | ------------- | ---------------------------- |
| `id`        | String (cuid) | Primary key                  |
| `userId`    | String        | Foreign key to users         |
| `fcmToken`  | String        | FCM registration token       |
| `platform`  | String        | Platform (ios, android, web) |
| `isActive`  | Boolean       | Token validity status        |
| `lastSeen`  | DateTime      | Last activity timestamp      |
| `createdAt` | DateTime      | Registration timestamp       |

## Security Considerations

1. **Authentication**: All notification endpoints require valid JWT token
2. **Authorization**: Users can only access their own notifications
3. **Rate Limiting**: Token registration endpoint has rate limiting
4. **Token Ownership**: Token cannot be registered to multiple users
5. **No Sensitive Data**: Notifications do not contain sensitive information (only IDs)
6. **Input Validation**: All inputs validated with Zod schemas

## Scalability Features

1. **Multicast Chunking**: Splits token lists > 500 into multiple requests
2. **Async Event Handling**: Notifications sent asynchronously
3. **Token Cleanup**: Batch cleanup of stale tokens
4. **Database Indexes**: Indexes on userId, fcmToken, isActive, createdAt
5. **Pagination**: Notifications list supports pagination

## Future Enhancements

1. **Silent Notifications**: Support data-only notifications
2. **Scheduled Notifications**: Queue notifications for future delivery
3. **Priority Levels**: Different priority levels for notification types
4. **Analytics**: Track notification delivery rates and open rates
5. **Throttling**: Prevent notification spam per user
6. **Webhook Support**: Allow custom webhook endpoints for notifications
7. **Template Management**: Centralized notification templates
8. **A/B Testing**: Test different notification messages
