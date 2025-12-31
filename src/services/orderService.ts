import { Prisma, type Order, type OrderItem, type Product } from '@prisma/client';

import { prisma } from '@/configs/db';
import { ORDER_STATUS, type OrderStatus, isValidStatusTransition } from '@/constants/orderStatus';
import { PAYMENT_STATUS, PAYMENT_PROVIDER } from '@/constants/paymentStatus';
import * as cartService from '@/services/cartService';
import * as stripeService from '@/services/stripeService';
import { NotificationEvents, notificationEmitter } from '@/utils/eventEmitter';

/**
 * Extended Order with items and product details
 */
interface OrderWithItems extends Order {
  orderItems: (OrderItem & { product: Product })[];
}

/**
 * Interface for order query filters
 */
interface OrderQueryFilters {
  page?: number;
  limit?: number;
  status?: OrderStatus;
  salonId?: string;
}

/**
 * Paginated orders response
 */
interface PaginatedOrders {
  orders: OrderWithItems[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Order with payment intent response
 */
interface OrderWithPayment {
  order: OrderWithItems;
  clientSecret: string;
  paymentIntentId: string;
}

/**
 * Create an order from the user's cart with Stripe payment
 * Validates stock, calculates totals, creates order with items, and initiates Stripe payment
 */
export async function createOrderWithPayment(
  userId: string,
  addressId: string
): Promise<OrderWithPayment> {
  // Validate cart has items and sufficient stock
  const validation = await cartService.validateCartForCheckout(userId);
  if (!validation.valid) {
    throw new Error(`Cart validation failed: ${validation.errors.join(', ')}`);
  }

  // Get cart details
  const { cart } = await cartService.getCartWithDetails(userId);

  if (cart.cartItems.length === 0) {
    throw new Error('Cart is empty');
  }

  // Verify address exists and belongs to user
  const address = await prisma.address.findUnique({
    where: { id: addressId },
  });

  if (!address) {
    throw new Error('Address not found');
  }

  if (address.userId !== userId) {
    throw new Error('Unauthorized: You do not own this address');
  }

  // All items must be from the same salon
  const salonIds = new Set(cart.cartItems.map((item) => item.product.salonId));
  if (salonIds.size > 1) {
    throw new Error('Cart contains items from multiple salons');
  }

  const salonId = cart.cartItems[0].product.salonId;

  // Calculate total
  let total = 0;
  for (const item of cart.cartItems) {
    const itemTotal = parseFloat(item.product.price.toString()) * item.quantity;
    total += itemTotal;
  }

  // Create Stripe PaymentIntent first
  const paymentIntent = await stripeService.createPaymentIntent(total, 'usd', {
    userId,
    addressId,
  });

  // Create order with items in a transaction
  const order = await prisma.$transaction(async (tx) => {
    // Create order with PAYMENT_PENDING status
    const newOrder = await tx.order.create({
      data: {
        userId,
        salonId,
        total: new Prisma.Decimal(total),
        status: ORDER_STATUS.PAYMENT_PENDING,
      },
    });

    // Create order items and reduce product quantities
    for (const cartItem of cart.cartItems) {
      await tx.orderItem.create({
        data: {
          orderId: newOrder.id,
          productId: cartItem.productId,
          quantity: cartItem.quantity,
          unitPrice: cartItem.product.price,
        },
      });

      // Reduce product quantity
      await tx.product.update({
        where: { id: cartItem.productId },
        data: {
          quantity: {
            decrement: cartItem.quantity,
          },
        },
      });
    }

    // Create payment record using transaction client
    await tx.payment.create({
      data: {
        orderId: newOrder.id,
        provider: PAYMENT_PROVIDER.STRIPE,
        amount: new Prisma.Decimal(total),
        txnId: paymentIntent.id,
        status: PAYMENT_STATUS.PENDING,
      },
    });

    // Clear the cart
    await tx.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    // Return order with items
    return tx.order.findUnique({
      where: { id: newOrder.id },
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
        salon: true,
      },
    });
  });

  if (!order) {
    throw new Error('Failed to create order');
  }

  notificationEmitter.emit(NotificationEvents.ORDER_CREATED, {
    userId: order.userId,
    orderId: order.id,
    total: order.total.toString(),
    salonName: order.salon.name,
  });

  if (!paymentIntent.client_secret) {
    throw new Error('PaymentIntent client_secret is missing');
  }

  return {
    order,
    clientSecret: paymentIntent.client_secret,
    paymentIntentId: paymentIntent.id,
  };
}

/**
 * Create an order from the user's cart
 * Validates stock, calculates totals, and creates order with items
 */
export async function createOrderFromCart(
  userId: string,
  addressId: string
): Promise<OrderWithItems> {
  // Validate cart has items and sufficient stock
  const validation = await cartService.validateCartForCheckout(userId);
  if (!validation.valid) {
    throw new Error(`Cart validation failed: ${validation.errors.join(', ')}`);
  }

  // Get cart details
  const { cart } = await cartService.getCartWithDetails(userId);

  if (cart.cartItems.length === 0) {
    throw new Error('Cart is empty');
  }

  // Verify address exists and belongs to user
  const address = await prisma.address.findUnique({
    where: { id: addressId },
  });

  if (!address) {
    throw new Error('Address not found');
  }

  if (address.userId !== userId) {
    throw new Error('Unauthorized: You do not own this address');
  }

  // All items must be from the same salon
  const salonIds = new Set(cart.cartItems.map((item) => item.product.salonId));
  if (salonIds.size > 1) {
    throw new Error('Cart contains items from multiple salons');
  }

  const salonId = cart.cartItems[0].product.salonId;

  // Calculate total
  let total = 0;
  for (const item of cart.cartItems) {
    const itemTotal = parseFloat(item.product.price.toString()) * item.quantity;
    total += itemTotal;
  }

  // Create order with items in a transaction
  const order = await prisma.$transaction(async (tx) => {
    // Create order
    const newOrder = await tx.order.create({
      data: {
        userId,
        salonId,
        total: new Prisma.Decimal(total),
        status: ORDER_STATUS.PENDING,
      },
    });

    // Create order items and reduce product quantities
    for (const cartItem of cart.cartItems) {
      // Create order item
      await tx.orderItem.create({
        data: {
          orderId: newOrder.id,
          productId: cartItem.productId,
          quantity: cartItem.quantity,
          unitPrice: cartItem.product.price,
        },
      });

      // Reduce product quantity
      await tx.product.update({
        where: { id: cartItem.productId },
        data: {
          quantity: {
            decrement: cartItem.quantity,
          },
        },
      });
    }

    // Clear the cart
    await tx.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    // Return order with items
    return tx.order.findUnique({
      where: { id: newOrder.id },
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
        salon: true,
      },
    });
  });

