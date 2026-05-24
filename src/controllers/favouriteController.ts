import type { Request, Response } from 'express';

import * as favouriteService from '@/services/favouriteService';

/**
 * POST /api/v1/favourites
 * Body: { type: 'product' | 'salon', itemId: string }
 */
export async function addFavourite(req: Request, res: Response): Promise<void> {
  const { type, itemId } = req.body;
  const userId = req.user?.id;

  if (!userId) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  try {
    const favourite = await favouriteService.addFavourite(userId, type, itemId);

    res.status(201).json({
      message: `${type === 'salon' ? 'Salon' : 'Product'} added to favourites`,
      data: favourite,
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Product not found' || error.message === 'Salon not found') {
        res.status(404).json({ message: error.message });
        return;
      }
      if (
        error.message === 'Product already in favourites' ||
        error.message === 'Salon already in favourites'
      ) {
        res.status(409).json({ message: error.message });
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
 * DELETE /api/v1/favourites/:id?type=product|salon
 */
export async function removeFavourite(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const type = req.query.type as 'product' | 'salon';
  const userId = req.user?.id;

  if (!userId) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  try {
    await favouriteService.removeFavourite(userId, type, id);

    res.status(200).json({
      message: `${type === 'salon' ? 'Salon' : 'Product'} removed from favourites`,
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Favourite not found') {
      res.status(404).json({ message: error.message });
      return;
    }
    res.status(500).json({
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * GET /api/v1/favourites?type=product|salon&page=1&limit=10
 */
export async function getFavourites(req: Request, res: Response): Promise<void> {
  const userId = req.user?.id;
  const { type, page, limit } = req.query;

  if (!userId) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  try {
    const result = await favouriteService.getUserFavourites(userId, {
      type: type as 'product' | 'salon',
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });

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
 * GET /api/v1/favourites/check/:id?type=product|salon
 */
export async function checkFavourite(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const type = req.query.type as 'product' | 'salon';
  const userId = req.user?.id;

  if (!userId) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  try {
    const isFavourited = await favouriteService.checkFavourite(userId, type, id);

    res.status(200).json({
      message: 'Favourite status retrieved',
      data: { id, type, isFavourited },
    });
  } catch (error) {
    res.status(500).json({
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
