# Order API

Order management endpoints for creating orders from cart, tracking order status, and managing order lifecycle.

---

## Create Order

**Description:** Create a new order from the user's cart. Validates stock availability, calculates totals, reduces inventory, and clears the cart upon successful order creation.

**Endpoint:** `POST /api/v1/orders`

**Authentication:** Required (Bearer token)

**Request Body:**

```json
{
  "addressId": "clx1addr123456789",
  "notes": "Please deliver between 2-5 PM"
}
```

**Field Validations:**

- `addressId`: Valid CUID format (required)
- `notes`: Max 500 characters (optional)

**Success Response (201 Created):**

```json
{
  "message": "Order created successfully",
  "data": {
    "id": "clx1order12345678",
    "userId": "clx9876543210abcdefghijk",
    "salonId": "clx1salon12345678",
    "total": "104.98",
    "status": "PENDING",
    "createdAt": "2025-11-02T15:30:00.000Z",
    "orderItems": [
      {
        "id": "clx1orderitem11111",
        "orderId": "clx1order12345678",
        "productId": "clx1prod123456789",
        "quantity": 2,
        "unitPrice": "29.99",
        "product": {
          "id": "clx1prod123456789",
          "salonId": "clx1salon12345678",
          "title": "Luxury Hair Serum",
          "sku": "HAIR-SER-001",
          "price": "29.99",
          "quantity": 48,
          "images": ["https://example.com/image1.jpg"]
        }
      },
      {
        "id": "clx1orderitem22222",
        "orderId": "clx1order12345678",
        "productId": "clx1prod987654321",
        "quantity": 1,
        "unitPrice": "45.00",
        "product": {
          "id": "clx1prod987654321",
          "salonId": "clx1salon12345678",
          "title": "Moisturizing Cream",
          "sku": "MOIST-CR-002",
          "price": "45.00",
          "quantity": 29,
          "images": ["https://example.com/image2.jpg"]
        }
      }
    ]
  }
}
```

**Error Responses:**

- **400 Bad Request:** Cart validation failed, cart is empty, or multiple salons

```json
{
  "message": "Cart validation failed: Insufficient stock for Luxury Hair Serum. Only 1 available, but 2 requested"
}
```

```json
{
  "message": "Cart is empty"
}
```

```json
{
  "message": "Cart contains items from multiple salons"
}
```

- **404 Not Found:** Address not found
- **403 Forbidden:** Address doesn't belong to user

**cURL Command:**

```bash
curl -X POST http://localhost:5000/api/v1/orders \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "addressId": "clx1addr123456789",
    "notes": "Please deliver between 2-5 PM"
  }'
```

---

## Get All Orders

**Description:** Retrieve all orders for the authenticated user with pagination and optional filters.

**Endpoint:** `GET /api/v1/orders`

**Authentication:** Required (Bearer token)

**Query Parameters:**

- `page` (number, optional) — Page number (default: 1)
- `limit` (number, optional) — Items per page (default: 10, max: 100)
- `status` (string, optional) — Filter by order status
- `salonId` (string, optional) — Filter by salon ID

**Valid Status Values:**

- `PENDING`
- `PAYMENT_PENDING`
- `PAYMENT_FAILED`
- `CONFIRMED`
- `SHIPPED`
- `DELIVERED`
- `CANCELLED`

**Success Response (200 OK):**

```json
{
  "message": "Orders retrieved successfully",
  "data": [
    {
      "id": "clx1order12345678",
      "userId": "clx9876543210abcdefghijk",
      "salonId": "clx1salon12345678",
      "total": "104.98",
      "status": "CONFIRMED",
      "createdAt": "2025-11-02T15:30:00.000Z",
      "orderItems": [
        {
          "id": "clx1orderitem11111",
          "orderId": "clx1order12345678",
          "productId": "clx1prod123456789",
          "quantity": 2,
          "unitPrice": "29.99",
          "product": {
            "id": "clx1prod123456789",
            "title": "Luxury Hair Serum",
            "sku": "HAIR-SER-001",
            "price": "29.99",
            "images": ["https://example.com/image1.jpg"]
          }
        }
      ]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 15,
    "totalPages": 2
  }
}
```

**cURL Command:**

