# ProBeauty API Development Rules

Opinionated, project-specific rules for creating and wiring API endpoints in this repository.

## Scope and versioning

- Base path: `/api/v1`
- All new routers are mounted in `src/index.ts` under `/api/v1/<feature>`
- Do not start new servers; use the existing Express app in `index.ts`

## Folder roles (single responsibility)

- `controllers/`: HTTP interface only. Thin functions accepting `(req, res)`, calling services, and shaping responses. No business logic or SQL here.
- `services/`: Business logic and integrations (Prisma, external APIs, emails, tokens). Pure, reusable functions with clear inputs/outputs.
- `schemas/`: Zod schemas for validating `body`, `query`, `params`, `headers`, `cookies`.
- `routes/`: Express Router definitions. Apply middleware, validation, and map routes to controllers.
- `middlewares/`: Cross-cutting concerns (auth, rate limiting, validation wrapper, security). Reuse rather than duplicating inline logic.
- `utils/`: Small, stateless helpers (e.g., token utils), non-domain specific.

## Golden rules

1. Controllers must be thin. Push logic into services.
2. Validate all inputs with Zod via `validateRequest` middleware.
3. Keep security middleware enabled and never bypass it.
4. Use JWT auth for protected endpoints (`authenticate`, and `authorize` when roles matter).
5. Consistent response shape and proper HTTP status codes.
6. Route only after global middleware is applied (see `applyMiddleware` in `middlewares/index.ts`).

## Endpoint contract

- Validation: Use Zod schemas and `validateRequest({ body, query, params, ... })`.
- Auth: Apply `authenticate` for protected routes; apply `authorize([roles])` for RBAC.
- Rate limiting: Use a limiter per domain where appropriate (`authRateLimiter` or create a new one).
- Responses: Always return JSON with an informative `message`. Include `data` for results or `errors` for validation.
- Errors: Let unhandled exceptions bubble to `errorHandler`; avoid `try/catch` unless you must intercept and finalize a response.

Example response patterns

- Success
  - 200 OK: `{ message: string, data?: any }`
  - 201 Created: `{ message: string, data?: any }`
- Client errors
  - 400 Bad Request (validation): `{ success: false, message: 'Validation failed in <target>', errors: [...] }`
  - 401 Unauthorized / 403 Forbidden: `{ message: string }`
  - 404 Not Found: `{ message: string }`
- Server errors
  - 500 Internal Server Error: `{ message: 'Internal server error', error?: string }`

## How to add a new endpoint (step-by-step)

Assume a new resource: `products`. Adjust names accordingly.

1. Define Zod schemas in `src/schemas/productSchema.ts`
   - Create one schema per operation (e.g., `createProductSchema`, `getProductQuerySchema`).
2. Implement service(s) in `src/services/productService.ts`
   - Keep business logic here; interact with Prisma models; isolate external calls.
3. Implement controller(s) in `src/controllers/productController.ts`
   - Extract validated data from `req`, call the service, and send the response.
4. Define routes in `src/routes/productRoute.ts`
   - Use `Router()`, apply `validateRequest`, `authenticate`/`authorize` as needed, and map to controllers.
5. Wire the router in `src/index.ts`
   - `import productRoute from '@/routes/productRoute'`
   - `app.use('/api/v1/products', productRoute)` (after `applyMiddleware(app)` and before error handlers).
6. Lint and run locally using Bun (see `CLAUDE.md` for commands).

## Minimal skeletons (copy and adapt)

Schemas: `src/schemas/productSchema.ts`

```ts
import { z, type AnyZodObject } from 'zod';

export const createProductSchema: AnyZodObject = z.object({
  name: z.string().min(2),
  price: z.number().nonnegative(),
});

export const getProductParamsSchema: AnyZodObject = z.object({
  id: z.string().uuid(),
});
```

Service: `src/services/productService.ts`

