import { Router } from 'express';

import {
  signup,
  login,
  confirmRegistration,
  resendRegistrationOtp,
  forgotPassword,
  verifyForgotPasswordOtp,
  resendForgotPasswordOtp,
  resetPassword,
  refreshAccessToken,
  refreshToken,
  googleAuth,
} from '@/controllers/authController';
import { authRateLimiter } from '@/middlewares/rateLimiter';
import { validateRequest } from '@/middlewares/validateRequest';
import {
  signupSchema,
  loginSchema,
  confirmRegistrationSchema,
  resendRegistrationOtpSchema,
  forgotPasswordSchema,
  verifyForgotPasswordOtpSchema,
  resendForgotPasswordOtpSchema,
  resetPasswordSchema,
  refreshTokenSchema,
  googleAuthSchema,
} from '@/schemas/authSchema';

const router = Router();

router.use(authRateLimiter);

router.post('/signup', validateRequest({ body: signupSchema }), signup);
router.post('/login', validateRequest({ body: loginSchema }), login);
router.post('/google', validateRequest({ body: googleAuthSchema }), googleAuth);
router.post(
  '/confirm-registration',
  validateRequest({ body: confirmRegistrationSchema }),
  confirmRegistration
);
router.post(
  '/resend-registration-otp',
  validateRequest({ body: resendRegistrationOtpSchema }),
  resendRegistrationOtp
);
router.post('/forgot-password', validateRequest({ body: forgotPasswordSchema }), forgotPassword);
router.post(
  '/verify-forgot-password-otp',
  validateRequest({ body: verifyForgotPasswordOtpSchema }),
  verifyForgotPasswordOtp
);
router.post(
  '/resend-forgot-password-otp',
  validateRequest({ body: resendForgotPasswordOtpSchema }),
  resendForgotPasswordOtp
);
router.post('/reset-password', validateRequest({ body: resetPasswordSchema }), resetPassword);
router.post('/refresh-token', validateRequest({ body: refreshTokenSchema }), refreshToken);
router.post(
  '/refresh-access-token',
  validateRequest({ body: refreshTokenSchema }),
  refreshAccessToken
);

export default router;
