# NitMiner - User Dashboard Implementation

This is a [Next.js](https://nextjs.org) project with a comprehensive user dashboard featuring profile management, subscriptions, billing, security, and notifications.

## 🎯 Dashboard Features

### ✅ User Profile Management
- Basic account details (name, email, phone, username)
- Profile picture
- Account status & role
- Login history & IP tracking
- User preferences (language, theme, timezone, developer mode)
- Notification settings

### ✅ Subscription & Plan Management
- Multiple plan types (free, premium 6m, premium 1y)
- Usage tracking (monthly scans, API calls)
- Trial status and remaining trials
- Plan timeline with expiration
- Auto-renewal settings
- Limit exceeded warnings

### ✅ Payment & Billing
- Multiple payment methods (card, UPI, PayPal)
- Payment provider integration ready
- Payment history with invoices
- Billing address management
- Refund tracking
- Tax/GST information

### ✅ Security Settings
- Two-factor authentication (2FA)
- Authorized device management
- Browser session tracking
- API key management
- Access log viewing
- Failed login attempt monitoring
- Account lock protection

### ✅ Notifications Center
- System alerts
- Payment reminders
- Plan expiry alerts
- Trial expiring notices
- Feature updates
- Security alerts
- Unread count tracking

## 📚 Documentation

**Start here**: [QUICK_SETUP.md](./QUICK_SETUP.md) - 5 minute quick start

### Complete Documentation Index
- **[QUICK_SETUP.md](./QUICK_SETUP.md)** - Quick start & testing
- **[IMPLEMENTATION_COMPLETE.md](./IMPLEMENTATION_COMPLETE.md)** - Visual summary
- **[DASHBOARD_IMPLEMENTATION.md](./DASHBOARD_IMPLEMENTATION.md)** - Comprehensive guide
- **[DASHBOARD_SUMMARY.md](./DASHBOARD_SUMMARY.md)** - Feature list
- **[API_REFERENCE.md](./API_REFERENCE.md)** - API documentation
- **[INTEGRATION_CHECKLIST.md](./INTEGRATION_CHECKLIST.md)** - Integration guide

## 🚀 Quick Start

### 1. Environment Setup
```bash
# .env.local
JWT_SECRET=your-super-secret-key-change-this-in-production
MONGODB_URI=mongodb://localhost:27017/nitminer
```

### 2. Run Development Server
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

### 3. Access Dashboard
Open [http://localhost:3000](http://localhost:3000)
1. Create account or login
2. Navigate to `/user/dashboard`
3. Explore all tabs!

## 📁 Project Structure

```
src/
├── models/User.js                 # Enhanced MongoDB schema
├── app/user/dashboard/page.js     # Main dashboard
├── app/api/
│   ├── middleware/authMiddleware.js
│   └── user/
│       ├── profile/route.js
│       ├── subscription/route.js
│       ├── billing/route.js
│       ├── security/route.js
│       └── notifications/route.js
└── components/dashboard/
    ├── ProfileTab.jsx
    ├── SubscriptionTab.jsx
    ├── BillingTab.jsx
    ├── SecurityTab.jsx
    └── NotificationsTab.jsx
```

## 🔐 Security Features

- ✅ JWT token-based authentication
- ✅ Protected API routes
- ✅ httpOnly secure cookies
- ✅ Access logs & audit trails
- ✅ 2FA support framework
- ✅ Device management
- ✅ Failed login tracking
- ✅ Sensitive data sanitization

## 📊 Database Schema

Complete MongoDB schema with:
- 6 nested sub-documents
- 50+ fields
- Performance-optimized indexes
- Support for all dashboard features

## 🛠 API Endpoints

All endpoints require authentication:

```
GET  /api/user/profile          - Fetch profile
PUT  /api/user/profile          - Update profile
GET  /api/user/subscription     - Fetch subscription
GET  /api/user/billing          - Fetch billing info
PUT  /api/user/billing          - Update billing
GET  /api/user/security         - Fetch security settings
POST /api/user/security         - Manage security
GET  /api/user/notifications    - Fetch notifications
PUT  /api/user/notifications    - Manage notifications
POST /api/auth/logout           - Logout user
```

See [API_REFERENCE.md](./API_REFERENCE.md) for complete documentation.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
# nitminer
