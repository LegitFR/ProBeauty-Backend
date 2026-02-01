import { prisma } from '@/configs/db';
import { BOOKING_STATUS } from '@/constants/bookingStatus';

interface CreateStaffReviewData {
  userId: string;
  staffId: string;
  bookingId: string;
  rating: number;
  comment?: string;
}

interface UpdateStaffReviewData {
  rating?: number;
  comment?: string;
}

interface GetStaffReviewsFilters {
  page?: number;
  limit?: number;
}

/**
 * Recalculate and update staff averageRating and totalRatings.
 * Call after create, update, or delete of a staff review.
 */
export async function updateStaffRatingAggregates(staffId: string): Promise<void> {
  const result = await prisma.staffReview.aggregate({
    where: { staffId },
    _avg: { rating: true },
    _count: { id: true },
  });

  await prisma.staff.update({
    where: { id: staffId },
    data: {
      averageRating: result._count.id === 0 ? null : (result._avg.rating ?? null),
      totalRatings: result._count.id,
    },
  });
}

/**
 * Create a staff review. Validates:
 * - Booking exists, belongs to user, has correct staff, and is COMPLETED
 * - User has not already reviewed this staff (unique constraint)
 */
export async function createStaffReview(data: CreateStaffReviewData) {
  const { userId, staffId, bookingId, rating, comment } = data;

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
  });

  if (!booking || booking.userId !== userId) {
    throw new Error('Booking not found or unauthorized');
  }

  if (booking.staffId !== staffId) {
    throw new Error('Booking does not belong to this staff member');
  }

  if (booking.status !== BOOKING_STATUS.COMPLETED) {
    throw new Error('Can only review staff after completing a booking');
  }

  const existingReview = await prisma.staffReview.findUnique({
    where: { userId_staffId: { userId, staffId } },
  });

  if (existingReview) {
    throw new Error('You have already reviewed this staff member');
  }

  const review = await prisma.$transaction(async (tx) => {
    const created = await tx.staffReview.create({
      data: { userId, staffId, bookingId, rating, comment },
      include: {
        user: { select: { id: true, name: true } },
        staff: { select: { id: true, name: true } },
        booking: { select: { id: true } },
      },
    });

    const agg = await tx.staffReview.aggregate({
      where: { staffId },
      _avg: { rating: true },
      _count: { id: true },
    });

    await tx.staff.update({
      where: { id: staffId },
      data: {
        averageRating: agg._avg.rating ?? null,
        totalRatings: agg._count.id,
      },
    });

    return created;
  });

  return review;
}

/**
 * Get a staff review by ID
 */
export async function getStaffReviewById(id: string) {
  return prisma.staffReview.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, name: true } },
      staff: { select: { id: true, name: true, averageRating: true, totalRatings: true } },
      booking: { select: { id: true } },
    },
  });
}

/**
 * Get reviews for a staff member with pagination and staff average rating
 */
export async function getReviewsByStaffId(staffId: string, filters?: GetStaffReviewsFilters) {
  const page = filters?.page ?? 1;
  const limit = filters?.limit ?? 10;
  const skip = (page - 1) * limit;

  const [reviews, total, staff] = await Promise.all([
    prisma.staffReview.findMany({
      where: { staffId },
      skip,
      take: limit,
      include: {
        user: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.staffReview.count({ where: { staffId } }),
    prisma.staff.findUnique({
      where: { id: staffId },
      select: { averageRating: true, totalRatings: true },
    }),
  ]);

  return {
    reviews,
    averageRating: staff?.averageRating ?? null,
    totalRatings: staff?.totalRatings ?? 0,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * Get staff reviews by user ID with pagination
 */
export async function getReviewsByUserId(userId: string, filters?: GetStaffReviewsFilters) {
  const page = filters?.page ?? 1;
  const limit = filters?.limit ?? 10;
  const skip = (page - 1) * limit;

  const [reviews, total] = await Promise.all([
    prisma.staffReview.findMany({
      where: { userId },
      skip,
      take: limit,
      include: {
        staff: { select: { id: true, name: true, image: true } },
        booking: { select: { id: true } },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.staffReview.count({ where: { userId } }),
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
 * Update a staff review. Only the review owner can update.
 */
export async function updateStaffReview(id: string, userId: string, data: UpdateStaffReviewData) {
  const review = await prisma.staffReview.findUnique({
    where: { id },
  });

  if (!review) {
    throw new Error('Staff review not found');
  }

  if (review.userId !== userId) {
    throw new Error('Unauthorized: You can only update your own reviews');
  }

  const updated = await prisma.$transaction(async (tx) => {
    const result = await tx.staffReview.update({
      where: { id },
      data,
      include: {
        user: { select: { id: true, name: true } },
        staff: { select: { id: true, name: true } },
        booking: { select: { id: true } },
      },
    });

    const agg = await tx.staffReview.aggregate({
      where: { staffId: review.staffId },
      _avg: { rating: true },
      _count: { id: true },
    });

    await tx.staff.update({
      where: { id: review.staffId },
      data: {
        averageRating: agg._avg.rating ?? null,
        totalRatings: agg._count.id,
      },
    });

    return result;
  });

  return updated;
}

/**
 * Delete a staff review. Only the review owner can delete.
 */
export async function deleteStaffReview(id: string, userId: string) {
  const review = await prisma.staffReview.findUnique({
    where: { id },
  });

  if (!review) {
    throw new Error('Staff review not found');
  }

  if (review.userId !== userId) {
    throw new Error('Unauthorized: You can only delete your own reviews');
  }

  const staffId = review.staffId;

  await prisma.$transaction(async (tx) => {
    await tx.staffReview.delete({
      where: { id },
    });

    const agg = await tx.staffReview.aggregate({
      where: { staffId },
      _avg: { rating: true },
      _count: { id: true },
    });

    await tx.staff.update({
      where: { id: staffId },
      data: {
        averageRating: agg._count.id === 0 ? null : (agg._avg.rating ?? null),
        totalRatings: agg._count.id,
      },
    });
  });
}
