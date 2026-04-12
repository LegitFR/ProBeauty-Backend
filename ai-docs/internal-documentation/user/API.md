## User profile & email API

General notes for the user profile and email management system.

- Base path: `/api/v1/user` (see `src/index.ts`)
- Authentication: All routes require `Authorization: Bearer <accessToken>`
- Rate limiting: 50 requests / 15 minutes per IP (`authRateLimiter`)
- Validation: All bodies validated with Zod (`src/schemas/userSchema.ts`) via `validateRequest`
- Content type: `application/json` for requests and responses

Tip: In examples below, replace `http://localhost:5000` with your server URL.

---

## Endpoints with examples

For each route you’ll find: what it does, sample request body, expected success response, and a ready-to-run curl.

---

### 1) Get current user profile — GET `/api/v1/user/me`

Returns the authenticated user’s profile with related commerce data.

Includes:

- Basic user: `id`, `name`, `email`, `phone`, `role`, etc.
- `bookings`: all bookings for the user
- `orders`: all orders, including `orderItems` and `payments`
- `cart`: active cart (if any), including `cartItems` and each `product`
- `addresses`: all saved addresses

Headers:

```http
Authorization: Bearer <accessToken>
Content-Type: application/json
```

Sample success response (200):

```json
{
  "user": {
    "id": "usr_123",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "phone": "9876543210",
    "role": "customer",
    "bookings": [
      {
        "id": "bkg_1",
        "salonId": "salon_1",
        "serviceId": "svc_1",
        "staffId": "stf_1",
        "startTime": "2025-01-10T10:00:00.000Z",
        "endTime": "2025-01-10T11:00:00.000Z",
        "status": "confirmed"
      }
    ],
    "orders": [
      {
        "id": "ord_1",
        "salonId": "salon_1",
        "total": "63.00",
        "status": "completed",
        "createdAt": "2025-01-01T12:00:00.000Z",
        "orderItems": [
          {
            "id": "oi_1",
            "productId": "prd_1",
            "quantity": 2,
            "unitPrice": "28.00"
          }
        ],
        "payments": [
          {
            "id": "pay_1",
            "provider": "stripe",
            "amount": "63.00",
            "status": "completed",
            "txnId": "txn_123"
          }
        ]
      }
    ],
    "cart": {
      "id": "cart_1",
      "cartItems": [
        {
          "id": "ci_1",
          "productId": "prd_2",
          "quantity": 1,
          "product": {
            "id": "prd_2",
            "title": "Argan Oil Hair Serum",
            "price": "35.00",
            "images": ["https://example.com/serum.jpg"]
          }
        }
      ]
    },
    "addresses": [
      {
        "id": "addr_1",
        "fullName": "Jane Doe",
        "phone": "9876543210",
        "addressLine1": "123 Main Street",
        "city": "New York",
        "state": "NY",
        "postalCode": "10001",
        "country": "US",
        "isDefault": true
      }
    ]
  }
}
```

curl:

```bash
curl -X GET "http://localhost:5000/api/v1/user/me" \
  -H "Authorization: Bearer <accessToken>" \
  -H "Content-Type: application/json"
```

Errors: 401 (missing/invalid token), 404 (user not found), 500 (server).

---

### 2) Update current user profile — PATCH `/api/v1/user/me`

Updates the authenticated user’s basic profile details.

Editable fields:

- `name` (optional)
- `phone` (optional, must contain 9 to 14 digits)

At least one field must be provided. Email is **not** editable here; use the email change flow below.

Headers:

```http
Authorization: Bearer <accessToken>
Content-Type: application/json
```

Sample request body:

```json
{
  "name": "Jane A. Doe",
  "phone": "9876543211"
}
```

Sample success response (200):

```json
{
  "message": "Profile updated successfully",
  "user": {
    "id": "usr_123",
    "name": "Jane A. Doe",
    "email": "jane@example.com",
    "phone": "9876543211",
    "role": "customer"
  }
}
```

curl:

```bash
curl -X PATCH "http://localhost:5000/api/v1/user/me" \
  -H "Authorization: Bearer <accessToken>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane A. Doe",
    "phone": "9876543211"
  }'
```

Errors: 400 (validation), 401 (unauthorized), 500 (server).

---

### 3) Request email change — POST `/api/v1/user/change-email/request`

Starts the email change flow by sending a 6‑digit OTP to the **new** email address.
The user’s `email` is **not** changed yet; it will only be updated after OTP verification.

Headers:

```http
Authorization: Bearer <accessToken>
Content-Type: application/json
```

Sample request body:

```json
{
  "newEmail": "new-jane@example.com"
}
```

Sample success response (200):

```json
{
  "message": "OTP sent to new email for confirmation"
}
```

curl:

```bash
curl -X POST "http://localhost:5000/api/v1/user/change-email/request" \
  -H "Authorization: Bearer <accessToken>" \
  -H "Content-Type: application/json" \
  -d '{
    "newEmail": "new-jane@example.com"
  }'
```

Behavior notes:

- If the `newEmail` already belongs to another user, the request fails with 409 (email already in use).
- A 6‑digit OTP is generated, hashed with bcrypt, and stored in the existing `otp`/`otpExpiresAt` fields on the user.
- OTP is valid for 10 minutes (same as registration and reset flows; see `AUTH_OVERVIEW.md`).
- If any step fails, the user’s existing `email` remains unchanged.

Errors: 400 (validation), 401 (unauthorized), 409 (email already in use), 500 (server).

---

### 4) Confirm email change — POST `/api/v1/user/change-email/confirm`

Verifies the OTP that was sent to the new email and, if valid, updates the user’s primary email.

Headers:

```http
Authorization: Bearer <accessToken>
Content-Type: application/json
```

Sample request body:

```json
{
  "newEmail": "new-jane@example.com",
  "otp": "123456"
}
```

Sample success response (200):

```json
{
  "message": "Email updated successfully",
  "user": {
    "id": "usr_123",
    "name": "Jane A. Doe",
    "email": "new-jane@example.com",
    "phone": "9876543211",
    "role": "customer"
  }
}
```

curl:

```bash
curl -X POST "http://localhost:5000/api/v1/user/change-email/confirm" \
  -H "Authorization: Bearer <accessToken>" \
  -H "Content-Type: application/json" \
  -d '{
    "newEmail": "new-jane@example.com",
    "otp": "123456"
  }'
```

Behavior notes:

- Uses the same `otp` and `otpExpiresAt` fields as other OTP flows.
- If OTP is missing, invalid, or expired → 400 (OTP expired or invalid).
- Before updating, the system rechecks that `newEmail` is not already used by another user.
- On success:
  - `users.email` is updated to `newEmail`.
  - `otp` and `otpExpiresAt` are cleared.
  - A confirmation email is sent to the new email address.
- If any of these checks fail, the user’s existing email remains unchanged.

Errors: 400 (validation / invalid or expired OTP), 401 (unauthorized), 409 (email already in use), 500 (server).

---

## Error handling and patterns

- Most errors return a JSON `{ "message": string }` with appropriate status codes (4xx/5xx).
- Validation errors are caught by `validateRequest` and respond with a 400 and a list of field-level errors.
- All routes require a valid access token; use `Authorization: Bearer <accessToken>` (see `AUTH_OVERVIEW.md` for login and token details).

## References

- Router: `src/routes/userRoute.ts`
- Controllers: `src/controllers/userController.ts`
- Schemas: `src/schemas/userSchema.ts`
- Services: `src/services/userService.ts`, `src/services/emailService.ts`
- Mount path: `src/index.ts`

