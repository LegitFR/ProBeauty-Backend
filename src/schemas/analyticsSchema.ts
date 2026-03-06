/**
 * Analytics Validation Schemas
 *
 * Zod schemas for validating analytics API requests
 */

import { z } from 'zod';

/**
 * Schema for validating salonId parameter
 */
export const analyticsParamsSchema = z.object({
  salonId: z.string().cuid('Invalid salon ID format'),
});

/**
 * Schema for validating analytics query parameters
 * Supports optional date range filtering with validation
 */
export const analyticsQuerySchema = z
  .object({
    startDate: z
      .string()
      .datetime('Invalid start date format. Must be ISO 8601 datetime string')
      .optional(),
    endDate: z
      .string()
      .datetime('Invalid end date format. Must be ISO 8601 datetime string')
      .optional(),
  })
  .refine(
    (data) => {
      // Validate that startDate is not after endDate
      if (data.startDate && data.endDate) {
        return new Date(data.startDate) <= new Date(data.endDate);
      }
      return true;
    },
    {
      message: 'startDate must be before or equal to endDate',
    }
  );

/**
 * Schema for validating admin analytics query parameters
 * Supports date range, period granularity, and top services limit
 */
export const adminAnalyticsQuerySchema: AnyZodObject = z
  .object({
    startDate: z
      .string()
      .datetime('Invalid start date format. Must be ISO 8601 datetime string')
      .optional(),
    endDate: z
      .string()
      .datetime('Invalid end date format. Must be ISO 8601 datetime string')
      .optional(),
    period: z.enum(['daily', 'weekly', 'monthly']).default('monthly').optional(),
    topServicesLimit: z
      .string()
      .transform((val) => parseInt(val, 10))
      .pipe(z.number().int().positive().max(50))
      .optional()
      .default('10'),
  })
  .refine(
    (data) => {
      if (data.startDate && data.endDate) {
        return new Date(data.startDate) <= new Date(data.endDate);
      }
      return true;
    },
    {
      message: 'startDate must be before or equal to endDate',
    }
  );
