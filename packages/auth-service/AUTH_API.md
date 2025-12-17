# Auth Service API Documentation

## Base URL
`/api/auth`

## Authentication Routes

### 1. Register Customer
`POST /register/customer`

Register a new customer account.

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+919876543210",
  "email": "john@example.com",
  "pin": "1234",
  "aadhaarOtpToken": "optional-token"
}
```

### 2. Login
`POST /login`

Login with Phone and PIN (or Biometric).

**Request Body:**
```json
{
  "phone": "+919876543210",
  "pin": "1234",
  "biometricToken": "optional-firebase-token"
}
```

### 3. Login with OTP (Step 1)
`POST /login/request-otp`

Request an OTP to login.

**Request Body:**
```json
{
  "phone": "+919876543210"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP sent successfully",
  "otp": "123456" // Only in development
}
```

### 4. Verify OTP & Login (Step 2)
`POST /login/verify-otp`

Verify the OTP to log in.

**Request Body:**
```json
{
  "phone": "+919876543210",
  "otp": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "token": "jwt-token-here",
  "user": { ... }
}
```

### 5. Set MPIN
`POST /set-mpin`

Set or update the 4-digit MPIN for the authenticated user.

**Headers:**
`Authorization: Bearer <jwt-token>`

**Request Body:**
```json
{
  "mpin": "1234"
}
```

**Response:**
```json
{
  "success": true,
  "message": "MPIN set successfully"
}
```

### 6. Get User Profile
`GET /me`

Get profile of the currently logged-in user.

**Headers:**
`Authorization: Bearer <jwt-token>`

**Response:**
```json
{
  "success": true,
  "user": { ... }
}
```
