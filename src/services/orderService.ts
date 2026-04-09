import { Prisma, type Order, type OrderItem, type Product } from '@prisma/client';

import { prisma } from '@/configs/db';
import { ORDER_STATUS, type OrderStatus, isValidStatusTransition } from '@/constants/orderStatus';
import { PAYMENT_STATUS, PAYMENT_PROVIDER } from '@/constants/paymentStatus';
import * as cartService from '@/services/cartService';
import {
  IFTHENPAY_METHOD,
  type IfthenpayCreditCardPaymentSession,
  type IfthenpayMethod,
  type IfthenpayPaymentSession,
  initiateIfthenpayPayment,
} from '@/services/ifthenpayService';
import { NotificationEvents, notificationEmitter } from '@/utils/eventEmitter';
import { generatePaymentReference } from '@/utils/paymentUtils';

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
  payment: IfthenpayPaymentSession;
}

/**
 * Create an order from the user's cart with If-Then Pay CCARD payment.
 */
export async function createOrderWithPayment(
  userId: string,
  addressId: string,
  paymentMethod: IfthenpayMethod = IFTHENPAY_METHOD.CCARD,
  mobileNumber?: string
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

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      email: true,
    },
  });

  if (!user) {
    throw new Error('User not found');
  }

  // Determine salonId: set if all items from one salon, null if multiple salons
  const salonIds = new Set(cart.cartItems.map((item) => item.product.salonId));
  const salonId = salonIds.size === 1 ? cart.cartItems[0].product.salonId : null;

  // Calculate total
  let total = 0;
  for (const item of cart.cartItems) {
    const itemTotal = parseFloat(item.product.price.toString()) * item.quantity;
    total += itemTotal;
  }

  const paymentReference = generatePaymentReference('ord', addressId);

  // Determine final salonId
  let finalSalonId: string | null | undefined = salonId;
  if (!finalSalonId && cart.cartItems.length > 0 && cart.cartItems[0].product.salonId) {
    finalSalonId = cart.cartItems[0].product.salonId;
    console.warn(
      `[Order] Multi-salon order detected but using first salon ${finalSalonId} as fallback. Please apply migration to support true multi-salon orders.`
    );
  }

  // Step 1: Create order + payment record in DB FIRST so the txnId always exists
  // before we call ifthenpay. This ensures the webhook callback can always find the payment.
  const { orderId, paymentId } = await prisma.$transaction(
    async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          userId,
          ...(finalSalonId !== undefined ? { salonId: finalSalonId } : {}),
          total: new Prisma.Decimal(total),
          status: ORDER_STATUS.PAYMENT_PENDING,
        },
      });

      for (const cartItem of cart.cartItems) {
        await tx.orderItem.create({
          data: {
            orderId: newOrder.id,
            productId: cartItem.productId,
            quantity: cartItem.quantity,
            unitPrice: cartItem.product.price,
          },
        });

        await tx.product.update({
          where: { id: cartItem.productId },
          data: { quantity: { decrement: cartItem.quantity } },
        });
      }

      const newPayment = await tx.payment.create({
        data: {
          orderId: newOrder.id,
          provider: PAYMENT_PROVIDER.IFTHENPAY,
          amount: new Prisma.Decimal(total),
          txnId: paymentReference,
          status: PAYMENT_STATUS.PENDING,
          ifthenpayMethod: paymentMethod,
          metadata: {
            checkout: { addressId },
            ...(paymentMethod === IFTHENPAY_METHOD.MBWAY && mobileNumber ? { mobileNumber } : {}),
          } as Prisma.InputJsonValue,
        },
      });

      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

      return { orderId: newOrder.id, paymentId: newPayment.id };
    },
    { maxWait: 10000, timeout: 30000 }
  );

  // Step 2: Call ifthenpay AFTER the DB record is committed
  let paymentSession: IfthenpayPaymentSession;
  try {
    paymentSession = await initiateIfthenpayPayment({
      amount: total,
      orderId: paymentReference,
      entityType: 'order',
      entityId: addressId,
      method: paymentMethod,
      mobileNumber,
      email: user.email,
      description: `Order ${paymentReference}`,
    });
  } catch (error) {
    // Ifthenpay initiation failed — mark order and payment as failed and restore stock
    await prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: orderId },
        data: { status: ORDER_STATUS.PAYMENT_FAILED },
      });
      await tx.payment.update({
        where: { id: paymentId },
        data: { status: PAYMENT_STATUS.FAILED, failureReason: 'Payment initiation failed' },
      });
      for (const cartItem of cart.cartItems) {
        await tx.product.update({
          where: { id: cartItem.productId },
          data: { quantity: { increment: cartItem.quantity } },
        });
      }
    });
    throw error;
  }

  // Step 3: Update payment record with ifthenpay session details
  await prisma.payment.update({
    where: { id: paymentId },
    data: {
      ifthenpayRequestId: paymentSession.requestId,
      ...(paymentSession.method === IFTHENPAY_METHOD.CCARD
        ? { ifthenpayPaymentUrl: (paymentSession as IfthenpayCreditCardPaymentSession).paymentUrl }
        : {}),
      metadata: {
        checkout: { addressId },
        initiation: paymentSession.rawResponse as unknown as Prisma.InputJsonValue,
        ...(paymentSession.method === IFTHENPAY_METHOD.MBWAY
          ? { mobileNumber: paymentSession.mobileNumber }
          : {}),
      } as Prisma.InputJsonValue,
    },
  });

  // Fetch the full order with relations
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      orderItems: {
        include: {
          product: { include: { salon: true } },
        },
      },
      salon: true,
    },
  });

  if (!order) {
    throw new Error('Failed to create order');
  }

  const serializedOrder = JSON.parse(
    JSON.stringify(order, (key, value) => {
      if (value && typeof value === 'object' && value.constructor?.name === 'Decimal') {
        return value.toString();
      }
      return value;
    })
  );

  return {
    order: serializedOrder as OrderWithItems,
    payment: paymentSession,
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

  // Determine salonId: set if all items from one salon, null if multiple salons
  const salonIds = new Set(cart.cartItems.map((item) => item.product.salonId));
  let finalSalonId: string | null | undefined =
    salonIds.size === 1 ? cart.cartItems[0].product.salonId : null;

  // Handle salonId: if null and migration not applied, use first salon as fallback
  if (!finalSalonId && cart.cartItems.length > 0 && cart.cartItems[0].product.salonId) {
    finalSalonId = cart.cartItems[0].product.salonId;
    console.warn(
      `[Order] Multi-salon order detected but using first salon ${finalSalonId} as fallback. Please apply migration to support true multi-salon orders.`
    );
  }

  // Calculate total
  let total = 0;
  for (const item of cart.cartItems) {
    const itemTotal = parseFloat(item.product.price.toString()) * item.quantity;
    total += itemTotal;
  }

  // Create order with items in a transaction (with increased timeout for serverless DB)
  const orderId = await prisma.$transaction(
    async (tx) => {
      // Create order
      const newOrder = await tx.order.create({
        data: {
          userId,
          ...(finalSalonId !== undefined ? { salonId: finalSalonId } : {}),
          total: new Prisma.Decimal(total),
          status: ORDER_STATUS.PENDING,
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

      // Clear the cart
      await tx.cartItem.deleteMany({
        where: { cartId: cart.id },
      });

      // Return just the order ID - fetch full order outside transaction
      return newOrder.id;
    },
    {
      maxWait: 10000, // 10 seconds max wait to acquire connection
      timeout: 30000, // 30 seconds timeout for transaction
    }
  );

  // Fetch the full order with relations OUTSIDE the transaction (avoids timeout)
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      orderItems: {
        include: {
          product: {
            include: {
              salon: true,
            },
          },
        },
      },
      salon: true,
    },
  });

  if (!order) {
    throw new Error('Failed to create order');
  }

  // Get salon names for notification (handle multiple salons)
  // Safely extract salon IDs from order items
  const uniqueSalons = new Set<string>();
  for (const item of order.orderItems) {
    if (item.product?.salonId) {
      uniqueSalons.add(item.product.salonId);
    }
  }

  let salonNameDisplay = 'Unknown Salon';
  if (uniqueSalons.size > 0) {
    const salonNames = await Promise.all(
      Array.from(uniqueSalons).map(async (salonId) => {
        try {
          const salon = await prisma.salon.findUnique({
            where: { id: salonId },
            select: { name: true },
          });
          return salon?.name || 'Unknown Salon';
        } catch (error) {
          console.error(`[Order] Error fetching salon ${salonId}:`, error);
          return 'Unknown Salon';
        }
      })
    );
    salonNameDisplay = salonNames.length === 1 ? salonNames[0] : `${salonNames.length} salons`;
  }

  notificationEmitter.emit(NotificationEvents.ORDER_CREATED, {
    userId: order.userId,
    orderId: order.id,
    total: order.total.toString(),
    salonName: salonNameDisplay,
  });

  // Convert Decimal values to strings for JSON serialization
  const serializedOrder = JSON.parse(
    JSON.stringify(order, (key, value) => {
      // Convert Decimal to string
      if (value && typeof value === 'object' && value.constructor?.name === 'Decimal') {
        return value.toString();
      }
      return value;
    })
  );

  return serializedOrder as OrderWithItems;
}

