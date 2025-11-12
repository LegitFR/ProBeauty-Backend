import type Stripe from 'stripe';

declare global {
  namespace Express {
    interface Request {
      stripeEvent?: Stripe.Event;
    }
  }
}

export {};
