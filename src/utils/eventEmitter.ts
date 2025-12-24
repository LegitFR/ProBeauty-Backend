import { EventEmitter } from 'events';

class NotificationEmitter extends EventEmitter {
  private static instance: NotificationEmitter;

  private constructor() {
    super();
    this.setMaxListeners(50);
  }

  static getInstance(): NotificationEmitter {
    if (!NotificationEmitter.instance) {
      NotificationEmitter.instance = new NotificationEmitter();
    }
    return NotificationEmitter.instance;
  }
}

export const notificationEmitter = NotificationEmitter.getInstance();

export const NotificationEvents = {
  BOOKING_CREATED: 'booking.created',
  BOOKING_RESCHEDULED: 'booking.rescheduled',
  BOOKING_CANCELLED: 'booking.cancelled',
  BOOKING_COMPLETED: 'booking.completed',
  BOOKING_CONFIRMED: 'booking.confirmed',
  ORDER_CREATED: 'order.created',
  ORDER_STATUS_CHANGED: 'order.status_changed',
  ORDER_CANCELLED: 'order.cancelled',
} as const;

export interface NotificationEventPayload {
  BOOKING_CREATED: {
    userId: string;
    bookingId: string;
    salonName: string;
    serviceName: string;
    startTime: Date;
  };
  BOOKING_RESCHEDULED: {
    userId: string;
    bookingId: string;
    salonName: string;
    newStartTime: Date;
  };
  BOOKING_CANCELLED: {
    userId: string;
    bookingId: string;
    salonName: string;
  };
  BOOKING_CONFIRMED: {
    userId: string;
    bookingId: string;
    salonName: string;
  };
  BOOKING_COMPLETED: {
    userId: string;
    bookingId: string;
    salonName: string;
  };
  ORDER_CREATED: {
    userId: string;
    orderId: string;
    total: string;
    salonName: string;
  };
  ORDER_STATUS_CHANGED: {
    userId: string;
    orderId: string;
    status: string;
    salonName: string;
  };
  ORDER_CANCELLED: {
    userId: string;
    orderId: string;
    salonName: string;
  };
}
