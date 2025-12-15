import { Router } from 'express';

import {
  createService,
  getService,
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
 * @route   GET /api/v1/services
 * @desc    Get all services (optionally filtered by salonId query parameter)
 * @access  Public
 */
router.get('/', getAllServices);

/**
 * @route   GET /api/v1/services/:id
 * @desc    Get a single service by ID
 * @access  Public
 */
router.get('/:id', validateRequest({ params: serviceIdParamsSchema }), getService);

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
