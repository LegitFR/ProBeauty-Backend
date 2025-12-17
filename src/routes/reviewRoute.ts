import { Router } from 'express';

import {
  createReview,
  getReview,
  getReviewsBySalon,
  getMyReviews,
  updateReview,
  deleteReview,
} from '@/controllers/reviewController';
import { authenticate } from '@/middlewares/auth/authenticate';
import { validateRequest } from '@/middlewares/validateRequest';
import {
  createReviewSchema,
  updateReviewSchema,
  reviewIdParamsSchema,
  salonIdParamsSchema,
  reviewQuerySchema,
} from '@/schemas/reviewSchema';

const router = Router();

/**
 * @route   POST /api/v1/reviews
 * @desc    Create a new review
 * @access  Private
 */
router.post('/', authenticate, validateRequest({ body: createReviewSchema }), createReview);

/**
 * @route   GET /api/v1/reviews/user/me
 * @desc    Get current user's reviews
 * @access  Private
 */
router.get('/user/me', authenticate, validateRequest({ query: reviewQuerySchema }), getMyReviews);

/**
 * @route   GET /api/v1/reviews/salon/:salonId
 * @desc    Get reviews by salon ID
 * @access  Public
 */
router.get(
  '/salon/:salonId',
  validateRequest({ params: salonIdParamsSchema, query: reviewQuerySchema }),
  getReviewsBySalon
);

/**
 * @route   GET /api/v1/reviews/:id
 * @desc    Get a single review by ID
 * @access  Public
 */
router.get('/:id', validateRequest({ params: reviewIdParamsSchema }), getReview);

/**
 * @route   PATCH /api/v1/reviews/:id
 * @desc    Update a review (owner only)
 * @access  Private
 */
router.patch(
  '/:id',
  authenticate,
  validateRequest({
    params: reviewIdParamsSchema,
    body: updateReviewSchema,
  }),
  updateReview
);

/**
 * @route   DELETE /api/v1/reviews/:id
 * @desc    Delete a review (owner only)
 * @access  Private
 */
router.delete(
  '/:id',
  authenticate,
  validateRequest({ params: reviewIdParamsSchema }),
  deleteReview
);

export default router;
