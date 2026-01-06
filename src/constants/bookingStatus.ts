/**
 * Booking Status Constants
 *
 * Defines the lifecycle states for bookings in the system.
 * Bookings progress through these states from creation to completion.
 */

export const BOOKING_STATUS = {
  PENDING: 'PENDING',
  PAYMENT_PENDING: 'PAYMENT_PENDING',
  PAYMENT_FAILED: 'PAYMENT_FAILED',
  CONFIRMED: 'CONFIRMED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  NO_SHOW: 'NO_SHOW',
} as const;

export type BookingStatus = (typeof BOOKING_STATUS)[keyof typeof BOOKING_STATUS];

/**
 * Valid booking status transitions
 * Defines which status changes are allowed
 */
export const BOOKING_STATUS_TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  [BOOKING_STATUS.PENDING]: [
    BOOKING_STATUS.PAYMENT_PENDING,
    BOOKING_STATUS.CONFIRMED,
    BOOKING_STATUS.CANCELLED,
  ],
  [BOOKING_STATUS.PAYMENT_PENDING]: [
    BOOKING_STATUS.CONFIRMED,
    BOOKING_STATUS.PAYMENT_FAILED,
    BOOKING_STATUS.CANCELLED,
  ],
  [BOOKING_STATUS.PAYMENT_FAILED]: [BOOKING_STATUS.PAYMENT_PENDING, BOOKING_STATUS.CANCELLED],
  [BOOKING_STATUS.CONFIRMED]: [
    BOOKING_STATUS.COMPLETED,
    BOOKING_STATUS.CANCELLED,
    BOOKING_STATUS.NO_SHOW,
  ],
  [BOOKING_STATUS.COMPLETED]: [],
  [BOOKING_STATUS.CANCELLED]: [],
  [BOOKING_STATUS.NO_SHOW]: [],
};

/**
 * Check if a status transition is valid
 */
export function isValidStatusTransition(
  currentStatus: BookingStatus,
  newStatus: BookingStatus
): boolean {
  const allowedTransitions = BOOKING_STATUS_TRANSITIONS[currentStatus];
  return allowedTransitions ? allowedTransitions.includes(newStatus) : false;
}

/**
 * All valid booking statuses as an array
 */
export const ALL_BOOKING_STATUSES = Object.values(BOOKING_STATUS);
