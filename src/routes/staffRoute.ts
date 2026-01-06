import { Router } from 'express';

import {
  createStaff,
  getStaff,
  getAllStaff,
  getStaffBySalon,
  updateStaff,
  deleteStaff,
  getAvailableStaffByDate,
  getStaffAvailabilityForDate,
} from '@/controllers/staffController';
import { authenticate } from '@/middlewares/auth/authenticate';
import { handleMulterError, uploadStaffImage } from '@/middlewares/uploadMiddleware';
import { validateRequest } from '@/middlewares/validateRequest';
import {
  createStaffSchema,
  updateStaffSchema,
  getStaffParamsSchema,
  getStaffQuerySchema,
  getSalonStaffParamsSchema,
  getAvailableStaffByDateQuerySchema,
  getStaffAvailabilityForDateParamsSchema,
  getStaffAvailabilityForDateQuerySchema,
} from '@/schemas/staffSchema';

const router = Router();

/**
 * @route   GET /api/v1/staff
 * @desc    Get all staff members with pagination and filtering
 * @access  Public
 */
router.get('/', validateRequest({ query: getStaffQuerySchema }), getAllStaff);

/**
 * @route   GET /api/v1/staff/available-on-date
 * @desc    Get all staff members available on a specific date for a salon
 * @access  Public
 */
router.get(
  '/available-on-date',
  validateRequest({ query: getAvailableStaffByDateQuerySchema }),
  getAvailableStaffByDate
);

/**
 * @route   GET /api/v1/staff/salon/:salonId
 * @desc    Get all staff members for a specific salon
 * @access  Public
 */
router.get(
  '/salon/:salonId',
  validateRequest({ params: getSalonStaffParamsSchema, query: getStaffQuerySchema }),
  getStaffBySalon
);

/**
 * @route   GET /api/v1/staff/:staffId/availability-for-date
 * @desc    Get a specific staff member's availability with bookings for a date
 * @access  Public
 */
router.get(
  '/:staffId/availability-for-date',
  validateRequest({
    params: getStaffAvailabilityForDateParamsSchema,
    query: getStaffAvailabilityForDateQuerySchema,
  }),
  getStaffAvailabilityForDate
);

/**
 * @route   GET /api/v1/staff/:id
 * @desc    Get a specific staff member by ID
 * @access  Public
 */
router.get('/:id', validateRequest({ params: getStaffParamsSchema }), getStaff);

/**
 * @route   POST /api/v1/staff
 * @desc    Create a new staff member (salon owner only)
 * @access  Private
 */
router.post(
  '/',
  authenticate,
  uploadStaffImage,
  handleMulterError,
  validateRequest({ body: createStaffSchema }),
  createStaff
);

/**
 * @route   PATCH /api/v1/staff/:id
 * @desc    Update a staff member (salon owner only)
 * @access  Private
 */
router.patch(
  '/:id',
  authenticate,
  uploadStaffImage,
  handleMulterError,
  validateRequest({ params: getStaffParamsSchema, body: updateStaffSchema }),
  updateStaff
);

/**
 * @route   DELETE /api/v1/staff/:id
 * @desc    Delete a staff member (salon owner only)
 * @access  Private
 */
router.delete('/:id', authenticate, validateRequest({ params: getStaffParamsSchema }), deleteStaff);

export default router;
