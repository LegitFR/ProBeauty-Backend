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
    try {
      await notificationService.sendToUser(data.userId, {
        title: 'Booking Confirmed',
        message: `Your appointment for ${data.serviceName} at ${data.salonName} is confirmed`,
        type: 'booking',
        data: { bookingId: data.bookingId, action: 'VIEW_BOOKING', screen: 'BookingDetails' },
      });
    } catch (error) {
      console.error('❌ Notification listener error (BOOKING_CREATED):', error);
    }
  }
);

notificationEmitter.on(
  NotificationEvents.BOOKING_CONFIRMED,
  async (data: { userId: string; bookingId: string; salonName: string }) => {
    try {
      await notificationService.sendToUser(data.userId, {
        title: 'Booking Confirmed',
        message: `Your appointment at ${data.salonName} has been confirmed`,
        type: 'booking',
        data: { bookingId: data.bookingId, action: 'VIEW_BOOKING', screen: 'BookingDetails' },
      });
    } catch (error) {
      console.error('❌ Notification listener error (BOOKING_CONFIRMED):', error);
    }
  }
);

notificationEmitter.on(
  NotificationEvents.BOOKING_RESCHEDULED,
  async (data: { userId: string; bookingId: string; salonName: string; newStartTime: Date }) => {
    try {
      await notificationService.sendToUser(data.userId, {
        title: 'Booking Rescheduled',
        message: `Your appointment at ${data.salonName} has been rescheduled`,
        type: 'booking',
        data: { bookingId: data.bookingId, action: 'VIEW_BOOKING', screen: 'BookingDetails' },
      });
    } catch (error) {
      console.error('❌ Notification listener error (BOOKING_RESCHEDULED):', error);
    }
  }
);

notificationEmitter.on(
  NotificationEvents.BOOKING_CANCELLED,
  async (data: { userId: string; bookingId: string; salonName: string }) => {
    try {
      await notificationService.sendToUser(data.userId, {
        title: 'Booking Cancelled',
        message: `Your appointment at ${data.salonName} has been cancelled`,
        type: 'booking',
        data: { bookingId: data.bookingId, action: 'VIEW_BOOKING', screen: 'BookingDetails' },
      });
    } catch (error) {
      console.error('❌ Notification listener error (BOOKING_CANCELLED):', error);
    }
  }
);

notificationEmitter.on(
  NotificationEvents.BOOKING_COMPLETED,
  async (data: { userId: string; bookingId: string; salonName: string }) => {
    try {
      await notificationService.sendToUser(data.userId, {
        title: 'Booking Completed',
        message: `Your appointment at ${data.salonName} has been completed`,
        type: 'booking',
        data: { bookingId: data.bookingId, action: 'VIEW_BOOKING', screen: 'BookingDetails' },
      });
    } catch (error) {
      console.error('❌ Notification listener error (BOOKING_COMPLETED):', error);
    }
  }
);

notificationEmitter.on(
  NotificationEvents.ORDER_CREATED,
  async (data: { userId: string; orderId: string; total: string; salonName: string }) => {
    try {
      await notificationService.sendToUser(data.userId, {
        title: 'Order Placed',
        message: `Your order of ₹${data.total} from ${data.salonName} has been placed`,
        type: 'order',
        data: { orderId: data.orderId, action: 'VIEW_ORDER', screen: 'OrderDetails' },
      });
    } catch (error) {
      console.error('❌ Notification listener error (ORDER_CREATED):', error);
    }
  }
);

notificationEmitter.on(
  NotificationEvents.ORDER_STATUS_CHANGED,
  async (data: { userId: string; orderId: string; status: string; salonName: string }) => {
    try {
      await notificationService.sendToUser(data.userId, {
        title: 'Order Status Updated',
        message: `Your order from ${data.salonName} is now ${data.status}`,
        type: 'order',
        data: { orderId: data.orderId, action: 'VIEW_ORDER', screen: 'OrderDetails' },
      });
    } catch (error) {
      console.error('❌ Notification listener error (ORDER_STATUS_CHANGED):', error);
    }
  }
);

notificationEmitter.on(
  NotificationEvents.ORDER_CANCELLED,
  async (data: { userId: string; orderId: string; salonName: string }) => {
    try {
      await notificationService.sendToUser(data.userId, {
        title: 'Order Cancelled',
        message: `Your order from ${data.salonName} has been cancelled`,
        type: 'order',
        data: { orderId: data.orderId, action: 'VIEW_ORDER', screen: 'OrderDetails' },
      });
    } catch (error) {
      console.error('❌ Notification listener error (ORDER_CANCELLED):', error);
    }
  }
);