```bash
# Get all orders
curl -X GET "http://localhost:5000/api/v1/orders" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"

# Get orders with filters
curl -X GET "http://localhost:5000/api/v1/orders?page=1&limit=5&status=CONFIRMED&salonId=clx1salon12345678" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

---

## Get All Orders (Admin)

**Description:** Retrieve all orders in the system with pagination and optional filters. Admin only endpoint.

**Endpoint:** `GET /api/v1/orders/admin`

**Authentication:** Required (Bearer token, admin role only)

**Query Parameters:**

- `page` (number, optional) — Page number (default: 1)
- `limit` (number, optional) — Items per page (default: 10, max: 100)
- `status` (string, optional) — Filter by order status
- `salonId` (string, optional) — Filter by salon ID

**Valid Status Values:**

- `PENDING`
- `PAYMENT_PENDING`
- `PAYMENT_FAILED`
- `CONFIRMED`
- `SHIPPED`
- `DELIVERED`
- `CANCELLED`

**Success Response (200 OK):**

```json
{
  "message": "Orders retrieved successfully",
  "data": [
    {
      "id": "clx1order12345678",
      "userId": "clx9876543210abcdefghijk",
      "salonId": "clx1salon12345678",
      "total": "104.98",
      "status": "CONFIRMED",
      "createdAt": "2025-11-02T15:30:00.000Z",
      "orderItems": [
        {
          "id": "clx1orderitem11111",
          "orderId": "clx1order12345678",
          "productId": "clx1prod123456789",
          "quantity": 2,
          "unitPrice": "29.99",
          "product": {
            "id": "clx1prod123456789",
            "title": "Luxury Hair Serum",
            "sku": "HAIR-SER-001",
            "price": "29.99",
            "images": ["https://example.com/image1.jpg"]
          }
        }
      ]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 150,
    "totalPages": 15
  }
}
```

**Error Responses:**

- **401 Unauthorized:** Admin not authenticated
- **403 Forbidden:** User does not have admin role

```json
{
  "message": "Access denied. Admin role required."
}
```

**cURL Command:**

```bash
# Get all orders as admin
curl -X GET "http://localhost:5000/api/v1/orders/admin" \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json"

# Get orders with filters
curl -X GET "http://localhost:5000/api/v1/orders/admin?page=1&limit=20&status=CONFIRMED&salonId=clx1salon12345678" \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

---

## Get Order by ID

**Description:** Retrieve a specific order by its ID. User must be the order owner or the salon owner.

**Endpoint:** `GET /api/v1/orders/:id`

**Authentication:** Required (Bearer token)

**URL Parameters:**

- `id` (string, required) — Order ID

**Success Response (200 OK):**

```json
{
  "message": "Order retrieved successfully",
  "data": {
    "id": "clx1order12345678",
    "userId": "clx9876543210abcdefghijk",
    "salonId": "clx1salon12345678",
    "total": "104.98",
    "status": "SHIPPED",
    "createdAt": "2025-11-02T15:30:00.000Z",
    "salon": {
      "id": "clx1salon12345678",
      "ownerId": "clx1owner123456789",
      "name": "Beauty Palace",
      "address": "123 Salon Street",
      "verified": true
    },
    "orderItems": [
      {
        "id": "clx1orderitem11111",
        "orderId": "clx1order12345678",
        "productId": "clx1prod123456789",
        "quantity": 2,
        "unitPrice": "29.99",
        "product": {
          "id": "clx1prod123456789",
          "salonId": "clx1salon12345678",
          "title": "Luxury Hair Serum",
          "sku": "HAIR-SER-001",
          "price": "29.99",
          "quantity": 48,
          "images": ["https://example.com/image1.jpg"]
        }
      },
      {
        "id": "clx1orderitem22222",
        "orderId": "clx1order12345678",
        "productId": "clx1prod987654321",
        "quantity": 1,
        "unitPrice": "45.00",
        "product": {
          "id": "clx1prod987654321",
          "salonId": "clx1salon12345678",
          "title": "Moisturizing Cream",
          "sku": "MOIST-CR-002",
          "price": "45.00",
          "quantity": 29,
          "images": ["https://example.com/image2.jpg"]
        }
      }
    ]
  }
}
```

**Error Responses:**

- **404 Not Found:** Order doesn't exist
- **403 Forbidden:** User doesn't have access to this order

**cURL Command:**

```bash
curl -X GET http://localhost:5000/api/v1/orders/clx1order12345678 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

---

## Update Order Status

**Description:** Update the status of an order. Only the salon owner can update order status. Status transitions are validated.

**Endpoint:** `PATCH /api/v1/orders/:id/status`

**Authentication:** Required (Bearer token, salon owner only)

**URL Parameters:**

- `id` (string, required) — Order ID

**Request Body:**

```json
{
  "status": "CONFIRMED"
}
```

**Valid Status Transitions:**

- `PENDING` → `PAYMENT_PENDING`, `CONFIRMED`, `CANCELLED`
- `PAYMENT_PENDING` → `CONFIRMED`, `PAYMENT_FAILED`, `CANCELLED`
- `PAYMENT_FAILED` → `PAYMENT_PENDING`, `CANCELLED`
- `CONFIRMED` → `SHIPPED`, `CANCELLED`
- `SHIPPED` → `DELIVERED`
- `DELIVERED` → (terminal state, no transitions)
- `CANCELLED` → (terminal state, no transitions)

**Success Response (200 OK):**

```json
{
  "message": "Order status updated successfully",
  "data": {
    "id": "clx1order12345678",
    "userId": "clx9876543210abcdefghijk",
    "salonId": "clx1salon12345678",
    "total": "104.98",
    "status": "CONFIRMED",
    "createdAt": "2025-11-02T15:30:00.000Z"
  }
}
```

**Error Responses:**

- **404 Not Found:** Order doesn't exist
- **403 Forbidden:** Only salon owner can update order status
- **400 Bad Request:** Invalid status transition

```json
{
  "message": "Invalid status transition from SHIPPED to PENDING"
}
```

**cURL Command:**

```bash
curl -X PATCH http://localhost:5000/api/v1/orders/clx1order12345678/status \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "CONFIRMED"
  }'
