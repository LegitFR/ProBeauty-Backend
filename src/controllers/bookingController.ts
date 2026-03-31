import type { Request, Response } from 'express';

import type { BookingStatus } from '@/schemas/bookingSchema';
import * as bookingService from '@/services/bookingService';
import { refreshPendingMbwayPayment } from '@/services/ifthenpayService';
import * as paymentService from '@/services/paymentService';

/**
 * Create a new booking
 */
export async function createBooking(req: Request, res: Response): Promise<void> {
  const userId = req.user?.id;
  const { salonId, serviceIds, staffId, staffIds, startTime } = req.body;

  if (!userId) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  const booking = await bookingService.createBooking({
    userId,
    salonId,
    serviceIds,
    staffId: staffId || undefined,
    staffIds: staffIds || undefined,
    startTime,
  });

  res.status(201).json({
    message: 'Booking created successfully',
    data: booking,
  });
}

/**
 * Get all bookings with role-based filtering
 */
export async function getBookings(req: Request, res: Response): Promise<void> {
  const userId = req.user?.id;
  const userRole = req.user?.role;
  const { salonId, staffId, status, startDate, endDate } = req.query;

  if (!userId) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  const filters: {
    userId?: string;
    salonId?: string;
    staffId?: string;
    status?: BookingStatus;
    startDate?: string;
    endDate?: string;
  } = {};

  // Role-based access control
  if (userRole === 'admin') {
    // Admin can see all bookings
    if (salonId) filters.salonId = salonId as string;
    if (staffId) filters.staffId = staffId as string;
  } else if (userRole === 'owner') {
    // Salon owners can only see bookings for their salons
    if (salonId) {
      // Verify the owner owns this salon
      const { prisma } = await import('@/configs/db');
      const salon = await prisma.salon.findFirst({
        where: {
          id: salonId as string,
          ownerId: userId,
        },
      });

      if (!salon) {
        res.status(403).json({ message: 'You do not have access to this salon' });
        return;
      }

      filters.salonId = salonId as string;
    } else {
      // Get all salons owned by this user
      const { prisma } = await import('@/configs/db');
      const salons = await prisma.salon.findMany({
        where: { ownerId: userId },
        select: { id: true },
      });

      if (salons.length === 0) {
        res.status(200).json({
          message: 'No bookings found',
          data: [],
        });
        return;
      }

      // For now, we'll get bookings for the first salon
      // In a real scenario, you might want to iterate through all salons
      filters.salonId = salons[0].id;
    }

    if (staffId) filters.staffId = staffId as string;
  } else if (userRole === 'staff') {
    // Staff can only see their own bookings
    const { prisma } = await import('@/configs/db');
    const staffProfile = await prisma.staff.findFirst({
      where: { userId },
    });

    if (!staffProfile) {
      res.status(404).json({ message: 'Staff profile not found' });
      return;
    }

    filters.staffId = staffProfile.id;
    // Staff can also see bookings without staff assigned (if any)
    // This is handled by the service layer
  } else {
    // Regular users can only see their own bookings
    filters.userId = userId;
  }

  // Apply common filters
  if (status) filters.status = status as BookingStatus;
  if (startDate) filters.startDate = startDate as string;
  if (endDate) filters.endDate = endDate as string;

  const bookings = await bookingService.getBookings(filters);

  res.status(200).json({
    message: 'Bookings retrieved successfully',
    data: bookings,
  });
}

/**
 * Get available time slots
 */
export async function getAvailableSlots(req: Request, res: Response): Promise<void> {
  const { salonId, serviceId, serviceIds: rawServiceIds, staffId, date } = req.query;

  // Normalise serviceId / serviceIds into a string array.
  // Supports: ?serviceId=x  |  ?serviceIds=x  |  ?serviceIds=x,y  |  ?serviceIds=x&serviceIds=y
  const raw = rawServiceIds ?? serviceId;
  let parsedServiceIds: string[];
  if (Array.isArray(raw)) {
    parsedServiceIds = raw as string[];
  } else if (typeof raw === 'string') {
    parsedServiceIds = raw.split(',');
  } else {
    res.status(400).json({ message: 'serviceId or serviceIds is required' });
    return;
  }

  const slots = await bookingService.getAvailableSlots({
    salonId: salonId as string,
    serviceIds: parsedServiceIds,
    staffId: staffId ? (staffId as string) : undefined,
    date: date as string,
  });

  res.status(200).json({
    message: 'Available slots retrieved successfully',
    data: slots,
  });
}

/**
 * Get a specific booking by ID
 */
