export const corsConfig = {
  origin: [
    'http://localhost:3000',
    'https://pro-beauty-web.vercel.app',
    'https://pro-beauty-salon-dashboard.vercel.app',
    'https://pro-beauty-admin.vercel.app',
    'https://probeautyapp.com',
    'https://www.probeautyapp.com',
    'https://admin.probeautyapp.com',
    'https://salon.probeautyapp.com',
    'https://probeautyapp.net',
    'https://www.probeautyapp.net',
    'https://admin.probeautyapp.net',
    'https://salon.probeautyapp.net',
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  credentials: true,
};
