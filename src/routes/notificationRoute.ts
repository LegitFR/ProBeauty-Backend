import { Router } from 'express';

import {
  getUserNotifications,
  markAllAsRead,
  markAsRead,
  registerDeviceToken,
  deleteNotification,
} from '@/controllers/notificationController';
import { authenticate } from '@/middlewares/auth/authenticate';
import { authRateLimiter } from '@/middlewares/rateLimiter';
import { validateRequest } from '@/middlewares/validateRequest';
import {
  getNotificationsSchema,
  markAsReadSchema,
  registerTokenSchema,
} from '@/schemas/notificationSchema';

const router = Router();

router.use(authRateLimiter);
router.use(authenticate);

router.post('/register-token', validateRequest({ body: registerTokenSchema }), registerDeviceToken);

router.get('/', validateRequest({ query: getNotificationsSchema }), getUserNotifications);

router.put('/:notificationId/read', validateRequest({ params: markAsReadSchema }), markAsRead);

router.put('/read-all', markAllAsRead);

router.delete('/:notificationId', deleteNotification);

export default router;
