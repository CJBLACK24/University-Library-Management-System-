# Required Environment Variables

This document lists all environment variables required for the University Library Management System to function properly.

## Required Variables

### Database
- `DATABASE_URL` - PostgreSQL connection string (Neon or other PostgreSQL provider)
  - **Required**: Yes
  - **Example**: `postgresql://user:password@host:5432/database`

### Authentication (NextAuth)
- `AUTH_SECRET` - Secret key for NextAuth session encryption
  - **Required**: Yes
  - **Generate**: `openssl rand -base64 32`

### ImageKit (Media Processing)
- `NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY` - ImageKit public API key
  - **Required**: Yes (for image/video uploads)
- `NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT` - ImageKit URL endpoint
  - **Required**: Yes (for image/video URLs)
- `IMAGEKIT_PRIVATE_KEY` - ImageKit private API key
  - **Required**: Yes (for server-side operations)

### Upstash (Caching & Workflows)
- `UPSTASH_REDIS_URL` - Upstash Redis connection URL
  - **Required**: Yes (for caching and rate limiting)
- `UPSTASH_REDIS_TOKEN` - Upstash Redis authentication token
  - **Required**: Yes
- `QSTASH_URL` - QStash base URL
  - **Required**: Yes (for workflow triggers)
  - **Example**: `https://qstash.upstash.io`
- `QSTASH_TOKEN` - QStash authentication token
  - **Required**: Yes
- `QSTASH_CURRENT_SIGNING_KEY` - QStash current signing key for webhook verification
  - **Required**: Recommended (for webhook security)
- `QSTASH_NEXT_SIGNING_KEY` - QStash next signing key for webhook verification
  - **Required**: Recommended (for key rotation)

### Email (Resend)
- `RESEND_TOKEN` - Resend API token for sending emails
  - **Required**: Yes (for all email notifications)

### Application URL
- `NEXT_PUBLIC_APP_URL` - Your application's public URL
  - **Required**: Recommended (for email links and API routes)
  - **Example**: `https://yourdomain.com` or `http://localhost:3000` for development

### Optional Variables
- `NEXT_PUBLIC_API_ENDPOINT` - API endpoint (if using external API)
  - **Required**: No
- `NEXT_PUBLIC_PROD_API_ENDPOINT` - Production API endpoint
  - **Required**: No
- `NODE_ENV` - Environment mode (`development` or `production`)
  - **Required**: No (defaults to development)

## Features That Require Specific Variables

### ✅ Fully Functional (All variables set)
- Authentication & User Management
- Book Management
- Borrow/Return System
- Email Notifications (if RESEND_TOKEN is set)
- PDF Receipt Generation (if jspdf is installed)
- Workflows & Caching (if Upstash variables are set)
- Image/Video Uploads (if ImageKit variables are set)

### ⚠️ Partially Functional (Missing some variables)
- **Email Notifications**: Will fail silently if `RESEND_TOKEN` is missing
- **PDF Receipts**: Will fail if `jspdf` package is not installed (run `npm install jspdf @types/jspdf`)
- **Image/Video Uploads**: Will fail if ImageKit variables are missing
- **Workflows**: Will fail if Upstash/QStash variables are missing
- **Caching**: Will fail if Upstash Redis variables are missing

### ❌ Cannot Function Without
- `DATABASE_URL` - Core functionality requires database
- `AUTH_SECRET` - Authentication will not work

## Installation Steps

1. **Install PDF generation package** (if not already installed):
   ```bash
   npm install jspdf @types/jspdf
   ```

2. **Create `.env.local` file** in the root directory:
   ```env
   # Database
   DATABASE_URL=your_postgresql_connection_string

   # Auth
   AUTH_SECRET=your_generated_secret

   # ImageKit
   NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY=your_public_key
   NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT=your_endpoint
   IMAGEKIT_PRIVATE_KEY=your_private_key

   # Upstash
   UPSTASH_REDIS_URL=your_redis_url
   UPSTASH_REDIS_TOKEN=your_redis_token
   QSTASH_URL=https://qstash.upstash.io
   QSTASH_TOKEN=your_qstash_token
   QSTASH_CURRENT_SIGNING_KEY=your_current_signing_key
   QSTASH_NEXT_SIGNING_KEY=your_next_signing_key

   # Email
   RESEND_TOKEN=your_resend_token

   # App URL
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

3. **Verify all services are configured**:
   - Database connection works
   - ImageKit account is set up
   - Upstash account is created
   - Resend account is configured

## Testing Without All Variables

The application will work in a limited capacity without some variables:
- **Without ImageKit**: Image/video uploads will fail
- **Without Resend**: Email notifications will fail silently
- **Without Upstash**: Workflows and caching will fail
- **Without PDF package**: Receipt generation will fail

All other features (authentication, book management, etc.) will work normally.

