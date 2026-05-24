import type { NextFunction, Request, Response } from 'express';

import * as reviewService from '@/services/reviewService';

export async function createReview(req: Request, res: Response, next: NextFunction): Promise<void> {
  const { salonId, serviceId, productId, rating, comment } = req.body;
  const userId = req.user?.id;

  if (!userId) {
    res.status(401).json({ success: false, message: 'Authentication required' });
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
      success: true,
      message: 'Review created successfully',
      data: review,
    });
  } catch (error) {
    next(error);
  }
}

export async function getReview(req: Request, res: Response, next: NextFunction): Promise<void> {
  const { id } = req.params;

  try {
    const review = await reviewService.getReviewById(id);

    if (!review) {
      res.status(404).json({ success: false, message: 'Review not found' });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Review retrieved successfully',
      data: review,
    });
  } catch (error) {
    next(error);
  }
}

export async function getReviewsBySalon(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const { salonId } = req.params;
  const { page, limit } = req.query;

  try {
    const filters = {
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    };

    const result = await reviewService.getReviewsBySalonId(salonId, filters);

    res.status(200).json({
      success: true,
      message: 'Reviews retrieved successfully',
      data: result.reviews,
      averageRating: result.averageRating,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
}

export async function getMyReviews(req: Request, res: Response, next: NextFunction): Promise<void> {
  const userId = req.user?.id;
  const { page, limit } = req.query;

  if (!userId) {
    res.status(401).json({ success: false, message: 'Authentication required' });
    return;
  }

  try {
    const filters = {
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    };

    const result = await reviewService.getReviewsByUserId(userId, filters);

    res.status(200).json({
      success: true,
      message: 'Reviews retrieved successfully',
      data: result.reviews,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateReview(req: Request, res: Response, next: NextFunction): Promise<void> {
  const { id } = req.params;
  const { rating, comment } = req.body;
  const userId = req.user?.id;

  if (!userId) {
    res.status(401).json({ success: false, message: 'Authentication required' });
    return;
  }

  try {
    const review = await reviewService.updateReview(id, userId, { rating, comment });

    res.status(200).json({
      success: true,
      message: 'Review updated successfully',
      data: review,
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteReview(req: Request, res: Response, next: NextFunction): Promise<void> {
  const { id } = req.params;
  const userId = req.user?.id;

  if (!userId) {
    res.status(401).json({ success: false, message: 'Authentication required' });
    return;
  }

  try {
    await reviewService.deleteReview(id, userId);

    res.status(200).json({ success: true, message: 'Review deleted successfully' });
  } catch (error) {
    next(error);
  }
}
