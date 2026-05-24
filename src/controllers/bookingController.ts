import type { NextFunction, Request, Response } from 'express';

import type { BookingStatus } from '@/schemas/bookingSchema';
import * as bookingService from '@/services/bookingService';
import { refreshPendingMbwayPayment } from '@/services/ifthenpayService';
import * as paymentService from '@/services/paymentService';

export async function createBooking(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const userId = req.user?.id;
  const { salonId, serviceIds, staffId, staffIds, startTime } = req.body;

  if (!userId) {
    res.status(401).json({ success: false, message: 'Authentication required' });
    return;
  }

  try {
    const booking = await bookingService.createBooking({
      userId,
      salonId,
      serviceIds,
      staffId: staffId || undefined,
      staffIds: staffIds || undefined,
      startTime,
    });

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: booking,
    });
  } catch (error) {
    next(error);
  }
}

export async function getBookings(req: Request, res: Response, next: NextFunction): Promise<void> {
  const userId = req.user?.id;
  const userRole = req.user?.role;
  const { salonId, staffId, status, startDate, endDate } = req.query;

  if (!userId) {
    res.status(401).json({ success: false, message: 'Authentication required' });
    return;
  }

  try {
    const filters: {
      userId?: string;
      salonId?: string;
      staffId?: string;
      status?: BookingStatus;
      startDate?: string;
      endDate?: string;
    } = {};

    if (userRole === 'admin') {
      if (salonId) filters.salonId = salonId as string;
      if (staffId) filters.staffId = staffId as string;
    } else if (userRole === 'owner') {
      if (salonId) {
        const { prisma } = await import('@/configs/db');
        const salon = await prisma.salon.findFirst({
          where: { id: salonId as string, ownerId: userId },
        });

        if (!salon) {
          res.status(403).json({ success: false, message: 'You do not have access to this salon' });
          return;
        }

        filters.salonId = salonId as string;
      } else {
        const { prisma } = await import('@/configs/db');
        const salons = await prisma.salon.findMany({
          where: { ownerId: userId },
          select: { id: true },
        });

        if (salons.length === 0) {
          res.status(200).json({ success: true, message: 'No bookings found', data: [] });
          return;
        }

        filters.salonId = salons[0].id;
      }

      if (staffId) filters.staffId = staffId as string;
    } else if (userRole === 'staff') {
      const { prisma } = await import('@/configs/db');
      const staffProfile = await prisma.staff.findFirst({ where: { userId } });

      if (!staffProfile) {
        res.status(404).json({ success: false, message: 'Staff profile not found' });
        return;
      }

      filters.staffId = staffProfile.id;
    } else {
      filters.userId = userId;
    }

    if (status) filters.status = status as BookingStatus;
    if (startDate) filters.startDate = startDate as string;
    if (endDate) filters.endDate = endDate as string;

    const bookings = await bookingService.getBookings(filters);

    res.status(200).json({
      success: true,
      message: 'Bookings retrieved successfully',
      data: bookings,
    });
  } catch (error) {
    next(error);
  }
}

export async function getAvailableSlots(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const { salonId, serviceId, serviceIds: rawServiceIds, staffId, date } = req.query;

  const raw = rawServiceIds ?? serviceId;
  let parsedServiceIds: string[];
  if (Array.isArray(raw)) {
    parsedServiceIds = raw as string[];
  } else if (typeof raw === 'string') {
    parsedServiceIds = raw.split(',');
  } else {
    res.status(400).json({ success: false, message: 'serviceId or serviceIds is required' });
    return;
  }

  try {
    const slots = await bookingService.getAvailableSlots({
      salonId: salonId as string,
      serviceIds: parsedServiceIds,
      staffId: staffId ? (staffId as string) : undefined,
      date: date as string,
    });

    res.status(200).json({
      success: true,
      message: 'Available slots retrieved successfully',
      data: slots,
    });
  } catch (error) {
    next(error);
  }
}

