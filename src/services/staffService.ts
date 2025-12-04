import { Prisma } from '@prisma/client';

import { prisma } from '@/configs/db';

interface CreateStaffData {
  salonId: string;
  serviceIds: string[];
  availability?: Record<string, unknown> | null;
  userId?: string;
}

interface UpdateStaffData {
  serviceIds?: string[];
  availability?: Record<string, unknown> | null;
  userId?: string;
}

interface GetStaffFilters {
  page?: number;
  limit?: number;
  salonId?: string;
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

  // Verify all services exist and belong to the salon
  if (data.serviceIds && data.serviceIds.length > 0) {
    const services = await prisma.service.findMany({
      where: {
        id: { in: data.serviceIds },
        salonId: data.salonId,
      },
    });

    if (services.length !== data.serviceIds.length) {
      throw new Error('One or more services not found or do not belong to this salon');
    }
  }

  return prisma.staff.create({
    data: {
      salonId: data.salonId,
      availability: data.availability
        ? (JSON.stringify(data.availability) as Prisma.InputJsonValue)
        : undefined,
      userId: data.userId,
      services: {
        create: data.serviceIds.map((serviceId) => ({
          serviceId,
        })),
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

interface StaffWhereClause {
  salonId?: string;
}

export async function getAllStaff(filters?: GetStaffFilters) {
  const page = filters?.page || 1;
  const limit = filters?.limit || 10;
  const skip = (page - 1) * limit;

  const where: StaffWhereClause = {};

  if (filters?.salonId) {
    where.salonId = filters.salonId;
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
      orderBy: { createdAt: 'desc' },
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

  const where: StaffWhereClause = { salonId };

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
      orderBy: { createdAt: 'desc' },
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

  // If serviceIds are being updated, verify all services exist and belong to the salon
  if (data.serviceIds !== undefined) {
    if (data.serviceIds.length > 0) {
      const services = await prisma.service.findMany({
        where: {
          id: { in: data.serviceIds },
          salonId: staff.salonId,
        },
      });

      if (services.length !== data.serviceIds.length) {
        throw new Error('One or more services not found or do not belong to this salon');
      }
    }

    // Update service associations
    await prisma.staffService.deleteMany({
      where: { staffId: id },
    });
  }

  return prisma.staff.update({
    where: { id },
    data: {
      availability:
        data.availability !== undefined
          ? (JSON.stringify(data.availability) as Prisma.InputJsonValue)
          : undefined,
      userId: data.userId,
      services:
        data.serviceIds !== undefined
          ? {
              create: data.serviceIds.map((serviceId) => ({
                serviceId,
              })),
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
