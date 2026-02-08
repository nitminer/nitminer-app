# TrustInn JWT Token Integration Guide

This guide explains how TrustInn can integrate with NitMiner's JWT-based authentication system for secure user session management.

## Overview

When users access TrustInn from NitMiner, they receive a URL containing a JWT token: `https://trustinn.nitminer.com/tools?token=jwt_token`

The JWT token contains all necessary user information and can be validated using NitMiner's API endpoints.

## JWT Token Structure

The JWT token contains the following payload:

```json
{
  "id": "user_mongodb_id",
  "email": "user@example.com",
  "name": "User Name",
  "role": "user",
  "isPremium": false,
  "trialCount": 3,
  "purpose": "trustinn_access",
  "issuedAt": "2026-02-06T10:30:00Z",
  "iat": 1707213000,
  "exp": 1707817800,
  "iss": "nitminer-trustinn",
  "aud": "trustinn-app"
}
```

## Integration Steps

### 1. Receive and Parse the URL

When a user arrives at TrustInn with a token:

```javascript
// Example: User visits https://trustinn.nitminer.com/tools?token=eyJhbGciOiJIUzI1NiIs...

// Extract token from URL
const urlParams = new URLSearchParams(window.location.search);
const token = urlParams.get('token');

if (!token) {
  // No token provided, redirect to login or show error
  window.location.href = 'https://nitminer.com/login';
  return;
}
```

### 2. Validate the Token

Call NitMiner's validation endpoint to verify the token and get user information:

```javascript
// Validate token with NitMiner API
async function validateToken(token) {
  try {
    const response = await fetch('https://nitminer.com/api/auth/session/validate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token: token
      })
    });

    const result = await response.json();

    if (result.isValid) {
      // Token is valid, use user information
      console.log('User authenticated:', result.user);
      return {
        isValid: true,
        user: result.user,
        expiresAt: result.expiresAt
      };
    } else {
      // Token is invalid
      console.log('Token invalid:', result.reason);
      return {
        isValid: false,
        reason: result.reason
      };
    }
  } catch (error) {
    console.error('Token validation failed:', error);
    return {
      isValid: false,
      reason: 'Network error'
    };
  }
}

// Usage
const validation = await validateToken(token);
if (validation.isValid) {
  // Proceed with authenticated user
  const user = validation.user;
  // user.id, user.email, user.isPremium, user.trialCount, etc.
} else {
  // Handle invalid token
  alert('Session expired. Please login again.');
  window.location.href = 'https://nitminer.com/login';
}
```

### 3. Handle User Sessions

Store the validated user information in your application's session:

```javascript
// After successful validation
if (validation.isValid) {
  // Store user session in your app
  sessionStorage.setItem('trustinn_user', JSON.stringify(validation.user));
  sessionStorage.setItem('trustinn_token', token);
  sessionStorage.setItem('token_expires', validation.expiresAt);

  // Initialize your app with user data
  initializeApp(validation.user);
}
```

### 4. Check Session Validity Periodically

Implement periodic token validation to ensure the session is still active:

```javascript
// Check token validity every 5 minutes
setInterval(async () => {
  const storedToken = sessionStorage.getItem('trustinn_token');
  if (storedToken) {
    const validation = await validateToken(storedToken);
    if (!validation.isValid) {
      // Session expired, logout user
      sessionStorage.clear();
      alert('Your session has expired. Please login again.');
      window.location.href = 'https://nitminer.com/login';
    }
  }
}, 5 * 60 * 1000); // 5 minutes
```

### 5. Handle Premium Features

Use the user information to control access to premium features:

```javascript
function canAccessPremiumFeature(user) {
  return user.isPremium || user.trialCount > 0;
}

function getRemainingTrials(user) {
  return user.trialCount;
}

function decrementTrial(user) {
  // Note: Trial decrement is handled by NitMiner
  // You may want to re-validate the token after usage
  return validateToken(sessionStorage.getItem('trustinn_token'));
}

// Example usage
const user = JSON.parse(sessionStorage.getItem('trustinn_user'));

if (canAccessPremiumFeature(user)) {
  // Allow access to premium feature
  showPremiumContent();
} else {
  // Show upgrade prompt
  showUpgradePrompt();
}
```

