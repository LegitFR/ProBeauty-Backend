import { Router } from 'express';

import {
  createBooking,
  getBookings,
  getAvailableSlots,
  getBooking,
  updateBooking,
  cancelBooking,
  confirmBooking,
  completeBooking,
} from '@/controllers/bookingController';
import { authenticate } from '@/middlewares/auth/authenticate';
import { validateRequest } from '@/middlewares/validateRequest';
import {
  createBookingSchema,
  updateBookingSchema,
  bookingIdParamsSchema,
  availabilityQuerySchema,
  getBookingsQuerySchema,
} from '@/schemas/bookingSchema';

const router = Router();

// Create a new booking (authenticated users)
router.post('/', authenticate, validateRequest({ body: createBookingSchema }), createBooking);

// Get all bookings (role-based filtering)
router.get('/', authenticate, validateRequest({ query: getBookingsQuerySchema }), getBookings);

// Get available time slots (public or authenticated)
router.get('/availability', validateRequest({ query: availabilityQuerySchema }), getAvailableSlots);

// Get a specific booking by ID
router.get('/:id', authenticate, validateRequest({ params: bookingIdParamsSchema }), getBooking);

// Update a booking (reschedule or change staff)
router.put(
  '/:id',
  authenticate,
  validateRequest({ params: bookingIdParamsSchema, body: updateBookingSchema }),
  updateBooking
);

// Cancel a booking
router.delete(
  '/:id',
  authenticate,
  validateRequest({ params: bookingIdParamsSchema }),
  cancelBooking
);

// Confirm a booking (salon owner or admin only)
router.post(
  '/:id/confirm',
  authenticate,
  validateRequest({ params: bookingIdParamsSchema }),
  confirmBooking
);

// Mark booking as completed (salon owner or admin only)
router.post(
  '/:id/complete',
  authenticate,
  validateRequest({ params: bookingIdParamsSchema }),
  completeBooking
);

export default router;
