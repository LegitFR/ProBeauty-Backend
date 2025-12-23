import { Router } from 'express';

import {
  createOrder,
  getOrders,
  getAllOrdersForAdmin,
  getOrder,
  updateOrderStatus,
  cancelOrder,
} from '@/controllers/orderController';
import { authenticate, authorize } from '@/middlewares/auth/authenticate';
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
 * GET /api/v1/orders/admin
 * Get all orders (admin only)
 */
router.get(
  '/admin',
  authorize(['admin', 'ADMIN']),
  validateRequest({ query: getOrdersQuerySchema }),
  getAllOrdersForAdmin
);

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

export default router;