notificationEmitter.on(
  NotificationEvents.BOOKING_CONFIRMED,
  async (data: { userId: string; bookingId: string; salonName: string }) => {
    try {
      console.info(`📬 BOOKING_CONFIRMED event received for user: ${data.userId}`);
      await notificationService.sendToUser(data.userId, {
        title: 'Booking Confirmed',
        message: `Your appointment at ${data.salonName} has been confirmed`,
        type: 'booking',
        data: { bookingId: data.bookingId, action: 'VIEW_BOOKING', screen: 'BookingDetails' },
      });
    } catch (error) {
      console.error('❌ Notification listener error (BOOKING_CONFIRMED):', error);
    }
  }
);

notificationEmitter.on(
  NotificationEvents.BOOKING_RESCHEDULED,
  async (data: { userId: string; bookingId: string; salonName: string; newStartTime: Date }) => {
    try {
      console.info(`📬 BOOKING_RESCHEDULED event received for user: ${data.userId}`);
      await notificationService.sendToUser(data.userId, {
        title: 'Booking Rescheduled',
        message: `Your appointment at ${data.salonName} has been rescheduled`,
        type: 'booking',
        data: { bookingId: data.bookingId, action: 'VIEW_BOOKING', screen: 'BookingDetails' },
      });
    } catch (error) {
      console.error('❌ Notification listener error (BOOKING_RESCHEDULED):', error);
    }
  }
);

notificationEmitter.on(
  NotificationEvents.BOOKING_CANCELLED,
  async (data: { userId: string; bookingId: string; salonName: string }) => {
    try {
      console.info(`📬 BOOKING_CANCELLED event received for user: ${data.userId}`);
      await notificationService.sendToUser(data.userId, {
        title: 'Booking Cancelled',
        message: `Your appointment at ${data.salonName} has been cancelled`,
        type: 'booking',
        data: { bookingId: data.bookingId, action: 'VIEW_BOOKING', screen: 'BookingDetails' },
      });
    } catch (error) {
      console.error('❌ Notification listener error (BOOKING_CANCELLED):', error);
    }
  }
);

notificationEmitter.on(
  NotificationEvents.BOOKING_COMPLETED,
  async (data: { userId: string; bookingId: string; salonName: string }) => {
    try {
      console.info(`📬 BOOKING_COMPLETED event received for user: ${data.userId}`);
      await notificationService.sendToUser(data.userId, {
        title: 'Booking Completed',
        message: `Your appointment at ${data.salonName} has been completed`,
        type: 'booking',
        data: { bookingId: data.bookingId, action: 'VIEW_BOOKING', screen: 'BookingDetails' },
      });
    } catch (error) {
      console.error('❌ Notification listener error (BOOKING_COMPLETED):', error);
    }
  }
);

notificationEmitter.on(
  NotificationEvents.ORDER_CREATED,
  async (data: { userId: string; orderId: string; total: string; salonName: string }) => {
    try {
      console.info(`📬 ORDER_CREATED event received for user: ${data.userId}`);
      await notificationService.sendToUser(data.userId, {
        title: 'Order Placed',
        message: `Your order of ₹${data.total} from ${data.salonName} has been placed`,
        type: 'order',
        data: { orderId: data.orderId, action: 'VIEW_ORDER', screen: 'OrderDetails' },
      });
    } catch (error) {
      console.error('❌ Notification listener error (ORDER_CREATED):', error);
    }
  }
);

notificationEmitter.on(
  NotificationEvents.ORDER_STATUS_CHANGED,
  async (data: { userId: string; orderId: string; status: string; salonName: string }) => {
    try {
      console.info(`📬 ORDER_STATUS_CHANGED event received for user: ${data.userId}`);
      await notificationService.sendToUser(data.userId, {
        title: 'Order Status Updated',
        message: `Your order from ${data.salonName} is now ${data.status}`,
        type: 'order',
        data: { orderId: data.orderId, action: 'VIEW_ORDER', screen: 'OrderDetails' },
      });
    } catch (error) {
      console.error('❌ Notification listener error (ORDER_STATUS_CHANGED):', error);
    }
  }
);

notificationEmitter.on(
  NotificationEvents.ORDER_CANCELLED,
  async (data: { userId: string; orderId: string; salonName: string }) => {
    try {
      console.info(`📬 ORDER_CANCELLED event received for user: ${data.userId}`);
      await notificationService.sendToUser(data.userId, {
        title: 'Order Cancelled',
        message: `Your order from ${data.salonName} has been cancelled`,
        type: 'order',
        data: { orderId: data.orderId, action: 'VIEW_ORDER', screen: 'OrderDetails' },
      });
    } catch (error) {
      console.error('❌ Notification listener error (ORDER_CANCELLED):', error);
    }
  }
);

