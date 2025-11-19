## User Service

### Overview
Provides user profile retrieval and update operations with Redis-backed caching. Built with Express + TypeScript + Prisma.

### Environment Variables
| Variable | Description | Default |
| --- | --- | --- |
| `PORT` | HTTP port | `3002` |
| `NODE_ENV` | Node environment | `development` |
| `DATABASE_URL` | Postgres connection string | `postgresql://postgres:postgres@localhost:5432/mystay_db?schema=public` |
| `REDIS_URL` | Redis connection string | `redis://localhost:6379` |
| `JWT_SECRET` | Secret for JWT verification | **required** |

### Installation
```bash
cd packages/user-service
npm install
```

### Local Development
```bash
npm run dev
```

### Prisma & Database
```bash
npm run prisma:migrate -- --name init
npm run prisma:generate
npm run prisma:seed
```

### Testing
```bash
# Start test containers (Postgres on 5434, Redis on 6380)
docker compose -f ../../docker-compose.test.yml up -d

# Run Jest suite
npm test
```
The test harness connects to `postgresql://postgres:postgres@localhost:5434/mystay_test?schema=public`. Override via `TEST_DATABASE_URL`.

### Docker
Run from repo root:
```bash
docker compose --env-file ./.env.local up --build
```

### API Reference
See `packages/user-service/openapi.yaml` plus example requests in `postman_collection.json`.


