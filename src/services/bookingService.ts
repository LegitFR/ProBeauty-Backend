import { prisma } from '@/configs/db';
import type { BookingStatus } from '@/schemas/bookingSchema';
import {
  parseStaffAvailability,
  generateTimeSlots,
  isSlotAvailable,
  checkBookingConflicts,
} from '@/utils/availabilityUtils';

interface CreateBookingData {
  userId: string;
  salonId: string;
  serviceId: string;
  staffId?: string;
  startTime: string;
}

interface UpdateBookingData {
  startTime?: string;
  staffId?: string;
  status?: BookingStatus;
}

interface GetBookingsFilters {
  userId?: string;
  salonId?: string;
  staffId?: string;
  status?: BookingStatus;
  startDate?: string;
  endDate?: string;
}

interface AvailabilityQuery {
  salonId: string;
  serviceId: string;
  staffId?: string;
  date: string;
}

/**
 * Create a new booking with automatic confirmation
 */
export async function createBooking(data: CreateBookingData) {
  const { userId, salonId, serviceId, staffId, startTime } = data;

  // Verify user exists
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new Error('User not found');
  }

  // Verify salon exists
  const salon = await prisma.salon.findUnique({ where: { id: salonId } });
  if (!salon) {
    throw new Error('Salon not found');
  }

  // Verify service exists and get duration
  const service = await prisma.service.findUnique({ where: { id: serviceId } });
  if (!service) {
    throw new Error('Service not found');
  }

  if (service.salonId !== salonId) {
    throw new Error('Service does not belong to the specified salon');
  }

  // Parse dates
  const bookingStartTime = new Date(startTime);
  const bookingEndTime = new Date(bookingStartTime.getTime() + service.durationMinutes * 60000);

  // Check if booking time is in the past
  if (bookingStartTime < new Date()) {
    throw new Error('Cannot book appointments in the past');
  }

  // If staffId is provided, verify staff and check availability
  if (staffId) {
    // Verify staff exists and get availability
    const staff = await prisma.staff.findUnique({ where: { id: staffId } });
    if (!staff) {
      throw new Error('Staff not found');
    }

    if (staff.salonId !== salonId) {
      throw new Error('Staff does not work at the specified salon');
    }

    // Parse staff availability
    const staffAvailability = parseStaffAvailability(staff.availability);

    // Get existing bookings for this staff on the same day
    const dayStart = new Date(bookingStartTime);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(bookingStartTime);
    dayEnd.setHours(23, 59, 59, 999);

    const existingBookings = await prisma.booking.findMany({
      where: {
        staffId,
        startTime: {
          gte: dayStart,
          lte: dayEnd,
        },
        status: {
          notIn: ['CANCELLED', 'NO_SHOW'],
        },
      },
      select: {
        startTime: true,
        endTime: true,
      },
    });

    // Check if slot is available
    const available = isSlotAvailable(
      bookingStartTime,
      bookingEndTime,
      staffAvailability,
      existingBookings
    );

    if (!available) {
      const conflict = checkBookingConflicts(bookingStartTime, bookingEndTime, existingBookings);
      if (conflict) {
        throw new Error(
          `Time slot conflicts with existing booking (${conflict.startTime.toISOString()} - ${conflict.endTime.toISOString()})`
        );
      }
      throw new Error('Staff is not available at the requested time');
    }
  }

  // Create the booking with CONFIRMED status
  const booking = await prisma.booking.create({
    data: {
      userId,
      salonId,
      serviceId,
      staffId: staffId || null,
      startTime: bookingStartTime,
      endTime: bookingEndTime,
      status: 'CONFIRMED',
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      },
      salon: {
        select: {
          id: true,
          name: true,
          address: true,
        },
      },
      service: {
        select: {
          id: true,
          title: true,
          durationMinutes: true,
          price: true,
        },
      },
      staff: {
        select: {
          id: true,
          role: true,
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      },
    },
  });

  return booking;
}

/**
 * Get booking by ID with all relations
 */
export async function getBookingById(id: string) {
  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      },
      salon: {
        select: {
          id: true,
          name: true,
          address: true,
        },
      },
      service: {
        select: {
          id: true,
          title: true,
          durationMinutes: true,
          price: true,
        },
      },
      staff: {
        select: {
          id: true,
          role: true,
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      },
    },
  });

  return booking;
}

/**
 * Get bookings with filters
 */
