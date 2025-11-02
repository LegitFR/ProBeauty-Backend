import express, { type Express, type Request, type Response } from 'express';

import { connectToDatabase } from '@/configs/db';
import { envConfig } from '@/configs/env';
import { errorHandler } from '@/middlewares/errorHandler';
import { applyMiddleware } from '@/middlewares/index';
import { notFound } from '@/middlewares/notFound';
import auth from '@/routes/authRoute';
import product from '@/routes/productRoute';
import salon from '@/routes/salonRoute';
import service from '@/routes/serviceRoute';
import staff from '@/routes/staffRoute';

const app: Express = express();

app.use(express.json({ limit: '1mb' }));

const initializeApp = async () => {
  try {
    await connectToDatabase();

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
    app.use('/api/v1/salons', salon);
    app.use('/api/v1/products', product);
    app.use('/api/v1/services', service);
    app.use('/api/v1/staff', staff);

    // Error handlers must be last
    app.use(notFound);
    app.use(errorHandler);

    const PORT = envConfig.PORT || 5000;
    app.listen(PORT, () => {
      // eslint-disable-next-line no-console
      console.log(`🚀 Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Error initializing app:', error);
    process.exit(1);
  }
};

initializeApp();

export default app;
