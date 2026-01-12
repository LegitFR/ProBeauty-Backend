import { Router } from 'express';

import {
  createOffer,
  updateOffer,
  toggleOfferActive,
  deleteOffer,
  listOffers,
  getOffer,
  getActiveOffers,
  getOfferByIdPublic,
  validateOffer,
} from '@/controllers/offerController';
import { authenticate } from '@/middlewares/auth/authenticate';
import { handleMulterError, uploadOfferImage } from '@/middlewares/uploadMiddleware';
import { validateRequest } from '@/middlewares/validateRequest';
import {
  createOfferSchema,
  updateOfferSchema,
  toggleOfferActiveSchema,
  offerParamsSchema,
  listOffersQuerySchema,
  getActiveOffersQuerySchema,
  validateOfferSchema,
} from '@/schemas/offerSchema';

const router = Router();

// Public routes
router.get(
  '/public/active',
  validateRequest({ query: getActiveOffersQuerySchema }),
  getActiveOffers
);
router.get('/public/:id', validateRequest({ params: offerParamsSchema }), getOfferByIdPublic);

// Checkout validation (public)
router.post('/validate', validateRequest({ body: validateOfferSchema }), validateOffer);

// Protected routes (salon owners)
router.post(
  '/',
  authenticate,
  uploadOfferImage,
  handleMulterError,
  validateRequest({ body: createOfferSchema }),
  createOffer
);

router.patch(
  '/:id',
  authenticate,
  uploadOfferImage,
  handleMulterError,
  validateRequest({ params: offerParamsSchema, body: updateOfferSchema }),
  updateOffer
);

router.patch(
  '/:id/toggle',
  authenticate,
  validateRequest({ params: offerParamsSchema, body: toggleOfferActiveSchema }),
  toggleOfferActive
);

router.delete('/:id', authenticate, validateRequest({ params: offerParamsSchema }), deleteOffer);

router.get('/', authenticate, validateRequest({ query: listOffersQuerySchema }), listOffers);

router.get('/:id', authenticate, validateRequest({ params: offerParamsSchema }), getOffer);

export default router;
