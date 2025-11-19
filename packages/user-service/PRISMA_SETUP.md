# Prisma Setup Guide

## Prisma Schema

The Prisma schema is located at `prisma/schema.prisma` and defines the User model for PostgreSQL.

## Database Setup

### 1. Create `.env` file

Create a `.env` file in `packages/user-service/` with your database connection:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/mystay_db?schema=public"
PORT=3002
NODE_ENV=development
```

### 2. Sample DATABASE_URL Formats

- **Local PostgreSQL:**
  ```
  postgresql://postgres:password@localhost:5432/mystay_db?schema=public
  ```

- **With SSL:**
  ```
  postgresql://user:pass@host:5432/db?schema=public&sslmode=require
  ```

- **Connection Pooling (e.g., Prisma Data Proxy):**
  ```
  postgresql://user:pass@host:5432/db?schema=public&connection_limit=5
  ```

- **Remote Database:**
  ```
  postgresql://user:pass@remote-host.com:5432/mystay_db?schema=public
  ```

## Running Migrations

### Option 1: Using Prisma Migrate (Recommended)

This will create a new migration based on your schema:

```bash
cd packages/user-service
npm run prisma:generate
npm run prisma:migrate
```

When prompted, enter a migration name (e.g., `init`).

### Option 2: Deploy Existing Migration

If you want to use the existing migration SQL file:

```bash
cd packages/user-service
npm run prisma:generate
npm run prisma:migrate:deploy
```

### Option 3: Manual SQL Execution

You can also run the SQL file directly in your PostgreSQL database:

```bash
psql -U postgres -d mystay_db -f prisma/migrations/20240101000000_init/migration.sql
```

## Generate Prisma Client

After setting up the database, generate the Prisma Client:

```bash
npm run prisma:generate
```

This creates the TypeScript types and client code in `node_modules/.prisma/client`.

## Prisma Studio

To view and edit your database through a GUI:

```bash
npm run prisma:studio
```

This opens Prisma Studio at `http://localhost:5555`.

## Using Prisma Client in Code

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Example: Create a user
const user = await prisma.user.create({
  data: {
    uniqueId: 'user-123',
    userType: 'guest',
    firstName: 'John',
    phone: '+1234567890',
    email: 'john@example.com',
  },
});
```

## Migration Commands Reference

- `npm run prisma:generate` - Generate Prisma Client
- `npm run prisma:migrate` - Create and apply a new migration (development)
- `npm run prisma:migrate:deploy` - Apply pending migrations (production)
- `npm run prisma:studio` - Open Prisma Studio GUI

