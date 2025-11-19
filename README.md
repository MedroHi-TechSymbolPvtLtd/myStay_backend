# MyStay Backend Monorepo

A Node.js + TypeScript monorepo containing two microservices: `auth-service` and `user-service`.

## Project Structure

```
.
├── package.json              # Root package.json with workspaces
├── tsconfig.json             # Root TypeScript configuration
├── .gitignore
├── packages/
│   ├── auth-service/
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── src/
│   │       ├── index.ts
│   │       └── app.ts
│   └── user-service/
│       ├── package.json
│       ├── tsconfig.json
│       ├── prisma/
│       │   ├── schema.prisma
│       │   └── migrations/
│       └── src/
│           ├── index.ts
│           └── app.ts
└── README.md
```

## Prerequisites

- Node.js (v18 or higher)
- npm (v9 or higher, which supports workspaces)
- PostgreSQL (v12 or higher) - for user-service database

## Setup

1. **Install dependencies:**
   ```bash
   npm run bootstrap
   ```
   This installs all dependencies for the root and all workspace packages.

2. **Set up database (User Service):**
   
   Create a `.env` file in `packages/user-service/` with your database connection:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/mystay_db?schema=public"
   PORT=3002
   NODE_ENV=development
   ```
   
   **Sample DATABASE_URL formats:**
   - Local PostgreSQL: `postgresql://postgres:password@localhost:5432/mystay_db?schema=public`
   - With SSL: `postgresql://user:pass@host:5432/db?schema=public&sslmode=require`
   - Connection Pooling: `postgresql://user:pass@host:5432/db?schema=public&connection_limit=5`
   
   Then run Prisma migrations:
   ```bash
   cd packages/user-service
   npm run prisma:generate
   npm run prisma:migrate
   ```
   
   Or to use the existing migration SQL file:
   ```bash
   cd packages/user-service
   npm run prisma:generate
   npm run prisma:migrate:deploy
   ```

3. **Build all services:**
   ```bash
   npm run build
   ```

4. **Run tests:**
   ```bash
   npm run test
   ```

## Development

### Run all services in development mode:

```bash
npm run dev
```

This starts both services concurrently:
- `auth-service` on port 3001
- `user-service` on port 3002

### Run individual services:

```bash
# Auth service
cd packages/auth-service
npm run dev

# User service
cd packages/user-service
npm run dev
```

### Service-specific scripts:

Each service supports the following scripts:
- `npm run start` - Run the compiled production build
- `npm run dev` - Run in development mode with hot reload
- `npm run build` - Compile TypeScript to JavaScript
- `npm run test` - Run tests with Jest

**User Service additional scripts:**
- `npm run prisma:generate` - Generate Prisma Client
- `npm run prisma:migrate` - Create and apply a new migration (dev)
- `npm run prisma:migrate:deploy` - Apply migrations (production)
- `npm run prisma:studio` - Open Prisma Studio (database GUI)

## Docker Compose Development Setup

To run the services with Docker Compose, create a `docker-compose.yml` file:

```yaml
version: '3.8'

services:
  auth-service:
    build:
      context: .
      dockerfile: packages/auth-service/Dockerfile
    ports:
      - "3001:3001"
    environment:
      - PORT=3001
      - NODE_ENV=development
    volumes:
      - ./packages/auth-service:/app
      - /app/node_modules
    command: npm run dev

  user-service:
    build:
      context: .
      dockerfile: packages/user-service/Dockerfile
    ports:
      - "3002:3002"
    environment:
      - PORT=3002
      - NODE_ENV=development
    volumes:
      - ./packages/user-service:/app
      - /app/node_modules
    command: npm run dev
```

### Dockerfile example (for each service):

Create `packages/auth-service/Dockerfile` and `packages/user-service/Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY packages/auth-service/package*.json ./packages/auth-service/

# Install dependencies
RUN npm install

# Copy source code
COPY packages/auth-service ./packages/auth-service

WORKDIR /app/packages/auth-service

EXPOSE 3001

CMD ["npm", "run", "dev"]
```

Then run:
```bash
docker-compose up
```

## API Endpoints

### Auth Service (Port 3001)
- `GET /health` - Health check
- `GET /api/auth/test` - Test endpoint

### User Service (Port 3002)
- `GET /health` - Health check
- `GET /api/users/test` - Test endpoint

## Database Schema

The `user-service` uses Prisma ORM with PostgreSQL. The User model includes:

- User identification (id, uniqueId, userType)
- Personal information (firstName, lastName, sex, phone, email)
- Address details (addressLine1, addressLine2, city, state, pincode)
- Emergency contacts (emergencyName, emergencyPhone)
- Additional fields (profession, profileExtras JSON, aadhaarStatus)
- Timestamps (createdAt, updatedAt)

See `packages/user-service/prisma/schema.prisma` for the complete schema definition.

## Technologies

- **Runtime:** Node.js
- **Language:** TypeScript
- **Framework:** Express.js
- **Database:** PostgreSQL with Prisma ORM
- **Package Manager:** npm workspaces
- **Testing:** Jest, ts-jest, supertest
- **Linting:** ESLint
- **Formatting:** Prettier
- **Development:** ts-node-dev for hot reload

