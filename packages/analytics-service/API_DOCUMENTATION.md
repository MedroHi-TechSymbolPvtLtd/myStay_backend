# Analytics Service API Documentation

## Overview
The Analytics Service aggregates data across Transactions, Expenses, Properties, and Enrollments to provide insights into business performance.

## Authentication
All endpoints require a JWT token in the `Authorization` header: `Bearer <token>`.
- Admin endpoints require `userType: 'admin'`.

## Caching Strategy
Redis is used to cache expensive aggregation results.
- **Global Summary**: 120 seconds
- **Monthly Trends**: 300 seconds
- **Property Overview**: 180 seconds

## Endpoints

### 1. Global Dashboard Summary
**GET** `/api/analytics/admin/summary`
Retrieves high-level metrics for the entire system.
**Permissions**: Admin Only
**Response**:
```json
{
  "totalRevenue": 150000,
  "totalExpenses": 50000,
  "totalProfit": 100000,
  "occupancyRate": 85.5
  ...
}
```

### 2. Monthly Trends
**GET** `/api/analytics/admin/monthly?year=2024`
Returns monthly breakdown of revenue, expenses, and profit.
**Permissions**: Admin Only

### 3. Property Overview
**GET** `/api/analytics/property/:id/overview`
Metrics for a specific property including occupancy and financials.

## Error Handling
Standard error format:
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Description"
  }
}
```