export async function getBooking(req: Request, res: Response, next: NextFunction): Promise<void> {
  const { id } = req.params;
  const userId = req.user?.id;
  const userRole = req.user?.role;

  if (!userId) {
    res.status(401).json({ success: false, message: 'Authentication required' });
    return;
  }

  try {
    const booking = await bookingService.getBookingById(id);

    if (!booking) {
      res.status(404).json({ success: false, message: 'Booking not found' });
      return;
    }

    if (userRole === 'admin') {
      // Admin can see all bookings
    } else if (userRole === 'owner') {
      const { prisma } = await import('@/configs/db');
      const salon = await prisma.salon.findFirst({
        where: { id: booking.salonId, ownerId: userId },
      });

      if (!salon) {
        res.status(403).json({ success: false, message: 'You do not have access to this booking' });
        return;
      }
    } else if (userRole === 'staff') {
      const { prisma } = await import('@/configs/db');
      const staffProfile = await prisma.staff.findFirst({ where: { userId } });

      if (!staffProfile) {
        res.status(403).json({ success: false, message: 'Access denied' });
        return;
      }

      const bookingStaffIds = Array.isArray((booking as { staffIds?: unknown }).staffIds)
        ? ((booking as { staffIds: string[] }).staffIds as string[])
        : [];

      const isAssigned =
        booking.staffId === staffProfile.id || bookingStaffIds.includes(staffProfile.id);

      if (!isAssigned) {
        res.status(403).json({ success: false, message: 'Access denied' });
        return;
      }
    } else {
      if (booking.userId !== userId) {
        res.status(403).json({ success: false, message: 'Access denied' });
        return;
      }
    }

    res.status(200).json({
      success: true,
      message: 'Booking retrieved successfully',
      data: booking,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateBooking(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const { id } = req.params;
  const { startTime, staffId, status } = req.body;
  const userId = req.user?.id;
  const userRole = req.user?.role;

  if (!userId) {
    res.status(401).json({ success: false, message: 'Authentication required' });
    return;
  }

  try {
    const existingBooking = await bookingService.getBookingById(id);

    if (!existingBooking) {
      res.status(404).json({ success: false, message: 'Booking not found' });
      return;
    }

    if (userRole === 'admin') {
      // Admin can update any booking
    } else if (userRole === 'owner') {
      const { prisma } = await import('@/configs/db');
      const salon = await prisma.salon.findFirst({
        where: { id: existingBooking.salonId, ownerId: userId },
      });

      if (!salon) {
        res.status(403).json({ success: false, message: 'You do not have access to this booking' });
        return;
      }
    } else if (userRole === 'staff') {
      res.status(403).json({ success: false, message: 'Staff members cannot update bookings' });
      return;
    } else {
      if (existingBooking.userId !== userId) {
        res.status(403).json({ success: false, message: 'Access denied' });
        return;
      }

      if (status) {
        res.status(403).json({ success: false, message: 'Customers cannot change booking status' });
        return;
      }
    }

    const updatedBooking = await bookingService.updateBooking(id, { startTime, staffId, status });

    res.status(200).json({
      success: true,
      message: 'Booking updated successfully',
      data: updatedBooking,
    });
  } catch (error) {
    next(error);
  }
}

export async function cancelBooking(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const { id } = req.params;
  const userId = req.user?.id;
  const userRole = req.user?.role;

  if (!userId) {
    res.status(401).json({ success: false, message: 'Authentication required' });
    return;
  }

  try {
    const existingBooking = await bookingService.getBookingById(id);

    if (!existingBooking) {
      res.status(404).json({ success: false, message: 'Booking not found' });
      return;
    }

    if (userRole === 'admin') {
      // Admin can cancel any booking
    } else if (userRole === 'owner') {
      const { prisma } = await import('@/configs/db');
      const salon = await prisma.salon.findFirst({
        where: { id: existingBooking.salonId, ownerId: userId },
      });

      if (!salon) {
        res.status(403).json({ success: false, message: 'You do not have access to this booking' });
        return;
      }
    } else {
      if (existingBooking.userId !== userId) {
        res.status(403).json({ success: false, message: 'Access denied' });
        return;
      }
    }

    const cancelledBooking = await bookingService.cancelBooking(id);

    res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully',
      data: cancelledBooking,
    });
  } catch (error) {
    next(error);
  }
}

export async function confirmBooking(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const { id } = req.params;
  const userId = req.user?.id;
  const userRole = req.user?.role;

  if (!userId) {
    res.status(401).json({ success: false, message: 'Authentication required' });
    return;
  }

  try {
    const existingBooking = await bookingService.getBookingById(id);

    if (!existingBooking) {
      res.status(404).json({ success: false, message: 'Booking not found' });
      return;
    }

    if (userRole === 'admin') {
      // Admin can confirm any booking
    } else if (userRole === 'owner') {
      const { prisma } = await import('@/configs/db');
      const salon = await prisma.salon.findFirst({
        where: { id: existingBooking.salonId, ownerId: userId },
      });

      if (!salon) {
        res.status(403).json({ success: false, message: 'You do not have access to this booking' });
        return;
      }
    } else {
      res
        .status(403)
        .json({ success: false, message: 'Only salon owners or admins can confirm bookings' });
      return;
    }

    const confirmedBooking = await bookingService.confirmBooking(id);

    res.status(200).json({
      success: true,
      message: 'Booking confirmed successfully',
      data: confirmedBooking,
    });
  } catch (error) {
    next(error);
  }
}

export async function completeBooking(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const { id } = req.params;
  const userId = req.user?.id;
  const userRole = req.user?.role;

  if (!userId) {
    res.status(401).json({ success: false, message: 'Authentication required' });
    return;
  }

  try {
    const existingBooking = await bookingService.getBookingById(id);

    if (!existingBooking) {
      res.status(404).json({ success: false, message: 'Booking not found' });
      return;
    }

    if (userRole === 'admin') {
      // Admin can complete any booking
    } else if (userRole === 'owner') {
      const { prisma } = await import('@/configs/db');
      const salon = await prisma.salon.findFirst({
        where: { id: existingBooking.salonId, ownerId: userId },
      });

      if (!salon) {
        res.status(403).json({ success: false, message: 'You do not have access to this booking' });
        return;
      }
    } else {
      res
        .status(403)
        .json({
          success: false,
          message: 'Only salon owners or admins can mark bookings as completed',
        });
      return;
    }

    const completedBooking = await bookingService.completeBooking(id);

    res.status(200).json({
      success: true,
      message: 'Booking marked as completed',
      data: completedBooking,
    });
  } catch (error) {
    next(error);
  }
}

export async function createBookingWithPayment(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const userId = req.user?.id;

  if (!userId) {
    res.status(401).json({ success: false, message: 'Authentication required' });
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
      success: true,
      message: 'Booking created. Complete payment to confirm.',
      data: {
        booking: result.booking,
        payment: result.payment,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getBookingPayment(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const userId = req.user?.id;
  const { id } = req.params;

  if (!userId) {
    res.status(401).json({ success: false, message: 'Authentication required' });
    return;
  }

  try {
    const booking = await bookingService.getBookingById(id);

    if (!booking) {
      res.status(404).json({ success: false, message: 'Booking not found' });
      return;
    }

    if (booking.userId !== userId) {
      res.status(403).json({ success: false, message: 'Access denied' });
      return;
    }

    const payments = await paymentService.getPaymentsByBookingId(id);
    const refreshedPayments = await Promise.all(
      payments.map((payment) => refreshPendingMbwayPayment(payment))
    );

    res.status(200).json({
      success: true,
      message: 'Payment details retrieved successfully',
      data: refreshedPayments,
    });
  } catch (error) {
    next(error);
  }
}