```ts
// Business logic only
import { prisma } from '@/configs/db';

export async function createProduct(data: { name: string; price: number }) {
  return prisma.product.create({ data });
}

export async function getProductById(id: string) {
  return prisma.product.findUnique({ where: { id } });
}
```

Controller: `src/controllers/productController.ts`

```ts
import type { Request, Response } from 'express';
import * as productService from '@/services/productService';

export async function createProduct(req: Request, res: Response): Promise<void> {
  const { name, price } = req.body;
  const product = await productService.createProduct({ name, price });
  res.status(201).json({ message: 'Product created', data: product });
}

export async function getProduct(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const product = await productService.getProductById(id);
  if (!product) {
    res.status(404).json({ message: 'Product not found' });
    return;
  }
  res.status(200).json({ message: 'Product fetched', data: product });
}
```

Routes: `src/routes/productRoute.ts`

```ts
import { Router } from 'express';
import { authenticate } from '@/middlewares/auth/authenticate';
import { validateRequest } from '@/middlewares/validateRequest';
import { createProduct, getProduct } from '@/controllers/productController';
import { createProductSchema, getProductParamsSchema } from '@/schemas/productSchema';

const router = Router();

// Public/Protected: choose appropriately; example uses auth for both
router.post('/', authenticate, validateRequest({ body: createProductSchema }), createProduct);
router.get('/:id', authenticate, validateRequest({ params: getProductParamsSchema }), getProduct);

export default router;
```

Index wiring: `src/index.ts` (add below existing mounts)

```ts
import productRoute from '@/routes/productRoute';
app.use('/api/v1/products', productRoute);
```

## Error handling and middleware order

- Global security, parsing, logging, and rate limiting are applied via `applyMiddleware(app)` in `middlewares/index.ts`.
- Define routes after middleware is applied and before error handlers.
- Keep `notFound` and `errorHandler` as the last middleware in `index.ts`.

## Validation pattern (Zod + validateRequest)

- Create schemas per endpoint and per request section (body/query/params/etc.).
- Attach using `validateRequest({ body: schema })` or mix multiple: `validateRequest({ params, query, body })`.
- Avoid manual validation in controllers; rely on the middleware to reject invalid payloads.

## Auth and authorization

- Use `authenticate` for endpoints requiring logged-in users.
- Use `authorize(['admin', ...])` when role-based access control is needed.
- JWT signing/verification is centralized in `utils/tokenUtils.ts`.

## Database and external integrations

- Use Prisma via `configs/db` or `utils/prisma` helpers from services only.
- Email flows go through `services/emailService.ts` with templates under `services/templates/`.
- Never access the database directly from controllers or routes.

## Naming and conventions

- Filenames: `<feature><Type>.ts` (e.g., `productController.ts`, `productRoute.ts`, `productService.ts`).
- Router default export name: `<feature>Route` and default export from the route file.
- One router per feature; group related endpoints in the same router.
- Mount path pluralized when it represents a collection (e.g., `/products`).

## Quality gates

- Type-safe code only (TypeScript strict).
- Lint before commit (`bun run lint` and `bun run lint:fix`).
- Keep controllers free of business logic; tests (when available) cover services and integrations.

## Quick checklist before opening a PR

- [ ] Zod schemas created and used via `validateRequest`
- [ ] Controller(s) thin and delegating to service(s)
- [ ] Service(s) handle Prisma/external work and return data or throw errors
- [ ] Route(s) defined with proper middleware order and mounted under `/api/v1/<feature>`
- [ ] `src/index.ts` updated to `app.use('/api/v1/<feature>', <feature>Route)`
- [ ] Security/auth/rate limiting considered and applied as needed
- [ ] Responses consistent and status codes correct
- [ ] Linting passes

---

Reference implementations in this repo:

- `routes/authRoute.ts` — router structure, rate limiting, validation usage
- `controllers/authController.ts` — controller patterns and response shapes
- `middlewares/validateRequest.ts` — centralized validation
- `middlewares/auth/authenticate.ts` — authentication and role-based access
