# Analytics Service

Microservice No.8 in the 2M1W backend architecture.
This service powers the admin dashboards and analytics for A19 requirements, specifically Revenue, Expenses, Profit, and Occupancy tracking.

## Purpose
- Read-only analysis of live data.
- Caching logic to reduce DB load for heavy aggregation queries.
- Providing visual-ready data structures for charts.

## Tech Stack
- Node.js + Express + TypeScript
- Prisma ORM (Read Only)
- Redis Caching
- PostgreSQL

## Running Locally
1. Copy .env.example to .env
2. `npm install`
3. `npx prisma generate`
4. `npm run dev`

## Docker
`docker-compose up --build`
