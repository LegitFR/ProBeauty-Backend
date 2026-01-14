import { Prisma } from '@prisma/client';

import { prisma } from '@/configs/db';

interface CreateOfferData {
  salonId: string;
  title: string;
  description?: string;
  offerType: string;
  productId?: string;
  serviceId?: string;
  discountType: string;
  discountValue: number;
  startsAt: string;
  endsAt: string;
}

interface UpdateOfferData {
  title?: string;
  description?: string;
  offerType?: string;
  productId?: string;
  serviceId?: string;
  discountType?: string;
  discountValue?: number;
  startsAt?: string;
  endsAt?: string;
}

interface GetOffersFilters {
  salonId?: string;
  productId?: string;
  serviceId?: string;
  activeOnly?: boolean;
  page?: number;
  limit?: number;
}

interface ValidateOfferContext {
  salonId?: string;
  productId?: string;
  serviceId?: string;
}

export async function createOffer(ownerId: string, data: CreateOfferData, imageUrl?: string) {
  const salon = await prisma.salon.findUnique({
    where: { id: data.salonId },
  });

  if (!salon) {
    throw new Error('Salon not found');
  }

  if (salon.ownerId !== ownerId) {
    throw new Error('Unauthorized: You do not own this salon');
  }

  if (new Date(data.endsAt) <= new Date(data.startsAt)) {
    throw new Error('End date must be after start date');
  }

  if (data.offerType === 'product' && !data.productId) {
    throw new Error('Product ID is required for product offers');
  }

  if (data.offerType === 'service' && !data.serviceId) {
    throw new Error('Service ID is required for service offers');
  }

  if (data.offerType === 'product') {
    const product = await prisma.product.findUnique({
      where: { id: data.productId },
    });

    if (!product || product.salonId !== data.salonId) {
      throw new Error('Invalid product or product does not belong to this salon');
    }
  }

  if (data.offerType === 'service') {
    const service = await prisma.service.findUnique({
      where: { id: data.serviceId },
    });

    if (!service || service.salonId !== data.salonId) {
      throw new Error('Invalid service or service does not belong to this salon');
    }
  }

  return prisma.offer.create({
    data: {
      salonId: data.salonId,
      title: data.title,
      description: data.description,
      offerType: data.offerType,
      productId: data.productId,
      serviceId: data.serviceId,
      discountType: data.discountType,
      discountValue: new Prisma.Decimal(data.discountValue),
      startsAt: new Date(data.startsAt),
      endsAt: new Date(data.endsAt),
      image: imageUrl,
    },
    include: {
      salon: {
        select: { id: true, name: true },
      },
      product: {
        select: { id: true, title: true },
      },
      service: {
        select: { id: true, title: true },
      },
    },
  });
}

export async function updateOffer(
  id: string,
  ownerId: string,
  data: UpdateOfferData,
  imageUrl?: string
) {
  const offer = await prisma.offer.findUnique({
    where: { id },
    include: { salon: true },
  });

  if (!offer) {
    throw new Error('Offer not found');
  }

  if (offer.salon.ownerId !== ownerId) {
    throw new Error('Unauthorized: You do not own this offer');
  }

  if (data.startsAt && data.endsAt) {
    if (new Date(data.endsAt) <= new Date(data.startsAt)) {
      throw new Error('End date must be after start date');
    }
  }

  if (data.offerType === 'product' && !data.productId) {
    throw new Error('Product ID is required when offer type is product');
  }

  if (data.offerType === 'service' && !data.serviceId) {
    throw new Error('Service ID is required when offer type is service');
  }

  if (data.offerType === 'product' && data.productId) {
    const product = await prisma.product.findUnique({
      where: { id: data.productId },
    });

    if (!product || product.salonId !== offer.salonId) {
      throw new Error('Invalid product or product does not belong to this salon');
    }
  }

  if (data.offerType === 'service' && data.serviceId) {
    const service = await prisma.service.findUnique({
      where: { id: data.serviceId },
    });

    if (!service || service.salonId !== offer.salonId) {
      throw new Error('Invalid service or service does not belong to this salon');
    }
  }

  return prisma.offer.update({
    where: { id },
    data: {
      title: data.title,
      description: data.description,
      offerType: data.offerType,
      productId: data.productId,
      serviceId: data.serviceId,
      discountType: data.discountType,
      discountValue:
        data.discountValue !== undefined ? new Prisma.Decimal(data.discountValue) : undefined,
      startsAt: data.startsAt ? new Date(data.startsAt) : undefined,
      endsAt: data.endsAt ? new Date(data.endsAt) : undefined,
      image: imageUrl !== undefined ? imageUrl : undefined,
    },
    include: {
      salon: {
        select: { id: true, name: true },
      },
      product: {
        select: { id: true, title: true },
      },
      service: {
        select: { id: true, title: true },
      },
    },
  });
}

export async function toggleOfferActive(id: string, ownerId: string) {
  const offer = await prisma.offer.findUnique({
    where: { id },
    include: { salon: true },
  });

  if (!offer) {
    throw new Error('Offer not found');
  }

  if (offer.salon.ownerId !== ownerId) {
    throw new Error('Unauthorized: You do not own this offer');
  }

  return prisma.offer.update({
    where: { id },
    data: { isActive: !offer.isActive },
    include: {
      salon: {
        select: { id: true, name: true },
      },
      product: {
        select: { id: true, title: true },
      },
      service: {
        select: { id: true, title: true },
      },
    },
  });
}