  if (!order) {
    throw new Error('Failed to create order');
  }

  notificationEmitter.emit(NotificationEvents.ORDER_CREATED, {
    userId: order.userId,
    orderId: order.id,
    total: order.total.toString(),
    salonName: order.salon.name,
  });

  return order;
}

/**
 * Get a single order by ID
 * Only the order owner or salon owner can view the order
 */
export async function getOrderById(orderId: string, userId: string): Promise<OrderWithItems> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      orderItems: {
        include: {
          product: true,
        },
      },
      salon: true,
    },
  });

  if (!order) {
    throw new Error('Order not found');
  }

  // Check authorization: user must be order owner or salon owner
  const isOrderOwner = order.userId === userId;
  const isSalonOwner = order.salon.ownerId === userId;

  if (!isOrderOwner && !isSalonOwner) {
    throw new Error('Unauthorized: You do not have access to this order');
  }

  return order;
}

/**
 * Get all orders for a user with pagination and filters
 */
export async function getOrdersByUser(
  userId: string,
  filters: OrderQueryFilters = {}
): Promise<PaginatedOrders> {
  const page = filters.page || 1;
  const limit = filters.limit || 10;
  const skip = (page - 1) * limit;

  // Build where clause
  const where: Prisma.OrderWhereInput = {
    userId,
  };

  if (filters.status) {
    where.status = filters.status;
  }

  if (filters.salonId) {
    where.salonId = filters.salonId;
  }

  // Get total count
  const total = await prisma.order.count({ where });

  // Get orders
  const orders = await prisma.order.findMany({
    where,
    include: {
      orderItems: {
        include: {
          product: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    skip,
    take: limit,
  });

  return {
    orders,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * Update order status
 * Only salon owner can update order status
 * Validates status transitions
 */
export async function updateOrderStatus(
  orderId: string,
  userId: string,
  newStatus: OrderStatus
): Promise<Order> {
  // Get order
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { salon: true },
  });

  if (!order) {
    throw new Error('Order not found');
  }

  // Check if user is salon owner
  if (order.salon.ownerId !== userId) {
    throw new Error('Unauthorized: Only salon owner can update order status');
  }

  // Validate status transition
  const currentStatus = order.status as OrderStatus;
  if (!isValidStatusTransition(currentStatus, newStatus)) {
    throw new Error(`Invalid status transition from ${currentStatus} to ${newStatus}`);
  }

  // Update order status
  const updatedOrder = await prisma.order.update({
    where: { id: orderId },
    data: { status: newStatus },
    include: { salon: true },
  });

  notificationEmitter.emit(NotificationEvents.ORDER_STATUS_CHANGED, {
    userId: updatedOrder.userId,
    orderId: updatedOrder.id,
    status: updatedOrder.status,
    salonName: updatedOrder.salon.name,
  });

  return updatedOrder;
}

/**
 * Get all orders with pagination and filters (admin only)
 */
export async function getAllOrders(filters: OrderQueryFilters = {}): Promise<PaginatedOrders> {
  const page = filters.page || 1;
  const limit = filters.limit || 10;
  const skip = (page - 1) * limit;

  const where: Prisma.OrderWhereInput = {};

  if (filters.status) {
    where.status = filters.status;
  }

  if (filters.salonId) {
    where.salonId = filters.salonId;
  }

  const total = await prisma.order.count({ where });

  const orders = await prisma.order.findMany({
    where,
    include: {
      orderItems: {
        include: {
          product: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    skip,
    take: limit,
  });

  return {
    orders,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * Cancel an order
 * User can cancel their own order if it's not shipped/delivered
 * Restores product quantities
 */
export async function cancelOrder(orderId: string, userId: string): Promise<Order> {
  // Get order
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      orderItems: true,
      salon: true,
    },
  });

  if (!order) {
    throw new Error('Order not found');
  }

  // Check authorization
  const isOrderOwner = order.userId === userId;
  const isSalonOwner = order.salon.ownerId === userId;

  if (!isOrderOwner && !isSalonOwner) {
    throw new Error('Unauthorized: You cannot cancel this order');
  }

  // Check if order can be cancelled
  const currentStatus = order.status as OrderStatus;
  if (
    currentStatus === ORDER_STATUS.SHIPPED ||
    currentStatus === ORDER_STATUS.DELIVERED ||
    currentStatus === ORDER_STATUS.CANCELLED
  ) {
    throw new Error(`Cannot cancel order with status ${currentStatus}`);
  }

  // Cancel order and restore quantities in transaction
  const cancelledOrder = await prisma.$transaction(async (tx) => {
    // Restore product quantities
    for (const item of order.orderItems) {
      await tx.product.update({
        where: { id: item.productId },
        data: {
          quantity: {
            increment: item.quantity,
          },
        },
      });
    }

    // Update order status to cancelled
    return tx.order.update({
      where: { id: orderId },
      data: { status: ORDER_STATUS.CANCELLED },
      include: { salon: true },
    });
  });

  // Emit notification after transaction completes successfully
  notificationEmitter.emit(NotificationEvents.ORDER_CANCELLED, {
    userId: cancelledOrder.userId,
    orderId: cancelledOrder.id,
    salonName: cancelledOrder.salon.name,
  });

  return cancelledOrder;
}
