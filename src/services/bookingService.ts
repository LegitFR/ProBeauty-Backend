import { Prisma } from '@prisma/client';

import { prisma } from '@/configs/db';
import { BOOKING_STATUS } from '@/constants/bookingStatus';
import { PAYMENT_PROVIDER, PAYMENT_STATUS } from '@/constants/paymentStatus';
import type { BookingStatus } from '@/schemas/bookingSchema';
import {
  IFTHENPAY_METHOD,
  type IfthenpayMethod,
  type IfthenpayPaymentSession,
  initiateIfthenpayPayment,
} from '@/services/ifthenpayService';
import {
  parseStaffAvailability,
  generateTimeSlots,
  isSlotAvailable,
  checkBookingConflicts,
} from '@/utils/availabilityUtils';
import { NotificationEvents, notificationEmitter } from '@/utils/eventEmitter';
import { generatePaymentReference } from '@/utils/paymentUtils';

interface CreateBookingData {
  userId: string;
  salonId: string;
  serviceIds: string[];
  staffId?: string;
  staffIds?: string[];
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

interface ServiceSegment {
  serviceId: string;
  startTime: Date;
  endTime: Date;
}

interface StaffCandidate {
  id: string;
  name: string;
  availability: unknown;
}

interface BookingTimeRange {
  startTime: Date;
  endTime: Date;
}

interface StaffAvailabilityContext {
  staffByServiceId: Map<string, StaffCandidate[]>;
  bookingsByStaffId: Map<string, BookingTimeRange[]>;
}

function normalizeStaffIds(params: {
  serviceIds: string[];
  staffId?: string;
  staffIds?: string[];
}): string[] | undefined {
  const { serviceIds, staffId, staffIds } = params;

  if (staffIds && staffIds.length > 0) {
    if (staffIds.length === 1) return Array(serviceIds.length).fill(staffIds[0] as string);
    return staffIds;
  }

  if (staffId) {
    return Array(serviceIds.length).fill(staffId);
  }

  return undefined;
}

function bookingStaffWhere(staffId: string) {
  return {
    OR: [{ staffId }, { staffIds: { has: staffId } }],
  } satisfies Prisma.BookingWhereInput;
}

function getDayBounds(date: Date): { dayStart: Date; dayEnd: Date } {
  const dayStart = new Date(date);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(date);
  dayEnd.setHours(23, 59, 59, 999);

  return { dayStart, dayEnd };
}

function buildServiceSegments(
  bookingStartTime: Date,
  orderedServices: { id: string; durationMinutes: number }[]
): ServiceSegment[] {
  const serviceSegments: ServiceSegment[] = [];
  let cursorTime = new Date(bookingStartTime);

  for (const service of orderedServices) {
    const segmentStart = new Date(cursorTime);
    const segmentEnd = new Date(segmentStart.getTime() + service.durationMinutes * 60000);
    serviceSegments.push({ serviceId: service.id, startTime: segmentStart, endTime: segmentEnd });
    cursorTime = segmentEnd;
  }

  return serviceSegments;
}

async function getExistingBookingsForStaff(staffId: string, date: Date) {
  const { dayStart, dayEnd } = getDayBounds(date);

  return prisma.booking.findMany({
    where: {
      ...bookingStaffWhere(staffId),
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
}

async function findAvailableStaffForServiceSegment(params: {
  salonId: string;
  serviceId: string;
  startTime: Date;
  endTime: Date;
  pendingSegmentsByStaff?: Map<string, { startTime: Date; endTime: Date }[]>;
}): Promise<StaffCandidate[]> {
  const { salonId, serviceId, startTime, endTime, pendingSegmentsByStaff } = params;

  const staffForService = await prisma.staff.findMany({
    where: {
      salonId,
      services: {
        some: {
          serviceId,
        },
      },
    },
    select: {
      id: true,
      name: true,
      availability: true,
    },
  });

  const availableStaff: StaffCandidate[] = [];

  for (const staff of staffForService) {
    const staffAvailability = parseStaffAvailability(staff.availability);
    if (!staffAvailability) continue;

    const existingBookings = await getExistingBookingsForStaff(staff.id, startTime);
    const pendingSegments = pendingSegmentsByStaff?.get(staff.id) ?? [];
    const blockingSegments = [...existingBookings, ...pendingSegments];

    if (isSlotAvailable(startTime, endTime, staffAvailability, blockingSegments)) {
      availableStaff.push(staff);
    }
  }

  return availableStaff;
}

async function assignAvailableStaffToSegments(
  salonId: string,
  serviceSegments: ServiceSegment[]
): Promise<string[]> {
  const assignedStaffIds: string[] = [];
  const pendingSegmentsByStaff = new Map<string, { startTime: Date; endTime: Date }[]>();

  for (const segment of serviceSegments) {
    const staffAssignedToService = await prisma.staff.count({
      where: {
        salonId,
        services: {
          some: {
            serviceId: segment.serviceId,
          },
        },
      },
    });

    if (staffAssignedToService === 0) {
      throw new Error(
        `No staff members are assigned to perform service ${segment.serviceId}. Please select a different service or contact the salon.`
      );
    }

    const candidates = await findAvailableStaffForServiceSegment({
      salonId,
      serviceId: segment.serviceId,
      startTime: segment.startTime,
      endTime: segment.endTime,
      pendingSegmentsByStaff,
    });

    if (candidates.length === 0) {
      throw new Error(
        `No staff members are available for service ${segment.serviceId} at the requested time. Please try a different time or select a specific staff member.`
      );
    }

    const selectedStaffId = selectRandomStaff(candidates.map((staff) => staff.id));
    assignedStaffIds.push(selectedStaffId);

    const pendingSegments = pendingSegmentsByStaff.get(selectedStaffId) ?? [];
    pendingSegments.push({
      startTime: segment.startTime,
      endTime: segment.endTime,
    });
    pendingSegmentsByStaff.set(selectedStaffId, pendingSegments);
  }

  return assignedStaffIds;
}

async function buildStaffAvailabilityContext(params: {
  salonId: string;
  serviceIds: string[];
  date: Date;
}): Promise<StaffAvailabilityContext> {
  const { salonId, serviceIds, date } = params;

  const staff = await prisma.staff.findMany({
    where: {
      salonId,
      services: {
        some: {
          serviceId: {
            in: serviceIds,
          },
        },
      },
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

  const staffByServiceId = new Map<string, StaffCandidate[]>();

  for (const staffMember of staff) {
    for (const service of staffMember.services) {
      const staffForService = staffByServiceId.get(service.serviceId) ?? [];
      staffForService.push({
        id: staffMember.id,
        name: staffMember.name,
        availability: staffMember.availability,
      });
      staffByServiceId.set(service.serviceId, staffForService);
    }
  }

  const staffIds = staff.map((staffMember) => staffMember.id);
  const bookingsByStaffId = new Map<string, BookingTimeRange[]>();

  if (staffIds.length > 0) {
    const { dayStart, dayEnd } = getDayBounds(date);
    const bookings = await prisma.booking.findMany({
      where: {
        OR: [{ staffId: { in: staffIds } }, { staffIds: { hasSome: staffIds } }],
        startTime: {
          gte: dayStart,
          lte: dayEnd,
        },
        status: {
          notIn: ['CANCELLED', 'NO_SHOW'],
        },
      },
      select: {
        staffId: true,
        staffIds: true,
        startTime: true,
        endTime: true,
      },
    });

    for (const booking of bookings) {
      const bookingStaffIds =
        booking.staffIds.length > 0 ? booking.staffIds : booking.staffId ? [booking.staffId] : [];

      for (const staffId of bookingStaffIds) {
        const staffBookings = bookingsByStaffId.get(staffId) ?? [];
        staffBookings.push({
          startTime: booking.startTime,
          endTime: booking.endTime,
        });
        bookingsByStaffId.set(staffId, staffBookings);
      }
    }
  }

  return {
    staffByServiceId,
    bookingsByStaffId,
  };
}

function canAssignStaffToSegmentsFromContext(
  serviceSegments: ServiceSegment[],
  context: StaffAvailabilityContext
): boolean {
  const pendingSegmentsByStaff = new Map<string, BookingTimeRange[]>();

  for (const segment of serviceSegments) {
    const candidates = context.staffByServiceId.get(segment.serviceId) ?? [];
    let selectedStaffId: string | undefined;

    for (const candidate of candidates) {
      const staffAvailability = parseStaffAvailability(candidate.availability);
      if (!staffAvailability) continue;

      const existingBookings = context.bookingsByStaffId.get(candidate.id) ?? [];
      const pendingSegments = pendingSegmentsByStaff.get(candidate.id) ?? [];
      const blockingSegments = [...existingBookings, ...pendingSegments];

      if (
        isSlotAvailable(segment.startTime, segment.endTime, staffAvailability, blockingSegments)
      ) {
        selectedStaffId = candidate.id;
        break;
      }
    }

    if (!selectedStaffId) {
      return false;
    }

    const pendingSegments = pendingSegmentsByStaff.get(selectedStaffId) ?? [];
    pendingSegments.push({
      startTime: segment.startTime,
      endTime: segment.endTime,
    });
    pendingSegmentsByStaff.set(selectedStaffId, pendingSegments);
  }

  return true;
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
  const { userId, salonId, serviceIds, staffId, staffIds, startTime } = data;

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

  // Keep the service order as provided by the client
  const serviceMap = new Map(services.map((s) => [s.id, s]));
  const orderedServices = serviceIds
    .map((id) => serviceMap.get(id))
    .filter(Boolean) as (typeof services)[number][];

  if (orderedServices.length !== serviceIds.length) {
    throw new Error('One or more services not found');
  }

  // Split the booking window into per-service segments (sequential)
  const serviceSegments = buildServiceSegments(bookingStartTime, orderedServices);

  let assignedStaffIds = normalizeStaffIds({ serviceIds, staffId, staffIds });

  if (assignedStaffIds && assignedStaffIds.length !== serviceIds.length) {
    throw new Error('staffIds must contain 1 item or match the number of serviceIds');
  }

  if (!assignedStaffIds) {
    assignedStaffIds = await assignAvailableStaffToSegments(salonId, serviceSegments);
  }

  const uniqueStaffIds = Array.from(new Set(assignedStaffIds));

  // Verify staff exists and belongs to the salon
  const staffRecords = await prisma.staff.findMany({
    where: { id: { in: uniqueStaffIds } },
    select: {
      id: true,
      salonId: true,
      name: true,
      availability: true,
    },
  });

  if (staffRecords.length !== uniqueStaffIds.length) {
    throw new Error('One or more staff members not found');
  }

  const staffById = new Map(staffRecords.map((s) => [s.id, s]));
  for (const staff of staffRecords) {
    if (staff.salonId !== salonId) {
      throw new Error('Staff does not work at the specified salon');
    }
  }

  // Verify staff can perform their assigned services
  const staffServices = await prisma.staffService.findMany({
    where: {
      staffId: { in: uniqueStaffIds },
      serviceId: { in: serviceIds },
    },
    select: { staffId: true, serviceId: true },
  });
  const staffServiceSet = new Set(staffServices.map((s) => `${s.staffId}:${s.serviceId}`));

  for (let i = 0; i < serviceIds.length; i += 1) {
    const targetStaffId = assignedStaffIds[i] as string;
    const targetServiceId = serviceIds[i] as string;
    if (!staffServiceSet.has(`${targetStaffId}:${targetServiceId}`)) {
      throw new Error('Staff cannot perform one or more of the requested services');
    }
  }

  // Check availability per staff per service segment
  const dayStart = new Date(bookingStartTime);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(bookingStartTime);
  dayEnd.setHours(23, 59, 59, 999);

  const segmentsByStaff = new Map<string, { startTime: Date; endTime: Date }[]>();
  for (let i = 0; i < serviceSegments.length; i += 1) {
    const staffForSegment = assignedStaffIds[i] as string;
    const segment = serviceSegments[i] as { startTime: Date; endTime: Date };
    const existing = segmentsByStaff.get(staffForSegment) ?? [];
    existing.push(segment);
    segmentsByStaff.set(staffForSegment, existing);
  }

  for (const [targetStaffId, segments] of segmentsByStaff.entries()) {
    const staff = staffById.get(targetStaffId);
    if (!staff) throw new Error('Staff not found');

    const staffAvailability = parseStaffAvailability(staff.availability);
    if (!staffAvailability) {
      throw new Error('Staff is not available at the requested time');
    }

    const existingBookings = await prisma.booking.findMany({
      where: {
        ...bookingStaffWhere(targetStaffId),
        startTime: {
          gte: dayStart,
          lte: dayEnd,
        },
        status: {
          notIn: ['CANCELLED', 'NO_SHOW'],
        },
      },
      select: { startTime: true, endTime: true },
    });

    for (const segment of segments) {
      const available = isSlotAvailable(
        segment.startTime,
        segment.endTime,
        staffAvailability,
        existingBookings
      );

      if (!available) {
        const conflict = checkBookingConflicts(
          segment.startTime,
          segment.endTime,
          existingBookings
        );
        if (conflict) {
          throw new Error(
            `Time slot conflicts with existing booking (${conflict.startTime.toISOString()} - ${conflict.endTime.toISOString()})`
          );
        }
        throw new Error('Staff is not available at the requested time');
      }
    }
  }

  const primaryStaffId = assignedStaffIds[0] ?? null;

  // Create the booking with CONFIRMED status
  const booking = await prisma.booking.create({
    data: {
      userId,
      salonId,
      serviceIds,
      staffId: primaryStaffId,
      staffIds: assignedStaffIds,
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

  const staffMembers = await prisma.staff.findMany({
    where: { id: { in: uniqueStaffIds } },
    select: {
      id: true,
      name: true,
      image: true,
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });

  const serviceAssignments = serviceSegments.map((segment, index) => ({
    serviceId: segment.serviceId,
    staffId: assignedStaffIds[index] as string,
    startTime: segment.startTime,
    endTime: segment.endTime,
  }));

  // Add services to the response
  return {
    ...booking,
    staffMembers,
    serviceAssignments,
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
  payment: IfthenpayPaymentSession;
}

/**
 * Create a booking with If-Then Pay CCARD payment.
 */
export async function createBookingWithPayment(
  userId: string,
  salonId: string,
  serviceIds: string[],
  staffId: string | undefined,
  staffIds: string[] | undefined,
  startTime: string,
  paymentMethod: IfthenpayMethod = IFTHENPAY_METHOD.CCARD,
  mobileNumber?: string
): Promise<BookingWithPayment> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      email: true,
    },
  });

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

  // Keep the service order as provided by the client
  const serviceMap = new Map(services.map((s) => [s.id, s]));
  const orderedServices = serviceIds
    .map((id) => serviceMap.get(id))
    .filter(Boolean) as (typeof services)[number][];

  if (orderedServices.length !== serviceIds.length) {
    throw new Error('One or more services not found');
  }

  // Split the booking window into per-service segments (sequential)
  const serviceSegments = buildServiceSegments(bookingStartTime, orderedServices);

  let assignedStaffIds = normalizeStaffIds({ serviceIds, staffId, staffIds });

  if (assignedStaffIds && assignedStaffIds.length !== serviceIds.length) {
    throw new Error('staffIds must contain 1 item or match the number of serviceIds');
  }

  if (!assignedStaffIds) {
    assignedStaffIds = await assignAvailableStaffToSegments(salonId, serviceSegments);
  }

  const uniqueStaffIds = Array.from(new Set(assignedStaffIds));

  // Verify staff exists and belongs to the salon
  const staffRecords = await prisma.staff.findMany({
    where: { id: { in: uniqueStaffIds } },
    select: {
      id: true,
      salonId: true,
      availability: true,
    },
  });

  if (staffRecords.length !== uniqueStaffIds.length) {
    throw new Error('One or more staff members not found');
  }

  const staffById = new Map(staffRecords.map((s) => [s.id, s]));
  for (const staff of staffRecords) {
    if (staff.salonId !== salonId) {
      throw new Error('Staff does not work at the specified salon');
    }
  }

  // Verify staff can perform their assigned services
  const staffServices = await prisma.staffService.findMany({
    where: {
      staffId: { in: uniqueStaffIds },
      serviceId: { in: serviceIds },
    },
    select: { staffId: true, serviceId: true },
  });
  const staffServiceSet = new Set(staffServices.map((s) => `${s.staffId}:${s.serviceId}`));

  for (let i = 0; i < serviceIds.length; i += 1) {
    const targetStaffId = assignedStaffIds[i] as string;
    const targetServiceId = serviceIds[i] as string;
    if (!staffServiceSet.has(`${targetStaffId}:${targetServiceId}`)) {
      throw new Error('Staff cannot perform one or more of the requested services');
    }
  }

  // Check availability per staff per service segment
  const dayStart = new Date(bookingStartTime);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(bookingStartTime);
  dayEnd.setHours(23, 59, 59, 999);

  const segmentsByStaff = new Map<string, { startTime: Date; endTime: Date }[]>();
  for (let i = 0; i < serviceSegments.length; i += 1) {
    const staffForSegment = assignedStaffIds[i] as string;
    const segment = serviceSegments[i] as { startTime: Date; endTime: Date };
    const existing = segmentsByStaff.get(staffForSegment) ?? [];
    existing.push(segment);
    segmentsByStaff.set(staffForSegment, existing);
  }

  for (const [targetStaffId, segments] of segmentsByStaff.entries()) {
    const staff = staffById.get(targetStaffId);
    if (!staff) throw new Error('Staff not found');

    const staffAvailability = parseStaffAvailability(staff.availability);
    if (!staffAvailability) {
      throw new Error('Staff is not available at the requested time');
    }

    const existingBookings = await prisma.booking.findMany({
      where: {
        ...bookingStaffWhere(targetStaffId),
        startTime: {
          gte: dayStart,
          lte: dayEnd,
        },
        status: {
          notIn: ['CANCELLED', 'NO_SHOW'],
        },
      },
      select: { startTime: true, endTime: true },
    });

    for (const segment of segments) {
      const available = isSlotAvailable(
        segment.startTime,
        segment.endTime,
        staffAvailability,
        existingBookings
      );

      if (!available) {
        const conflict = checkBookingConflicts(
          segment.startTime,
          segment.endTime,
          existingBookings
        );
        if (conflict) {
          throw new Error(
            `Time slot conflicts with existing booking (${conflict.startTime.toISOString()} - ${conflict.endTime.toISOString()})`
          );
        }
        throw new Error('Staff is not available at the requested time');
      }
    }
  }

  const primaryStaffId = assignedStaffIds[0] ?? null;

  const paymentReference = generatePaymentReference('bok', salonId);
  const paymentSession = await initiateIfthenpayPayment({
    amount: totalPrice,
    orderId: paymentReference,
    entityType: 'booking',
    entityId: salonId,
    method: paymentMethod,
    mobileNumber,
    email: user.email,
    description: `Booking ${paymentReference}`,
  });

  // Create booking with PAYMENT_PENDING status in a transaction
  const booking = await prisma.$transaction(async (tx) => {
    // Create booking with PAYMENT_PENDING status
    const newBooking = await tx.booking.create({
      data: {
        userId,
        salonId,
        serviceIds,
        staffId: primaryStaffId,
        staffIds: assignedStaffIds,
        startTime: bookingStartTime,
        endTime: bookingEndTime,
        status: BOOKING_STATUS.PAYMENT_PENDING,
      },
    });

    try {
      await tx.payment.create({
        data: {
          orderId: null,
          bookingId: newBooking.id,
          provider: PAYMENT_PROVIDER.IFTHENPAY,
          amount: new Prisma.Decimal(totalPrice),
          txnId: paymentSession.reference,
          status: PAYMENT_STATUS.PENDING,
          ifthenpayRequestId: paymentSession.requestId,
          ifthenpayMethod: paymentSession.method,
          ...(paymentSession.method === IFTHENPAY_METHOD.CCARD
            ? { ifthenpayPaymentUrl: paymentSession.paymentUrl }
            : {}),
          metadata: {
            initiation: paymentSession.rawResponse as unknown as Prisma.InputJsonValue,
            ...(paymentSession.method === IFTHENPAY_METHOD.MBWAY
              ? { mobileNumber: paymentSession.mobileNumber }
              : {}),
          } as Prisma.InputJsonValue,
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
      `[Booking] Payment record created for booking ${newBooking.id}, txnId: ${paymentSession.reference}, requestId: ${paymentSession.requestId}`
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

  // Add services to the booking response
  const staffMembers = await prisma.staff.findMany({
    where: { id: { in: uniqueStaffIds } },
    select: {
      id: true,
      name: true,
      image: true,
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });

  const serviceAssignments = serviceSegments.map((segment, index) => ({
    serviceId: segment.serviceId,
    staffId: assignedStaffIds[index] as string,
    startTime: segment.startTime,
    endTime: segment.endTime,
  }));

  const bookingWithServices = {
    ...booking,
    staffMembers,
    serviceAssignments,
    services: services.map((service) => ({
      id: service.id,
      title: service.title,
      durationMinutes: service.durationMinutes,
      price: service.price,
    })),
  };

  return {
    booking: bookingWithServices,
    payment: paymentSession,
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

  const staffIdsForBooking =
    booking.staffIds.length > 0 ? booking.staffIds : booking.staffId ? [booking.staffId] : [];

  const staffMembers =
    staffIdsForBooking.length > 0
      ? await prisma.staff.findMany({
          where: { id: { in: staffIdsForBooking } },
          select: {
            id: true,
            name: true,
            image: true,
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        })
      : [];

  const serviceMap = new Map(services.map((s) => [s.id, s]));
  const orderedServices = booking.serviceIds.map((sid) => serviceMap.get(sid)).filter(Boolean);
  const normalizedStaffIds =
    booking.staffIds.length === booking.serviceIds.length
      ? booking.staffIds
      : booking.staffIds.length === 1
        ? Array(booking.serviceIds.length).fill(booking.staffIds[0] as string)
        : booking.staffId
          ? Array(booking.serviceIds.length).fill(booking.staffId)
          : [];

  const serviceAssignments: {
    serviceId: string;
    staffId?: string;
    startTime: Date;
    endTime: Date;
  }[] = [];
  let cursorTime = new Date(booking.startTime);
  for (let i = 0; i < orderedServices.length; i += 1) {
    const service = orderedServices[i] as {
      id: string;
      durationMinutes: number;
    };
    const segmentStart = new Date(cursorTime);
    const segmentEnd = new Date(segmentStart.getTime() + service.durationMinutes * 60000);
    serviceAssignments.push({
      serviceId: service.id,
      staffId: normalizedStaffIds[i],
      startTime: segmentStart,
      endTime: segmentEnd,
    });
    cursorTime = segmentEnd;
  }

  return {
    ...booking,
    staffMembers,
    serviceAssignments,
    services,
  };
}

/**
 * Get bookings with filters
 */
export async function getBookings(filters: GetBookingsFilters) {
  const { userId, salonId, staffId, status, startDate, endDate } = filters;

  const where: Prisma.BookingWhereInput = {};

  if (userId) where.userId = userId;
  if (salonId) where.salonId = salonId;
  if (staffId) {
    where.OR = [{ staffId }, { staffIds: { has: staffId } }];
  }
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

  // Fetch all staff for all bookings (for multi-staff bookings)
  const allStaffIds = bookings.flatMap((b) =>
    b.staffIds.length > 0 ? b.staffIds : b.staffId ? [b.staffId] : []
  );
  const uniqueStaffIds = [...new Set(allStaffIds)];

  const staffMembers = uniqueStaffIds.length
    ? await prisma.staff.findMany({
        where: { id: { in: uniqueStaffIds } },
        select: {
          id: true,
          name: true,
          image: true,
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      })
    : [];
  const staffMap = new Map(staffMembers.map((s) => [s.id, s]));

  // Add services to each booking
  const bookingsWithServices = bookings.map((booking) => ({
    ...booking,
    services: booking.serviceIds.map((id) => serviceMap.get(id)).filter(Boolean),
    staffMembers:
      booking.staffIds.length > 0
        ? booking.staffIds.map((id) => staffMap.get(id)).filter(Boolean)
        : booking.staffId
          ? [staffMap.get(booking.staffId)].filter(Boolean)
          : [],
    serviceAssignments: (() => {
      const ordered = booking.serviceIds.map((id) => serviceMap.get(id)).filter(Boolean) as {
        id: string;
        durationMinutes: number;
      }[];

      const normalizedStaffIds =
        booking.staffIds.length === booking.serviceIds.length
          ? booking.staffIds
          : booking.staffIds.length === 1
            ? Array(booking.serviceIds.length).fill(booking.staffIds[0] as string)
            : booking.staffId
              ? Array(booking.serviceIds.length).fill(booking.staffId)
              : [];

      const assignments: {
        serviceId: string;
        staffId?: string;
        startTime: Date;
        endTime: Date;
      }[] = [];
      let cursor = new Date(booking.startTime);
      for (let i = 0; i < ordered.length; i += 1) {
        const service = ordered[i] as { id: string; durationMinutes: number };
        const segStart = new Date(cursor);
        const segEnd = new Date(segStart.getTime() + service.durationMinutes * 60000);
        assignments.push({
          serviceId: service.id,
          staffId: normalizedStaffIds[i],
          startTime: segStart,
          endTime: segEnd,
        });
        cursor = segEnd;
      }

      return assignments;
    })(),
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
  const serviceMap = new Map(services.map((s) => [s.id, s]));
  const orderedServices = serviceIds
    .map((id) => serviceMap.get(id))
    .filter(Boolean) as (typeof services)[number][];

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
        ...bookingStaffWhere(staffId),
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
    const slotIntervalMinutes = 30;
    const dayMinutes = 24 * 60;
    const availabilityContext = await buildStaffAvailabilityContext({
      salonId,
      serviceIds,
      date: requestedDate,
    });

    for (
      let currentMinutes = 0;
      currentMinutes + totalDurationMinutes <= dayMinutes;
      currentMinutes += slotIntervalMinutes
    ) {
      const slotStart = new Date(requestedDate);
      slotStart.setHours(Math.floor(currentMinutes / 60), currentMinutes % 60, 0, 0);
      const slotEnd = new Date(slotStart.getTime() + totalDurationMinutes * 60000);
      const serviceSegments = buildServiceSegments(slotStart, orderedServices);

      if (canAssignStaffToSegmentsFromContext(serviceSegments, availabilityContext)) {
        slots.push({
          startTime: slotStart.toISOString(),
          endTime: slotEnd.toISOString(),
          available: true,
        });
      }
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
  const existingServiceMap = new Map(existingServices.map((service) => [service.id, service]));
  const orderedExistingServices = existingBooking.serviceIds
    .map((serviceId) => existingServiceMap.get(serviceId))
    .filter(Boolean) as (typeof existingServices)[number][];

  // Cannot update cancelled or completed bookings
  if (existingBooking.status === 'CANCELLED' || existingBooking.status === 'COMPLETED') {
    throw new Error(`Cannot update ${existingBooking.status.toLowerCase()} booking`);
  }

  const updateData: {
    startTime?: Date;
    endTime?: Date;
    staffId?: string | null;
    staffIds?: string[];
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
      const serviceSegments = buildServiceSegments(newStartTime, orderedExistingServices);
      const assignedStaffIds = await assignAvailableStaffToSegments(
        existingBooking.salonId,
        serviceSegments
      );

      targetStaffId = assignedStaffIds[0] ?? null;
      updateData.staffId = targetStaffId;
      updateData.staffIds = assignedStaffIds;
    } else if (staffId !== undefined) {
      // Specific staff requested
      targetStaffId = staffId;
    } else {
      // Keep existing staff (if any)
      targetStaffId = existingBooking.staffId;
    }

    // Check single-staff availability if we have a specific target staff.
    // Multi-staff "any staff" reschedules are validated during segment assignment above.
    if (targetStaffId && !updateData.staffIds) {
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
          ...bookingStaffWhere(targetStaffId),
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
          ...bookingStaffWhere(staffId),
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