notificationEmitter.on(
  NotificationEvents.BOOKING_CONFIRMED,
  async (data: { userId: string; bookingId: string; salonName: string }) => {
    try {
      console.log(`📬 BOOKING_CONFIRMED event received for user: ${data.userId}`);
      await notificationService.sendToUser(data.userId, {
        title: 'Booking Confirmed',
        message: `Your appointment at ${data.salonName} has been confirmed`,
        type: 'booking',
        data: { bookingId: data.bookingId, action: 'VIEW_BOOKING', screen: 'BookingDetails' },
      });
    } catch (error) {
      console.error('❌ Notification listener error (BOOKING_CONFIRMED):', error);
    }
  }
);

notificationEmitter.on(
  NotificationEvents.BOOKING_RESCHEDULED,
  async (data: { userId: string; bookingId: string; salonName: string; newStartTime: Date }) => {
    try {
      console.log(`📬 BOOKING_RESCHEDULED event received for user: ${data.userId}`);
      await notificationService.sendToUser(data.userId, {
        title: 'Booking Rescheduled',
        message: `Your appointment at ${data.salonName} has been rescheduled`,
        type: 'booking',
        data: { bookingId: data.bookingId, action: 'VIEW_BOOKING', screen: 'BookingDetails' },
      });
    } catch (error) {
      console.error('❌ Notification listener error (BOOKING_RESCHEDULED):', error);
    }
  }
);

notificationEmitter.on(
  NotificationEvents.BOOKING_CANCELLED,
  async (data: { userId: string; bookingId: string; salonName: string }) => {
    try {
      console.log(`📬 BOOKING_CANCELLED event received for user: ${data.userId}`);
      await notificationService.sendToUser(data.userId, {
        title: 'Booking Cancelled',
        message: `Your appointment at ${data.salonName} has been cancelled`,
        type: 'booking',
        data: { bookingId: data.bookingId, action: 'VIEW_BOOKING', screen: 'BookingDetails' },
      });
    } catch (error) {
      console.error('❌ Notification listener error (BOOKING_CANCELLED):', error);
    }
  }
);

notificationEmitter.on(
  NotificationEvents.BOOKING_COMPLETED,
  async (data: { userId: string; bookingId: string; salonName: string }) => {
    try {
      console.log(`📬 BOOKING_COMPLETED event received for user: ${data.userId}`);
      await notificationService.sendToUser(data.userId, {
        title: 'Booking Completed',
        message: `Your appointment at ${data.salonName} has been completed`,
        type: 'booking',
        data: { bookingId: data.bookingId, action: 'VIEW_BOOKING', screen: 'BookingDetails' },
      });
    } catch (error) {
      console.error('❌ Notification listener error (BOOKING_COMPLETED):', error);
    }
  }
);

notificationEmitter.on(
  NotificationEvents.ORDER_CREATED,
  async (data: { userId: string; orderId: string; total: string; salonName: string }) => {
    try {
      console.log(`📬 ORDER_CREATED event received for user: ${data.userId}`);
      await notificationService.sendToUser(data.userId, {
        title: 'Order Placed',
        message: `Your order of ₹${data.total} from ${data.salonName} has been placed`,
        type: 'order',
        data: { orderId: data.orderId, action: 'VIEW_ORDER', screen: 'OrderDetails' },
      });
    } catch (error) {
      console.error('❌ Notification listener error (ORDER_CREATED):', error);
    }
  }
);

notificationEmitter.on(
  NotificationEvents.ORDER_STATUS_CHANGED,
  async (data: { userId: string; orderId: string; status: string; salonName: string }) => {
    try {
      console.log(`📬 ORDER_STATUS_CHANGED event received for user: ${data.userId}`);
      await notificationService.sendToUser(data.userId, {
        title: 'Order Status Updated',
        message: `Your order from ${data.salonName} is now ${data.status}`,
        type: 'order',
        data: { orderId: data.orderId, action: 'VIEW_ORDER', screen: 'OrderDetails' },
      });
    } catch (error) {
      console.error('❌ Notification listener error (ORDER_STATUS_CHANGED):', error);
    }
  }
);

notificationEmitter.on(
  NotificationEvents.ORDER_CANCELLED,
  async (data: { userId: string; orderId: string; salonName: string }) => {
    try {
      console.log(`📬 ORDER_CANCELLED event received for user: ${data.userId}`);
      await notificationService.sendToUser(data.userId, {
        title: 'Order Cancelled',
        message: `Your order from ${data.salonName} has been cancelled`,
        type: 'order',
        data: { orderId: data.orderId, action: 'VIEW_ORDER', screen: 'OrderDetails' },
      });
    } catch (error) {
      console.error('❌ Notification listener error (ORDER_CANCELLED):', error);
    }
  }
);
