# Auth Service API Documentation

## Overview

The Auth Service provides user registration endpoints for customers and admins with JWT token generation, PIN hashing, and optional Aadhaar verification via Cashfree.

## Environment Variables

Create a `.env` file in `packages/auth-service/`:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/mystay_db?schema=public"

# Server
PORT=3001
NODE_ENV=development

# JWT Configuration
JWT_SECRET="your-secret-key-change-in-production"
JWT_EXPIRES_IN="7d"

# Cashfree Configuration (optional)
CASHFREE_ENABLED=false
CASHFREE_API_KEY="your-cashfree-api-key"
```

## API Endpoints

### POST /api/auth/register/customer

Register a new customer account.

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890",
  "email": "john@example.com",
  "pin": "1234",
  "aadhaarOtpToken": "optional-aadhaar-otp-token"
}
```

**Required Fields:**
- `firstName` (string): Customer's first name
- `phone` (string): Unique phone number
- `pin` (string): 4-6 digit PIN (required for customers)

**Optional Fields:**
- `lastName` (string): Customer's last name
- `email` (string): Unique email address
- `aadhaarOtpToken` (string): Aadhaar OTP token for verification (if Cashfree enabled)

**Response (201 Created):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "uniqueId": "CUST-ABC123-XYZ789",
    "firstName": "John",
    "phone": "+1234567890",
    "userType": "customer"
  }
}
```

**Error Responses:**
- `400 Bad Request`: Validation errors or missing required fields
- `409 Conflict`: User with phone/email already exists
- `500 Internal Server Error`: Server error

---

### POST /api/auth/register/admin

Register a new admin account.

**Request Body:**
```json
{
  "firstName": "Admin",
  "lastName": "User",
  "phone": "+1234567891",
  "email": "admin@example.com",
  "pin": "1234",
  "aadhaarOtpToken": "optional-aadhaar-otp-token"
}
```

**Required Fields:**
- `firstName` (string): Admin's first name
- `phone` (string): Unique phone number

**Optional Fields:**
- `lastName` (string): Admin's last name
- `email` (string): Unique email address
- `pin` (string): 4-6 digit PIN (optional for admins)
- `aadhaarOtpToken` (string): Aadhaar OTP token for verification (if Cashfree enabled)

**Response (201 Created):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "uniqueId": "ADM-ABC123-XYZ789",
    "firstName": "Admin",
    "phone": "+1234567891",
    "userType": "admin"
  }
}
```

**Error Responses:**
- `400 Bad Request`: Validation errors
- `409 Conflict`: User with phone/email already exists
- `500 Internal Server Error`: Server error

## Features

### PIN Hashing
- PINs are hashed using bcrypt (10 salt rounds) before storage
- Stored in `profileExtras.pinHash` JSON field
- Never stored in plain text

### Unique ID Generation
- Format: `{PREFIX}-{TIMESTAMP}-{RANDOM}`
- Customer: `CUST-{timestamp}-{random}`
- Admin: `ADM-{timestamp}-{random}`

### JWT Tokens
- Payload includes: `userId`, `uniqueId`, `userType`
- Expiry configurable via `JWT_EXPIRES_IN` (default: 7 days)
- Secret configurable via `JWT_SECRET`

### Aadhaar Verification
- Optional verification via Cashfree API
- Controlled by `CASHFREE_ENABLED` environment variable
- If disabled, registration proceeds with `aadhaarStatus: "unverified"`
- If enabled and token provided, verifies via Cashfree API
- Currently stubbed - implement actual Cashfree integration in `src/services/cashfree.service.ts`

## Validation Rules

### Phone Number
- Required for both customer and admin
- Must match pattern: `/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/`
- Must be unique

### Email
- Optional for both customer and admin
- Must be valid email format
- Must be unique if provided

### PIN
- Required for customer registration
- Optional for admin registration
- Must be 4-6 digits
- Must contain only numbers

### First Name
- Required for both customer and admin
- 1-100 characters

### Last Name
- Optional for both customer and admin
- Max 100 characters

## Setup

1. **Install dependencies:**
   ```bash
   cd packages/auth-service
   npm install
   ```

2. **Set up Prisma:**
   ```bash
   npm run prisma:generate
   ```

3. **Run migrations:**
   ```bash
   npm run prisma:migrate
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```

## Project Structure

```
packages/auth-service/
├── src/
│   ├── controllers/
│   │   └── auth.controller.ts      # Registration logic
│   ├── routes/
│   │   └── auth.routes.ts          # Route definitions
│   ├── services/
│   │   ├── jwt.service.ts          # JWT token generation
│   │   ├── user.service.ts         # Prisma user operations
│   │   └── cashfree.service.ts     # Cashfree Aadhaar verification
│   ├── middlewares/
│   │   └── validation.ts           # Request validation
│   ├── utils/
│   │   └── generateUniqueId.ts     # Unique ID generation
│   ├── lib/
│   │   └── prisma.ts               # Prisma client instance
│   ├── app.ts                      # Express app setup
│   └── index.ts                    # Entry point
├── prisma/
│   └── schema.prisma               # Database schema
└── package.json
```

