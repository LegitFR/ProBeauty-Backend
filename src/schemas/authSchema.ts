import { z, type AnyZodObject } from 'zod';

export const signupSchema: AnyZodObject = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z
    .string()
    .regex(/^\d{9,14}$/, 'Phone number must contain 9 to 14 digits')
    .optional(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.string().default('customer'),
});

export const confirmRegistrationSchema: AnyZodObject = z.object({
  email: z.string().email('Invalid email address'),
  otp: z.string().length(6, 'OTP must be 6 digits'),
});

export const resendRegistrationOtpSchema: AnyZodObject = z.object({
  email: z.string().email('Invalid email address'),
});

export const loginSchema: AnyZodObject = z.object({
  identifier: z.string().min(1, 'Email or phone number is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const forgotPasswordSchema: AnyZodObject = z.object({
  email: z.string().email('Invalid email address'),
});

export const verifyForgotPasswordOtpSchema: AnyZodObject = z.object({
  email: z.string().email('Invalid email address'),
  otp: z.string().length(6, 'OTP must be 6 digits'),
});

export const resendForgotPasswordOtpSchema: AnyZodObject = z.object({
  email: z.string().email('Invalid email address'),
});

export const resetPasswordSchema: AnyZodObject = z.object({
  email: z.string().email('Invalid email address'),
  otp: z.string().length(6, 'OTP must be 6 digits'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
});

export const refreshTokenSchema: AnyZodObject = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

export const googleAuthSchema: AnyZodObject = z.object({
  idToken: z.string().min(1, 'Google ID token is required'),
});
