import { Router } from 'express';

import {
  createService,
  getService,
  getServicesBySalon,
  getAllServices,
  updateService,
  deleteService,
} from '@/controllers/serviceController';
import { authenticate } from '@/middlewares/auth/authenticate';
import { validateRequest } from '@/middlewares/validateRequest';
import {
  createServiceSchema,
  updateServiceSchema,
  serviceIdParamsSchema,
} from '@/schemas/serviceSchema';

const router = Router();

/**
 * @route   POST /api/v1/services
 * @desc    Create a new service (salon owner only)
 * @access  Private
 */
router.post('/', authenticate, validateRequest({ body: createServiceSchema }), createService);

/**
 * @route   GET /api/v1/services/:id
 * @desc    Get a single service by ID
 * @access  Public
 */
router.get('/:id', validateRequest({ params: serviceIdParamsSchema }), getService);

/**
 * @route   GET /api/v1/services/salon/:salonId
 * @desc    Get all services for a specific salon
 * @access  Public
 */
router.get('/salon/:salonId', getServicesBySalon);

/**
 * @route   GET /api/v1/services
 * @desc    Get all services
 * @access  Public
 */
router.get('/', getAllServices);

/**
 * @route   PUT /api/v1/services/:id
 * @desc    Update a service (salon owner only)
 * @access  Private
 */
router.put(
  '/:id',
  authenticate,
  validateRequest({
    params: serviceIdParamsSchema,
    body: updateServiceSchema,
  }),
  updateService
);

/**
 * @route   DELETE /api/v1/services/:id
 * @desc    Delete a service (salon owner only)
 * @access  Private
 */
router.delete(
  '/:id',
  authenticate,
  validateRequest({ params: serviceIdParamsSchema }),
  deleteService
);

export default router;
