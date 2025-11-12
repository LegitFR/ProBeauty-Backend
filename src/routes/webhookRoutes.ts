import express from 'express';

import * as webhookController from '@/controllers/webhookController';
import { verifyStripeWebhook } from '@/middlewares/stripeWebhookValidator';

const router = express.Router();

/**
 * Stripe webhook endpoint
 * IMPORTANT: This route requires raw body parsing for signature verification
 * The raw body parser should be applied in index.ts before this route
 */
router.post('/stripe', verifyStripeWebhook, webhookController.handleStripeWebhookEvent);

export default router;