## API Endpoints

### POST /api/auth/session/validate

**Endpoint**: `https://nitminer.com/api/auth/session/validate`

**Method**: POST

**Headers**:
```
Content-Type: application/json
```

**Request Body**:
```json
{
  "token": "jwt_token_string"
}
```

**Success Response (200)**:
```json
{
  "isValid": true,
  "user": {
    "id": "user_mongodb_id",
    "email": "user@example.com",
    "name": "User Name",
    "role": "user",
    "isPremium": false,
    "trialCount": 3
  },
  "expiresAt": "2026-02-13T10:30:00Z",
  "issuedAt": "2026-02-06T10:30:00Z"
}
```

**Error Response (200)**:
```json
{
  "isValid": false,
  "reason": "Token expired" | "Invalid token" | "Token not for TrustInn"
}
```

## Security Considerations

1. **Always validate tokens server-side**: Never trust client-side token validation alone
2. **Check token expiration**: The `expiresAt` field indicates when the token expires
3. **Validate token purpose**: Only accept tokens with `purpose: "trustinn_access"`
4. **Handle network errors**: Implement proper error handling for API calls
5. **Secure token storage**: Store tokens securely (sessionStorage is recommended over localStorage)

## Error Handling

Common validation errors:
- `Token expired`: User needs to login again
- `Invalid token`: Token is malformed or tampered with
- `Token not for TrustInn`: Token is not intended for TrustInn access
- `Network error`: API is unreachable, implement retry logic

## Testing

You can test the integration using these steps:

1. Login to NitMiner
2. Click on TrustInn access
3. Verify you receive a URL with a token parameter
4. Call the validation endpoint with the token
5. Confirm you receive valid user information

## Support

If you encounter issues with the integration:

1. Check that the NitMiner domain is correct (`https://nitminer.com`)
2. Verify the token is being extracted correctly from the URL
3. Ensure your requests include proper headers
4. Check the browser console for network errors
5. Contact NitMiner support for API-related issues

## Example Implementation

Here's a complete example of how to integrate TrustInn with NitMiner authentication:

```javascript
// trustinn-integration.js
class TrustInnAuth {
  constructor() {
    this.apiBase = 'https://nitminer.com/api/auth';
    this.user = null;
    this.token = null;
  }

  async initialize() {
    // Extract token from URL
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    if (!token) {
      this.redirectToLogin();
      return false;
    }

    // Validate token
    const validation = await this.validateToken(token);

    if (validation.isValid) {
      this.user = validation.user;
      this.token = token;

      // Store session
      this.storeSession();

      // Start session monitoring
      this.startSessionMonitoring();

      return true;
    } else {
      alert('Invalid session. Please login again.');
      this.redirectToLogin();
      return false;
    }
  }

  async validateToken(token) {
    try {
      const response = await fetch(`${this.apiBase}/session/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      });

      return await response.json();
    } catch (error) {
      console.error('Validation error:', error);
      return { isValid: false, reason: 'Network error' };
    }
  }

  storeSession() {
    sessionStorage.setItem('trustinn_user', JSON.stringify(this.user));
    sessionStorage.setItem('trustinn_token', this.token);
  }

  startSessionMonitoring() {
    setInterval(async () => {
      if (this.token) {
        const validation = await this.validateToken(this.token);
        if (!validation.isValid) {
          this.logout();
        }
      }
    }, 5 * 60 * 1000); // Check every 5 minutes
  }

  logout() {
    sessionStorage.clear();
    this.redirectToLogin();
  }

  redirectToLogin() {
    window.location.href = 'https://nitminer.com/login';
  }

  canAccessPremium() {
    return this.user?.isPremium || this.user?.trialCount > 0;
  }

  getRemainingTrials() {
    return this.user?.trialCount || 0;
  }
}

// Usage
const auth = new TrustInnAuth();
auth.initialize().then(success => {
  if (success) {
    console.log('User authenticated:', auth.user);
    // Initialize your TrustInn application
  }
});
```

This integration ensures secure, seamless authentication between NitMiner and TrustInn while maintaining user session integrity.