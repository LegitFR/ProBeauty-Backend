## Auth overview

General notes for the authentication system.

- Base path: `/api/v1/auth` (see `src/index.ts`)
- Rate limiting: 50 requests / 15 minutes per IP for all auth routes (`authRateLimiter`)
- Validation: All bodies validated with Zod (`src/schemas/authSchema.ts`) via `validateRequest`
- Tokens:
  - Access token: JWT, expires in 3 hours
  - Refresh token: JWT, expires in 15 days
- OTP validity: 10 minutes for registration and password reset flows
- Content type: `application/json` for requests and responses
- Trust proxy: Enabled (`trust proxy: 1`) for accurate client IP detection behind proxies/load balancers

Tip: In examples below, replace `http://localhost:5000` with your server URL.

---

## Client-Side Usage Notes

### For Direct API Calls (No Special Headers Required)

When making requests from client applications (web, mobile, Postman, curl), **you do NOT need to manually set any proxy headers**. Simply make standard HTTP requests:

```javascript
// Example: Fetch API (Browser/Node.js)
const response = await fetch('http://localhost:5000/api/v1/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    identifier: 'jane@example.com',
    password: 'P@ssw0rd!'
  })
});
```

```javascript
// Example: Axios (Browser/Node.js)
const response = await axios.post('http://localhost:5000/api/v1/auth/login', {
  identifier: 'jane@example.com',
  password: 'P@ssw0rd!'
}, {
  headers: {
    'Content-Type': 'application/json'
  }
});
```

### About X-Forwarded-For Header

The `X-Forwarded-For` header is **automatically set by infrastructure** (proxies, load balancers, CDNs, Docker, Kubernetes) between the client and server. It tracks the original client IP address for accurate rate limiting.

**You do NOT manually set this header** from client applications. The server's `trust proxy` setting (enabled in `src/index.ts`) handles this automatically.

**Infrastructure that sets this header:**
- Reverse proxies (nginx, Apache)
- Load balancers (AWS ALB/ELB, Azure Load Balancer)
- CDNs (Cloudflare, Fastly)
- Container orchestration (Docker, Kubernetes ingress)
- API gateways

If you're running the server directly (not behind a proxy), the header won't be present and the server will use the direct connection IP.

---

## Endpoints with examples

For each route you’ll find: what it does, sample request body, expected success response, and a ready-to-run curl.

### 1) Register and send OTP — POST `/api/v1/auth/signup`

Registers a user and emails a 6‑digit OTP for verification.

Sample request body:

```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "phone": "9876543210",
  "password": "P@ssw0rd!",
  "role": "customer"
}
```

Sample success response (201):

```json
{
  "message": "User registered. OTP sent to email.",
  "userId": "usr_123"
}
```

curl:

```bash
curl -X POST "http://localhost:5000/api/v1/auth/signup" \
	-H "Content-Type: application/json" \
	-d '{
		"name": "Jane Doe",
		"email": "jane@example.com",
		"phone": "9876543210",
		"password": "P@ssw0rd!",
		"role": "customer"
	}'
```

Errors: 409 (user exists), 500 (server).

---

### 2) Confirm registration — POST `/api/v1/auth/confirm-registration`

Verifies OTP and activates the account.

Sample request body:

```json
{ "email": "jane@example.com", "otp": "123456" }
```

Sample success response (200):

```json
{ "message": "Account verified" }
```

curl:

```bash
curl -X POST "http://localhost:5000/api/v1/auth/confirm-registration" \
	-H "Content-Type: application/json" \
	-d '{ "email": "jane@example.com", "otp": "123456" }'
```

Errors: 404 (not found), 400 (already verified / OTP expired or invalid), 500 (server).

Note: Implementation currently updates the user but may not return the 200 body above; consider aligning.

---

### 3) Login — POST `/api/v1/auth/login`

Authenticates by email or phone and returns tokens.

Sample request body:

```json
{ "identifier": "jane@example.com", "password": "P@ssw0rd!" }
```

Sample success response (200):

```json
{
  "message": "Login successful",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "usr_123",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "phone": "9876543210",
    "role": "customer"
  }
}
```

curl:

