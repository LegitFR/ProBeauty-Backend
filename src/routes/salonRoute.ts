import { Router } from 'express';

import {
  createSalon,
  getSalon,
  getSalonsByOwner,
  updateSalon,
  deleteSalon,
  getAllSalons,
} from '@/controllers/salonController';
import { authenticate } from '@/middlewares/auth/authenticate';
import { validateRequest } from '@/middlewares/validateRequest';
import {
  createSalonSchema,
  updateSalonSchema,
  getSalonParamsSchema,
  getSalonQuerySchema,
} from '@/schemas/salonSchema';

const router = Router();

// Public route to get all salons with pagination and filtering
router.get('/', validateRequest({ query: getSalonQuerySchema }), getAllSalons);

// Protected route to register a new salon (requires authentication)
router.post('/', authenticate, validateRequest({ body: createSalonSchema }), createSalon);

// Protected route to get all salons owned by the authenticated user
router.get(
  '/my-salons',
  authenticate,
  validateRequest({ query: getSalonQuerySchema }),
  getSalonsByOwner
);

// Public route to get a specific salon by ID
router.get('/:id', validateRequest({ params: getSalonParamsSchema }), getSalon);

// Protected route to update a salon (owner only)
router.patch(
  '/:id',
  authenticate,
  validateRequest({ params: getSalonParamsSchema, body: updateSalonSchema }),
  updateSalon
);

// Protected route to delete a salon (owner only)
router.delete('/:id', authenticate, validateRequest({ params: getSalonParamsSchema }), deleteSalon);

export default router;
