# 🧭 **ProBeauty — Route Structure**

---

## 🧩 **Base URL**

```
/api/v1
```

All routes should be prefixed with `/api/v1` for version control.

---

## 🔐 **Auth Routes**

**Purpose:** Handles user registration, login, logout, and profile authentication.

| Method   | Endpoint                | Description                                          |
| -------- | ----------------------- | ---------------------------------------------------- |
| **POST** | `/auth/register`        | Register a new user (client, salon owner, or staff). |
| **POST** | `/auth/login`           | Login using email & password.                        |
| **POST** | `/auth/social-login`    | Login via Google or Apple.                           |
| **POST** | `/auth/logout`          | Logout the current user.                             |
| **GET**  | `/auth/me`              | Get current logged-in user’s profile (JWT required). |
| **POST** | `/auth/forgot-password` | Send password reset link via email.                  |
| **POST** | `/auth/reset-password`  | Reset password using token.                          |
| **PUT**  | `/auth/update-password` | Update password (authenticated users).               |

---

## 👤 **User Routes (Clients / Customers)**

**Purpose:** Manage customer profiles, bookings, and preferences.

| Method     | Endpoint                     | Description                                     |
| ---------- | ---------------------------- | ----------------------------------------------- |
| **GET**    | `/users/profile`             | Fetch user profile details.                     |
| **PUT**    | `/users/profile`             | Update user profile (name, phone, preferences). |
| **GET**    | `/users/bookings`            | Fetch all bookings for logged-in user.          |
| **GET**    | `/users/bookings/:id`        | Get details of a specific booking.              |
| **DELETE** | `/users/bookings/:id/cancel` | Cancel a booking.                               |
| **GET**    | `/users/notifications`       | Fetch user notifications (reminders, offers).   |
| **GET**    | `/users/loyalty`             | Get loyalty points or membership info.          |
| **POST**   | `/favourites`                              | Add a product or salon to favourites (`{ type, itemId }` in body). |
| **GET**    | `/favourites?type=product\|salon`          | Get paginated list of favourite products or salons.                |
| **GET**    | `/favourites/check/:id?type=product\|salon`| Check if a specific product or salon is favourited.                |
| **DELETE** | `/favourites/:id?type=product\|salon`      | Remove a product or salon from favourites.                         |

---

## 💈 **Salon Routes**

**Purpose:** Manage salon profile, staff, and services.

| Method     | Endpoint                          | Description                                         |
| ---------- | --------------------------------- | --------------------------------------------------- |
| **POST**   | `/salons`                         | Create a new salon (for salon owners).              |
| **GET**    | `/salons`                         | Get all salons (public listing).                    |
| **GET**    | `/salons/:id`                     | Get salon details by ID.                            |
| **PUT**    | `/salons/:id`                     | Update salon profile info (name, address, timings). |
| **DELETE** | `/salons/:id`                     | Delete salon (admin-only or owner).                 |
| **GET**    | `/salons/:id/services`            | Get all services offered by a salon.                |
| **POST**   | `/salons/:id/services`            | Add a new service.                                  |
| **PUT**    | `/salons/:id/services/:serviceId` | Update existing service.                            |
| **DELETE** | `/salons/:id/services/:serviceId` | Delete a service.                                   |
| **GET**    | `/salons/:id/stylists`            | Fetch list of stylists for the salon.               |
| **POST**   | `/salons/:id/stylists`            | Add stylist to salon.                               |
| **PUT**    | `/salons/:id/stylists/:stylistId` | Update stylist details.                             |
| **DELETE** | `/salons/:id/stylists/:stylistId` | Remove stylist.                                     |
| **GET**    | `/salons/:id/reviews`             | Get all customer reviews for a salon.               |
| **POST**   | `/salons/:id/reviews`             | Add a review for a salon.                           |

---

## 🗓️ **Booking Routes**

**Purpose:** Handles all booking, scheduling, and calendar logic.

| Method     | Endpoint                          | Description                                     |
| ---------- | --------------------------------- | ----------------------------------------------- |
| **POST**   | `/bookings`                       | Create a new booking.                           |
| **GET**    | `/bookings`                       | Get all bookings (filtered by user or salon).   |
| **GET**    | `/bookings/:id`                   | Get details of a specific booking.              |
| **PUT**    | `/bookings/:id`                   | Update booking (reschedule, change stylist).    |
| **DELETE** | `/bookings/:id`                   | Cancel booking.                                 |
| **GET**    | `/bookings/availability/:salonId` | Check available time slots for a salon/stylist. |
| **POST**   | `/bookings/:id/confirm`           | Confirm a booking (for salon owner).            |
| **POST**   | `/bookings/:id/complete`          | Mark booking as completed.                      |

---

## 💳 **Payment Routes**

**Purpose:** Payment and billing for salon services.

| Method   | Endpoint                      | Description                                 |
| -------- | ----------------------------- | ------------------------------------------- |
| **POST** | `/payments/intent`            | Create a payment intent (Stripe/Razorpay).  |
| **POST** | `/payments/confirm`           | Confirm a successful payment.               |
| **GET**  | `/payments/:bookingId`        | Fetch payment details for a booking.        |
| **GET**  | `/payments/history`           | View payment history (user or salon owner). |
| **POST** | `/payments/refund/:bookingId` | Initiate refund process.                    |

