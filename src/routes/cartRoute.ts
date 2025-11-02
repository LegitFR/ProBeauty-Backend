import { Router } from 'express';

import {
  getCart,
  addItemToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
} from '@/controllers/cartController';
import { authenticate } from '@/middlewares/auth/authenticate';
import { validateRequest } from '@/middlewares/validateRequest';
import { addToCartSchema, updateCartItemSchema, cartItemParamsSchema } from '@/schemas/cartSchema';

const router = Router();

// All cart routes require authentication
router.use(authenticate);

/**
 * GET /api/v1/cart
 * Get the current user's cart with all items and totals
 */
router.get('/', getCart);

/**
 * POST /api/v1/cart/items
 * Add an item to the cart
 */
router.post('/items', validateRequest({ body: addToCartSchema }), addItemToCart);

/**
 * PATCH /api/v1/cart/items/:productId
 * Update cart item quantity
 */
router.patch(
  '/items/:productId',
  validateRequest({
    params: cartItemParamsSchema,
    body: updateCartItemSchema,
  }),
  updateCartItem
);

/**
 * DELETE /api/v1/cart/items/:productId
 * Remove an item from the cart
 */
router.delete(
  '/items/:productId',
  validateRequest({ params: cartItemParamsSchema }),
  removeCartItem
);

/**
 * DELETE /api/v1/cart
 * Clear all items from the cart
 */
router.delete('/', clearCart);

export default router;
