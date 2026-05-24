import { Router } from 'express';

import {
  addFavourite,
  checkFavourite,
  getFavourites,
  removeFavourite,
} from '@/controllers/favouriteController';
import { authenticate } from '@/middlewares/auth/authenticate';
import { validateRequest } from '@/middlewares/validateRequest';
import {
  addFavouriteSchema,
  checkFavouriteParamsSchema,
  checkFavouriteQuerySchema,
  favouriteQuerySchema,
  itemIdParamsSchema,
} from '@/schemas/favouriteSchema';

const router = Router();

/**
 * @route   POST /api/v1/favourites
 * @desc    Add a product or salon to favourites
 * @body    { type: 'product' | 'salon', itemId: string }
 * @access  Private
 */
router.post('/', authenticate, validateRequest({ body: addFavouriteSchema }), addFavourite);

/**
 * @route   GET /api/v1/favourites?type=product|salon
 * @desc    Get user's favourites by type
 * @access  Private
 */
router.get('/', authenticate, validateRequest({ query: favouriteQuerySchema }), getFavourites);

/**
 * @route   GET /api/v1/favourites/check/:id?type=product|salon
 * @desc    Check if a product or salon is in favourites
 * @access  Private
 */
router.get(
  '/check/:id',
  authenticate,
  validateRequest({ params: checkFavouriteParamsSchema, query: checkFavouriteQuerySchema }),
  checkFavourite
);

/**
 * @route   DELETE /api/v1/favourites/:id?type=product|salon
 * @desc    Remove a product or salon from favourites
 * @access  Private
 */
router.delete(
  '/:id',
  authenticate,
  validateRequest({ params: itemIdParamsSchema, query: checkFavouriteQuerySchema }),
  removeFavourite
);

export default router;
