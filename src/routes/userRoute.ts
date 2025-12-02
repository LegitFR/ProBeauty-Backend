import { Router } from 'express';

import {
  getCurrentUser,
  updateCurrentUser,
  requestEmailChange,
  confirmEmailChangeController,
} from '@/controllers/userController';
import { authenticate } from '@/middlewares/auth/authenticate';
import { authRateLimiter } from '@/middlewares/rateLimiter';
import { validateRequest } from '@/middlewares/validateRequest';
import {
  updateProfileSchema,
  requestEmailChangeSchema,
  confirmEmailChangeSchema,
} from '@/schemas/userSchema';

const router = Router();

router.use(authRateLimiter);
router.use(authenticate);

router.get('/me', getCurrentUser);

router.patch('/me', validateRequest({ body: updateProfileSchema }), updateCurrentUser);

router.post(
  '/change-email/request',
  validateRequest({ body: requestEmailChangeSchema }),
  requestEmailChange
);

router.post(
  '/change-email/confirm',
  validateRequest({ body: confirmEmailChangeSchema }),
  confirmEmailChangeController
);

export default router;
