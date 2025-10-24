import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { type Express } from 'express';
import helmet from 'helmet';
import hpp from 'hpp';
import morgan from 'morgan';

import { corsConfig } from '@/configs/cors';
import { cspDirectives } from '@/configs/csp';

import { rateLimiter } from './rateLimiter';

export const applyMiddleware = (app: Express): void => {
  app.use(cors(corsConfig));

  app.use(helmet());

  app.use(helmet.contentSecurityPolicy({ directives: cspDirectives }));

  app.use(helmet.frameguard({ action: 'deny' }));

  app.use(helmet.referrerPolicy({ policy: 'strict-origin-when-cross-origin' }));

  app.use(hpp());

  app.disable('x-powered-by');

  app.use(cookieParser());

  app.use(
    compression({
      threshold: 1024,
      level: 6,
    })
  );

  app.use(rateLimiter);

  // Custom Morgan format: METHOD /path STATUS STATUS_TEXT - RESPONSE_TIME ms
  morgan.token('status-text', (_req, res) => {
    const status = res.statusCode;
    if (status >= 200 && status < 300) return 'OK';
    if (status >= 300 && status < 400) return 'REDIRECT';
    if (status >= 400 && status < 500) return 'CLIENT_ERROR';
    if (status >= 500) return 'SERVER_ERROR';
    return 'UNKNOWN';
  });

  // Morgan logger - logs all requests
  app.use(morgan(':method :url :status :status-text - :response-time ms'));
};
