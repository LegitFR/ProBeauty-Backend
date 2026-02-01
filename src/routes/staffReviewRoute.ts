import { Router } from 'express';

import {
  createStaffReview,
  deleteStaffReview,
  getMyStaffReviews,
  getStaffReview,
  getStaffReviews,
  updateStaffReview,
} from '@/controllers/staffController';
import { authenticate } from '@/middlewares/auth/authenticate';
import { validateRequest } from '@/middlewares/validateRequest';
import {
  createStaffReviewSchema,
  staffIdParamsForReviewsSchema,
  staffReviewIdParamsSchema,
  staffReviewQuerySchema,
  updateStaffReviewSchema,
} from '@/schemas/staffSchema';

const router = Router();

/**
 * @route   POST /api/v1/staff-reviews
 * @desc    Create a staff review (requires authentication and completed booking)
 * @access  Private
 */
router.post(
  '/',
  authenticate,
  validateRequest({ body: createStaffReviewSchema }),
  createStaffReview
);

/**
 * @route   GET /api/v1/staff-reviews/user/me
 * @desc    Get current user's staff reviews
 * @access  Private
 */
router.get(
  '/user/me',
  authenticate,
  validateRequest({ query: staffReviewQuerySchema }),
  getMyStaffReviews
);

/**
 * @route   GET /api/v1/staff-reviews/staff/:staffId
 * @desc    Get all reviews for a specific staff member
 * @access  Public
 */
router.get(
  '/staff/:staffId',
  validateRequest({
    params: staffIdParamsForReviewsSchema,
    query: staffReviewQuerySchema,
  }),
  getStaffReviews
);

/**
 * @route   GET /api/v1/staff-reviews/:id
 * @desc    Get a specific staff review
 * @access  Public
 */
router.get('/:id', validateRequest({ params: staffReviewIdParamsSchema }), getStaffReview);

/**
 * @route   PATCH /api/v1/staff-reviews/:id
 * @desc    Update a staff review (owner only)
 * @access  Private
 */
router.patch(
  '/:id',
  authenticate,
  validateRequest({
    params: staffReviewIdParamsSchema,
    body: updateStaffReviewSchema,
  }),
  updateStaffReview
);

/**
 * @route   DELETE /api/v1/staff-reviews/:id
 * @desc    Delete a staff review (owner only)
 * @access  Private
 */
router.delete(
  '/:id',
  authenticate,
  validateRequest({ params: staffReviewIdParamsSchema }),
  deleteStaffReview
);

export default router;