export async function deleteOffer(id: string, ownerId: string) {
  const offer = await prisma.offer.findUnique({
    where: { id },
    include: { salon: true },
  });

  if (!offer) {
    throw new Error('Offer not found');
  }

  if (offer.salon.ownerId !== ownerId) {
    throw new Error('Unauthorized: You do not own this offer');
  }

  return prisma.offer.delete({
    where: { id },
  });
}

export async function listOffersForSalon(filters: GetOffersFilters, ownerId: string) {
  const page = filters.page || 1;
  const limit = filters.limit || 10;
  const skip = (page - 1) * limit;

  const where: {
    salon?: { ownerId: string };
    salonId?: string;
    productId?: string;
    serviceId?: string;
    isActive?: boolean;
  } = {
    salon: { ownerId },
  };

  if (filters.salonId) {
    where.salonId = filters.salonId;
  }

  if (filters.productId) {
    where.productId = filters.productId;
  }

  if (filters.serviceId) {
    where.serviceId = filters.serviceId;
  }

  if (filters.activeOnly) {
    where.isActive = true;
  }

  const [offers, total] = await Promise.all([
    prisma.offer.findMany({
      where,
      skip,
      take: limit,
      include: {
        salon: {
          select: { id: true, name: true },
        },
        product: {
          select: { id: true, title: true },
        },
        service: {
          select: { id: true, title: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.offer.count({ where }),
  ]);

  return {
    offers,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getOfferById(id: string) {
  return prisma.offer.findUnique({
    where: { id },
    include: {
      salon: {
        select: { id: true, name: true, address: true },
      },
      product: {
        select: { id: true, title: true, price: true },
      },
      service: {
        select: { id: true, title: true, price: true },
      },
    },
  });
}

export async function getActiveOffers(filters: Omit<GetOffersFilters, 'activeOnly'>) {
  const page = filters.page || 1;
  const limit = filters.limit || 10;
  const skip = (page - 1) * limit;

  const now = new Date();

  const where: {
    isActive: boolean;
    startsAt: { lte: Date };
    endsAt: { gte: Date };
    salonId?: string;
    productId?: string;
    serviceId?: string;
  } = {
    isActive: true,
    startsAt: { lte: now },
    endsAt: { gte: now },
  };

  if (filters.salonId) {
    where.salonId = filters.salonId;
  }

  if (filters.productId) {
    where.productId = filters.productId;
  }

  if (filters.serviceId) {
    where.serviceId = filters.serviceId;
  }

  const [offers, total] = await Promise.all([
    prisma.offer.findMany({
      where,
      skip,
      take: limit,
      include: {
        salon: {
          select: { id: true, name: true },
        },
        product: {
          select: { id: true, title: true },
        },
        service: {
          select: { id: true, title: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.offer.count({ where }),
  ]);

  return {
    offers,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function validateAndCalculateDiscount(
  offerId: string,
  amount: number,
  context: ValidateOfferContext
) {
  const offer = await prisma.offer.findUnique({
    where: { id: offerId },
    include: {
      salon: true,
      product: true,
      service: true,
    },
  });

  if (!offer) {
    return {
      valid: false,
      discountAmount: 0,
      finalAmount: amount,
      error: 'Offer not found',
    };
  }

  if (!offer.isActive) {
    return {
      valid: false,
      discountAmount: 0,
      finalAmount: amount,
      error: 'Offer is not active',
    };
  }

  const now = new Date();
  if (now < offer.startsAt || now > offer.endsAt) {
    return {
      valid: false,
      discountAmount: 0,
      finalAmount: amount,
      error: 'Offer is expired or not yet started',
    };
  }

  if (offer.offerType === 'salon') {
    if (context.salonId && context.salonId !== offer.salonId) {
      return {
        valid: false,
        discountAmount: 0,
        finalAmount: amount,
        error: 'Offer is not applicable to this salon',
      };
    }
  }

  if (offer.offerType === 'product') {
    if (!context.productId || context.productId !== offer.productId) {
      return {
        valid: false,
        discountAmount: 0,
        finalAmount: amount,
        error: 'Offer is not applicable to this product',
      };
    }
    if (context.salonId && context.salonId !== offer.salonId) {
      return {
        valid: false,
        discountAmount: 0,
        finalAmount: amount,
        error: 'Offer is not applicable to this salon',
      };
    }
  }

  if (offer.offerType === 'service') {
    if (!context.serviceId || context.serviceId !== offer.serviceId) {
      return {
        valid: false,
        discountAmount: 0,
        finalAmount: amount,
        error: 'Offer is not applicable to this service',
      };
    }
    if (context.salonId && context.salonId !== offer.salonId) {
      return {
        valid: false,
        discountAmount: 0,
        finalAmount: amount,
        error: 'Offer is not applicable to this salon',
      };
    }
  }

  const discountValue = offer.discountValue.toNumber();
  let discountAmount = 0;

  if (offer.discountType === 'percentage') {
    discountAmount = (amount * discountValue) / 100;
  } else {
    discountAmount = discountValue;
  }

  discountAmount = Math.round(discountAmount * 100) / 100;
  const finalAmount = Math.max(0, Math.round((amount - discountAmount) * 100) / 100);

  return {
    valid: true,
    discountAmount,
    finalAmount,
    error: null,
  };
}
