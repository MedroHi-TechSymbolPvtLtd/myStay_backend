# Admin Panel Service (Microservice No. 9)

Acts as the **secure control center for admins** in the 2M1W architecture.
Built with Node.js, TypeScript, Express, Prisma, PostgreSQL, and Redis.

## Features
- **Admin Auth**: JWT based auth with RBAC (Super Admin, Admin, Manager).
- **Property Management**: View and control property status.
- **Analytics Dashboard**: Aggregates data from Analytics Service.
- **Transaction & Expense View**: Proxies to respective services.
- **System Notifications**: Send alerts via Notification Service.

## Architecture
This service sits between the Admin Frontend and internal microservices.
It uses:
- **Analytics Service** for data.
- **Expense/Transaction Services** for financial data.
- **Redis** for caching dashboard summaries and property lists.

## Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Variables**
   Copy `.env.example` to `.env` and configure:
   - `DATABASE_URL` (PostgreSQL)
   - `REDIS_URL` (Redis)
   - Service URLs (Analytics, Expense, etc.)

3. **Database**
   ```bash
   npx prisma generate
   npx prisma db push # Or migrate
   ```

4. **Run**
   ```bash
   npm run dev
   ```

## Testing
```bash
npm test
```

## API Documentation
See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for full details.
