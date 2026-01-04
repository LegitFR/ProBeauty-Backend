/**
 * Analytics Routes
 *
 * API endpoints for salon revenue analytics
 */

import { Router } from 'express';

import { getSalonAnalytics } from '@/controllers/analyticsController';
import { authenticate } from '@/middlewares/auth/authenticate';
import { validateRequest } from '@/middlewares/validateRequest';
import { analyticsParamsSchema, analyticsQuerySchema } from '@/schemas/analyticsSchema';

const router = Router();

// All analytics routes require authentication
router.use(authenticate);

/**
 * GET /api/v1/salons/:salonId/analytics
 * Get revenue analytics for a specific salon
 *
 * Access Control:
 * - Salon owners: Can view their own salon's analytics
 * - Admins: Can view any salon's analytics
 *
 * Query Parameters:
 * - startDate (optional): ISO 8601 datetime string for start of date range
 * - endDate (optional): ISO 8601 datetime string for end of date range
 *
 * Response:
 * - 200: Analytics data retrieved successfully
 * - 401: User not authenticated
 * - 403: User does not own the salon (non-admin)
 * - 404: Salon not found
 * - 400: Invalid query parameters
 */
router.get(
  '/:salonId/analytics',
  validateRequest({
    params: analyticsParamsSchema,
    query: analyticsQuerySchema,
  }),
  getSalonAnalytics
);

export default router;
