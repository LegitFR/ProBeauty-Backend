import { z, type AnyZodObject } from 'zod';

export const updateProfileSchema: AnyZodObject = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  phone: z
    .string()
    .regex(/^\d{9,14}$/, 'Phone number must contain 9 to 14 digits')
    .optional(),
});

export const requestEmailChangeSchema: AnyZodObject = z.object({
  newEmail: z.string().email('Invalid email address'),
});

export const confirmEmailChangeSchema: AnyZodObject = z.object({
  newEmail: z.string().email('Invalid email address'),
  otp: z.string().length(6, 'OTP must be 6 digits'),
});
