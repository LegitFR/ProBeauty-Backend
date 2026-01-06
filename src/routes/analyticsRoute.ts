/**
 * Analytics Routes
 *
 * API endpoints for salon revenue analytics
 * Base path: /api/v1/analytics
 */

import { Router } from 'express';

import { getAdminAnalytics, getSalonAnalytics } from '@/controllers/analyticsController';
import { authenticate, authorize } from '@/middlewares/auth/authenticate';
import { validateRequest } from '@/middlewares/validateRequest';
import {
  adminAnalyticsQuerySchema,
  analyticsParamsSchema,
  analyticsQuerySchema,
} from '@/schemas/analyticsSchema';

const router = Router();

// All analytics routes require authentication
router.use(authenticate);

/**
 * GET /api/v1/analytics/admin
 * Get platform-wide analytics for admin dashboard
 *
 * Access Control:
 * - Admin only
 *
 * Query Parameters:
 * - startDate (optional): ISO 8601 datetime string for start of date range
 * - endDate (optional): ISO 8601 datetime string for end of date range
 * - period (optional): 'daily' | 'weekly' | 'monthly' (default: 'monthly')
 * - topServicesLimit (optional): Number of top services to return (default: 10, max: 50)
 *
 * Response:
 * - 200: Admin analytics data retrieved successfully
 * - 401: User not authenticated
 * - 403: User is not an admin
 * - 400: Invalid query parameters
 */
router.get(
  '/admin',
  authorize(['admin', 'ADMIN']),
  validateRequest({
    query: adminAnalyticsQuerySchema,
  }),
  getAdminAnalytics
);

/**
 * GET /api/v1/analytics/salons/:salonId
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
  '/salons/:salonId',
  validateRequest({
    params: analyticsParamsSchema,
    query: analyticsQuerySchema,
  }),
  getSalonAnalytics
);

export default router;
