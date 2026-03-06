/* eslint-disable security/detect-object-injection */
import type { Request, Response, NextFunction } from 'express';
import { ZodError, type ZodTypeAny } from 'zod';

type ValidationTarget = 'body' | 'query' | 'params' | 'headers' | 'cookies';

type ZodSchemaGroup = Partial<Record<ValidationTarget, ZodTypeAny>>;

export const validateRequest = (schemas: ZodSchemaGroup) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      for (const key of Object.keys(schemas) as ValidationTarget[]) {
        const schema = schemas[key];
        if (schema) {
          const result = schema.safeParse(req[key]);
          if (!result.success) {
            res.status(400).json({
              success: false,
              message: `Validation failed in ${key}`,
              errors: result.error.errors.map((err) => ({
                path: err.path.join('.'),
                message: err.message,
              })),
            });
            return;
          }
          // For some properties like `query`, Express / the underlying router
          // exposes them via a getter-only property on the request object.
          // Direct reassignment (e.g. `req.query = ...`) will throw
          // "Cannot set property query of #<IncomingMessage> which has only a getter".
          // To avoid that, we mutate/merge into the existing object instead of
          // replacing the property descriptor on `req`.
          if (key === 'body') {
            // `body` is safe to reassign in our stack.
            req.body = result.data as unknown;
          } else if (key === 'query') {
            Object.assign(req.query, result.data);
          } else if (key === 'params') {
            Object.assign(req.params, result.data);
          } else if (key === 'headers') {
            Object.assign(req.headers, result.data);
          } else if (key === 'cookies') {
            // cookies may be undefined if cookie-parser isn't used
            if (!req.cookies) {
              (req as Request & { cookies: Record<string, unknown> }).cookies =
                result.data as Record<string, unknown>;
            } else {
              Object.assign(
                req.cookies as Record<string, unknown>,
                result.data as Record<string, unknown>
              );
            }
          }
        }
      }
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: err.errors.map((err) => ({
            path: err.path.join('.'),
            message: err.message,
          })),
        });
        return;
      }
      next(err);
    }
  };
};
