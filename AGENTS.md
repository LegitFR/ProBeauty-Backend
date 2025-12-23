---
description: Global development rules for ProBeauty Backend
globs:
  - '**/*.ts'
alwaysApply: true
---

# ✅ Package Management Rules

This project uses **Bun** exclusively.

Use:

- `bun install` → regular dependency
- `bun install -D` → dev dependency

❌ Do NOT use npm or yarn.

---

# 📁 Project Structure Rules

Project Layout:

- `src/controllers` → Handles HTTP requests ONLY
- `src/services` → Business logic & external APIs
- `src/routes` → Defines API endpoints
- `src/schemas` → Zod validation
- `src/middlewares` → Auth + validation + security
- `src/utils` → Shared helpers
- `src/config` → Env, email config, rate limit, etc.

All new features must follow existing naming and file organization.

---

# 🔐 Authentication Rules

System is based on:

- Access Token + Refresh Token
- JWT-based identity
- OTP flow for login/signup

✅ Protect routes with:

```ts
authMiddleware;
```

❌ Never weaken auth rules or change expiry without approval.

---

# 🛡️ Security Standards

Security stack includes:

- Helmet
- CORS
- HPP
- Rate Limiting
- Sanitization utilities

❌ Never disable or bypass these protections
✅ New sensitive routes must implement rate limiting

---

# 🗄️ Database + Prisma Rules

We use **Prisma** with **PostgreSQL**.

Schema changes:

```bash
bun run prisma:generate
bun run prisma:migrate
```

Migration files should **NOT be edited manually**.

⚠️ Breaking changes forbidden

- Don’t remove columns
- Don’t modify existing field types

Only **add new** fields for backwards compatibility.

---

# ✅ Validation with Zod

Every request payload MUST be validated.

Validation stays in:

```
src/schemas/
```

Attach validation using:

```ts
validateRequest(schema);
```

Controllers must NEVER use raw `req.body`.

---

# 📧 Email System

Templates stored in:

```
src/services/templates/
```

Always use:

```ts
sendEmail();
```

No inline text emails.

---

# 🐛 Error Handling

Use centralized error utilities:
✅ `next(error)`
✅ Standardized JSON error response

❌ No random `console.log` in production
Use logger util for debugging.

---

# 🧹 Code Quality Rules

Run before every commit:

```bash
bun run lint
```

Autofix:

```bash
bun run lint:fix
```

Prefer:

- `const` > `let`
- Async/await > .then
- Strict typing everywhere
- Avoid unused imports/variables

---

# 🧪 Testing (Future Standard)

Once tests exist:

- Business logic must include test coverage
- Test files go into `/tests/`

Follow TDD mindset.

---

# 🚀 Server Workflow

Assume server is running — don't restart unnecessarily.

Run development server:

```bash
bun run dev
```

No changing default ports or env structures.

---

# 📝 Documentation Requirements

On updating:
✔ Routes → document in `ai-docs/`
✔ DB Models → update schema references
✔ Auth → update security notes

Documentation should always match production behavior.

---

# ⭐ Golden Rule

📌 ALWAYS search for an `ai-docs.md` in your working directory
→ It contains contextual rules specific to that module.

```

```