export async function getBooking(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const userId = req.user?.id;
  const userRole = req.user?.role;

  if (!userId) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  const booking = await bookingService.getBookingById(id);

  if (!booking) {
    res.status(404).json({ message: 'Booking not found' });
    return;
  }

  // Role-based access control
  if (userRole === 'admin') {
    // Admin can see all bookings
  } else if (userRole === 'owner') {
    // Verify the owner owns the salon
    const { prisma } = await import('@/configs/db');
    const salon = await prisma.salon.findFirst({
      where: {
        id: booking.salonId,
        ownerId: userId,
      },
    });

    if (!salon) {
      res.status(403).json({ message: 'Access denied' });
      return;
    }
  } else if (userRole === 'staff') {
    // Verify this booking is assigned to the staff member
    const { prisma } = await import('@/configs/db');
    const staffProfile = await prisma.staff.findFirst({
      where: {
        userId,
      },
    });

    if (!staffProfile) {
      res.status(403).json({ message: 'Access denied' });
      return;
    }

    const bookingStaffIds = Array.isArray((booking as { staffIds?: unknown }).staffIds)
      ? ((booking as { staffIds: string[] }).staffIds as string[])
      : [];

    const isAssigned =
      booking.staffId === staffProfile.id || bookingStaffIds.includes(staffProfile.id);

    if (!isAssigned) {
      res.status(403).json({ message: 'Access denied' });
      return;
    }
  } else {
    // Regular users can only see their own bookings
    if (booking.userId !== userId) {
      res.status(403).json({ message: 'Access denied' });
      return;
    }
  }

  res.status(200).json({
    message: 'Booking retrieved successfully',
    data: booking,
  });
}

/**
 * Update a booking (reschedule or change staff)
 */
export async function updateBooking(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const { startTime, staffId, status } = req.body;
  const userId = req.user?.id;
  const userRole = req.user?.role;

  if (!userId) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  // Get the booking to check permissions
  const existingBooking = await bookingService.getBookingById(id);

  if (!existingBooking) {
    res.status(404).json({ message: 'Booking not found' });
    return;
  }

  // Role-based access control
  if (userRole === 'admin') {
    // Admin can update any booking
  } else if (userRole === 'owner') {
    // Verify the owner owns the salon
    const { prisma } = await import('@/configs/db');
    const salon = await prisma.salon.findFirst({
      where: {
        id: existingBooking.salonId,
        ownerId: userId,
      },
    });

    if (!salon) {
      res.status(403).json({ message: 'Access denied' });
      return;
    }
  } else if (userRole === 'staff') {
    // Staff cannot update bookings, only users and owners
    res.status(403).json({ message: 'Access denied' });
    return;
  } else {
    // Regular users can only update their own bookings
    if (existingBooking.userId !== userId) {
      res.status(403).json({ message: 'Access denied' });
      return;
    }

    // Users cannot change status
    if (status) {
      res.status(403).json({ message: 'Users cannot change booking status' });
      return;
    }
  }

  const updatedBooking = await bookingService.updateBooking(id, {
    startTime,
    staffId,
    status,
  });

  res.status(200).json({
    message: 'Booking updated successfully',
    data: updatedBooking,
  });
}

/**
 * Cancel a booking
 */
export async function cancelBooking(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const userId = req.user?.id;
  const userRole = req.user?.role;

  if (!userId) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  // Get the booking to check permissions
  const existingBooking = await bookingService.getBookingById(id);

  if (!existingBooking) {
    res.status(404).json({ message: 'Booking not found' });
    return;
  }

  // Role-based access control
  if (userRole === 'admin') {
    // Admin can cancel any booking
  } else if (userRole === 'owner') {
    // Verify the owner owns the salon
    const { prisma } = await import('@/configs/db');
    const salon = await prisma.salon.findFirst({
      where: {
        id: existingBooking.salonId,
        ownerId: userId,
      },
    });

    if (!salon) {
      res.status(403).json({ message: 'Access denied' });
      return;
    }
  } else {
    // Regular users can only cancel their own bookings
    if (existingBooking.userId !== userId) {
      res.status(403).json({ message: 'Access denied' });
      return;
    }
  }

  const cancelledBooking = await bookingService.cancelBooking(id);

  res.status(200).json({
    message: 'Booking cancelled successfully',
    data: cancelledBooking,
  });
}

/**
 * Confirm a booking
 */
