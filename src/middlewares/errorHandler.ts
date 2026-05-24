import type { NextFunction, Request, Response } from 'express';

import { AppError } from '@/utils/AppError';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error('❌ Error:', err.stack || err);

  const statusCode =
    err instanceof AppError
      ? err.statusCode
      : ((err as Error & { status?: number; statusCode?: number }).status ??
        (err as Error & { status?: number; statusCode?: number }).statusCode ??
        500);

  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};