export async function getBookings(filters: GetBookingsFilters) {
  const { userId, salonId, staffId, status, startDate, endDate } = filters;

  const where: {
    userId?: string;
    salonId?: string;
    staffId?: string;
    status?: BookingStatus;
    startTime?: {
      gte?: Date;
      lte?: Date;
    };
  } = {};

  if (userId) where.userId = userId;
  if (salonId) where.salonId = salonId;
  if (staffId) where.staffId = staffId;
  if (status) where.status = status;

  if (startDate || endDate) {
    where.startTime = {};
    if (startDate) where.startTime.gte = new Date(startDate);
    if (endDate) where.startTime.lte = new Date(endDate);
  }

  const bookings = await prisma.booking.findMany({
    where,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      },
      salon: {
        select: {
          id: true,
          name: true,
          address: true,
        },
      },
      service: {
        select: {
          id: true,
          title: true,
          durationMinutes: true,
          price: true,
        },
      },
      staff: {
        select: {
          id: true,
          role: true,
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      },
    },
    orderBy: {
      startTime: 'asc',
    },
  });

  return bookings;
}

/**
 * Get available time slots for a specific date, service, and optionally staff
 */
export async function getAvailableSlots(query: AvailabilityQuery) {
  const { salonId, serviceId, staffId, date } = query;

  // Verify salon exists
  const salon = await prisma.salon.findUnique({ where: { id: salonId } });
  if (!salon) {
    throw new Error('Salon not found');
  }

  // Verify service exists and belongs to salon
  const service = await prisma.service.findUnique({ where: { id: serviceId } });
  if (!service) {
    throw new Error('Service not found');
  }

  if (service.salonId !== salonId) {
    throw new Error('Service does not belong to the specified salon');
  }

  // Parse requested date
  const requestedDate = new Date(date);
  requestedDate.setHours(0, 0, 0, 0);

  // Check if date is in the past
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (requestedDate < today) {
    throw new Error('Cannot check availability for past dates');
  }

  let slots: { startTime: string; endTime: string; available: boolean }[] = [];
  let staffInfo: { id: string; role: string } | null = null;

  if (staffId) {
    // Verify staff exists and belongs to salon
    const staff = await prisma.staff.findUnique({ where: { id: staffId } });
    if (!staff) {
      throw new Error('Staff not found');
    }

    if (staff.salonId !== salonId) {
      throw new Error('Staff does not work at the specified salon');
    }

    staffInfo = {
      id: staff.id,
      role: staff.role,
    };

    // Parse staff availability
    const staffAvailability = parseStaffAvailability(staff.availability);

    // Get existing bookings for this staff on the requested date
    const dayStart = new Date(requestedDate);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(requestedDate);
    dayEnd.setHours(23, 59, 59, 999);

    const existingBookings = await prisma.booking.findMany({
      where: {
        staffId,
        startTime: {
          gte: dayStart,
          lte: dayEnd,
        },
        status: {
          notIn: ['CANCELLED', 'NO_SHOW'],
        },
      },
      select: {
        startTime: true,
        endTime: true,
      },
    });

    // Generate time slots based on staff availability
    slots = generateTimeSlots(
      requestedDate,
      staffAvailability,
      service.durationMinutes,
      existingBookings
    );
  } else {
    // If no staffId provided, return empty slots
    // Availability checking without staff assignment requires staff selection
    // This can be enhanced later to support salon-level availability
    slots = [];
  }

  return {
    date,
    salon: {
      id: salon.id,
      name: salon.name,
    },
    service: {
      id: service.id,
      title: service.title,
      durationMinutes: service.durationMinutes,
    },
    staff: staffInfo,
    slots,
  };
}

/**
 * Update booking (reschedule or change staff)
 */
