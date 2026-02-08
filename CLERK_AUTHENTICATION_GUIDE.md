# Clerk Authentication Integration Guide

## Overview

The signup route has been completely rewritten to use **Clerk for authentication** instead of manual email/password handling. This provides better security, scalability, and user experience.

## Key Changes

### What Changed:
- ✅ **No password management**: Clerk handles all password security
- ✅ **Clerk authentication**: Uses `auth()` helper from `@clerk/nextjs/server`
- ✅ **MongoDB integration**: User profiles are stored in MongoDB via Mongoose
- ✅ **OTP verification**: Users must verify email with OTP before full account activation
- ✅ **No JWT generation**: Clerk manages session tokens automatically
- ✅ **Welcome emails**: Still sends welcome emails to new users

### What Stayed the Same:
- Email-based user identification
- MongoDB storage for user profiles
- Welcome and OTP email notifications
- User roles and trial system

---

## API Endpoints

### 1. **POST /api/auth/signup**

**Purpose**: Create a new user account after Clerk authentication

**Requirements**:
- User must be authenticated via Clerk first
- Clerk signup should be completed before calling this endpoint

**Request Body**:
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "phone": "9876543210"
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "message": "Signup successful. Please verify your email with the OTP sent to your email address.",
  "user": {
    "_id": "67a8f9c2e4b0d5f8c9a2b1c3",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "9876543210",
    "role": "user"
  },
  "otpRequired": true,
  "otpExpiresAt": "2026-02-07T10:15:00.000Z"
}
```

**Default User Settings**:
```json
{
  "role": "user",
  "trialCount": 5,
  "isPremium": false,
  "subscription": "free",
  "isActive": true,
  "phone": "provided_phone"
}
```

**Error Responses**:
- `401`: User not authenticated with Clerk
- `400`: Missing/invalid fields or user already exists
- `500`: Database or server error

---

### 2. **POST /api/auth/verify-otp**

**Purpose**: Verify OTP and activate user account

**Requirements**:
- User must be authenticated via Clerk
- User must have completed signup
- Valid OTP from email

**Request Body**:
```json
{
  "email": "john@example.com",
  "otp": "123456"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Email verified successfully. Your account is now active.",
  "user": {
    "_id": "67a8f9c2e4b0d5f8c9a2b1c3",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "9876543210",
    "isActive": true,
    "role": "user",
    "trialCount": 5
  }
}
```

**Error Responses**:
- `401`: User not authenticated with Clerk
- `400`: Invalid or expired OTP
- `404`: User not found
- `500`: Server error

---

### 3. **POST /api/auth/resend-otp**

**Purpose**: Resend OTP if previous one expired

**Requirements**:
- User must be authenticated via Clerk
- User must exist in MongoDB

**Request Body**:
```json
{
  "email": "john@example.com"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "OTP has been resent to your email address.",
  "otpExpiresAt": "2026-02-07T10:15:00.000Z",
  "expiresIn": "10 minutes"
}
```

**Error Responses**:
- `401`: User not authenticated with Clerk
- `404`: User not found
- `500`: Failed to send email

---

## Frontend Implementation Example

### Step 1: Clerk Signup
```javascript
// User signs up with Clerk first using their UI components
import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return <SignUp />;
}
```

### Step 2: Complete Profile
After Clerk signup, redirect user to complete their profile:
```javascript
async function completeProfile(firstName, lastName, phone) {
  const response = await fetch('/api/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      firstName,
      lastName,
      phone,
    })
  });
  
  const data = await response.json();
  if (response.ok) {
    showOTPInput(); // Show OTP form
  } else {
    showError(data.error);
  }
}
```

### Step 3: Verify OTP
```javascript
async function verifyOTP(email, otp) {
  const response = await fetch('/api/auth/verify-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email,
      otp,
    })
  });
  
  const data = await response.json();
  if (response.ok) {
    navigateToDashboard(); // User is fully onboarded
  } else {
    showError(data.error);
  }
}
```

### Step 4: Resend OTP (if needed)
```javascript
async function resendOTP(email) {
  const response = await fetch('/api/auth/resend-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  });
  
  const data = await response.json();
  if (response.ok) {
    showSuccess('OTP resent! Check your email.');
  } else {
    showError(data.error);
  }
}
```

---

## Environment Variables

All required credentials are already in `.env.local`:

```dotenv
# Clerk Credentials
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_Zmx1ZW50LW1hbnRpcy00My5jbGVyay5hY2NvdW50cy5kZXYk
CLERK_SECRET_KEY=sk_test_YKT7txu3UcjbNPxtGyvdB70sPYQlsKsGO7M0ZwmrYE

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=nitminer@nitw.ac.in
SMTP_PASSWORD=foai ezdd vdas yfpu
SMTP_FROM=nitminer@nitw.ac.in

# Database
MONGODB_URI=mongodb+srv://nitminer_db_user:BQwe2vgJmDm0yaoh@cluster0.lo0ggwk.mongodb.net/trustinn
```

---

## User Model Fields

The User model now includes:

```typescript
{
  firstName: string;        // New
  lastName: string;         // New
  email: string;           // Existing
  phone: string;           // New
  clerkUserId?: string;    // New - Links to Clerk
  googleId?: string;       // Existing
  password?: string;       // Still optional for backwards compatibility
  role: 'user' | 'admin';  // Existing
  trialCount: number;      // Existing (default: 5)
  isPremium: boolean;      // Existing (default: false)
  isActive: boolean;       // New (default: true, set after OTP verification)
  subscription: string;    // Existing (default: 'free')
  settings: { ... };       // Existing
  createdAt: Date;         // Existing
  updatedAt: Date;         // Existing
}
```

---

## OTP Configuration

- **Length**: 6 digits
- **Expiration**: 10 minutes
- **Storage**: MongoDB (auto-deletes after expiration via TTL index)
- **Email**: Sent via SMTP (Gmail)
- **Resend**: Available via `/api/auth/resend-otp`

---

## Security Features

1. **Clerk Authentication**: Industry-standard authentication
2. **OTP Verification**: Email confirmation before account activation
3. **No Password Storage**: Clerk manages password encryption
4. **Token Management**: Clerk handles JWT/session tokens
5. **Email Validation**: Ensures valid email format
6. **Phone Validation**: Ensures 10-digit phone numbers
7. **User Uniqueness**: Email and Clerk ID must be unique
8. **Expired OTP Auto-cleanup**: MongoDB TTL index removes old OTPs

---

## Migration Notes

### For Existing Users:
- Old Mongoose `name` field is replaced with `firstName` and `lastName`
- Run migration script to split existing `name` field if needed
- `password` field is deprecated but kept for backwards compatibility
- New users won't have password field

### For Login:
To implement Clerk-based login, use Clerk's login component:
```javascript
import { SignIn } from "@clerk/nextjs";

export default function LoginPage() {
  return <SignIn />;
}
```

After Clerk login, fetch user profile from MongoDB using `email`:
```javascript
const { user: clerkUser } = useAuth();
const dbUser = await fetch(`/api/users/${clerkUser.emailAddresses[0].emailAddress}`);
```

---

## Testing the Flow

### 1. Test Signup (after Clerk signup):
```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "phone": "9876543210"
  }'
