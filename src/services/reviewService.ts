import { prisma } from '@/configs/db';
import { AppError } from '@/utils/AppError';

interface CreateReviewData {
  userId: string;
  salonId: string;
  serviceId?: string;
  productId?: string;
  rating: number;
  comment?: string;
}

interface UpdateReviewData {
  rating?: number;
  comment?: string;
}

interface GetReviewsFilters {
  page?: number;
  limit?: number;
}

/**
 * Create a new review
 */
export async function createReview(data: CreateReviewData) {
  const { userId, salonId, serviceId, productId, rating, comment } = data;

  // Verify salon exists
  const salon = await prisma.salon.findUnique({
    where: { id: salonId },
  });

  if (!salon) {
    throw new AppError('Salon not found', 404);
  }

  // Verify service exists if provided
  if (serviceId) {
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
    });

    if (!service) {
      throw new AppError('Service not found', 404);
    }

    // Verify service belongs to the salon
    if (service.salonId !== salonId) {
      throw new AppError('Service does not belong to this salon', 400);
    }
  }

  // Verify product exists if provided
  if (productId) {
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new AppError('Product not found', 404);
    }

    // Verify product belongs to the salon
    if (product.salonId !== salonId) {
      throw new AppError('Product does not belong to this salon', 400);
    }
  }

  return prisma.review.create({
    data: {
      userId,
      salonId,
      serviceId,
      productId,
      rating,
      comment,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
        },
      },
      salon: {
        select: {
          id: true,
          name: true,
        },
      },
      service: {
        select: {
          id: true,
          title: true,
        },
      },
      product: {
        select: {
          id: true,
          title: true,
        },
      },
    },
  });
}

/**
 * Get a review by ID
 */
export async function getReviewById(id: string) {
  return prisma.review.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          name: true,
        },
      },
      salon: {
        select: {
          id: true,
          name: true,
        },
      },
      service: {
        select: {
          id: true,
          title: true,
        },
      },
      product: {
        select: {
          id: true,
          title: true,
        },
      },
    },
  });
}

/**
 * Get reviews by salon ID with pagination
 */
export async function getReviewsBySalonId(salonId: string, filters?: GetReviewsFilters) {
  const page = filters?.page || 1;
  const limit = filters?.limit || 10;
  const skip = (page - 1) * limit;

  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where: { salonId },
      skip,
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
        service: {
          select: {
            id: true,
            title: true,
          },
        },
        product: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.review.count({ where: { salonId } }),
  ]);

  // Calculate average rating for the salon
  const avgResult = await prisma.review.aggregate({
    where: { salonId },
    _avg: {
      rating: true,
    },
  });

  return {
    reviews,
    averageRating: avgResult._avg.rating || 0,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * Get reviews by user ID with pagination
 */
export async function getReviewsByUserId(userId: string, filters?: GetReviewsFilters) {
  const page = filters?.page || 1;
  const limit = filters?.limit || 10;
  const skip = (page - 1) * limit;

  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where: { userId },
      skip,
      take: limit,
      include: {
        salon: {
          select: {
            id: true,
            name: true,
          },
        },
        service: {
          select: {
            id: true,
            title: true,
          },
        },
        product: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.review.count({ where: { userId } }),
  ]);

  return {
    reviews,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * Update a review by ID
 */
export async function updateReview(id: string, userId: string, data: UpdateReviewData) {
  // Check if review exists and belongs to the user
  const review = await prisma.review.findUnique({
    where: { id },
  });

  if (!review) {
    throw new AppError('Review not found', 404);
  }

  if (review.userId !== userId) {
    throw new AppError('Unauthorized: You can only update your own reviews', 403);
  }

  return prisma.review.update({
    where: { id },
    data,
    include: {
      user: {
        select: {
          id: true,
          name: true,
        },
      },
      salon: {
        select: {
          id: true,
          name: true,
        },
      },
      service: {
        select: {
          id: true,
          title: true,
        },
      },
      product: {
        select: {
          id: true,
          title: true,
        },
      },
    },
  });
}

/**
 * Delete a review by ID
 */
export async function deleteReview(id: string, userId: string) {
  // Check if review exists and belongs to the user
  const review = await prisma.review.findUnique({
    where: { id },
  });

  if (!review) {
    throw new AppError('Review not found', 404);
  }

  if (review.userId !== userId) {
    throw new AppError('Unauthorized: You can only delete your own reviews', 403);
  }

  return prisma.review.delete({
    where: { id },
  });
}
