import { z, type AnyZodObject } from 'zod';

// Booking status enum
export const bookingStatusEnum = z.enum([
  'PENDING',
  'PAYMENT_PENDING',
  'PAYMENT_FAILED',
  'CONFIRMED',
  'COMPLETED',
  'CANCELLED',
  'NO_SHOW',
]);

export type BookingStatus = z.infer<typeof bookingStatusEnum>;

// Create booking schema
export const createBookingSchema: AnyZodObject = z.object({
  salonId: z.string().cuid('Invalid salon ID'),
  serviceIds: z
    .array(z.string().cuid('Invalid service ID'))
    .min(1, 'At least one service is required'),
  staffId: z.string().cuid('Invalid staff ID').optional(),
  startTime: z.string().datetime('Invalid start time format'),
});

// Update booking schema (for rescheduling)
export const updateBookingSchema: AnyZodObject = z.object({
  startTime: z.string().datetime('Invalid start time format').optional(),
  staffId: z.string().cuid('Invalid staff ID').optional(),
  status: bookingStatusEnum.optional(),
});

// Booking ID params schema
export const bookingIdParamsSchema: AnyZodObject = z.object({
  id: z.string().cuid('Invalid booking ID'),
});

// Availability query schema
export const availabilityQuerySchema: AnyZodObject = z.object({
  salonId: z.string().cuid('Invalid salon ID'),
  serviceIds: z
    .array(z.string().cuid('Invalid service ID'))
    .min(1, 'At least one service is required'),
  staffId: z.string().cuid('Invalid staff ID').optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
});

// Get bookings query schema
export const getBookingsQuerySchema: AnyZodObject = z.object({
  salonId: z.string().cuid('Invalid salon ID').optional(),
  staffId: z.string().cuid('Invalid staff ID').optional(),
  status: bookingStatusEnum.optional(),
  startDate: z.string().datetime('Invalid start date format').optional(),
  endDate: z.string().datetime('Invalid end date format').optional(),
});
