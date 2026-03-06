import { z, type AnyZodObject } from 'zod';

// Time slot schema for staff availability
const timeSlotSchema = z.object({
  start: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Time must be in HH:mm format'),
  end: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Time must be in HH:mm format'),
});

// Day availability schema
const dayAvailabilitySchema = z.object({
  isAvailable: z.boolean(),
  slots: z.array(timeSlotSchema).optional(),
});

// Complete availability schema for a week
export const staffAvailabilitySchema = z.object({
  monday: dayAvailabilitySchema,
  tuesday: dayAvailabilitySchema,
  wednesday: dayAvailabilitySchema,
  thursday: dayAvailabilitySchema,
  friday: dayAvailabilitySchema,
  saturday: dayAvailabilitySchema,
  sunday: dayAvailabilitySchema,
});

export type StaffAvailability = z.infer<typeof staffAvailabilitySchema>;
export type TimeSlot = z.infer<typeof timeSlotSchema>;
export type DayAvailability = z.infer<typeof dayAvailabilitySchema>;

export const createStaffSchema: AnyZodObject = z.object({
  name: z.string().min(1, 'Name is required'),
  salonId: z.string().cuid('Invalid salon ID format'),
  serviceId: z.string().cuid('Invalid service ID format'),
  availability: staffAvailabilitySchema.optional(),
  userId: z.string().cuid('Invalid user ID format').optional(),
});

export const updateStaffSchema: AnyZodObject = z.object({
  name: z.string().min(1, 'Name cannot be empty').optional(),
  serviceId: z.string().cuid('Invalid service ID format').optional(),
  availability: staffAvailabilitySchema.optional(),
  userId: z.string().cuid('Invalid user ID format').optional(),
});

export const getStaffParamsSchema: AnyZodObject = z.object({
  id: z.string().cuid('Invalid staff ID format'),
});

export const getStaffQuerySchema: AnyZodObject = z.object({
  page: z.string().transform(Number).optional(),
  limit: z.string().transform(Number).optional(),
  salonId: z.string().cuid('Invalid salon ID format').optional(),
});

export const getSalonStaffParamsSchema: AnyZodObject = z.object({
  salonId: z.string().cuid('Invalid salon ID format'),
});

export const getAvailableStaffByDateQuerySchema: AnyZodObject = z.object({
  salonId: z.string().cuid('Invalid salon ID format'),
  serviceId: z.string().cuid('Invalid service ID format').optional(),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid date format. Use ISO format (e.g., 2024-12-22)',
  }),
});

export const getStaffAvailabilityForDateParamsSchema: AnyZodObject = z.object({
  staffId: z.string().cuid('Invalid staff ID format'),
});

export const getStaffAvailabilityForDateQuerySchema: AnyZodObject = z.object({
  date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid date format. Use ISO format (e.g., 2024-12-22)',
  }),
});

// Staff Review Schemas
export const createStaffReviewSchema: AnyZodObject = z.object({
  staffId: z.string().cuid('Invalid staff ID format'),
  bookingId: z.string().cuid('Invalid booking ID format'),
  rating: z
    .number()
    .int('Rating must be an integer')
    .min(1, 'Rating must be at least 1')
    .max(5, 'Rating must be at most 5'),
  comment: z.string().max(1000, 'Comment must not exceed 1000 characters').optional(),
});

export const updateStaffReviewSchema: AnyZodObject = z.object({
  rating: z
    .number()
    .int('Rating must be an integer')
    .min(1, 'Rating must be at least 1')
    .max(5, 'Rating must be at most 5')
    .optional(),
  comment: z.string().max(1000, 'Comment must not exceed 1000 characters').optional(),
});

export const staffReviewIdParamsSchema: AnyZodObject = z.object({
  id: z.string().cuid('Invalid review ID format'),
});

export const staffIdParamsForReviewsSchema: AnyZodObject = z.object({
  staffId: z.string().cuid('Invalid staff ID format'),
});

export const staffReviewQuerySchema: AnyZodObject = z.object({
  page: z.string().transform(Number).optional(),
  limit: z.string().transform(Number).optional(),
});
