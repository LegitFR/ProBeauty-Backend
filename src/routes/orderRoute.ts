import { Router } from 'express';

import {
  createOrder,
  getOrders,
  getOrder,
  updateOrderStatus,
  cancelOrder,
  createOrderWithPayment,
  getOrderPayment,
} from '@/controllers/orderController';
import { authenticate } from '@/middlewares/auth/authenticate';
import { validateRequest } from '@/middlewares/validateRequest';
import {
  createOrderSchema,
  updateOrderStatusSchema,
  getOrderParamsSchema,
  getOrdersQuerySchema,
} from '@/schemas/orderSchema';

const router = Router();

// All order routes require authentication
router.use(authenticate);

/**
 * POST /api/v1/orders/checkout
 * Create a new order with Stripe payment
 */
router.post('/checkout', validateRequest({ body: createOrderSchema }), createOrderWithPayment);

/**
 * POST /api/v1/orders
 * Create a new order from the user's cart
 */
router.post('/', validateRequest({ body: createOrderSchema }), createOrder);

/**
 * GET /api/v1/orders
 * Get all orders for the authenticated user with pagination and filters
 */
router.get('/', validateRequest({ query: getOrdersQuerySchema }), getOrders);

/**
 * GET /api/v1/orders/:id
 * Get a specific order by ID
 */
router.get('/:id', validateRequest({ params: getOrderParamsSchema }), getOrder);

/**
 * PATCH /api/v1/orders/:id/status
 * Update order status (salon owner only)
 */
router.patch(
  '/:id/status',
  validateRequest({
    params: getOrderParamsSchema,
    body: updateOrderStatusSchema,
  }),
  updateOrderStatus
);

/**
 * POST /api/v1/orders/:id/cancel
 * Cancel an order
 */
router.post('/:id/cancel', validateRequest({ params: getOrderParamsSchema }), cancelOrder);

/**
 * GET /api/v1/orders/:id/payment
 * Get payment details for an order
 */
router.get('/:id/payment', validateRequest({ params: getOrderParamsSchema }), getOrderPayment);

export default router;
