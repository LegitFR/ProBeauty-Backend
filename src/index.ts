import express, { type Express, type Request, type Response } from 'express';

import { connectToDatabase } from '@/configs/db';
import { envConfig } from '@/configs/env';
import { errorHandler } from '@/middlewares/errorHandler';
import { applyMiddleware } from '@/middlewares/index';
import { notFound } from '@/middlewares/notFound';
import address from '@/routes/addressRoute';
import analytics from '@/routes/analyticsRoute';
import auth from '@/routes/authRoute';
import booking from '@/routes/bookingRoute';
import cart from '@/routes/cartRoute';
import favourite from '@/routes/favouriteRoute';
import notifications from '@/routes/notificationRoute';
import offer from '@/routes/offerRoute';
import order from '@/routes/orderRoute';
import product from '@/routes/productRoute';
import review from '@/routes/reviewRoute';
import salon from '@/routes/salonRoute';
import service from '@/routes/serviceRoute';
import staffReview from '@/routes/staffReviewRoute';
import staff from '@/routes/staffRoute';
import user from '@/routes/userRoute';
import webhooks from '@/routes/webhookRoutes';
import { verifyEmailTransporter } from '@/services/sendEmail';
import './services/notificationEventListeners';

const app: Express = express();

// Enable trust proxy for accurate client IP detection behind proxies/load balancers
app.set('trust proxy', 1);

// IMPORTANT: Webhook routes MUST be registered BEFORE express.json()
// This is required for Stripe signature verification which needs the raw body
app.use('/api/v1/webhooks', express.raw({ type: 'application/json' }), webhooks);

app.use(express.json({ limit: '1mb' }));

const initializeApp = async () => {
  try {
    console.info('🔄 Starting ProBeauty Backend...');
    console.info('📍 Working Directory:', process.cwd());
    await connectToDatabase();

    // Verify SMTP connection early — catches bad credentials or host issues
    // before any real traffic hits the email-sending endpoints.
    try {
      await verifyEmailTransporter();
      console.info('✅ SMTP email transporter verified successfully');
    } catch (emailError) {
      console.error('⚠️  SMTP verification failed — emails will not be delivered:', emailError);
      // Non-fatal: server still starts, but email-related features won't work
    }

    // Apply all middleware first (including morgan logger)
    applyMiddleware(app);

    // Define routes AFTER middleware
    app.get('/', (_req: Request, res: Response) => {
      res.send('Phew-Phew,  API is running! 🚀');
    });

    app.get('/api/v1/health', (_req: Request, res: Response) => {
      res.status(200).json({
        success: true,
        message: 'API is healthy! 🏥',
        uptime: process.uptime(),
      });
    });

    app.use('/api/v1/auth', auth);
    app.use('/api/v1/user', user);
    app.use('/api/v1/notifications', notifications);
    app.use('/api/v1/analytics', analytics);
    app.use('/api/v1/salons', salon);
    app.use('/api/v1/products', product);
    app.use('/api/v1/services', service);
    app.use('/api/v1/offers', offer);
    app.use('/api/v1/staff', staff);
    app.use('/api/v1/staff-reviews', staffReview);
    app.use('/api/v1/addresses', address);
    app.use('/api/v1/cart', cart);
    app.use('/api/v1/orders', order);
    app.use('/api/v1/bookings', booking);
    app.use('/api/v1/reviews', review);
    app.use('/api/v1/favourites', favourite);

    // Error handlers must be last
    app.use(notFound);
    app.use(errorHandler);

    const PORT = envConfig.PORT || 5000;
    app.listen(PORT, '0.0.0.0', () => {
      console.info(`🚀 Server is running on http://0.0.0.0:${PORT}`);
      console.info(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('❌ Error initializing app:', error);
    process.exit(1);
  }
};

initializeApp();

export default app;
