import { Router } from 'express';

import {
  handleIfthenpayCreditCardWebhookController,
  handleIfthenpayMbwayWebhookController,
  handleStripeWebhookController,
} from '@/controllers/webhookController';
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
router.get('/ifthenpay/ccard', handleIfthenpayCreditCardWebhookController);
router.get('/ifthenpay/mbway', handleIfthenpayMbwayWebhookController);

export default router;
