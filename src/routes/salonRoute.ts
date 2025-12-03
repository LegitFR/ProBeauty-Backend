import { Router } from 'express';

import {
  createSalon,
  getSalon,
  getSalonsByOwner,
  updateSalon,
  deleteSalon,
  getAllSalons,
  searchSalons,
} from '@/controllers/salonController';
import { authenticate } from '@/middlewares/auth/authenticate';
import { uploadSalonImages, handleMulterError } from '@/middlewares/uploadMiddleware';
import { validateRequest } from '@/middlewares/validateRequest';
import {
  createSalonSchema,
  updateSalonSchema,
  getSalonParamsSchema,
  getSalonQuerySchema,
  salonSearchQuerySchema,
} from '@/schemas/salonSchema';

const router = Router();

// Public route to get all salons with pagination and filtering
router.get('/', validateRequest({ query: getSalonQuerySchema }), getAllSalons);

// Public search route with advanced filters
router.get('/search', validateRequest({ query: salonSearchQuerySchema }), searchSalons);

// Protected route to register a new salon (requires authentication)
router.post(
  '/',
  authenticate,
  uploadSalonImages,
  handleMulterError,
  validateRequest({ body: createSalonSchema }),
  createSalon
);

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
  uploadSalonImages,
  handleMulterError,
  validateRequest({ params: getSalonParamsSchema, body: updateSalonSchema }),
  updateSalon
);

// Protected route to delete a salon (owner only)
router.delete('/:id', authenticate, validateRequest({ params: getSalonParamsSchema }), deleteSalon);

export default router;
