import type { Request, Response } from 'express';

import * as favouriteService from '@/services/favouriteService';

/**
 * Add a product to favourites
 * POST /api/v1/favourites
 */
export async function addFavourite(req: Request, res: Response): Promise<void> {
  const { productId } = req.body;
  const userId = req.user?.id;

  if (!userId) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  try {
    const favourite = await favouriteService.addFavourite(userId, productId);

    res.status(201).json({
      message: 'Product added to favourites',
      data: favourite,
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Product not found') {
        res.status(404).json({ message: error.message });
        return;
      }
      if (error.message === 'Product already in favourites') {
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
 * Remove a product from favourites
 * DELETE /api/v1/favourites/:productId
 */
export async function removeFavourite(req: Request, res: Response): Promise<void> {
  const { productId } = req.params;
  const userId = req.user?.id;

  if (!userId) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  try {
    await favouriteService.removeFavourite(userId, productId);

    res.status(200).json({
      message: 'Product removed from favourites',
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Favourite not found') {
        res.status(404).json({ message: error.message });
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
 * Get user's favourites
 * GET /api/v1/favourites
 */
export async function getFavourites(req: Request, res: Response): Promise<void> {
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

    const result = await favouriteService.getUserFavourites(userId, filters);

    res.status(200).json({
      message: 'Favourites retrieved successfully',
      data: result.favourites,
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
 * Check if a product is in favourites
 * GET /api/v1/favourites/check/:productId
 */
export async function checkFavourite(req: Request, res: Response): Promise<void> {
  const { productId } = req.params;
  const userId = req.user?.id;

  if (!userId) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  try {
    const isFavourited = await favouriteService.checkFavourite(userId, productId);

    res.status(200).json({
      message: 'Favourite status retrieved',
      data: {
        productId,
        isFavourited,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
