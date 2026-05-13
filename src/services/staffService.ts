import { Prisma } from '@prisma/client';

import { prisma } from '@/configs/db';

interface CreateStaffData {
  name: string;
  salonId: string;
  serviceId: string;
  availability?: Record<string, unknown> | null;
  userId?: string;
  image?: string;
}

interface UpdateStaffData {
  name?: string;
  serviceId?: string;
  availability?: Record<string, unknown> | null;
  userId?: string;
  image?: string;
}

interface GetStaffFilters {
  page?: number;
  limit?: number;
  salonId?: string;
  serviceId?: string;
}

export async function createStaff(ownerId: string, data: CreateStaffData) {
  // Verify salon ownership
  const salon = await prisma.salon.findUnique({
    where: { id: data.salonId },
  });

  if (!salon || salon.ownerId !== ownerId) {
    throw new Error('Unauthorized: You do not own this salon');
  }

  // If userId is provided, verify the user exists
  if (data.userId) {
    const user = await prisma.user.findUnique({
      where: { id: data.userId },
    });

    if (!user) {
      throw new Error('User not found');
    }
  }

  // Verify service exists and belongs to the salon
  const service = await prisma.service.findUnique({
    where: {
      id: data.serviceId,
    },
  });

  if (!service || service.salonId !== data.salonId) {
    throw new Error('Service not found or does not belong to this salon');
  }

  return prisma.staff.create({
    data: {
      name: data.name,
      salonId: data.salonId,
      availability: data.availability
        ? (JSON.stringify(data.availability) as Prisma.InputJsonValue)
        : undefined,
      userId: data.userId,
      image: data.image,
      services: {
        create: {
          serviceId: data.serviceId,
        },
      },
    },
    include: {
      salon: {
        select: { id: true, name: true },
      },
      user: {
        select: { id: true, name: true, email: true, phone: true },
      },
      services: {
        include: {
          service: {
            select: { id: true, title: true, price: true },
          },
        },
      },
    },
  });
}

export async function getStaffById(id: string) {
  return prisma.staff.findUnique({
    where: { id },
    include: {
      salon: {
        select: { id: true, name: true, address: true },
      },
      user: {
        select: { id: true, name: true, email: true, phone: true },
      },
      services: {
        include: {
          service: {
            select: { id: true, title: true, price: true, durationMinutes: true },
          },
        },
      },
      bookings: {
        select: {
          id: true,
          startTime: true,
          endTime: true,
          status: true,
        },
        orderBy: { startTime: 'desc' },
        take: 5,
      },
    },
  });
}