```bash
curl -X POST "http://localhost:5000/api/v1/auth/login" \
	-H "Content-Type: application/json" \
	-d '{ "identifier": "jane@example.com", "password": "P@ssw0rd!" }'
```

Errors: 401 (invalid credentials or inactive), 500 (server).

---

### 4) Forgot password — POST `/api/v1/auth/forgot-password`

Sends a password reset OTP to the user’s email.

Sample request body:

```json
{ "email": "jane@example.com" }
```

Sample success response (200):

```json
{ "message": "OTP sent to email for password reset" }
```

curl:

```bash
curl -X POST "http://localhost:5000/api/v1/auth/forgot-password" \
	-H "Content-Type: application/json" \
	-d '{ "email": "jane@example.com" }'
```

Errors: 404 (not found), 500 (server).

---

### 5) Verify reset OTP — POST `/api/v1/auth/verify-forgot-password-otp`

Validates the password reset OTP.

Sample request body:

```json
{ "email": "jane@example.com", "otp": "123456" }
```

Sample success response (200):

```json
{ "message": "OTP verified successfully" }
```

curl:

```bash
curl -X POST "http://localhost:5000/api/v1/auth/verify-forgot-password-otp" \
	-H "Content-Type: application/json" \
	-d '{ "email": "jane@example.com", "otp": "123456" }'
```

Errors: 404 (not found), 400 (expired/invalid), 500 (server).

---

### 6) Resend reset OTP — POST `/api/v1/auth/resend-forgot-password-otp`

Resends the password reset OTP.

Sample request body:

```json
{ "email": "jane@example.com" }
```

Sample success response (200):

```json
{ "message": "New OTP sent to email" }
```

curl:

```bash
curl -X POST "http://localhost:5000/api/v1/auth/resend-forgot-password-otp" \
	-H "Content-Type: application/json" \
	-d '{ "email": "jane@example.com" }'
```

Errors: 404 (not found), 500 (server).

---

### 7) Reset password — POST `/api/v1/auth/reset-password`

Resets password using email + OTP.

Sample request body:

```json
{ "email": "jane@example.com", "otp": "123456", "newPassword": "N3wP@ssw0rd!" }
```

Sample success response (200):

```json
{ "message": "Password reset successfully" }
```

curl:

```bash
curl -X POST "http://localhost:5000/api/v1/auth/reset-password" \
	-H "Content-Type: application/json" \
	-d '{ "email": "jane@example.com", "otp": "123456", "newPassword": "N3wP@ssw0rd!" }'
```

Errors: 404 (not found), 400 (expired/invalid), 500 (server).

---

### 8) Refresh access token — POST `/api/v1/auth/refresh-token`

Returns a new access token using a valid refresh token. Alias: `/api/v1/auth/refresh-access-token`.

Sample request body:

```json
{ "refreshToken": "<your-refresh-token>" }
```

Sample success response (200):

```json
{ "message": "Access token refreshed", "accessToken": "eyJhbGciOiJIUzI1NiIs..." }
```

curl:

```bash
curl -X POST "http://localhost:5000/api/v1/auth/refresh-token" \
	-H "Content-Type: application/json" \
	-d '{ "refreshToken": "<your-refresh-token>" }'
```

Errors: 401 (invalid refresh token / user mismatch), 500 (server).

---

## Error handling and patterns

- Most errors return a JSON `{ "message": string }` with appropriate status codes (4xx/5xx).
- Validation errors are caught by `validateRequest` and respond with 400-series codes and messages from Zod.
- Use the access token in `Authorization: Bearer <accessToken>` for protected, non-auth routes.

## Implementation notes

- `/confirm-registration` currently updates user data but may not send the sample 200 body; aligning controller responses is recommended.
- `/signup` success message in dev may include the OTP; omit in production.
- `/refresh-access-token` is a direct alias of `/refresh-token`; consider keeping one canonical route.

## References

- Router: `src/routes/authRoute.ts`
- Controllers: `src/controllers/authController.ts`
- Schemas: `src/schemas/authSchema.ts`
- Tokens: `src/utils/tokenUtils.ts`
- Rate limiting: `src/middlewares/rateLimiter.ts`
- Mount path: `src/index.ts`