```

### 2. Test OTP Verification:
```bash
curl -X POST http://localhost:3000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "otp": "123456"
  }'
```

### 3. Test OTP Resend:
```bash
curl -X POST http://localhost:3000/api/auth/resend-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com"
  }'
```

---

## Troubleshooting

### "Unauthorized" Error
- Ensure user is logged in via Clerk
- Check `CLERK_SECRET_KEY` in environment
- Verify Clerk middleware is properly configured

### OTP Not Received
- Check SMTP email settings
- Verify `SMTP_PASSWORD` is correct (check app-specific passwords for Gmail)
- Check spam/junk folder
- Use resend-otp endpoint to request new OTP

### User Already Exists
- Email is already registered
- Check MongoDB for duplicate emails
- Use login flow instead of signup

### OTP Expired
- OTPs expire after 10 minutes
- Use `/api/auth/resend-otp` to get a new one
- Check system time is correct on server

---

## Next Steps

1. ✅ Signup route updated
2. ✅ User model updated
3. ✅ OTP verification added
4. ✅ OTP resend added
5. ⏳ Update login route to use Clerk
6. ⏳ Update dashboard redirect hooks for Clerk
7. ⏳ Update admin authentication if needed
8. ⏳ Test with real Clerk setup

---

## Files Changed

- `/src/app/api/auth/signup/route.ts` - Rewritten for Clerk
- `/src/app/api/auth/verify-otp/route.ts` - Updated for Clerk
- `/src/app/api/auth/resend-otp/route.ts` - New file
- `/src/models/User.ts` - Added firstName, lastName, phone, clerkUserId, isActive