export async function updateBooking(id: string, data: UpdateBookingData) {
  const { startTime, staffId, status } = data;

  // Get existing booking
  const existingBooking = await prisma.booking.findUnique({
    where: { id },
    include: {
      service: true,
    },
  });

  if (!existingBooking) {
    throw new Error('Booking not found');
  }

  // Cannot update cancelled or completed bookings
  if (existingBooking.status === 'CANCELLED' || existingBooking.status === 'COMPLETED') {
    throw new Error(`Cannot update ${existingBooking.status.toLowerCase()} booking`);
  }

  const updateData: {
    startTime?: Date;
    endTime?: Date;
    staffId?: string;
    status?: BookingStatus;
  } = {};

  // If rescheduling
  if (startTime) {
    const newStartTime = new Date(startTime);
    const newEndTime = new Date(
      newStartTime.getTime() + existingBooking.service.durationMinutes * 60000
    );

    // Check if new time is in the past
    if (newStartTime < new Date()) {
      throw new Error('Cannot reschedule to a time in the past');
    }

    const targetStaffId = staffId !== undefined ? staffId : existingBooking.staffId;

    // Only check staff availability if staffId is provided or existing booking has staff
    if (targetStaffId) {
      // Get staff availability
      const staff = await prisma.staff.findUnique({ where: { id: targetStaffId } });
      if (!staff) {
        throw new Error('Staff not found');
      }

      const staffAvailability = parseStaffAvailability(staff.availability);

      // Get existing bookings for the target staff (excluding this booking)
      const dayStart = new Date(newStartTime);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(newStartTime);
      dayEnd.setHours(23, 59, 59, 999);

      const existingBookings = await prisma.booking.findMany({
        where: {
          staffId: targetStaffId,
          id: { not: id },
          startTime: {
            gte: dayStart,
            lte: dayEnd,
          },
          status: {
            notIn: ['CANCELLED', 'NO_SHOW'],
          },
        },
        select: {
          startTime: true,
          endTime: true,
        },
      });

      // Check availability
      const available = isSlotAvailable(
        newStartTime,
        newEndTime,
        staffAvailability,
        existingBookings
      );

      if (!available) {
        throw new Error('The requested time slot is not available');
      }
    }

    updateData.startTime = newStartTime;
    updateData.endTime = newEndTime;
  }

  // If changing staff (including removing staff by setting to null)
  if (staffId !== undefined && staffId !== existingBooking.staffId) {
    if (staffId === null) {
      // Removing staff assignment
      updateData.staffId = null;
    } else {
      // Assigning or changing staff
      const staff = await prisma.staff.findUnique({ where: { id: staffId } });
      if (!staff) {
        throw new Error('Staff not found');
      }

      if (staff.salonId !== existingBooking.salonId) {
        throw new Error('Staff does not work at this salon');
      }

      updateData.staffId = staffId;
    }
  }

  // If updating status
  if (status) {
    updateData.status = status;
  }

  // Update the booking
  const updatedBooking = await prisma.booking.update({
    where: { id },
    data: updateData,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      },
      salon: {
        select: {
          id: true,
          name: true,
          address: true,
        },
      },
      service: {
        select: {
          id: true,
          title: true,
          durationMinutes: true,
          price: true,
        },
      },
      staff: {
        select: {
          id: true,
          role: true,
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      },
    },
  });

  return updatedBooking;
}

/**
 * Cancel a booking
 */
export async function cancelBooking(id: string) {
  const booking = await prisma.booking.findUnique({ where: { id } });

  if (!booking) {
    throw new Error('Booking not found');
  }

  if (booking.status === 'CANCELLED') {
    throw new Error('Booking is already cancelled');
  }

  if (booking.status === 'COMPLETED') {
    throw new Error('Cannot cancel a completed booking');
  }

  const updatedBooking = await prisma.booking.update({
    where: { id },
    data: { status: 'CANCELLED' },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      },
      salon: {
        select: {
          id: true,
          name: true,
          address: true,
        },
      },
      service: {
        select: {
          id: true,
          title: true,
          durationMinutes: true,
          price: true,
        },
      },
      staff: {
        select: {
          id: true,
          role: true,
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      },
    },
  });

  return updatedBooking;
}

/**
 * Confirm a booking
 */
export async function confirmBooking(id: string) {
  const booking = await prisma.booking.findUnique({ where: { id } });

  if (!booking) {
    throw new Error('Booking not found');
  }

  if (booking.status === 'CONFIRMED') {
    throw new Error('Booking is already confirmed');
  }

  if (booking.status === 'CANCELLED') {
    throw new Error('Cannot confirm a cancelled booking');
  }

  if (booking.status === 'COMPLETED') {
    throw new Error('Cannot confirm a completed booking');
  }

  const updatedBooking = await prisma.booking.update({
    where: { id },
    data: { status: 'CONFIRMED' },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      },
      salon: {
        select: {
          id: true,
          name: true,
          address: true,
        },
      },
      service: {
        select: {
          id: true,
          title: true,
          durationMinutes: true,
          price: true,
        },
      },
      staff: {
        select: {
          id: true,
          role: true,
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      },
    },
  });

  return updatedBooking;
}

/**
 * Mark booking as completed
 */
export async function completeBooking(id: string) {
  const booking = await prisma.booking.findUnique({ where: { id } });

  if (!booking) {
    throw new Error('Booking not found');
  }

  if (booking.status === 'COMPLETED') {
    throw new Error('Booking is already completed');
  }

  if (booking.status === 'CANCELLED') {
    throw new Error('Cannot complete a cancelled booking');
  }

  const updatedBooking = await prisma.booking.update({
    where: { id },
    data: { status: 'COMPLETED' },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      },
      salon: {
        select: {
          id: true,
          name: true,
          address: true,
        },
      },
      service: {
        select: {
          id: true,
          title: true,
          durationMinutes: true,
          price: true,
        },
      },
      staff: {
        select: {
          id: true,
          role: true,
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      },
    },
  });

  return updatedBooking;
}
