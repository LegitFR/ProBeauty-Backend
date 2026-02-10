import { z } from 'zod';

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
export const createBookingSchema = z
  .object({
    salonId: z.string().cuid('Invalid salon ID'),
    serviceIds: z
      .array(z.string().cuid('Invalid service ID'))
      .min(1, 'At least one service is required'),
    staffId: z.string().cuid('Invalid staff ID').optional(),
    staffIds: z.array(z.string().cuid('Invalid staff ID')).optional(),
    startTime: z.string().datetime('Invalid start time format'),
  })
  .superRefine((data, ctx) => {
    if (!data.staffIds) return;

    if (data.staffIds.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['staffIds'],
        message: 'At least one staff ID is required when staffIds is provided',
      });
      return;
    }

    if (!(data.staffIds.length === 1 || data.staffIds.length === data.serviceIds.length)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['staffIds'],
        message: 'staffIds must contain 1 item or match the number of serviceIds',
      });
    }

    if (data.staffId && data.staffIds[0] !== data.staffId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['staffId'],
        message: 'staffId must match staffIds[0] when both are provided',
      });
    }
  });

// Update booking schema (for rescheduling)
export const updateBookingSchema = z.object({
  startTime: z.string().datetime('Invalid start time format').optional(),
  staffId: z.string().cuid('Invalid staff ID').optional(),
  status: bookingStatusEnum.optional(),
});

// Booking ID params schema
export const bookingIdParamsSchema = z.object({
  id: z.string().cuid('Invalid booking ID'),
});

// Availability query schema
// Validates individual query fields; serviceId/serviceIds normalisation is
// handled in the controller because Express's req.query object does not
// reliably reflect Zod transforms after Object.assign merging.
export const availabilityQuerySchema = z.object({
  salonId: z.string().cuid('Invalid salon ID'),
  serviceId: z.string().cuid('Invalid service ID').optional(),
  serviceIds: z.union([z.string(), z.array(z.string())]).optional(),
  staffId: z.string().cuid('Invalid staff ID').optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
});

// Get bookings query schema
export const getBookingsQuerySchema = z.object({
  salonId: z.string().cuid('Invalid salon ID').optional(),
  staffId: z.string().cuid('Invalid staff ID').optional(),
  status: bookingStatusEnum.optional(),
  startDate: z.string().datetime('Invalid start date format').optional(),
  endDate: z.string().datetime('Invalid end date format').optional(),
});
