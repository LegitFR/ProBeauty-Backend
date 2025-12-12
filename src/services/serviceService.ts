import { prisma } from '@/configs/db';

interface CreateServiceData {
  salonId: string;
  title: string;
  category: string;
  durationMinutes: number;
  price: number;
}

interface UpdateServiceData {
  title?: string;
  category?: string;
  durationMinutes?: number;
  price?: number;
}

/**
 * Create a new service for a salon
 */
export async function createService(data: CreateServiceData) {
  const { salonId, title, category, durationMinutes, price } = data;

  // Verify salon exists
  const salon = await prisma.salon.findUnique({
    where: { id: salonId },
  });

  if (!salon) {
    throw new Error('Salon not found');
  }

  // Create the service
  return prisma.service.create({
    data: {
      salonId,
      title,
      category,
      durationMinutes,
      price,
    },
  });
}

/**
 * Get a service by ID
 */
export async function getServiceById(id: string) {
  return prisma.service.findUnique({
    where: { id },
    include: {
      salon: {
        select: {
          id: true,
          name: true,
          address: true,
        },
      },
    },
  });
}

/**
 * Get all services for a specific salon
 */
export async function getServicesBySalonId(salonId: string) {
  return prisma.service.findMany({
    where: { salonId },
    orderBy: {
      title: 'asc',
    },
  });
}

/**
 * Get all services (with optional pagination)
 */
export async function getAllServices() {
  return prisma.service.findMany({
    include: {
      salon: {
        select: {
          id: true,
          name: true,
          address: true,
        },
      },
    },
    orderBy: {
      title: 'asc',
    },
  });
}

/**
 * Update a service by ID
 */
export async function updateService(id: string, data: UpdateServiceData) {
  // Check if service exists
  const service = await prisma.service.findUnique({
    where: { id },
  });

  if (!service) {
    throw new Error('Service not found');
  }

  // Update the service
  return prisma.service.update({
    where: { id },
    data,
  });
}

/**
 * Delete a service by ID
 */
export async function deleteService(id: string) {
  // Check if service exists
  const service = await prisma.service.findUnique({
    where: { id },
  });

  if (!service) {
    throw new Error('Service not found');
  }

  // Delete the service
  return prisma.service.delete({
    where: { id },
  });
}

/**
 * Verify if a user owns the salon that owns a specific service
 */
export async function verifyServiceOwnership(serviceId: string, userId: string): Promise<boolean> {
  const service = await prisma.service.findUnique({
    where: { id: serviceId },
    include: {
      salon: true,
    },
  });

  if (!service) {
    return false;
  }

  return service.salon.ownerId === userId;
}
