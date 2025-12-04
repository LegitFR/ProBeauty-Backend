import { z, type AnyZodObject } from 'zod';

/**
 * Allowed address types
 */
export const addressTypes = ['Home', 'Work', 'Office', 'Other'] as const;
export type AddressType = (typeof addressTypes)[number];

/**
 * Schema for creating a new address
 */
export const createAddressSchema: AnyZodObject = z.object({
  fullName: z
    .string()
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name must not exceed 100 characters'),
  phone: z
    .string()
    .min(10, 'Phone number must be at least 10 digits')
    .max(15, 'Phone number must not exceed 15 digits')
    .regex(/^[0-9+\-\s()]+$/, 'Invalid phone number format'),
  addressLine1: z
    .string()
    .min(5, 'Address line 1 must be at least 5 characters')
    .max(200, 'Address line 1 must not exceed 200 characters'),
  addressLine2: z.string().max(200, 'Address line 2 must not exceed 200 characters').optional(),
  city: z
    .string()
    .min(2, 'City must be at least 2 characters')
    .max(100, 'City must not exceed 100 characters'),
  state: z
    .string()
    .min(2, 'State must be at least 2 characters')
    .max(100, 'State must not exceed 100 characters'),
  postalCode: z
    .string()
    .min(3, 'Postal code must be at least 3 characters')
    .max(10, 'Postal code must not exceed 10 characters')
    .regex(/^[A-Z0-9\s-]+$/i, 'Invalid postal code format'),
  country: z
    .string()
    .min(2, 'Country must be at least 2 characters')
    .max(100, 'Country must not exceed 100 characters'),
  addressType: z
    .enum(addressTypes, {
      errorMap: () => ({
        message: `Address type must be one of: ${addressTypes.join(', ')}`,
      }),
    })
    .optional(),
  isDefault: z.boolean().optional(),
});

/**
 * Schema for updating an existing address
 * All fields are optional
 */
export const updateAddressSchema: AnyZodObject = z.object({
  fullName: z
    .string()
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name must not exceed 100 characters')
    .optional(),
  phone: z
    .string()
    .min(10, 'Phone number must be at least 10 digits')
    .max(15, 'Phone number must not exceed 15 digits')
    .regex(/^[0-9+\-\s()]+$/, 'Invalid phone number format')
    .optional(),
  addressLine1: z
    .string()
    .min(5, 'Address line 1 must be at least 5 characters')
    .max(200, 'Address line 1 must not exceed 200 characters')
    .optional(),
  addressLine2: z
    .string()
    .max(200, 'Address line 2 must not exceed 200 characters')
    .optional()
    .nullable(),
  city: z
    .string()
    .min(2, 'City must be at least 2 characters')
    .max(100, 'City must not exceed 100 characters')
    .optional(),
  state: z
    .string()
    .min(2, 'State must be at least 2 characters')
    .max(100, 'State must not exceed 100 characters')
    .optional(),
  postalCode: z
    .string()
    .min(3, 'Postal code must be at least 3 characters')
    .max(10, 'Postal code must not exceed 10 characters')
    .regex(/^[A-Z0-9\s-]+$/i, 'Invalid postal code format')
    .optional(),
  country: z
    .string()
    .min(2, 'Country must be at least 2 characters')
    .max(100, 'Country must not exceed 100 characters')
    .optional(),
  addressType: z
    .enum(addressTypes, {
      errorMap: () => ({
        message: `Address type must be one of: ${addressTypes.join(', ')}`,
      }),
    })
    .optional(),
});

/**
 * Schema for validating address ID in URL parameters
 */
export const getAddressParamsSchema: AnyZodObject = z.object({
  id: z.string().cuid('Invalid address ID format'),
});
