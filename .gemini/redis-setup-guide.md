# Redis Configuration Guide

## 🚀 Step-by-Step Setup

### 1. Get Upstash Redis Credentials

1. Visit [Upstash Console](https://console.upstash.com/)
2. Sign in to your account
3. Click on the **Redis** tab in the navigation
4. Click **Create Database**
5. Configure your database:
   - **Name**: `ulms-cache` (or any name you prefer)
   - **Region**: Choose the closest to your users
   - **Type**: Choose based on your needs (Free tier is fine for development)
6. Click **Create**

### 2. Copy Your Credentials

After creating the database, you'll see:
- **UPSTASH_REDIS_REST_URL**: `https://xxx-xxx.upstash.io`
- **UPSTASH_REDIS_REST_TOKEN**: A long token string

### 3. Add to `.env.local`

Open your `.env.local` file and add:

```env
# Upstash Redis Configuration
UPSTASH_REDIS_URL=https://your-actual-redis-url.upstash.io
UPSTASH_REDIS_TOKEN=your_actual_redis_token_here
```

**Important**: Replace the placeholder values with your actual credentials!

### 4. Restart Development Server

After adding the credentials:

```bash
# Stop the current server (Ctrl+C in terminal)
# Then restart:
npm run dev
```

### 5. Test Redis Connection

Once the server is running, visit:

```
http://localhost:3000/api/test/redis
```

You should see a response like:
```json
{
  "success": true,
  "connection": "✅ Connected",
  "caching": "✅ Working",
  "totalCachedKeys": 2,
  "timestamp": "2025-11-20T00:13:18.000Z"
}
```

If you see this, **Redis is working!** ✅

## 📚 What We've Set Up

### 1. Redis Client (`database/redis.ts`)
Basic Redis client for all operations.

### 2. Rate Limiting (`lib/rate-limit.ts`)
Protects your API from abuse:
- **API Rate Limit**: 10 requests per 10 seconds
- **Auth Rate Limit**: 5 requests per minute (login/signup)
- **Search Rate Limit**: 20 requests per 10 seconds
- **Borrow Rate Limit**: 3 requests per minute

### 3. Caching Utilities (`lib/cache.ts`)
Improves performance:
- **Cache TTL presets**: SHORT (1m), MEDIUM (5m), LONG (15m), etc.
- **Cache keys**: Organized by feature (books, users, analytics, borrow)
- **Helper functions**: `getCache`, `setCache`, `cacheOrFetch`, `invalidateRelatedCaches`

### 4. Test Utilities (`lib/redis-test.ts`)
Development tools to verify Redis is working.

## 🔧 Usage Examples

### Rate Limiting in API Routes

```typescript
import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, apiRateLimit } from "@/lib/rate-limit";

export async function GET(request: NextRequest) {
  // Check rate limit
  const ip = request.headers.get("x-forwarded-for") ?? "127.0.0.1";
  const { success, headers } = await checkRateLimit(ip, apiRateLimit);

  if (!success) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429, headers }
    );
  }

  // Your API logic here
  return NextResponse.json({ data: "success" }, { headers });
}
```

### Caching Data

```typescript
import { cacheOrFetch, CACHE_KEYS, CACHE_TTL } from "@/lib/cache";
import { db } from "@/database/drizzle";

export async function getFeaturedBooks() {
  return cacheOrFetch(
    CACHE_KEYS.BOOKS.FEATURED,
    async () => {
      // Fetch from database
      return await db.query.books.findMany({
        where: eq(books.featured, true),
        limit: 10,
      });
    },
    CACHE_TTL.LONG // Cache for 15 minutes
  );
}
```

### Invalidating Cache After Updates

```typescript
import { invalidateRelatedCaches, CACHE_KEYS } from "@/lib/cache";

export async function updateBook(bookId: string, data: any) {
  // Update in database
  await db.update(books).set(data).where(eq(books.id, bookId));

  // Invalidate related caches
  await invalidateRelatedCaches([
    CACHE_KEYS.BOOKS.ALL,
    CACHE_KEYS.BOOKS.DETAIL(bookId),
    CACHE_KEYS.BOOKS.FEATURED,
  ]);
}
```

## ⚠️ Common Issues

### Issue: "Cannot find module '@upstash/ratelimit'"

**Solution**: Install the package:
```bash
npm install @upstash/ratelimit
```

### Issue: Test endpoint returns 500 error

**Causes**:
1. Wrong credentials in `.env.local`
2. Server not restarted after adding credentials
3. Upstash Redis database not created

**Solution**: Double-check your credentials and restart the server.

### Issue: Rate limiting not working

**Check**:
- Redis credentials are correct
- Rate limit is being checked in your API route
- IP address is being extracted correctly

## 🎯 Next Steps

Now that Redis is configured, you can:

1. ✅ Implement rate limiting on sensitive API routes
2. ✅ Add caching to database queries
3. ✅ Set up analytics caching for dashboard
4. ✅ Cache book listings and search results
5. ✅ Implement DDoS protection

---

**Last Updated**: 2025-11-20
