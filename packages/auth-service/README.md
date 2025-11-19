## Auth Service

### Overview
Node.js + TypeScript Express service that handles registration, login, forgot-PIN workflows, JWT issuance, and optional biometric verification.

### Environment Variables
| Variable | Description | Default |
| --- | --- | --- |
| `PORT` | HTTP port | `3001` |
| `NODE_ENV` | Node environment | `development` |
| `DATABASE_URL` | Postgres connection string | `postgresql://postgres:postgres@localhost:5432/mystay_db?schema=public` |
| `JWT_SECRET` | Secret used to sign access tokens | **required** |
| `JWT_EXPIRES_IN` | Token lifetime | `7d` |
| `CASHFREE_ENABLED` | Enable Aadhaar verification stub | `false` |
| `FIREBASE_SERVICE_ACCOUNT_PATH` / `FIREBASE_SERVICE_ACCOUNT` | Firebase Admin credentials (biometric login) | optional |

### Installation
```bash
cd packages/auth-service
npm install
```

### Local Development
```bash
cd /Users/mainadmin/myStay_backend
npm run dev --workspace=packages/auth-service
```

### Prisma & Database
1. Start Postgres (see project-level `docker-compose.yml`).
2. Run migrations:
   ```bash
   cd packages/auth-service
   npm run prisma:migrate -- --name init
   ```
3. Regenerate client: `npm run prisma:generate`
4. Seed data: `npm run prisma:seed`

### Testing
Tests require the test Postgres/Redis containers listening on `localhost:5434` and `localhost:6380` respectively.
```bash
# Start test infra
docker compose -f ../../docker-compose.test.yml up -d

# Run Jest + Supertest suite
npm test
```
Environment overrides for tests can be set via `.env.test` or exported variables (`TEST_DATABASE_URL`).

### Docker
The root `docker-compose.yml` builds and runs this service alongside its dependencies. Ensure `.env.local` exists at the repo root, then:
```bash
docker compose --env-file ./.env.local up --build
```

### API Reference
See `packages/auth-service/openapi.yaml` for the complete Swagger definition. Example requests are included in `postman_collection.json`.


