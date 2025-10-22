# Zod with Bun

Zod is a TypeScript-first schema validation library that provides an easy and type-safe way to validate user inputs, API requests, environment variables, and more.  
It works seamlessly with **Bun**, providing blazing-fast validation and lightweight type inference for your data models.

---

## 🚀 Setup

### Install Zod

You can install Zod using Bun’s fast package manager:

```bash
$ bun add zod
```

Once installed, you can start defining schemas and validating data right away — no configuration needed.

---

## 🧩 Basic Usage

Zod lets you define schemas to validate and parse data.

```ts
import { z } from 'zod';

const UserSchema = z.object({
  name: z.string(),
  age: z.number().min(18),
  email: z.string().email(),
});

const userData = {
  name: 'Alice',
  age: 25,
  email: 'alice@example.com',
};

const result = UserSchema.parse(userData); // returns validated user
console.log(result);
```

If validation fails, Zod throws a detailed error describing which field failed and why.

---

## ⚙️ Safe Parsing

Instead of throwing an error, you can safely check if data is valid using `.safeParse()`:

```ts
const invalidUser = {
  name: 'Bob',
  age: 16,
  email: 'not-an-email',
};

const result = UserSchema.safeParse(invalidUser);

if (!result.success) {
  console.error(result.error.issues);
} else {
  console.log('Valid data:', result.data);
}
```

This method returns an object with `{ success: boolean; data?: T; error?: ZodError }`.

---

## 🧱 Schema Composition

You can compose schemas together to create powerful, reusable structures.

```ts
const AddressSchema = z.object({
  street: z.string(),
  city: z.string(),
  zip: z.string().length(6),
});

const ExtendedUserSchema = UserSchema.extend({
  address: AddressSchema,
});
```

---

## 🧪 Type Inference

Zod integrates deeply with TypeScript. You can automatically infer types from schemas:

```ts
type User = z.infer<typeof UserSchema>;

// Equivalent to:
// type User = { name: string; age: number; email: string; }
```

This keeps your types perfectly in sync with your runtime validation.

---

## 🔁 Transformations

Use `.transform()` to manipulate data after validation.

```ts
const TrimmedSchema = z.string().transform((str) => str.trim().toLowerCase());

const email = TrimmedSchema.parse('  HELLO@EMAIL.COM  ');
console.log(email); // "hello@email.com"
```

---

## 🧩 Refinements & Custom Validations

Zod allows you to define additional validation logic beyond built-in constraints.

```ts
const PasswordSchema = z
  .string()
  .min(8)
  .refine((val) => /[A-Z]/.test(val), {
    message: 'Password must contain at least one uppercase letter',
  });
```

---

## 📦 Nested & Array Schemas

Validate arrays and nested objects effortlessly.

```ts
const ProductSchema = z.object({
  id: z.number(),
  name: z.string(),
  price: z.number().positive(),
});

const CartSchema = z.array(ProductSchema);

const cart = CartSchema.parse([
  { id: 1, name: 'Shampoo', price: 5.99 },
  { id: 2, name: 'Conditioner', price: 4.5 },
]);
```

---

## 🧰 Optional & Default Values

Zod supports optional fields and default fallbacks.

```ts
const ConfigSchema = z.object({
  port: z.number().default(3000),
  mode: z.enum(['dev', 'prod']).optional(),
});

const config = ConfigSchema.parse({});
console.log(config); // { port: 3000 }
```

---

## 🌐 Validating Environment Variables

Zod can validate your `.env` configuration easily.

```ts
import { z } from 'zod';

const EnvSchema = z.object({
  DATABASE_URL: z.string().url(),
  PORT: z.string().transform(Number).default('3000'),
});

const parsedEnv = EnvSchema.parse(process.env);
```

---

## 🧠 Advanced Schema Types

Zod supports complex structures like unions, enums, discriminated unions, and records.

### Union Example

```ts
const ResultSchema = z.union([
  z.object({ status: z.literal('success'), data: z.string() }),
  z.object({ status: z.literal('error'), message: z.string() }),
]);
```

### Enum Example

```ts
const RoleSchema = z.enum(['admin', 'user', 'guest']);
```

---

## 🧩 Integration with Prisma & Bun

Zod integrates perfectly with Prisma models and Bun apps.

Example: Validating Prisma input data before creating a record:

```ts
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

const CreateUserSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  age: z.number().min(18),
});

async function createUser(input: unknown) {
  const data = CreateUserSchema.parse(input);
  return await prisma.user.create({ data });
}
```

---

## ⚡ Performance

Zod is designed for runtime validation efficiency.
When paired with **Bun**, Zod schemas parse and execute faster due to Bun’s native runtime optimization and low-overhead imports.

---

## 🧠 Useful Commands Reference

| Command             | Description                                                    |
| ------------------- | -------------------------------------------------------------- |
| `bun add zod`       | Install Zod using Bun                                          |
| `bun run <file>.ts` | Run Zod validation scripts                                     |
| `bun test`          | Run tests validating Zod schemas (if integrated with Bun test) |

---

## 📂 Example Project Structure

```
.
├── src
│   ├── schemas/
│   │   ├── user.ts
│   │   └── product.ts
│   ├── routes/
│   └── index.ts
├── prisma/
│   └── schema.prisma
├── .env
├── package.json
└── tsconfig.json
```

---

## 🔗 Resources

- [Zod Documentation](https://zod.dev/)
- [Bun Documentation](https://bun.sh/docs)
- [Zod GitHub Repository](https://github.com/colinhacks/zod)
