import { z, type AnyZodObject } from 'zod';

export const createStaffSchema: AnyZodObject = z.object({
  salonId: z.string().cuid('Invalid salon ID format'),
  role: z.string().min(2, 'Staff role must be at least 2 characters'),
  availability: z.record(z.any()).optional(),
  userId: z.string().cuid('Invalid user ID format').optional(),
});

export const updateStaffSchema: AnyZodObject = z.object({
  role: z.string().min(2, 'Staff role must be at least 2 characters').optional(),
  availability: z.record(z.any()).optional(),
  userId: z.string().cuid('Invalid user ID format').optional(),
});

export const getStaffParamsSchema: AnyZodObject = z.object({
  id: z.string().cuid('Invalid staff ID format'),
});

export const getStaffQuerySchema: AnyZodObject = z.object({
  page: z.string().transform(Number).optional(),
  limit: z.string().transform(Number).optional(),
  salonId: z.string().cuid('Invalid salon ID format').optional(),
  role: z.string().optional(),
});

export const getSalonStaffParamsSchema: AnyZodObject = z.object({
  salonId: z.string().cuid('Invalid salon ID format'),
});