```

---

## Cancel Order

**Description:** Cancel an order. User can cancel their own order, or salon owner can cancel. Cannot cancel orders that are already shipped, delivered, or cancelled. Product quantities are restored to inventory.

**Endpoint:** `POST /api/v1/orders/:id/cancel`

**Authentication:** Required (Bearer token)

**URL Parameters:**

- `id` (string, required) — Order ID

**Success Response (200 OK):**

```json
{
  "message": "Order cancelled successfully",
  "data": {
    "id": "clx1order12345678",
    "userId": "clx9876543210abcdefghijk",
    "salonId": "clx1salon12345678",
    "total": "104.98",
    "status": "CANCELLED",
    "createdAt": "2025-11-02T15:30:00.000Z"
  }
}
```

**Error Responses:**

- **404 Not Found:** Order doesn't exist
- **403 Forbidden:** User cannot cancel this order
- **400 Bad Request:** Order cannot be cancelled

```json
{
  "message": "Cannot cancel order with status SHIPPED"
}
```

```json
{
  "message": "Cannot cancel order with status DELIVERED"
}
```

**cURL Command:**

```bash
curl -X POST http://localhost:5000/api/v1/orders/clx1order12345678/cancel \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

---

## Order Status Flow

```
PENDING
  ├─→ PAYMENT_PENDING
  │     ├─→ CONFIRMED
  │     │     ├─→ SHIPPED
  │     │     │     └─→ DELIVERED ✓
  │     │     └─→ CANCELLED ✗
  │     ├─→ PAYMENT_FAILED
  │     │     ├─→ PAYMENT_PENDING (retry)
  │     │     └─→ CANCELLED ✗
  │     └─→ CANCELLED ✗
  ├─→ CONFIRMED
  │     ├─→ SHIPPED
  │     │     └─→ DELIVERED ✓
  │     └─→ CANCELLED ✗
  └─→ CANCELLED ✗
```

## Order Lifecycle Events

1. **Order Created** → Status: `PENDING`

   - Cart validated for stock availability
   - Order total calculated
   - Product quantities reduced
   - Cart cleared

2. **Payment Initiated** → Status: `PAYMENT_PENDING`

   - User redirected to payment gateway
   - Order held pending payment

3. **Payment Completed** → Status: `CONFIRMED`

   - Payment successful
   - Salon notified to prepare order

4. **Order Shipped** → Status: `SHIPPED`

   - Salon marks order as shipped
   - User notified with tracking info

5. **Order Delivered** → Status: `DELIVERED`

   - Order successfully delivered
   - Final status

6. **Payment Failed** → Status: `PAYMENT_FAILED`

   - Payment processing failed
   - User can retry or cancel

7. **Order Cancelled** → Status: `CANCELLED`
   - User or salon cancelled order
   - Product quantities restored
   - Refund initiated if payment was made

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
  "message": "Unauthorized: You do not have access to this order"
}
```

```json
{
  "message": "Unauthorized: Only salon owner can update order status"
}
```

**404 Not Found:**

```json
{
  "message": "Order not found"
}
```

**400 Bad Request:**

```json
{
  "message": "Cart validation failed: Insufficient stock for Product Name"
}
```

```json
{
  "message": "Invalid status transition from CONFIRMED to PENDING"
}
```

**500 Internal Server Error:**

```json
{
  "message": "Failed to create order",
  "error": "Error details"
}
```

---

## Complete Order Flow Example

### 1. User adds products to cart

```bash
POST /api/v1/cart/items
```

### 2. User reviews cart

```bash
GET /api/v1/cart
```

### 3. User creates/selects shipping address

```bash
POST /api/v1/addresses
# or
GET /api/v1/addresses
```

### 4. User creates order

```bash
POST /api/v1/orders
{
  "addressId": "clx1addr123456789"
}
```

### 5. User views order details

```bash
GET /api/v1/orders/clx1order12345678
```

### 6. Salon owner confirms order

```bash
PATCH /api/v1/orders/clx1order12345678/status
{
  "status": "CONFIRMED"
}
```

### 7. Salon owner ships order

```bash
PATCH /api/v1/orders/clx1order12345678/status
{
  "status": "SHIPPED"
}
```

### 8. Salon owner marks as delivered

```bash
PATCH /api/v1/orders/clx1order12345678/status
{
  "status": "DELIVERED"
}
```

---

## Notes

- **Single Salon Per Order:** All items in an order must be from the same salon
- **Inventory Management:** Product quantities are automatically reduced when order is created
- **Stock Restoration:** Product quantities are restored if order is cancelled
- **Authorization:** Users can only view their own orders; salon owners can view and manage orders from their salon
- **Status Validation:** Invalid status transitions are rejected with descriptive error messages
- **Atomic Operations:** Order creation and cancellation use database transactions to ensure data consistency
