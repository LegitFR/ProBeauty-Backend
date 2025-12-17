import type { Request, Response } from 'express';

import * as reviewService from '@/services/reviewService';

/**
 * Create a new review
 * POST /api/v1/reviews
 */
export async function createReview(req: Request, res: Response): Promise<void> {
  const { salonId, serviceId, productId, rating, comment } = req.body;
  const userId = req.user?.id;

  if (!userId) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  try {
    const review = await reviewService.createReview({
      userId,
      salonId,
      serviceId,
      productId,
      rating,
      comment,
    });

    res.status(201).json({
      message: 'Review created successfully',
      data: review,
    });
  } catch (error) {
    if (error instanceof Error) {
      if (
        error.message === 'Salon not found' ||
        error.message === 'Service not found' ||
        error.message === 'Product not found'
      ) {
        res.status(404).json({ message: error.message });
        return;
      }
      if (
        error.message === 'Service does not belong to this salon' ||
        error.message === 'Product does not belong to this salon'
      ) {
        res.status(400).json({ message: error.message });
        return;
      }
    }
    res.status(500).json({
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * Get a single review by ID
 * GET /api/v1/reviews/:id
 */
export async function getReview(req: Request, res: Response): Promise<void> {
  const { id } = req.params;

  try {
    const review = await reviewService.getReviewById(id);

    if (!review) {
      res.status(404).json({ message: 'Review not found' });
      return;
    }

    res.status(200).json({
      message: 'Review retrieved successfully',
      data: review,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * Get reviews by salon ID
 * GET /api/v1/reviews/salon/:salonId
 */
export async function getReviewsBySalon(req: Request, res: Response): Promise<void> {
  const { salonId } = req.params;
  const { page, limit } = req.query;

  try {
    const filters = {
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    };

    const result = await reviewService.getReviewsBySalonId(salonId, filters);

    res.status(200).json({
      message: 'Reviews retrieved successfully',
      data: result.reviews,
      averageRating: result.averageRating,
      pagination: result.pagination,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * Get reviews by current user
 * GET /api/v1/reviews/user/me
 */
export async function getMyReviews(req: Request, res: Response): Promise<void> {
  const userId = req.user?.id;
  const { page, limit } = req.query;

  if (!userId) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  try {
    const filters = {
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    };

    const result = await reviewService.getReviewsByUserId(userId, filters);

    res.status(200).json({
      message: 'Reviews retrieved successfully',
      data: result.reviews,
      pagination: result.pagination,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * Update a review
 * PATCH /api/v1/reviews/:id
 */
export async function updateReview(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const { rating, comment } = req.body;
  const userId = req.user?.id;

  if (!userId) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  try {
    const review = await reviewService.updateReview(id, userId, {
      rating,
      comment,
    });

    res.status(200).json({
      message: 'Review updated successfully',
      data: review,
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Review not found') {
        res.status(404).json({ message: error.message });
        return;
      }
      if (error.message === 'Unauthorized: You can only update your own reviews') {
        res.status(403).json({ message: error.message });
        return;
      }
    }
    res.status(500).json({
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * Delete a review
 * DELETE /api/v1/reviews/:id
 */
export async function deleteReview(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const userId = req.user?.id;

  if (!userId) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  try {
    await reviewService.deleteReview(id, userId);

    res.status(200).json({
      message: 'Review deleted successfully',
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Review not found') {
        res.status(404).json({ message: error.message });
        return;
      }
      if (error.message === 'Unauthorized: You can only delete your own reviews') {
        res.status(403).json({ message: error.message });
        return;
      }
    }
    res.status(500).json({
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
