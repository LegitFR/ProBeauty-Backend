import { Prisma } from '@prisma/client';

import { prisma } from '@/configs/db';

interface CreateSalonData {
  name: string;
  address: string;
  phone?: string;
  geo?: {
    latitude: number;
    longitude: number;
  };
  hours?: Record<string, { open: string; close: string }>;
  thumbnail?: string;
  images?: string[];
}

interface UpdateSalonData {
  name?: string;
  address?: string;
  phone?: string;
  geo?: {
    latitude: number;
    longitude: number;
  };
  hours?: Record<string, { open: string; close: string }>;
  thumbnail?: string;
  images?: string[];
}

interface GetSalonsFilters {
  page?: number;
  limit?: number;
  verified?: boolean;
}

export async function createSalon(ownerId: string, data: CreateSalonData) {
  return prisma.salon.create({
    data: {
      ownerId,
      name: data.name,
      address: data.address,
      geo: data.geo ? (JSON.stringify(data.geo) as Prisma.InputJsonValue) : undefined,
      hours: data.hours ? (JSON.stringify(data.hours) as Prisma.InputJsonValue) : undefined,
      thumbnail: data.thumbnail,
      images: data.images,
      verified: false,
    },
  });
}

export async function getSalonById(id: string) {
  return prisma.salon.findUnique({
    where: { id },
    include: {
      staff: true,
      services: true,
      products: true,
    },
  });
}

interface SalonsWhereClause {
  ownerId: string;
  verified?: boolean;
}

export async function getSalonsByOwnerId(ownerId: string, filters?: GetSalonsFilters) {
  const page = filters?.page || 1;
  const limit = filters?.limit || 10;
  const skip = (page - 1) * limit;

  const where: SalonsWhereClause = { ownerId };
  if (filters?.verified !== undefined) {
    where.verified = filters.verified;
  }

  const [salons, total] = await Promise.all([
    prisma.salon.findMany({
      where,
      skip,
      take: limit,
      include: {
        staff: true,
        services: true,
        products: true,
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.salon.count({ where }),
  ]);

  return {
    salons,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function updateSalon(id: string, ownerId: string, data: UpdateSalonData) {
  // Verify ownership
  const salon = await prisma.salon.findUnique({
    where: { id },
  });

  if (!salon || salon.ownerId !== ownerId) {
    return null;
  }

  return prisma.salon.update({
    where: { id },
    data: {
      name: data.name,
      address: data.address,
      geo: data.geo ? (JSON.stringify(data.geo) as Prisma.InputJsonValue) : undefined,
      hours: data.hours ? (JSON.stringify(data.hours) as Prisma.InputJsonValue) : undefined,
      thumbnail: data.thumbnail,
      images: data.images,
    },
    include: {
      staff: true,
      services: true,
      products: true,
    },
  });
}

export async function deleteSalon(id: string, ownerId: string) {
  // Verify ownership
  const salon = await prisma.salon.findUnique({
    where: { id },
  });

  if (!salon || salon.ownerId !== ownerId) {
    return null;
  }

  return prisma.salon.delete({
    where: { id },
  });
}

interface AllSalonsWhereClause {
  verified?: boolean;
}

export async function getAllSalons(filters?: GetSalonsFilters) {
  const page = filters?.page || 1;
  const limit = filters?.limit || 10;
  const skip = (page - 1) * limit;

  const where: AllSalonsWhereClause = {};
  if (filters?.verified !== undefined) {
    where.verified = filters.verified;
  }

  const [salons, total] = await Promise.all([
    prisma.salon.findMany({
      where,
      skip,
      take: limit,
      include: {
        owner: {
          select: { id: true, name: true, email: true },
        },
        staff: true,
        services: true,
        products: true,
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.salon.count({ where }),
  ]);

  return {
    salons,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}
