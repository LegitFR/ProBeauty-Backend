import { Prisma } from '@prisma/client';

import { prisma } from '@/configs/db';
import { BOOKING_STATUS } from '@/constants/bookingStatus';
import { PAYMENT_PROVIDER, PAYMENT_STATUS } from '@/constants/paymentStatus';
import type { BookingStatus } from '@/schemas/bookingSchema';
import * as stripeService from '@/services/stripeService';
import {
  parseStaffAvailability,
  generateTimeSlots,
  isSlotAvailable,
  checkBookingConflicts,
} from '@/utils/availabilityUtils';
import { NotificationEvents, notificationEmitter } from '@/utils/eventEmitter';

interface CreateBookingData {
  userId: string;
  salonId: string;
  serviceIds: string[];
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
  serviceIds: string[];
  staffId?: string;
  date: string;
}

/**
 * Find all available staff members for services at a specific time
 * @param salonId - The salon ID
 * @param serviceIds - Array of service IDs
 * @param startTime - The requested booking start time
 * @param endTime - The requested booking end time
 * @returns Array of available staff IDs
 */
async function findAvailableStaffForService(
  salonId: string,
  serviceIds: string[],
  startTime: Date,
  endTime: Date
): Promise<string[]> {
  // Find all staff at the salon who can perform ALL the requested services
  // We need to find staff that have all serviceIds in their services
  const staffWithServices = await prisma.staff.findMany({
    where: {
      salonId,
    },
    select: {
      id: true,
      name: true,
      availability: true,
      services: {
        select: {
          serviceId: true,
        },
      },
    },
  });

  // Filter staff who have ALL the requested services
  const staffWithService = staffWithServices.filter((staff) => {
    const staffServiceIds = staff.services.map((s) => s.serviceId);
    return serviceIds.every((serviceId) => staffServiceIds.includes(serviceId));
  });

  if (staffWithService.length === 0) {
    // Check if there are any staff at the salon at all
    const allStaffAtSalon = await prisma.staff.findMany({
      where: { salonId },
      select: { id: true, name: true },
    });

    if (allStaffAtSalon.length === 0) {
      throw new Error(
        'No staff members found at this salon. Please contact the salon to add staff members.'
      );
    }

    // Check if any staff have services assigned
    const staffWithAnyService = await prisma.staff.findMany({
      where: {
        salonId,
        services: {
          some: {},
        },
      },
      select: { id: true, name: true },
    });

    if (staffWithAnyService.length === 0) {
      throw new Error(
        'No staff members have services assigned. Please contact the salon to assign services to staff members.'
      );
    }

    throw new Error(
      'No staff members are assigned to perform this service. Please select a specific staff member or contact the salon.'
    );
  }

  // Get the day boundaries for checking existing bookings
  const dayStart = new Date(startTime);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(startTime);
  dayEnd.setHours(23, 59, 59, 999);

  // Check availability for each staff member
  const availableStaffIds: string[] = [];
  const unavailableReasons: { staffId: string; staffName: string; reason: string }[] = [];

  for (const staff of staffWithService) {
    const staffAvailability = parseStaffAvailability(staff.availability);

    // Check if staff has availability configured
    if (!staffAvailability) {
      unavailableReasons.push({
        staffId: staff.id,
        staffName: staff.name,
        reason: 'No availability schedule configured',
      });
      continue;
    }

    // Get existing bookings for this staff on the same day
    const existingBookings = await prisma.booking.findMany({
      where: {
        staffId: staff.id,
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

    // Check if this staff member is available at the requested time
    const available = isSlotAvailable(startTime, endTime, staffAvailability, existingBookings);

    if (available) {
      availableStaffIds.push(staff.id);
    } else {
      // Determine why staff is unavailable - provide detailed debugging info
      const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      const dayName = days[startTime.getDay()] as keyof typeof staffAvailability;
      const dayAvailability = staffAvailability[dayName];

      // Get the requested time in local format for debugging
      const requestedHour = startTime.getHours();
      const requestedMinute = startTime.getMinutes();
      const requestedTimeStr = `${requestedHour.toString().padStart(2, '0')}:${requestedMinute.toString().padStart(2, '0')}`;

      let reason = 'Not available';
      if (!dayAvailability?.isAvailable) {
        reason = `Not working on ${dayName}`;
      } else if (!dayAvailability.slots || dayAvailability.slots.length === 0) {
        reason = `No availability slots configured for ${dayName}`;
      } else if (existingBookings.length > 0) {
        const conflict = checkBookingConflicts(startTime, endTime, existingBookings);
        if (conflict) {
          reason = `Has conflicting booking at ${conflict.startTime.toISOString()}`;
        } else {
          // Time doesn't fit in any slot
          const slotRanges = dayAvailability.slots.map((s) => `${s.start}-${s.end}`).join(', ');
          reason = `Requested time ${requestedTimeStr} not in available slots: ${slotRanges}`;
        }
      } else {
        // No bookings but time doesn't fit
        const slotRanges = dayAvailability.slots.map((s) => `${s.start}-${s.end}`).join(', ');
        reason = `Requested time ${requestedTimeStr} not in available slots: ${slotRanges}`;
      }

      unavailableReasons.push({
        staffId: staff.id,
        staffName: staff.name,
        reason,
      });
    }
  }

  // If no staff available, provide detailed error message with time slot suggestions
  if (availableStaffIds.length === 0 && unavailableReasons.length > 0) {
    const reasonsSummary = unavailableReasons.map((r) => `${r.staffName}: ${r.reason}`).join('; ');

    // Get service duration to suggest valid time slots
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
      select: { durationMinutes: true },
    });

    // Generate suggested time slots based on availability
    let suggestionText = '';
    if (service && staffWithService.length > 0) {
      const firstStaff = staffWithService[0];
      const staffAvailability = parseStaffAvailability(firstStaff.availability);
      if (staffAvailability) {
        const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        const dayName = days[startTime.getDay()] as keyof typeof staffAvailability;
        const dayAvailability = staffAvailability[dayName];

        if (dayAvailability?.isAvailable && dayAvailability.slots) {
          const suggestedSlots: string[] = [];
          const serviceDurationMinutes = service.durationMinutes;

          for (const slot of dayAvailability.slots) {
            // Parse slot times
            const [slotStartHour, slotStartMin] = slot.start.split(':').map(Number);
            const [slotEndHour, slotEndMin] = slot.end.split(':').map(Number);
            const slotStartMinutes = slotStartHour * 60 + slotStartMin;
            const slotEndMinutes = slotEndHour * 60 + slotEndMin;

            // Generate 30-minute interval suggestions that fit the service duration
            for (
              let currentMinutes = slotStartMinutes;
              currentMinutes + serviceDurationMinutes <= slotEndMinutes;
              currentMinutes += 30
            ) {
              const hours = Math.floor(currentMinutes / 60);
              const mins = currentMinutes % 60;
              const timeStr = `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
              suggestedSlots.push(timeStr);
            }
          }

          if (suggestedSlots.length > 0) {
            // Show first 8 suggestions
            const topSuggestions = suggestedSlots.slice(0, 8);
            suggestionText = ` Suggested available times (for ${service.durationMinutes}-min service): ${topSuggestions.join(', ')}.`;
          }
        }
      }
    }

    throw new Error(
      `No staff members are available at the requested time. Reasons: ${reasonsSummary}.${suggestionText} Please try a different time or select a specific staff member.`
    );
  }

  return availableStaffIds;
}

/**
 * Randomly select a staff member from available staff
 * @param availableStaffIds - Array of available staff IDs
 * @returns A randomly selected staff ID
 */
function selectRandomStaff(availableStaffIds: string[]): string {
  if (availableStaffIds.length === 0) {
    throw new Error('No available staff found');
  }

  // Random selection for staff assignment - safe array index access
  const randomIndex = Math.floor(Math.random() * availableStaffIds.length);
  return availableStaffIds[randomIndex] as string;
}

/**
 * Create a new booking with automatic confirmation
 */
export async function createBooking(data: CreateBookingData) {
  const { userId, salonId, serviceIds, staffId, startTime } = data;

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

  // Verify all services exist and belong to the salon, calculate total duration
  const services = await prisma.service.findMany({
    where: {
      id: { in: serviceIds },
    },
  });

  if (services.length !== serviceIds.length) {
    throw new Error('One or more services not found');
  }

  // Verify all services belong to the salon
  const invalidServices = services.filter((s) => s.salonId !== salonId);
  if (invalidServices.length > 0) {
    throw new Error('One or more services do not belong to the specified salon');
  }

  // Calculate total duration from all services
  const totalDurationMinutes = services.reduce(
    (total, service) => total + service.durationMinutes,
    0
  );

  // Parse dates
  const bookingStartTime = new Date(startTime);
  const bookingEndTime = new Date(bookingStartTime.getTime() + totalDurationMinutes * 60000);

  // Check if booking time is in the past
  if (bookingStartTime < new Date()) {
    throw new Error('Cannot book appointments in the past');
  }

  // Determine the staff to assign
  let assignedStaffId: string | null = null;

  if (staffId) {
    // If staffId is provided, verify staff and check availability
    const staff = await prisma.staff.findUnique({ where: { id: staffId } });
    if (!staff) {
      throw new Error('Staff not found');
    }

    if (staff.salonId !== salonId) {
      throw new Error('Staff does not work at the specified salon');
    }

    // Verify staff can perform ALL the requested services
    const staffServices = await prisma.staffService.findMany({
      where: {
        staffId,
        serviceId: { in: serviceIds },
      },
    });

    if (staffServices.length !== serviceIds.length) {
      throw new Error('Staff cannot perform one or more of the requested services');
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

    assignedStaffId = staffId;
  } else {
    // If no staffId provided, find available staff and randomly assign one
    // findAvailableStaffForService will throw detailed error if no staff available
    const availableStaffIds = await findAvailableStaffForService(
      salonId,
      serviceIds,
      bookingStartTime,
      bookingEndTime
    );

    // Randomly select one available staff member
    assignedStaffId = selectRandomStaff(availableStaffIds);
  }

  // Create the booking with CONFIRMED status
  const booking = await prisma.booking.create({
    data: {
      userId,
      salonId,
      serviceIds,
      staffId: assignedStaffId,
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
          images: true,
          thumbnail: true,
        },
      },
      staff: {
        select: {
          id: true,
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

  // services array is already fetched above, use it
  const serviceNames = services.map((s) => s.title).join(', ');

  notificationEmitter.emit(NotificationEvents.BOOKING_CREATED, {
    userId: booking.userId,
    bookingId: booking.id,
    salonName: booking.salon.name,
    serviceName: serviceNames,
    startTime: booking.startTime,
  });

  // Add services to the response
  return {
    ...booking,
    services: services.map((service) => ({
      id: service.id,
      title: service.title,
      durationMinutes: service.durationMinutes,
      price: service.price,
    })),
  };
}

interface BookingWithPayment {
  booking: Awaited<ReturnType<typeof prisma.booking.findUnique>>;
  clientSecret: string;
  paymentIntentId: string;
}

/**
 * Create a booking with Stripe payment
 * Validates booking data, creates booking with PAYMENT_PENDING status, and initiates Stripe payment
 */
export async function createBookingWithPayment(
  userId: string,
  salonId: string,
  serviceIds: string[],
  staffId: string | undefined,
  startTime: string
): Promise<BookingWithPayment> {
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

  // Verify all services exist and belong to the salon, calculate total duration and price
  const services = await prisma.service.findMany({
    where: {
      id: { in: serviceIds },
    },
  });

  if (services.length !== serviceIds.length) {
    throw new Error('One or more services not found');
  }

  // Verify all services belong to the salon
  const invalidServices = services.filter((s) => s.salonId !== salonId);
  if (invalidServices.length > 0) {
    throw new Error('One or more services do not belong to the specified salon');
  }

  // Calculate total duration and price from all services
  const totalDurationMinutes = services.reduce(
    (total, service) => total + service.durationMinutes,
    0
  );
  const totalPrice = services.reduce(
    (total, service) => total + parseFloat(service.price.toString()),
    0
  );

  // Parse dates
  const bookingStartTime = new Date(startTime);
  const bookingEndTime = new Date(bookingStartTime.getTime() + totalDurationMinutes * 60000);

  // Check if booking time is in the past
  if (bookingStartTime < new Date()) {
    throw new Error('Cannot book appointments in the past');
  }

  // Determine the staff to assign
  let assignedStaffId: string | null = null;

  if (staffId) {
    // If staffId is provided, verify staff and check availability
    const staff = await prisma.staff.findUnique({ where: { id: staffId } });
    if (!staff) {
      throw new Error('Staff not found');
    }

    if (staff.salonId !== salonId) {
      throw new Error('Staff does not work at the specified salon');
    }

    // Verify staff can perform ALL the requested services
    const staffServices = await prisma.staffService.findMany({
      where: {
        staffId,
        serviceId: { in: serviceIds },
      },
    });

    if (staffServices.length !== serviceIds.length) {
      throw new Error('Staff cannot perform one or more of the requested services');
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

    assignedStaffId = staffId;
  } else {
    // If no staffId provided, find available staff and randomly assign one
    const availableStaffIds = await findAvailableStaffForService(
      salonId,
      serviceId,
      bookingStartTime,
      bookingEndTime
    );

    // Randomly select one available staff member
    assignedStaffId = selectRandomStaff(availableStaffIds);
  }

  // Get or create Stripe customer for the user
  const stripeCustomer = await stripeService.getOrCreateCustomer(user.email, user.name, {
    userId: user.id,
  });

  console.info(
    `[Booking] Creating booking for user ${userId} with Stripe customer ${stripeCustomer.id}`
  );

  // Create Stripe PaymentIntent with customer association
  const paymentIntent = await stripeService.createPaymentIntent(
    totalPrice,
    'usd',
    {
      userId,
      salonId,
      serviceIds: serviceIds.join(','),
      ...(assignedStaffId ? { staffId: assignedStaffId } : {}),
    },
    stripeCustomer.id
  );

  // Create booking with PAYMENT_PENDING status in a transaction
  const booking = await prisma.$transaction(async (tx) => {
    // Create booking with PAYMENT_PENDING status
    const newBooking = await tx.booking.create({
      data: {
        userId,
        salonId,
        serviceIds,
        staffId: assignedStaffId,
        startTime: bookingStartTime,
        endTime: bookingEndTime,
        status: BOOKING_STATUS.PAYMENT_PENDING,
      },
    });

    // Create payment record with Stripe customer ID
    try {
      await tx.payment.create({
        data: {
          orderId: null,
          bookingId: newBooking.id,
          provider: PAYMENT_PROVIDER.STRIPE,
          amount: new Prisma.Decimal(totalPrice),
          txnId: paymentIntent.id,
          status: PAYMENT_STATUS.PENDING,
          stripeCustomerId: stripeCustomer.id,
        },
      });
    } catch (error) {
      console.error('[Booking] Error creating payment record:', error);
      // Check if it's a database schema issue
      if (
        error instanceof Error &&
        error.message.includes('column') &&
        error.message.includes('booking_id')
      ) {
        throw new Error(
          'Database migration not applied. Please run: bun run prisma migrate deploy'
        );
      }
      throw error;
    }

    console.info(
      `[Booking] Payment record created for booking ${newBooking.id}, txnId: ${paymentIntent.id}, stripeCustomerId: ${stripeCustomer.id}`
    );

    // Return booking with relations
    return tx.booking.findUnique({
      where: { id: newBooking.id },
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
        staff: {
          select: {
            id: true,
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
  });

  if (!booking) {
    throw new Error('Failed to create booking');
  }

  if (!paymentIntent.client_secret) {
    throw new Error('PaymentIntent client_secret is missing');
  }

  // Add services to the booking response
  const bookingWithServices = {
    ...booking,
    services: services.map((service) => ({
      id: service.id,
      title: service.title,
      durationMinutes: service.durationMinutes,
      price: service.price,
    })),
  };

  return {
    booking: bookingWithServices,
    clientSecret: paymentIntent.client_secret,
    paymentIntentId: paymentIntent.id,
  };
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
          images: true,
          thumbnail: true,
        },
      },
      staff: {
        select: {
          id: true,
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

  if (!booking) {
    return null;
  }

  // Fetch services separately
  const services = await prisma.service.findMany({
    where: { id: { in: booking.serviceIds } },
    select: {
      id: true,
      title: true,
      durationMinutes: true,
      price: true,
    },
  });

  return {
    ...booking,
    services,
  };
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
          images: true,
          thumbnail: true,
        },
      },
      staff: {
        select: {
          id: true,
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

  // Fetch all services for all bookings
  const allServiceIds = bookings.flatMap((b) => b.serviceIds);
  const uniqueServiceIds = [...new Set(allServiceIds)];

  const services = await prisma.service.findMany({
    where: { id: { in: uniqueServiceIds } },
    select: {
      id: true,
      title: true,
      durationMinutes: true,
      price: true,
    },
  });

  // Create a map for quick lookup
  const serviceMap = new Map(services.map((s) => [s.id, s]));

  // Add services to each booking
  const bookingsWithServices = bookings.map((booking) => ({
    ...booking,
    services: booking.serviceIds.map((id) => serviceMap.get(id)).filter(Boolean),
  }));

  return bookingsWithServices;
}

/**
 * Get available time slots for a specific date, services, and optionally staff
 */
export async function getAvailableSlots(query: AvailabilityQuery) {
  const { salonId, serviceIds, staffId, date } = query;

  // Verify salon exists
  const salon = await prisma.salon.findUnique({ where: { id: salonId } });
  if (!salon) {
    throw new Error('Salon not found');
  }

  // Verify all services exist and belong to salon
  const services = await prisma.service.findMany({
    where: {
      id: { in: serviceIds },
    },
  });

  if (services.length !== serviceIds.length) {
    throw new Error('One or more services not found');
  }

  const invalidServices = services.filter((s) => s.salonId !== salonId);
  if (invalidServices.length > 0) {
    throw new Error('One or more services do not belong to the specified salon');
  }

  // Calculate total duration from all services
  const totalDurationMinutes = services.reduce(
    (total, service) => total + service.durationMinutes,
    0
  );

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
  let staffInfo: { id: string } | null = null;

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
      totalDurationMinutes,
      existingBookings
    );
  } else {
    // If no staffId provided, find all staff who can perform ALL the services
    // and generate aggregated slots showing when at least one staff is available
    const staffWithServices = await prisma.staff.findMany({
      where: {
        salonId,
      },
      select: {
        id: true,
        availability: true,
        services: {
          select: {
            serviceId: true,
          },
        },
      },
    });

    // Filter staff who have ALL the requested services
    const staffWithService = staffWithServices.filter((staff) => {
      const staffServiceIds = staff.services.map((s) => s.serviceId);
      return serviceIds.every((serviceId) => staffServiceIds.includes(serviceId));
    });

    // Remove services from the result since we only need id and availability for later logic
    const filteredStaffWithService = staffWithService.map((staff) => ({
      id: staff.id,
      availability: staff.availability,
    }));

    if (filteredStaffWithService.length === 0) {
      slots = [];
    } else {
      // Get day boundaries
      const dayStart = new Date(requestedDate);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(requestedDate);
      dayEnd.setHours(23, 59, 59, 999);

      // Generate slots for each staff member and merge them
      const allSlotsMap = new Map<
        string,
        { startTime: string; endTime: string; available: boolean }
      >();

      for (const staff of filteredStaffWithService) {
        const staffAvailability = parseStaffAvailability(staff.availability);

        // Get existing bookings for this staff on the requested date
        const existingBookings = await prisma.booking.findMany({
          where: {
            staffId: staff.id,
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

        // Generate time slots for this staff member using total duration
        const staffSlots = generateTimeSlots(
          requestedDate,
          staffAvailability,
          totalDurationMinutes,
          existingBookings
        );

        // Merge slots: a slot is available if at least one staff member has it available
        for (const slot of staffSlots) {
          const slotKey = slot.startTime;
          const existingSlot = allSlotsMap.get(slotKey);

          if (!existingSlot) {
            allSlotsMap.set(slotKey, slot);
          } else if (slot.available && !existingSlot.available) {
            // If this staff has it available, mark the slot as available
            existingSlot.available = true;
          }
        }
      }

      // Convert map to array and sort by start time
      slots = Array.from(allSlotsMap.values()).sort((a, b) =>
        a.startTime.localeCompare(b.startTime)
      );
    }
  }

  return {
    date,
    salon: {
      id: salon.id,
      name: salon.name,
    },
    services: services.map((s) => ({
      id: s.id,
      title: s.title,
      durationMinutes: s.durationMinutes,
    })),
    totalDurationMinutes,
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
  });

  if (!existingBooking) {
    throw new Error('Booking not found');
  }

  // Get services for duration calculation
  const existingServices = await prisma.service.findMany({
    where: { id: { in: existingBooking.serviceIds } },
  });

  const existingTotalDuration = existingServices.reduce(
    (total, service) => total + service.durationMinutes,
    0
  );

  // Cannot update cancelled or completed bookings
  if (existingBooking.status === 'CANCELLED' || existingBooking.status === 'COMPLETED') {
    throw new Error(`Cannot update ${existingBooking.status.toLowerCase()} booking`);
  }

  const updateData: {
    startTime?: Date;
    endTime?: Date;
    staffId?: string | null;
    status?: BookingStatus;
  } = {};

  // If rescheduling
  if (startTime) {
    const newStartTime = new Date(startTime);
    const newEndTime = new Date(newStartTime.getTime() + existingTotalDuration * 60000);

    // Check if new time is in the past
    if (newStartTime < new Date()) {
      throw new Error('Cannot reschedule to a time in the past');
    }

    // Determine target staff based on staffId parameter
    // If staffId is explicitly null, find and assign any available staff
    // If staffId is undefined, keep existing staff (if any)
    // If staffId is provided, use that specific staff
    let targetStaffId: string | null = null;

    if (staffId === null) {
      // Explicitly requesting "any staff" - find available staff and randomly assign
      const availableStaffIds = await findAvailableStaffForService(
        existingBooking.salonId,
        existingBooking.serviceIds,
        newStartTime,
        newEndTime
      );

      if (availableStaffIds.length === 0) {
        throw new Error(
          'No staff members are available for this service at the requested time. Please try a different time or select a specific staff member.'
        );
      }

      targetStaffId = selectRandomStaff(availableStaffIds);
      updateData.staffId = targetStaffId;
    } else if (staffId !== undefined) {
      // Specific staff requested
      targetStaffId = staffId;
    } else {
      // Keep existing staff (if any)
      targetStaffId = existingBooking.staffId;
    }

    // Check staff availability if we have a target staff
    if (targetStaffId) {
      // Verify staff can perform ALL the services in the booking
      const staffServices = await prisma.staffService.findMany({
        where: {
          staffId: targetStaffId,
          serviceId: { in: existingBooking.serviceIds },
        },
      });

      if (staffServices.length !== existingBooking.serviceIds.length) {
        throw new Error('Staff cannot perform one or more of the services in this booking');
      }

      // Get staff availability
      const staff = await prisma.staff.findUnique({ where: { id: targetStaffId } });
      if (!staff) {
        throw new Error('Staff not found');
      }

      if (staff.salonId !== existingBooking.salonId) {
        throw new Error('Staff does not work at this salon');
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

  // If changing staff (without rescheduling)
  // Note: If rescheduling with staffId === null, staff assignment is already handled above
  if (staffId !== undefined && !startTime && staffId !== existingBooking.staffId) {
    if (staffId === null) {
      // Removing staff assignment - but we need to check if rescheduling is also happening
      // If not rescheduling, we can't remove staff without a new time
      throw new Error(
        'Cannot remove staff assignment without rescheduling. Please provide a new startTime to find available staff.'
      );
    } else {
      // Assigning or changing staff (without rescheduling)
      // Verify staff can perform ALL the services
      const staffServices = await prisma.staffService.findMany({
        where: {
          staffId,
          serviceId: { in: existingBooking.serviceIds },
        },
      });

      if (staffServices.length !== existingBooking.serviceIds.length) {
        throw new Error('Staff cannot perform one or more of the services in this booking');
      }

      const staff = await prisma.staff.findUnique({ where: { id: staffId } });
      if (!staff) {
        throw new Error('Staff not found');
      }

      if (staff.salonId !== existingBooking.salonId) {
        throw new Error('Staff does not work at this salon');
      }

      // Check if staff is available at the existing booking time
      const staffAvailability = parseStaffAvailability(staff.availability);

      const dayStart = new Date(existingBooking.startTime);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(existingBooking.startTime);
      dayEnd.setHours(23, 59, 59, 999);

      const existingBookings = await prisma.booking.findMany({
        where: {
          staffId,
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

      const available = isSlotAvailable(
        existingBooking.startTime,
        existingBooking.endTime,
        staffAvailability,
        existingBookings
      );

      if (!available) {
        throw new Error('Staff is not available at the current booking time');
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
          images: true,
          thumbnail: true,
        },
      },
      staff: {
        select: {
          id: true,
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

  // Fetch services for the updated booking
  const updatedServices = await prisma.service.findMany({
    where: { id: { in: updatedBooking.serviceIds } },
    select: {
      id: true,
      title: true,
      durationMinutes: true,
      price: true,
    },
  });

  if (startTime && updateData.startTime) {
    notificationEmitter.emit(NotificationEvents.BOOKING_RESCHEDULED, {
      userId: updatedBooking.userId,
      bookingId: updatedBooking.id,
      salonName: updatedBooking.salon.name,
      newStartTime: updateData.startTime,
    });
  }

  return {
    ...updatedBooking,
    services: updatedServices,
  };
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
          images: true,
          thumbnail: true,
        },
      },
      staff: {
        select: {
          id: true,
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

  // Fetch services for the cancelled booking
  const services = await prisma.service.findMany({
    where: { id: { in: updatedBooking.serviceIds } },
    select: {
      id: true,
      title: true,
      durationMinutes: true,
      price: true,
    },
  });

  notificationEmitter.emit(NotificationEvents.BOOKING_CANCELLED, {
    userId: updatedBooking.userId,
    bookingId: updatedBooking.id,
    salonName: updatedBooking.salon.name,
  });

  return {
    ...updatedBooking,
    services,
  };
}

/**
 * Mark booking as completed
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
          images: true,
          thumbnail: true,
        },
      },
      staff: {
        select: {
          id: true,
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

  // Fetch services for the confirmed booking
  const services = await prisma.service.findMany({
    where: { id: { in: updatedBooking.serviceIds } },
    select: {
      id: true,
      title: true,
      durationMinutes: true,
      price: true,
    },
  });

  notificationEmitter.emit(NotificationEvents.BOOKING_CONFIRMED, {
    userId: updatedBooking.userId,
    bookingId: updatedBooking.id,
    salonName: updatedBooking.salon.name,
  });

  return {
    ...updatedBooking,
    services,
  };
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
          images: true,
          thumbnail: true,
        },
      },
      staff: {
        select: {
          id: true,
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

  // Fetch services for the completed booking
  const services = await prisma.service.findMany({
    where: { id: { in: updatedBooking.serviceIds } },
    select: {
      id: true,
      title: true,
      durationMinutes: true,
      price: true,
    },
  });

  notificationEmitter.emit(NotificationEvents.BOOKING_COMPLETED, {
    userId: updatedBooking.userId,
    bookingId: updatedBooking.id,
    salonName: updatedBooking.salon.name,
  });

  return {
    ...updatedBooking,
    services,
  };
}
