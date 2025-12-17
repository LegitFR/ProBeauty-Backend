import { Router } from 'express';

import {
  addFavourite,
  removeFavourite,
  getFavourites,
  checkFavourite,
} from '@/controllers/favouriteController';
import { authenticate } from '@/middlewares/auth/authenticate';
import { validateRequest } from '@/middlewares/validateRequest';
import {
  addFavouriteSchema,
  productIdParamsSchema,
  favouriteQuerySchema,
} from '@/schemas/favouriteSchema';

const router = Router();

/**
 * @route   POST /api/v1/favourites
 * @desc    Add a product to favourites
 * @access  Private
 */
router.post('/', authenticate, validateRequest({ body: addFavouriteSchema }), addFavourite);

/**
 * @route   GET /api/v1/favourites
 * @desc    Get user's favourites
 * @access  Private
 */
router.get('/', authenticate, validateRequest({ query: favouriteQuerySchema }), getFavourites);

/**
 * @route   GET /api/v1/favourites/check/:productId
 * @desc    Check if a product is in favourites
 * @access  Private
 */
router.get(
  '/check/:productId',
  authenticate,
  validateRequest({ params: productIdParamsSchema }),
  checkFavourite
);

/**
 * @route   DELETE /api/v1/favourites/:productId
 * @desc    Remove a product from favourites
 * @access  Private
 */
router.delete(
  '/:productId',
  authenticate,
  validateRequest({ params: productIdParamsSchema }),
  removeFavourite
);

export default router;