export async function confirmBooking(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const userId = req.user?.id;
  const userRole = req.user?.role;

  if (!userId) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  // Get the booking to check permissions
  const existingBooking = await bookingService.getBookingById(id);

  if (!existingBooking) {
    res.status(404).json({ message: 'Booking not found' });
    return;
  }

  // Only owners and admins can confirm bookings
  if (userRole === 'admin') {
    // Admin can confirm any booking
  } else if (userRole === 'owner') {
    // Verify the owner owns the salon
    const { prisma } = await import('@/configs/db');
    const salon = await prisma.salon.findFirst({
      where: {
        id: existingBooking.salonId,
        ownerId: userId,
      },
    });

    if (!salon) {
      res.status(403).json({ message: 'Access denied' });
      return;
    }
  } else {
    res.status(403).json({ message: 'Only salon owners can confirm bookings' });
    return;
  }

  const confirmedBooking = await bookingService.confirmBooking(id);

  res.status(200).json({
    message: 'Booking confirmed successfully',
    data: confirmedBooking,
  });
}

/**
 * Mark booking as completed
 */
export async function completeBooking(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const userId = req.user?.id;
  const userRole = req.user?.role;

  if (!userId) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  // Get the booking to check permissions
  const existingBooking = await bookingService.getBookingById(id);

  if (!existingBooking) {
    res.status(404).json({ message: 'Booking not found' });
    return;
  }

  // Only owners and admins can mark bookings as completed
  if (userRole === 'admin') {
    // Admin can complete any booking
  } else if (userRole === 'owner') {
    // Verify the owner owns the salon
    const { prisma } = await import('@/configs/db');
    const salon = await prisma.salon.findFirst({
      where: {
        id: existingBooking.salonId,
        ownerId: userId,
      },
    });

    if (!salon) {
      res.status(403).json({ message: 'Access denied' });
      return;
    }
  } else {
    res.status(403).json({ message: 'Only salon owners can mark bookings as completed' });
    return;
  }

  const completedBooking = await bookingService.completeBooking(id);

  res.status(200).json({
    message: 'Booking marked as completed',
    data: completedBooking,
  });
}

/**
 * Create a new booking with If-Then Pay payment
 * POST /api/v1/bookings/checkout
 */
export async function createBookingWithPayment(req: Request, res: Response): Promise<void> {
  const userId = req.user?.id;

  if (!userId) {
    res.status(401).json({ message: 'User not authenticated' });
    return;
  }

  try {
    const { salonId, serviceIds, staffId, staffIds, startTime, paymentMethod, mobileNumber } =
      req.body;

    const result = await bookingService.createBookingWithPayment(
      userId,
      salonId,
      serviceIds,
      staffId,
      staffIds,
      startTime,
      paymentMethod,
      mobileNumber
    );

    res.status(201).json({
      message: 'Booking created successfully. Complete payment to confirm.',
      data: {
        booking: result.booking,
        payment: result.payment,
      },
    });
  } catch (error) {
    console.error('[Booking Controller] Error creating booking with payment:', error);
    if (error instanceof Error) {
      if (
        error.message.includes('not found') ||
        error.message.includes('does not belong') ||
        error.message.includes('does not work') ||
        error.message.includes('cannot perform')
      ) {
        res.status(400).json({ message: error.message });
        return;
      }
      if (error.message.includes('past') || error.message.includes('conflicts')) {
        res.status(400).json({ message: error.message });
        return;
      }
      if (error.message.includes('migration not applied') || error.message.includes('column')) {
        res.status(500).json({
          message: 'Database configuration error',
          error: error.message,
        });
        return;
      }
      res.status(500).json({
        message: 'Failed to create booking',
        error: error.message,
      });
    } else {
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}

/**
 * Get payment details for a booking
 * GET /api/v1/bookings/:id/payment
 */
export async function getBookingPayment(req: Request, res: Response): Promise<void> {
  const userId = req.user?.id;
  const { id } = req.params;

  if (!userId) {
    res.status(401).json({ message: 'User not authenticated' });
    return;
  }

  try {
    // Verify booking exists and user has access
    const booking = await bookingService.getBookingById(id);

    if (!booking) {
      res.status(404).json({ message: 'Booking not found' });
      return;
    }

    // Check if user owns the booking
    if (booking.userId !== userId) {
      res.status(403).json({ message: 'Access denied' });
      return;
    }

    // Get payments for this booking
    const payments = await paymentService.getPaymentsByBookingId(id);
    const refreshedPayments = await Promise.all(
      payments.map((payment) => refreshPendingMbwayPayment(payment))
    );

    res.status(200).json({
      message: 'Payment details retrieved successfully',
      data: refreshedPayments,
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({
        message: 'Failed to retrieve payment details',
        error: error.message,
      });
    } else {
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}