---

## 🎁 **Promotions & Loyalty Routes**

**Purpose:** Manage discount codes, loyalty programs, and memberships.

| Method     | Endpoint            | Description                           |
| ---------- | ------------------- | ------------------------------------- |
| **GET**    | `/promotions`       | Get all active offers.                |
| **POST**   | `/promotions`       | Create a new promotion (owner/admin). |
| **PUT**    | `/promotions/:id`   | Update promotion details.             |
| **DELETE** | `/promotions/:id`   | Delete promotion.                     |
| **POST**   | `/promotions/apply` | Apply promo code during booking.      |
| **GET**    | `/loyalty/:userId`  | Fetch loyalty points for a user.      |
| **POST**   | `/loyalty/redeem`   | Redeem points for a discount.         |

---

## 💬 **Reviews & Ratings Routes**

**Purpose:** Manage service and stylist feedback.

| Method     | Endpoint       | Description                                     |
| ---------- | -------------- | ----------------------------------------------- |
| **GET**    | `/reviews`     | Fetch all reviews (filter by salon or stylist). |
| **POST**   | `/reviews`     | Submit a new review.                            |
| **PUT**    | `/reviews/:id` | Edit a review.                                  |
| **DELETE** | `/reviews/:id` | Delete a review.                                |

---

## ⚙️ **Admin Routes**

**Purpose:** Platform-level management for super admins.

| Method     | Endpoint                   | Description                                             |
| ---------- | -------------------------- | ------------------------------------------------------- |
| **GET**    | `/admin/salons`            | View all registered salons.                             |
| **GET**    | `/admin/users`             | View all users.                                         |
| **GET**    | `/admin/bookings`          | View all bookings.                                      |
| **PUT**    | `/admin/salons/:id/verify` | Approve or verify a salon listing.                      |
| **DELETE** | `/admin/salons/:id`        | Remove a salon from the platform.                       |
| **GET**    | `/admin/analytics`         | View platform-wide analytics (revenue, bookings, etc.). |
| **POST**   | `/admin/promotions/global` | Create global promotions visible across salons.         |

---

## 🔔 **Notification Routes**

**Purpose:** Handle reminders, alerts, and push notifications.

| Method     | Endpoint                  | Description                               |
| ---------- | ------------------------- | ----------------------------------------- |
| **GET**    | `/notifications`          | Fetch user notifications.                 |
| **POST**   | `/notifications/send`     | Send a manual notification (admin/salon). |
| **PUT**    | `/notifications/:id/read` | Mark notification as read.                |
| **DELETE** | `/notifications/:id`      | Delete notification.                      |

---

## 📊 **Reports & Analytics Routes**

**Purpose:** Retrieve performance and financial analytics for salon owners and admins.

| Method  | Endpoint               | Description                                              |
| ------- | ---------------------- | -------------------------------------------------------- |
| **GET** | `/reports/salon/:id`   | Get salon-specific analytics (revenue, clients, trends). |
| **GET** | `/reports/stylist/:id` | Get stylist performance report.                          |
| **GET** | `/reports/bookings`    | Booking trends (daily, weekly, monthly).                 |
| **GET** | `/reports/revenue`     | Revenue statistics with time filters.                    |

---

## 🧾 **Inventory (Optional Add-on)**

**Purpose:** Manage beauty products and stock for each salon.

| Method     | Endpoint                         | Description                    |
| ---------- | -------------------------------- | ------------------------------ |
| **GET**    | `/inventory/:salonId`            | Fetch salon’s inventory.       |
| **POST**   | `/inventory/:salonId`            | Add product to inventory.      |
| **PUT**    | `/inventory/:salonId/:productId` | Update product details.        |
| **DELETE** | `/inventory/:salonId/:productId` | Remove product from inventory. |

---

## 🧠 **Future / Add-on Routes**

| Module                         | Example Routes                                                                  |
| ------------------------------ | ------------------------------------------------------------------------------- |
| **AI Haircut Filter (Add-on)** | `POST /ai/haircut/upload`, `GET /ai/haircut/styles`, `POST /ai/haircut/preview` |
| **AI Chat Assistant**          | `POST /ai/assistant/query`                                                      |
| **Mobile Notifications**       | `POST /notifications/mobile`                                                    |
| **Salon Academy**              | `/academy/courses`, `/academy/enroll/:courseId`                                 |

---

# ✅ **Folder Structure Suggestion (Express Example)**

```
/routes
  ├── auth.routes.js
  ├── users.routes.js
  ├── salons.routes.js
  ├── bookings.routes.js
  ├── payments.routes.js
  ├── promotions.routes.js
  ├── reviews.routes.js
  ├── admin.routes.js
  ├── notifications.routes.js
  ├── reports.routes.js
  ├── inventory.routes.js
  └── ai.routes.js (future)
```

---

Would you like me to create a **visual API structure diagram** (like a flow of `/auth → /salons → /bookings → /payments`) to help you during backend setup and documentation? It can serve as a visual reference for your Postman or Swagger API docs.
