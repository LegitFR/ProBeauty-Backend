import * as notificationService from '@/services/notificationService';
import { NotificationEvents, notificationEmitter } from '@/utils/eventEmitter';

notificationEmitter.on(
  NotificationEvents.BOOKING_CREATED,
  async (data: {
    userId: string;
    bookingId: string;
    salonName: string;
    serviceName: string;
    startTime: Date;
  }) => {
    await notificationService.sendToUser(data.userId, {
      title: 'Booking Created',
      message: `Your appointment for ${data.serviceName} at ${data.salonName} is created`,
      type: 'booking',
      data: { bookingId: data.bookingId, action: 'VIEW_BOOKING', screen: 'BookingDetails' },
    });
  }
);

notificationEmitter.on(
  NotificationEvents.BOOKING_RESCHEDULED,
  async (data: { userId: string; bookingId: string; salonName: string; newStartTime: Date }) => {
    await notificationService.sendToUser(data.userId, {
      title: 'Booking Rescheduled',
      message: `Your appointment at ${data.salonName} has been rescheduled`,
      type: 'booking',
      data: { bookingId: data.bookingId, action: 'VIEW_BOOKING', screen: 'BookingDetails' },
    });
  }
);

notificationEmitter.on(
  NotificationEvents.BOOKING_CANCELLED,
  async (data: { userId: string; bookingId: string; salonName: string }) => {
    await notificationService.sendToUser(data.userId, {
      title: 'Booking Cancelled',
      message: `Your appointment at ${data.salonName} has been cancelled`,
      type: 'booking',
      data: { bookingId: data.bookingId, action: 'VIEW_BOOKING', screen: 'BookingDetails' },
    });
  }
);

notificationEmitter.on(
  NotificationEvents.BOOKING_COMPLETED,
  async (data: { userId: string; bookingId: string; salonName: string }) => {
    await notificationService.sendToUser(data.userId, {
      title: 'Booking Completed',
      message: `Your appointment at ${data.salonName} has been completed`,
      type: 'booking',
      data: { bookingId: data.bookingId, action: 'VIEW_BOOKING', screen: 'BookingDetails' },
    });
  }
);

notificationEmitter.on(
  NotificationEvents.ORDER_CREATED,
  async (data: { userId: string; orderId: string; total: string; salonName: string }) => {
    await notificationService.sendToUser(data.userId, {
      title: 'Order Placed',
      message: `Your order of ₹${data.total} from ${data.salonName} has been placed`,
      type: 'order',
      data: { orderId: data.orderId, action: 'VIEW_ORDER', screen: 'OrderDetails' },
    });
  }
);

notificationEmitter.on(
  NotificationEvents.ORDER_STATUS_CHANGED,
  async (data: { userId: string; orderId: string; status: string; salonName: string }) => {
    await notificationService.sendToUser(data.userId, {
      title: 'Order Status Updated',
      message: `Your order from ${data.salonName} is now ${data.status}`,
      type: 'order',
      data: { orderId: data.orderId, action: 'VIEW_ORDER', screen: 'OrderDetails' },
    });
  }
);

notificationEmitter.on(
  NotificationEvents.ORDER_CANCELLED,
  async (data: { userId: string; orderId: string; salonName: string }) => {
    await notificationService.sendToUser(data.userId, {
      title: 'Order Cancelled',
      message: `Your order from ${data.salonName} has been cancelled`,
      type: 'order',
      data: { orderId: data.orderId, action: 'VIEW_ORDER', screen: 'OrderDetails' },
    });
  }
);
