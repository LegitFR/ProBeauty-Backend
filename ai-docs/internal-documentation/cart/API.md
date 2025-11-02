# Cart API

Shopping cart management endpoints for adding, updating, and removing products before checkout.

---

## Get Cart

**Description:** Retrieve the current user's cart with all items, product details, and calculated totals.

**Endpoint:** `GET /api/v1/cart`

**Authentication:** Required (Bearer token)

**Success Response (200 OK):**
```json
{
  "message": "Cart retrieved successfully",
  "data": {
    "cart": {
      "id": "clx1cart123456789",
      "userId": "clx9876543210abcdefghijk",
      "createdAt": "2025-11-01T10:00:00.000Z",
      "cartItems": [
        {
          "id": "clx1item111111111",
          "cartId": "clx1cart123456789",
          "productId": "clx1prod123456789",
          "quantity": 2,
          "product": {
            "id": "clx1prod123456789",
            "salonId": "clx1salon12345678",
            "title": "Luxury Hair Serum",
            "sku": "HAIR-SER-001",
            "price": "29.99",
            "quantity": 50,
            "images": ["https://example.com/image1.jpg"]
          }
        },
        {
          "id": "clx1item222222222",
          "cartId": "clx1cart123456789",
          "productId": "clx1prod987654321",
          "quantity": 1,
          "product": {
            "id": "clx1prod987654321",
            "salonId": "clx1salon12345678",
            "title": "Moisturizing Cream",
            "sku": "MOIST-CR-002",
            "price": "45.00",
            "quantity": 30,
            "images": ["https://example.com/image2.jpg"]
          }
        }
      ]
    },
    "summary": {
      "totalItems": 3,
      "subtotal": 104.98,
      "itemCount": 2
    }
  }
}
```

**cURL Command:**
```bash
curl -X GET http://localhost:5000/api/v1/cart \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

---

## Add Item to Cart

**Description:** Add a product to the cart. If the product is already in the cart, the quantity will be incremented.

**Endpoint:** `POST /api/v1/cart/items`

**Authentication:** Required (Bearer token)

**Request Body:**
```json
{
  "productId": "clx1prod123456789",
  "quantity": 2
}
```

**Field Validations:**
- `productId`: Valid CUID format
- `quantity`: Positive integer

**Success Response (201 Created):**
```json
{
  "message": "Item added to cart successfully",
  "data": {
    "id": "clx1item111111111",
    "cartId": "clx1cart123456789",
    "productId": "clx1prod123456789",
    "quantity": 2,
    "product": {
      "id": "clx1prod123456789",
      "salonId": "clx1salon12345678",
      "title": "Luxury Hair Serum",
      "sku": "HAIR-SER-001",
      "price": "29.99",
      "quantity": 50,
      "images": ["https://example.com/image1.jpg"]
    }
  }
}
```

**Error Responses:**
- **404 Not Found:** Product doesn't exist
- **400 Bad Request:** Insufficient stock or invalid quantity

```json
{
  "message": "Insufficient stock. Only 5 items available"
}
```

```json
{
  "message": "Cannot add 3 more items. Only 2 more available"
}
```

**cURL Command:**
```bash
curl -X POST http://localhost:5000/api/v1/cart/items \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "clx1prod123456789",
    "quantity": 2
  }'
```

---

## Update Cart Item

**Description:** Update the quantity of a product in the cart.

**Endpoint:** `PATCH /api/v1/cart/items/:productId`

**Authentication:** Required (Bearer token)

**URL Parameters:**
- `productId` (string, required) — Product ID

**Request Body:**
```json
{
  "quantity": 5
}
```

**Field Validations:**
- `quantity`: Positive integer

**Success Response (200 OK):**
```json
{
  "message": "Cart item updated successfully",
  "data": {
    "id": "clx1item111111111",
    "cartId": "clx1cart123456789",
    "productId": "clx1prod123456789",
    "quantity": 5,
    "product": {
      "id": "clx1prod123456789",
      "salonId": "clx1salon12345678",
      "title": "Luxury Hair Serum",
      "sku": "HAIR-SER-001",
      "price": "29.99",
      "quantity": 50,
      "images": ["https://example.com/image1.jpg"]
    }
  }
}
```

**Error Responses:**
- **404 Not Found:** Product not found or item not in cart
- **400 Bad Request:** Insufficient stock

**cURL Command:**
```bash
curl -X PATCH http://localhost:5000/api/v1/cart/items/clx1prod123456789 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "quantity": 5
  }'
```

---

## Remove Item from Cart

**Description:** Remove a specific product from the cart.

**Endpoint:** `DELETE /api/v1/cart/items/:productId`

**Authentication:** Required (Bearer token)

**URL Parameters:**
- `productId` (string, required) — Product ID

**Success Response (200 OK):**
```json
{
  "message": "Item removed from cart successfully"
}
```

**Error Responses:**
- **404 Not Found:** Item not found in cart

**cURL Command:**
```bash
curl -X DELETE http://localhost:5000/api/v1/cart/items/clx1prod123456789 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

---

## Clear Cart

**Description:** Remove all items from the cart.

**Endpoint:** `DELETE /api/v1/cart`

**Authentication:** Required (Bearer token)

**Success Response (200 OK):**
```json
{
  "message": "Cart cleared successfully"
}
```

**cURL Command:**
```bash
curl -X DELETE http://localhost:5000/api/v1/cart \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

---

## Common Error Responses

**401 Unauthorized:**
```json
{
  "message": "User not authenticated"
}
```

**404 Not Found:**
```json
{
  "message": "Product not found"
}
```

```json
{
  "message": "Item not found in cart"
}
```

**400 Bad Request (Insufficient Stock):**
```json
{
  "message": "Insufficient stock. Only 10 items available"
}
```

**400 Bad Request (Validation):**
```json
{
  "success": false,
  "message": "Validation failed in body",
  "errors": [
    {
      "field": "quantity",
      "message": "Quantity must be at least 1"
    }
  ]
}
```

**500 Internal Server Error:**
```json
{
  "message": "Failed to add item to cart",
  "error": "Error details"
}
```

---

## Cart Workflow

1. **Browse Products:** User views products via `/api/v1/products`
2. **Add to Cart:** User adds products via `POST /api/v1/cart/items`
3. **View Cart:** User reviews cart via `GET /api/v1/cart`
4. **Update Quantities:** User adjusts quantities via `PATCH /api/v1/cart/items/:productId`
5. **Remove Items:** User removes unwanted items via `DELETE /api/v1/cart/items/:productId`
6. **Checkout:** User creates order via `POST /api/v1/orders` (see Order API docs)

## Notes

- Cart is automatically created when user first adds an item
- Cart is automatically cleared after successful order creation
- Stock availability is validated on every add/update operation
- All items in cart must be from the same salon to create an order
- Cart totals include all items with their current prices