export async function getAllStaff(filters?: GetStaffFilters) {
  const page = filters?.page || 1;
  const limit = filters?.limit || 10;
  const skip = (page - 1) * limit;

  const where: Prisma.StaffWhereInput = {};

  if (filters?.salonId) {
    where.salonId = filters.salonId;
  }

  if (filters?.serviceId) {
    where.services = {
      some: {
        serviceId: filters.serviceId,
      },
    };
  }

  const [staff, total] = await Promise.all([
    prisma.staff.findMany({
      where,
      skip,
      take: limit,
      include: {
        salon: {
          select: { id: true, name: true },
        },
        user: {
          select: { id: true, name: true, email: true },
        },
        services: {
          include: {
            service: {
              select: { id: true, title: true, price: true },
            },
          },
        },
      },
      orderBy: { name: 'asc' },
    }),
    prisma.staff.count({ where }),
  ]);

  return {
    staff,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getStaffBySalonId(salonId: string, filters?: GetStaffFilters) {
  const page = filters?.page || 1;
  const limit = filters?.limit || 10;
  const skip = (page - 1) * limit;

  const where: Prisma.StaffWhereInput = { salonId };

  if (filters?.serviceId) {
    where.services = {
      some: {
        serviceId: filters.serviceId,
      },
    };
  }

  const [staff, total] = await Promise.all([
    prisma.staff.findMany({
      where,
      skip,
      take: limit,
      include: {
        salon: {
          select: { id: true, name: true },
        },
        user: {
          select: { id: true, name: true, email: true },
        },
        services: {
          include: {
            service: {
              select: { id: true, title: true, price: true },
            },
          },
        },
      },
      orderBy: { name: 'asc' },
    }),
    prisma.staff.count({ where }),
  ]);

  return {
    staff,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function updateStaff(id: string, ownerId: string, data: UpdateStaffData) {
  const staff = await prisma.staff.findUnique({
    where: { id },
    include: { salon: true },
  });

  if (!staff || staff.salon.ownerId !== ownerId) {
    return null;
  }

  // If userId is being updated, verify the new user exists
  if (data.userId && data.userId !== staff.userId) {
    const user = await prisma.user.findUnique({
      where: { id: data.userId },
    });

    if (!user) {
      throw new Error('User not found');
    }
  }

  // If serviceId is being updated, verify service exists and belongs to the salon
  if (data.serviceId !== undefined) {
    const service = await prisma.service.findUnique({
      where: {
        id: data.serviceId,
      },
    });

    if (!service || service.salonId !== staff.salonId) {
      throw new Error('Service not found or does not belong to this salon');
    }

    // Update service association (delete old and create new)
    await prisma.staffService.deleteMany({
      where: { staffId: id },
    });
  }

  return prisma.staff.update({
    where: { id },
    data: {
      name: data.name !== undefined ? data.name : undefined,
      availability:
        data.availability !== undefined
          ? (JSON.stringify(data.availability) as Prisma.InputJsonValue)
          : undefined,
      userId: data.userId,
      image: data.image,
      services:
        data.serviceId !== undefined
          ? {
              create: {
                serviceId: data.serviceId,
              },
            }
          : undefined,
    },
    include: {
      salon: {
        select: { id: true, name: true },
      },
      user: {
        select: { id: true, name: true, email: true },
      },
      services: {
        include: {
          service: {
            select: { id: true, title: true, price: true },
          },
        },
      },
    },
  });
}

export async function deleteStaff(id: string, ownerId: string) {
  const staff = await prisma.staff.findUnique({
    where: { id },
    include: { salon: true },
  });

  if (!staff || staff.salon.ownerId !== ownerId) {
    return null;
  }

  return prisma.staff.delete({
    where: { id },
  });
}

/**
 * Get day name from date
 */
function getDayName(
  date: Date
): 'sunday' | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' {
  const days = [
    'sunday',
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
  ] as const;
  return days[date.getDay()];
}

interface AvailabilitySlot {
  start: string;
  end: string;
}

interface DayAvailability {
  isAvailable: boolean;
  slots?: AvailabilitySlot[];
}

interface StaffAvailability {
  monday?: DayAvailability;
  tuesday?: DayAvailability;
  wednesday?: DayAvailability;
  thursday?: DayAvailability;
  friday?: DayAvailability;
  saturday?: DayAvailability;
  sunday?: DayAvailability;
}

/**
 * Parse staff availability JSON safely
 */
function parseAvailability(availability: unknown): StaffAvailability | null {
  try {
    if (!availability) return null;
    if (typeof availability === 'string') {
      return JSON.parse(availability) as StaffAvailability;
    }
    if (typeof availability === 'object') {
      return availability as StaffAvailability;
    }
    return null;
  } catch {
    return null;
  }
}

interface GetAvailableStaffByDateParams {
  salonId: string;
  serviceId?: string;
  date: string;
}

/**
 * Get all staff members available on a specific date for a salon
 * Optionally filter by service
 */
export async function getAvailableStaffByDate(params: GetAvailableStaffByDateParams) {
  const { salonId, serviceId, date } = params;

  // Parse the date and get day of week
  const requestedDate = new Date(date);
  const dayOfWeek = getDayName(requestedDate);

  // Build where clause
  const where: { salonId: string; services?: { some: { serviceId: string } } } = {
    salonId,
  };

  // If serviceId provided, filter by service
  if (serviceId) {
    where.services = {
      some: {
        serviceId,
      },
    };
  }

  // Get all staff for the salon (optionally filtered by service)
  const allStaff = await prisma.staff.findMany({
    where,
    include: {
      user: {
        select: { id: true, name: true, email: true },
      },
      services: {
        include: {
          service: {
            select: { id: true, title: true, price: true, durationMinutes: true },
          },
        },
      },
    },
  });

  // Filter staff who are available on the requested day of the week
  const availableStaff = allStaff.filter((staff) => {
    const availability = parseAvailability(staff.availability);
    if (!availability) return false;

    const dayAvailability = availability[dayOfWeek];
    return dayAvailability?.isAvailable === true;
  });

  // Map to response format with day-specific availability
  const staffWithDayAvailability = availableStaff.map((staff) => {
    const availability = parseAvailability(staff.availability);
    const dayAvailability = availability?.[dayOfWeek] || { isAvailable: false };

    return {
      id: staff.id,
      name: staff.name,
      user: staff.user,
      services: staff.services.map((s) => s.service),
      availability: dayAvailability,
    };
  });

  return {
    date,
    dayOfWeek,
    staff: staffWithDayAvailability,
  };
}

interface GetStaffAvailabilityWithBookingsParams {
  staffId: string;
  date: string;
}

/**
 * Get a specific staff member's availability for a date along with their existing bookings
 */
export async function getStaffAvailabilityWithBookings(
  params: GetStaffAvailabilityWithBookingsParams
) {
  const { staffId, date } = params;

  // Get staff with details
  const staff = await prisma.staff.findUnique({
    where: { id: staffId },
    include: {
      user: {
        select: { id: true, name: true, email: true },
      },
      services: {
        include: {
          service: {
            select: { id: true, title: true, price: true, durationMinutes: true },
          },
        },
      },
    },
  });

  if (!staff) {
    return null;
  }

  // Parse the date and get day of week
  const requestedDate = new Date(date);
  const dayOfWeek = getDayName(requestedDate);

  // Parse availability
  const availability = parseAvailability(staff.availability);
  const dayAvailability = availability?.[dayOfWeek] || { isAvailable: false };

  // Get start and end of the requested day
  const dayStart = new Date(requestedDate);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(requestedDate);
  dayEnd.setHours(23, 59, 59, 999);

  // Get existing bookings for this staff on the requested date
  const existingBookings = await prisma.booking.findMany({
    where: {
      OR: [{ staffId }, { staffIds: { has: staffId } }],
      startTime: {
        gte: dayStart,
        lte: dayEnd,
      },
      status: {
        notIn: ['CANCELLED', 'NO_SHOW'],
      },
    },
    select: {
      id: true,
      startTime: true,
      endTime: true,
      status: true,
    },
    orderBy: { startTime: 'asc' },
  });

  // Format bookings for response (convert to HH:mm format)
  const formattedBookings = existingBookings.map((booking) => ({
    id: booking.id,
    start: `${booking.startTime.getHours().toString().padStart(2, '0')}:${booking.startTime.getMinutes().toString().padStart(2, '0')}`,
    end: `${booking.endTime.getHours().toString().padStart(2, '0')}:${booking.endTime.getMinutes().toString().padStart(2, '0')}`,
    status: booking.status,
  }));

  return {
    staff: {
      id: staff.id,
      name: staff.name,
      user: staff.user,
      services: staff.services.map((s) => s.service),
    },
    date,
    dayOfWeek,
    availability: dayAvailability,
    bookings: formattedBookings,
  };
}
