import { Router } from 'express';

import { handleStripeWebhookController } from '@/controllers/webhookController';
import { stripeWebhookValidator } from '@/middlewares/stripeWebhookValidator';

const router = Router();

/**
 * Stripe Webhook Route
 *
 * POST /api/v1/webhooks/stripe
 *
 * Important: This route must use raw body parsing for signature verification.
 * The raw body middleware is applied in index.ts BEFORE express.json().
 */
router.post('/stripe', stripeWebhookValidator, handleStripeWebhookController);

export default router;
