export const corsConfig = {
  origin: [
    'http://localhost:3000',
    'https://pro-beauty-web.vercel.app',
    'https://pro-beauty-salon-dashboard.vercel.app',
    'https://pro-beauty-admin.vercel.app',
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  credentials: true,
};
