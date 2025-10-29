# CLAUDE.md

Guidelines for Claude Code (claude.ai/code) when working with this repository.

---

## 🧠 Project Overview

ProBeauty Backend is a secure authentication system using:

- **Bun** for runtime & package management
- **Express** for APIs
- **Prisma** ORM with **PostgreSQL**
- **Zod** for validation
- **JWT** for authentication
- **NodeMailer** for OTP email service
- Security middleware (Helmet, HPP, CORS, Rate Limiting)

This project is designed to follow clean architecture & AI-friendly code conventions.

---

## 📦 Package Manager & Commands

ALL dependency and script execution uses **Bun**.

### ✅ Core Commands

| Purpose              | Command                   |
| -------------------- | ------------------------- |
| Start dev server     | `bun run dev`             |
| Lint project         | `bun run lint`            |
| Auto-fix lint issues | `bun run lint:fix`        |
| Prisma codegen       | `bun run prisma:generate` |
| DB migrations        | `bun run prisma:migrate`  |
| Seed DB (if enabled) | `bun run seed`            |

> ALWAYS run `bun run lint:fix` before pushing changes ✅

---

## 🏗️ Architecture

### 📁 Folder Structure Summary

```

src/
├─ controllers/ → Handles HTTP layer logic only
├─ services/ → Business logic + external integrations
├─ routes/ → API routing definitions
├─ schemas/ → Zod validation schemas
├─ middlewares/ → Auth, validation, security
├─ config/ → Environment, email, Prisma client
├─ utils/ → Reusable helpers

```

Controllers must be **thin** — move logic into services.

### Key Architectural Principles

1️⃣ **Layered Architecture**
→ No business logic inside controllers or routes

2️⃣ **Centralized Validation**
→ All request input must be validated using Zod

3️⃣ **Token-based Authentication**
→ Access + Refresh JWTs
→ OTP-based login & signup flow

4️⃣ **Secure by Default**
→ Security middleware MUST remain enabled

---

## 🔐 Authentication & Authorization

- OTP sent via email for initial identity verification
- Refresh tokens stored securely & rotated properly
- Protected routes require:

```ts
authMiddleware;
```

📌 Do NOT alter expiry durations or claims unless explicitly modifying auth system.

---

## 🗄️ Database

- **Database:** PostgreSQL
- **ORM:** Prisma
- Schema: `prisma/schema.prisma`

### Required Commands After Schema Changes

1️⃣ Update `schema.prisma`
2️⃣ Run:

```bash
bun run prisma:generate
bun run prisma:migrate
```

3️⃣ Update Zod schemas + services to reflect DB changes

### ❌ Critical Rules

- Never edit migration SQL manually
- Never remove or modify existing fields without direction
- Prefer **backwards compatible** additions (add new columns instead)

---

## 🌐 Local Development URLs

| Service                        | URL                                                    |
| ------------------------------ | ------------------------------------------------------ |
| API Base URL                   | [http://localhost:5000/api](http://localhost:5000/api) |
| OTP Email Preview (if enabled) | Console / Template                                     |

---

## ✅ Code Standards

| Rule               | Requirement                                              |
| ------------------ | -------------------------------------------------------- |
| Type safety        | Strict TypeScript ✅                                     |
| Logging            | Use logger utils — no stray `console.log`                |
| Comments           | Only when truly needed — code should be self-explanatory |
| Security           | NEVER bypass or remove protection middleware             |
| Dependency Install | Always inside project root using Bun                     |

---

## 🧪 Testing (Upcoming Standard)

Tests will follow structure:

```
tests/
 ├─ unit/
 ├─ integration/
```

Once test suite is added:

- New services must include tests
- Authentication flows require integration coverage

---

## 📌 AI Development Guidance

If modifying a feature:
→ Look for `ai-docs.md` in the closest directory subtree

These contain:
✅ Expected patterns
✅ Best practices
✅ Integration notes

**Follow them before writing new code.**

---

## ✅ Final Rule

> Claude must assume the backend server is available and running — do not create code that starts new servers.

---
- never use 'any' type for type declarations. create type interfaces.