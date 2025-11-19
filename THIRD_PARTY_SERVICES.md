# Third-Party Services & Dependencies Required

## 🚀 Essential Services (Required)

### 1. **PostgreSQL Database**
- **Purpose**: Primary database for storing user data
- **Version**: 13 or higher
- **Docker Image**: `postgres:13`
- **Environment Variables**:
  - `DATABASE_URL`: Connection string
  - `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`
- **Setup**: Included in `docker-compose.yml`
- **Test Database**: Separate instance on port `5434` (see `docker-compose.test.yml`)

### 2. **Redis Cache**
- **Purpose**: Caching user profiles and session data
- **Version**: 6 or higher
- **Docker Image**: `redis:6`
- **Environment Variables**:
  - `REDIS_URL`: Connection string (default: `redis://localhost:6379`)
- **Setup**: Included in `docker-compose.yml`
- **Fallback**: In-memory cache if Redis unavailable (for development)

### 3. **JWT Secret**
- **Purpose**: Signing and verifying authentication tokens
- **Environment Variable**: `JWT_SECRET`
- **Required**: Yes (shared between auth-service and user-service)
- **Security**: Use strong random string in production

## 🔌 Optional Services (Can be disabled)

### 4. **Firebase Admin SDK** (Optional - for biometric login)
- **Purpose**: Verify Firebase ID tokens for biometric authentication
- **Package**: `firebase-admin@^12.0.0`
- **Environment Variables**:
  - `FIREBASE_SERVICE_ACCOUNT_PATH`: Path to service account JSON file
  - **OR** `FIREBASE_SERVICE_ACCOUNT`: Service account JSON as string
  - `FIREBASE_PROJECT_ID`: Firebase project ID
- **Status**: Disabled by default (`CASHFREE_ENABLED=false`)
- **Setup**: Requires Firebase project and service account credentials
- **Note**: Biometric login will be disabled if not configured

### 5. **Cashfree API** (Optional - for Aadhaar verification)
- **Purpose**: Verify Aadhaar numbers via OTP
- **Environment Variables**:
  - `CASHFREE_ENABLED`: `true`/`false` (default: `false`)
  - `CASHFREE_API_KEY`: API key for Cashfree
- **Status**: Currently stubbed/disabled
- **Implementation**: See `packages/auth-service/src/services/cashfree.service.ts`
- **Note**: Service works without it (Aadhaar status remains "unverified")

### 6. **SMS Provider** (Optional - for production OTP)
- **Purpose**: Send OTP via SMS (currently in-memory for dev)
- **Recommended Providers**:
  - **Twilio**: Most popular (see comments in `otp.service.ts`)
  - **AWS SNS**: Alternative option
  - **MessageBird**: Another alternative
- **Environment Variables** (example for Twilio):
  - `TWILIO_ACCOUNT_SID`
  - `TWILIO_AUTH_TOKEN`
  - `TWILIO_PHONE_NUMBER`
- **Status**: Currently using in-memory OTP (dev mode)
- **Note**: OTP service has placeholder for SMS integration

## 📦 NPM Packages (All managed via package.json)

### Core Dependencies
- `express@^4.18.2` - Web framework
- `cors@^2.8.5` - CORS middleware
- `@prisma/client@^5.9.1` - Prisma ORM client
- `bcrypt@^5.1.1` - Password hashing
- `jsonwebtoken@^9.0.2` - JWT token handling
- `express-validator@^7.0.1` - Request validation
- `redis@^4.6.12` - Redis client (user-service only)
- `firebase-admin@^12.0.0` - Firebase Admin SDK (auth-service only)

### Development Dependencies
- `typescript@^5.3.3` - TypeScript compiler
- `ts-node-dev@^2.0.0` - Hot reload for development
- `jest@^29.7.0` - Testing framework
- `ts-jest@^29.1.1` - Jest TypeScript preset
- `supertest@^6.3.3` - HTTP testing
- `prisma@^5.9.1` - Prisma CLI
- `ts-node@^10.9.2` - TypeScript execution (for seeding)

## 🐳 Docker Services (All included in docker-compose.yml)

1. **PostgreSQL 13** - Database server
2. **Redis 6** - Cache server
3. **auth-service** - Authentication microservice (build from Dockerfile)
4. **user-service** - User profile microservice (build from Dockerfile)

## 🔧 Setup Commands

### 1. Install Dependencies
```bash
npm run bootstrap  # From root directory
```

### 2. Start Services (Docker)
```bash
docker compose --env-file ./.env.local up --build
```

### 3. Run Migrations
```bash
# Auth service
cd packages/auth-service
npm run prisma:migrate

# User service (if needed)
cd packages/user-service
npm run prisma:migrate
```

### 4. Seed Database
```bash
cd packages/user-service
npm run prisma:seed
```

### 5. Run Tests
```bash
# Start test infrastructure
docker compose -f docker-compose.test.yml up -d

# Run tests
npm test --workspace=packages/auth-service
npm test --workspace=packages/user-service

# Stop test infrastructure
docker compose -f docker-compose.test.yml down
```

## 📝 Environment Variables Summary

### Required for Production
```env
DATABASE_URL=postgresql://user:pass@host:5432/db?schema=public
REDIS_URL=redis://host:6379
JWT_SECRET=your-strong-secret-key-here
PORT=3001  # or 3002 for user-service
NODE_ENV=production
```

### Optional (Feature Flags)
```env
FIREBASE_SERVICE_ACCOUNT_PATH=./path/to/service-account.json
FIREBASE_PROJECT_ID=your-project-id
CASHFREE_ENABLED=false
CASHFREE_API_KEY=your-api-key
TWILIO_ACCOUNT_SID=your-sid  # For SMS OTP
TWILIO_AUTH_TOKEN=your-token
TWILIO_PHONE_NUMBER=your-number
```

## ⚠️ Current Issues Fixed

1. **Duplicate test content** - Removed duplicate code in `auth.test.ts`
2. **Jest setup files** - Excluded from test matching
3. **Database migrations** - Need to run migrations before tests:
   ```bash
   # For test database
   docker compose -f docker-compose.test.yml up -d
   DATABASE_URL="postgresql://postgres:postgres@localhost:5434/mystay_test?schema=public" npm run prisma:migrate --workspace=packages/auth-service
   DATABASE_URL="postgresql://postgres:postgres@localhost:5434/mystay_test?schema=public" npm run prisma:migrate --workspace=packages/user-service
   ```

