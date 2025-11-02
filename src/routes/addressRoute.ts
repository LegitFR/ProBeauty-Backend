import { Router } from 'express';

import {
  createAddress,
  getAddresses,
  getAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} from '@/controllers/addressController';
import { authenticate } from '@/middlewares/auth/authenticate';
import { validateRequest } from '@/middlewares/validateRequest';
import {
  createAddressSchema,
  updateAddressSchema,
  getAddressParamsSchema,
} from '@/schemas/addressSchema';

const router = Router();

// All address routes require authentication
router.use(authenticate);

/**
 * POST /api/v1/addresses
 * Create a new address for the authenticated user
 */
router.post('/', validateRequest({ body: createAddressSchema }), createAddress);

/**
 * GET /api/v1/addresses
 * Get all addresses for the authenticated user
 */
router.get('/', getAddresses);

/**
 * GET /api/v1/addresses/:id
 * Get a specific address by ID
 */
router.get('/:id', validateRequest({ params: getAddressParamsSchema }), getAddress);

/**
 * PATCH /api/v1/addresses/:id
 * Update an existing address
 */
router.patch(
  '/:id',
  validateRequest({
    params: getAddressParamsSchema,
    body: updateAddressSchema,
  }),
  updateAddress
);

/**
 * DELETE /api/v1/addresses/:id
 * Delete an address
 */
router.delete('/:id', validateRequest({ params: getAddressParamsSchema }), deleteAddress);

/**
 * PATCH /api/v1/addresses/:id/set-default
 * Set an address as the default address
 */
router.patch(
  '/:id/set-default',
  validateRequest({ params: getAddressParamsSchema }),
  setDefaultAddress
);

export default router;
