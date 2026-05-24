import type { NextFunction, Request, Response } from 'express';

import { type OrderStatus } from '@/constants/orderStatus';
import { refreshPendingMbwayPayment } from '@/services/ifthenpayService';
import * as orderService from '@/services/orderService';
import * as paymentService from '@/services/paymentService';

export async function createOrderWithPayment(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const userId = req.user?.id;

  if (!userId) {
    res.status(401).json({ success: false, message: 'Authentication required' });
    return;
  }

  try {
    const { addressId, paymentMethod, mobileNumber } = req.body;

    const result = await orderService.createOrderWithPayment(
      userId,
      addressId,
      paymentMethod,
      mobileNumber
    );

    res.status(201).json({
      success: true,
      message: 'Order created. Complete payment to confirm.',
      data: {
        order: result.order,
        payment: result.payment,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getOrderPayment(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const userId = req.user?.id;
  const { id: orderId } = req.params;

  if (!userId) {
    res.status(401).json({ success: false, message: 'Authentication required' });
    return;
  }

  try {
    await orderService.getOrderById(orderId, userId);

    const payments = await paymentService.getPaymentsByOrderId(orderId);
    const refreshedPayments = await Promise.all(
      payments.map((payment) => refreshPendingMbwayPayment(payment))
    );

    res.status(200).json({
      success: true,
      message: 'Payment details retrieved successfully',
      data: refreshedPayments,
    });
  } catch (error) {
    next(error);
  }
}

export async function createOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
  const userId = req.user?.id;

  if (!userId) {
    res.status(401).json({ success: false, message: 'Authentication required' });
    return;
  }

  try {
    const { addressId } = req.body;

    const order = await orderService.createOrderFromCart(userId, addressId);

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: order,
    });
  } catch (error) {
    next(error);
  }
}

export async function getOrders(req: Request, res: Response, next: NextFunction): Promise<void> {
  const userId = req.user?.id;

  if (!userId) {
    res.status(401).json({ success: false, message: 'Authentication required' });
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
      success: true,
      message: 'Orders retrieved successfully',
      data: result.orders,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
}

export async function getAllOrdersForAdmin(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const userRole = req.user?.role;

  if (!userRole || (userRole !== 'admin' && userRole !== 'ADMIN')) {
    res.status(403).json({ success: false, message: 'Access denied. Admin role required.' });
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
      success: true,
      message: 'Orders retrieved successfully',
      data: result.orders,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
}

export async function getOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
  const userId = req.user?.id;
  const { id } = req.params;

  if (!userId) {
    res.status(401).json({ success: false, message: 'Authentication required' });
    return;
  }

  try {
    const order = await orderService.getOrderById(id, userId);

    res.status(200).json({
      success: true,
      message: 'Order retrieved successfully',
      data: order,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateOrderStatus(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const userId = req.user?.id;
  const { id } = req.params;

  if (!userId) {
    res.status(401).json({ success: false, message: 'Authentication required' });
    return;
  }

  try {
    const { status } = req.body;

    const order = await orderService.updateOrderStatus(id, userId, status);

    res.status(200).json({
      success: true,
      message: 'Order status updated successfully',
      data: order,
    });
  } catch (error) {
    next(error);
  }
}

export async function cancelOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
  const userId = req.user?.id;
  const { id } = req.params;

  if (!userId) {
    res.status(401).json({ success: false, message: 'Authentication required' });
    return;
  }

  try {
    const order = await orderService.cancelOrder(id, userId);

    res.status(200).json({
      success: true,
      message: 'Order cancelled successfully',
      data: order,
    });
  } catch (error) {
    next(error);
  }
}
