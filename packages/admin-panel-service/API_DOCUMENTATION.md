# Admin Panel Service API Documentation

## Overview
Control center for Admin operations.

## Roles
| Role | Permissions |
| -- | -- |
| **super_admin** | Full Access (Manage Admins, System) |
| **admin** | Manage Properties, View Finances, Analytics |
| **manager** | View functionality, Limited Analytics |

## Authentication
**Header**: `Authorization: Bearer <token>`

### POST /api/admin/auth/login
Login with email/phone and password.
**Body:**
```json
{
  "identifier": "admin@example.com",
  "password": "..."
}
```

### GET /api/admin/auth/me
Get current admin profile and permissions.

## Dashboard
### GET /api/admin/dashboard/summary
Returns high-level stats (Revenue, Active Properties, etc).
*Cached (120s)*

## Properties
### GET /api/admin/properties
List all properties with status.
*Cached (180s)*

### PUT /api/admin/properties/:id/status
Update status (ACTIVE, MAINTENANCE).

## Admin Management (Super Admin)
### POST /api/admin/create
Create new admin.

## Integrations
- Calls **Analytics Service** for `/dashboard` endpoints.
- Calls **Notification Service** for `/notify`.
