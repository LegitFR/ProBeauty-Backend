/**
 * Analytics Validation Schemas
 *
 * Zod schemas for validating analytics API requests
 */

import { z, type AnyZodObject } from 'zod';

/**
 * Schema for validating salonId parameter
 */
export const analyticsParamsSchema: AnyZodObject = z.object({
  salonId: z.string().cuid('Invalid salon ID format'),
});

/**
 * Schema for validating analytics query parameters
 * Supports optional date range filtering with validation
 */
export const analyticsQuerySchema: AnyZodObject = z
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
