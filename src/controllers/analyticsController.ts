/**
 * Analytics Controller
 *
 * HTTP request handlers for salon analytics endpoints
 */

import type { Request, Response } from 'express';

import { prisma } from '@/configs/db';
import * as analyticsService from '@/services/analyticsService';

/**
 * Get revenue analytics for a specific salon
 * Authorization: Salon owners can view their own salon, admins can view any salon
 *
 * @route GET /api/v1/salons/:salonId/analytics
 * @param req - Express request object with salonId param and optional date query params
 * @param res - Express response object
 */
export async function getSalonAnalytics(req: Request, res: Response): Promise<void> {
  try {
    const { salonId } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (!userId) {
      res.status(401).json({
        message: 'User not authenticated',
      });
      return;
    }

    // Authorization check: Verify user can access this salon's data
    if (userRole !== 'admin' && userRole !== 'ADMIN') {
      // Non-admin users must be the salon owner
      const salon = await prisma.salon.findFirst({
        where: {
          id: salonId,
          ownerId: userId,
        },
      });

      if (!salon) {
        res.status(403).json({
          message: 'Unauthorized: You do not own this salon',
        });
        return;
      }
    } else {
      // Admin users: Verify salon exists
      const salon = await prisma.salon.findUnique({
        where: { id: salonId },
      });

      if (!salon) {
        res.status(404).json({
          message: 'Salon not found',
        });
        return;
      }
    }

    // Get analytics data
    const analytics = await analyticsService.getSalonAnalytics(salonId, {
      startDate: req.query.startDate as string | undefined,
      endDate: req.query.endDate as string | undefined,
    });

    res.status(200).json({
      message: 'Analytics retrieved successfully',
      data: analytics,
    });
  } catch (error) {
    console.error('Error fetching salon analytics:', error);
    res.status(500).json({
      message: 'Failed to retrieve analytics',
    });
  }
}
