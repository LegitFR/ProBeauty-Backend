# Prisma with Bun

Prisma is a modern ORM (Object Relational Mapper) that simplifies database access by providing an intuitive API, type-safe queries, and easy schema migrations.  
When used with **Bun**, you get faster dependency installs, type generation, and script execution.

---

## 🚀 Setup

### Install Prisma

You can install Prisma and the required client using Bun’s fast package manager.

```bash
$ bun add prisma @prisma/client
```

Once installed, initialize Prisma inside your project:

```bash
$ bunx prisma init
```

This command creates a `prisma/` folder with a default `schema.prisma` file and adds a `.env` file to manage your database connection URL.

---

## ⚙️ Configure Database

In your `.env` file, specify the database connection URL:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/mydb?schema=public"
```

Prisma supports popular databases such as PostgreSQL, MySQL, SQLite, MongoDB, and more.

Update the `datasource` block in `prisma/schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

---

## 🧩 Generate Prisma Client

After editing your schema, run the following command to generate the Prisma client:

```bash
$ bunx prisma generate
```

This generates a type-safe client you can import and use throughout your application.

```ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const allUsers = await prisma.user.findMany();
  console.log(allUsers);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
  });
```

---

## 🧱 Create & Run Migrations

When you make changes to your Prisma schema, use the following command to create a new migration:

```bash
$ bunx prisma migrate dev --name init
```

This will:

- Create a new SQL migration file inside `prisma/migrations/`
- Apply it to your local database
- Regenerate the Prisma client automatically

To deploy migrations in production:

```bash
$ bunx prisma migrate deploy
```

---

## 🌱 Seeding the Database

You can add a seed script to populate your database with initial data.

### 1. Define the seed file

Create `prisma/seed.ts`:

```ts
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  await prisma.user.create({
    data: {
      name: 'Alice',
      email: 'alice@example.com',
    },
  });
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
  });
```

### 2. Configure in `package.json`

Add the following entry:

```json
{
  "prisma": {
    "seed": "bun run prisma/seed.ts"
  }
}
```

### 3. Run the seed command

```bash
$ bunx prisma db seed
```

---

## 🧾 Viewing the Database

Prisma provides a visual database explorer.

```bash
$ bunx prisma studio
```

This opens **Prisma Studio**, a browser-based UI for exploring and editing your data.

---

## 🧪 Running with Bun Scripts

You can add Prisma commands as Bun scripts in your `package.json`:

```json
{
  "scripts": {
    "dev": "bun run src/index.ts",
    "migrate": "bunx prisma migrate dev --name auto",
    "generate": "bunx prisma generate",
    "studio": "bunx prisma studio"
  }
}
```

Now run:

```bash
$ bun run migrate
$ bun run studio
```

---

## 🧠 Useful Commands Reference

| Command                                 | Description                                        |
| --------------------------------------- | -------------------------------------------------- |
| `bunx prisma init`                      | Initialize Prisma in your project                  |
| `bunx prisma generate`                  | Generate the Prisma client                         |
| `bunx prisma migrate dev --name <name>` | Create & apply a migration                         |
| `bunx prisma migrate deploy`            | Deploy migrations in production                    |
| `bunx prisma db push`                   | Push schema changes without generating a migration |
| `bunx prisma db seed`                   | Seed your database                                 |
| `bunx prisma studio`                    | Open Prisma Studio GUI                             |
| `bunx prisma format`                    | Format the Prisma schema file                      |

---

## ⚡ Performance

When combined with **Bun**, Prisma operations (such as migrations and client generation) execute significantly faster than when using npm or yarn.
Bun’s optimized runtime and dependency management make development smoother and more efficient.

---

## 🧩 Example Project Structure

```
.
├── prisma
│   ├── schema.prisma
│   └── seed.ts
├── src
│   ├── index.ts
│   └── routes/
├── .env
├── package.json
└── tsconfig.json
```

---

## 🔗 Resources

- [Prisma Docs](https://www.prisma.io/docs)
- [Bun Docs](https://bun.sh/docs)
- [Prisma + Bun Guide (Community)](https://github.com/oven-sh/bun/discussions)