/**
 * Get a single order by ID
 * Only the order owner or salon owner (of any product in order) can view the order
 */
export async function getOrderById(orderId: string, userId: string): Promise<OrderWithItems> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      orderItems: {
        include: {
          product: {
            include: {
              salon: true,
            },
          },
        },
      },
      salon: true,
    },
  });

  if (!order) {
    throw new Error('Order not found');
  }

  // Check authorization: user must be order owner or owner of any salon with products in order
  const isOrderOwner = order.userId === userId;

  // Check if user owns any salon that has products in this order
  const salonIdsInOrder = new Set(
    order.orderItems.map((item) => item.product.salonId).filter((id): id is string => id !== null)
  );

  let isSalonOwner = false;
  if (salonIdsInOrder.size > 0) {
    const salons = await prisma.salon.findMany({
      where: {
        id: { in: Array.from(salonIdsInOrder) },
        ownerId: userId,
      },
      select: { id: true },
    });
    isSalonOwner = salons.length > 0;
  }

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

  // Filter by salonId through orderItems -> product -> salonId
  if (filters.salonId) {
    where.orderItems = {
      some: {
        product: {
          salonId: filters.salonId,
        },
      },
    };
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
 * Only salon owner (of any product in order) can update order status
 * Validates status transitions
 */
export async function updateOrderStatus(
  orderId: string,
  userId: string,
  newStatus: OrderStatus
): Promise<Order> {
  // Get order with items and products
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      orderItems: {
        include: {
          product: {
            include: {
              salon: true,
            },
          },
        },
      },
      salon: true,
    },
  });

  if (!order) {
    throw new Error('Order not found');
  }

  // Check if user owns any salon that has products in this order
  const salonIdsInOrder = new Set(
    order.orderItems.map((item) => item.product.salonId).filter((id): id is string => id !== null)
  );

  let isSalonOwner = false;
  if (salonIdsInOrder.size > 0) {
    const salons = await prisma.salon.findMany({
      where: {
        id: { in: Array.from(salonIdsInOrder) },
        ownerId: userId,
      },
      select: { id: true },
    });
    isSalonOwner = salons.length > 0;
  }

  if (!isSalonOwner) {
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
    include: {
      orderItems: {
        include: {
          product: {
            include: {
              salon: true,
            },
          },
        },
      },
      salon: true,
    },
  });

  // Get salon names for notification (handle multiple salons)
  const uniqueSalons = new Set(
    updatedOrder.orderItems
      .map((item) => item.product.salonId)
      .filter((id): id is string => id !== null)
  );
  const salonNames = await Promise.all(
    Array.from(uniqueSalons).map(async (salonId) => {
      const salon = await prisma.salon.findUnique({
        where: { id: salonId },
        select: { name: true },
      });
      return salon?.name || 'Unknown Salon';
    })
  );
  const salonNameDisplay = salonNames.length === 1 ? salonNames[0] : `${salonNames.length} salons`;

  notificationEmitter.emit(NotificationEvents.ORDER_STATUS_CHANGED, {
    userId: updatedOrder.userId,
    orderId: updatedOrder.id,
    status: updatedOrder.status,
    salonName: salonNameDisplay,
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

  // Filter by salonId through orderItems -> product -> salonId
  if (filters.salonId) {
    where.orderItems = {
      some: {
        product: {
          salonId: filters.salonId,
        },
      },
    };
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
 * Salon owner (of any product in order) can also cancel
 * Restores product quantities
 */
export async function cancelOrder(orderId: string, userId: string): Promise<Order> {
  // Get order with items and products
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      orderItems: {
        include: {
          product: {
            include: {
              salon: true,
            },
          },
        },
      },
      salon: true,
    },
  });

  if (!order) {
    throw new Error('Order not found');
  }

  // Check authorization
  const isOrderOwner = order.userId === userId;

  // Check if user owns any salon that has products in this order
  const salonIdsInOrder = new Set(
    order.orderItems.map((item) => item.product.salonId).filter((id): id is string => id !== null)
  );

  let isSalonOwner = false;
  if (salonIdsInOrder.size > 0) {
    const salons = await prisma.salon.findMany({
      where: {
        id: { in: Array.from(salonIdsInOrder) },
        ownerId: userId,
      },
      select: { id: true },
    });
    isSalonOwner = salons.length > 0;
  }

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

  // Cancel order and restore quantities in transaction (with increased timeout for serverless DB)
  await prisma.$transaction(
    async (tx) => {
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
      await tx.order.update({
        where: { id: orderId },
        data: { status: ORDER_STATUS.CANCELLED },
      });
    },
    {
      maxWait: 10000,
      timeout: 30000,
    }
  );

  // Fetch the updated order outside transaction
  const cancelledOrder = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      orderItems: {
        include: {
          product: {
            include: {
              salon: true,
            },
          },
        },
      },
      salon: true,
    },
  });

  if (!cancelledOrder) {
    throw new Error('Failed to fetch cancelled order');
  }

  // Get salon names for notification (handle multiple salons)
  const uniqueSalons = new Set(
    cancelledOrder.orderItems
      .map((item) => item.product.salonId)
      .filter((id): id is string => id !== null)
  );
  const salonNames = await Promise.all(
    Array.from(uniqueSalons).map(async (salonId) => {
      const salon = await prisma.salon.findUnique({
        where: { id: salonId },
        select: { name: true },
      });
      return salon?.name || 'Unknown Salon';
    })
  );
  const salonNameDisplay = salonNames.length === 1 ? salonNames[0] : `${salonNames.length} salons`;

  // Emit notification after transaction completes successfully
  notificationEmitter.emit(NotificationEvents.ORDER_CANCELLED, {
    userId: cancelledOrder.userId,
    orderId: cancelledOrder.id,
    salonName: salonNameDisplay,
  });

  return cancelledOrder;
}
