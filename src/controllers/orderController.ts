import type { Request, Response } from 'express';

import { type OrderStatus } from '@/constants/orderStatus';
import * as orderService from '@/services/orderService';
import * as paymentService from '@/services/paymentService';

/**
 * Create a new order with Stripe payment from the user's cart
 * POST /api/v1/orders/checkout
 */
export async function createOrderWithPayment(req: Request, res: Response): Promise<void> {
  const userId = req.user?.id;

  if (!userId) {
    res.status(401).json({ message: 'User not authenticated' });
    return;
  }

  try {
    const { addressId } = req.body;

    const result = await orderService.createOrderWithPayment(userId, addressId);

    res.status(201).json({
      message: 'Order created successfully. Complete payment to confirm.',
      data: {
        order: result.order,
        clientSecret: result.clientSecret,
        paymentIntentId: result.paymentIntentId,
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('Cart validation failed') || error.message === 'Cart is empty') {
        res.status(400).json({ message: error.message });
        return;
      }
      if (error.message === 'Address not found') {
        res.status(404).json({ message: error.message });
        return;
      }
      if (error.message === 'Unauthorized: You do not own this address') {
        res.status(403).json({ message: error.message });
        return;
      }
      res.status(500).json({
        message: 'Failed to create order',
        error: error.message,
      });
    } else {
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}

/**
 * Get payment details for an order
 * GET /api/v1/orders/:id/payment
 */
export async function getOrderPayment(req: Request, res: Response): Promise<void> {
  const userId = req.user?.id;
  const { id: orderId } = req.params;

  if (!userId) {
    res.status(401).json({ message: 'User not authenticated' });
    return;
  }

  try {
    // First verify the user has access to this order
    await orderService.getOrderById(orderId, userId);

    // Get payment details
    const payments = await paymentService.getPaymentsByOrderId(orderId);

    res.status(200).json({
      message: 'Payment details retrieved successfully',
      data: payments,
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Order not found') {
        res.status(404).json({ message: error.message });
        return;
      }
      if (error.message === 'Unauthorized: You do not have access to this order') {
        res.status(403).json({ message: error.message });
        return;
      }
      res.status(500).json({
        message: 'Failed to retrieve payment details',
        error: error.message,
      });
    } else {
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}

/**
 * Create a new order from the user's cart
 * POST /api/v1/orders
 */
export async function createOrder(req: Request, res: Response): Promise<void> {
  const userId = req.user?.id;

  if (!userId) {
    res.status(401).json({ message: 'User not authenticated' });
    return;
  }

  try {
    const { addressId } = req.body;

    const order = await orderService.createOrderFromCart(userId, addressId);

    res.status(201).json({
      message: 'Order created successfully',
      data: order,
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('Cart validation failed') || error.message === 'Cart is empty') {
        res.status(400).json({ message: error.message });
        return;
      }
      if (error.message === 'Address not found') {
        res.status(404).json({ message: error.message });
        return;
      }
      if (error.message === 'Unauthorized: You do not own this address') {
        res.status(403).json({ message: error.message });
        return;
      }
      res.status(500).json({
        message: 'Failed to create order',
        error: error.message,
      });
    } else {
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}

/**
 * Get all orders for the authenticated user
 * GET /api/v1/orders
 */
export async function getOrders(req: Request, res: Response): Promise<void> {
  const userId = req.user?.id;

  if (!userId) {
    res.status(401).json({ message: 'User not authenticated' });
    return;
  }

  try {
    const { page, limit, status, salonId } = req.query;

    const result = await orderService.getOrdersByUser(userId, {
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      status: status as OrderStatus | undefined,
      salonId: salonId as string | undefined,
    });

    res.status(200).json({
      message: 'Orders retrieved successfully',
      data: result.orders,
      pagination: result.pagination,
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({
        message: 'Failed to retrieve orders',
        error: error.message,
      });
    } else {
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}

/**
 * Get all orders (admin only)
 * GET /api/v1/orders/admin
 */
export async function getAllOrdersForAdmin(req: Request, res: Response): Promise<void> {
  const userRole = req.user?.role;

  if (!userRole || (userRole !== 'admin' && userRole !== 'ADMIN')) {
    res.status(403).json({ message: 'Access denied. Admin role required.' });
    return;
  }

  try {
    const { page, limit, status, salonId } = req.query;

    const result = await orderService.getAllOrders({
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      status: status as OrderStatus | undefined,
      salonId: salonId as string | undefined,
    });

    res.status(200).json({
      message: 'Orders retrieved successfully',
      data: result.orders,
      pagination: result.pagination,
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({
        message: 'Failed to retrieve orders',
        error: error.message,
      });
    } else {
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}

/**
 * Get a single order by ID
 * GET /api/v1/orders/:id
 */
export async function getOrder(req: Request, res: Response): Promise<void> {
  const userId = req.user?.id;
  const { id } = req.params;

  if (!userId) {
    res.status(401).json({ message: 'User not authenticated' });
    return;
  }

  try {
    const order = await orderService.getOrderById(id, userId);

    res.status(200).json({
      message: 'Order retrieved successfully',
      data: order,
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Order not found') {
        res.status(404).json({ message: error.message });
        return;
      }
      if (error.message === 'Unauthorized: You do not have access to this order') {
        res.status(403).json({ message: error.message });
        return;
      }
      res.status(500).json({
        message: 'Failed to retrieve order',
        error: error.message,
      });
    } else {
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}

/**
 * Update order status
 * PATCH /api/v1/orders/:id/status
 * Only salon owner can update order status
 */
export async function updateOrderStatus(req: Request, res: Response): Promise<void> {
  const userId = req.user?.id;
  const { id } = req.params;

  if (!userId) {
    res.status(401).json({ message: 'User not authenticated' });
    return;
  }

  try {
    const { status } = req.body;

    const order = await orderService.updateOrderStatus(id, userId, status);

    res.status(200).json({
      message: 'Order status updated successfully',
      data: order,
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Order not found') {
        res.status(404).json({ message: error.message });
        return;
      }
      if (error.message === 'Unauthorized: Only salon owner can update order status') {
        res.status(403).json({ message: error.message });
        return;
      }
      if (error.message.includes('Invalid status transition')) {
        res.status(400).json({ message: error.message });
        return;
      }
      res.status(500).json({
        message: 'Failed to update order status',
        error: error.message,
      });
    } else {
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}

/**
 * Cancel an order
 * POST /api/v1/orders/:id/cancel
 * User can cancel their own order, or salon owner can cancel
 */
export async function cancelOrder(req: Request, res: Response): Promise<void> {
  const userId = req.user?.id;
  const { id } = req.params;

  if (!userId) {
    res.status(401).json({ message: 'User not authenticated' });
    return;
  }

  try {
    const order = await orderService.cancelOrder(id, userId);

    res.status(200).json({
      message: 'Order cancelled successfully',
      data: order,
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Order not found') {
        res.status(404).json({ message: error.message });
        return;
      }
      if (error.message === 'Unauthorized: You cannot cancel this order') {
        res.status(403).json({ message: error.message });
        return;
      }
      if (error.message.includes('Cannot cancel order')) {
        res.status(400).json({ message: error.message });
        return;
      }
      res.status(500).json({
        message: 'Failed to cancel order',
        error: error.message,
      });
    } else {
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}
