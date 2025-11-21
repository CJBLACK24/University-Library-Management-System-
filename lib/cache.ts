import redis from "@/database/redis";

/**
 * Caching utilities for the application
 * Improves performance and reduces database load
 */

export const CACHE_TTL = {
  SHORT: 60, // 1 minute
  MEDIUM: 300, // 5 minutes
  LONG: 900, // 15 minutes
  VERY_LONG: 3600, // 1 hour
  DAY: 86400, // 24 hours
} as const;

export const CACHE_KEYS = {
  BOOKS: {
    ALL: "books:all",
    DETAIL: (id: string) => `books:detail:${id}`,
    FEATURED: "books:featured",
    NEW: "books:new",
    AVAILABLE: "books:available",
  },
  USERS: {
    ALL: "users:all",
    DETAIL: (id: string) => `users:detail:${id}`,
    PROFILE: (id: string) => `users:profile:${id}`,
  },
  ANALYTICS: {
    DASHBOARD: "analytics:dashboard",
    TRENDS: "analytics:trends",
    STATS: "analytics:stats",
  },
  BORROW: {
    RECORDS: "borrow:records",
    USER_HISTORY: (userId: string) => `borrow:user:${userId}`,
    BOOK_HISTORY: (bookId: string) => `borrow:book:${bookId}`,
  },
} as const;

/**
 * Get cached data
 */
export async function getCache<T>(key: string): Promise<T | null> {
  try {
    const cached = await redis.get(key);
    if (!cached) return null;
    
    return (typeof cached === "string" ? JSON.parse(cached) : cached) as T;
  } catch (error) {
    console.error(`Cache get error for key ${key}:`, error);
    return null;
  }
}

/**
 * Set cache with TTL
 */
export async function setCache<T>(
  key: string,
  data: T,
  ttl: number = CACHE_TTL.MEDIUM
): Promise<boolean> {
  try {
    await redis.set(key, JSON.stringify(data), { ex: ttl });
    return true;
  } catch (error) {
    console.error(`Cache set error for key ${key}:`, error);
    return false;
  }
}

/**
 * Delete cache by key
 */
export async function deleteCache(key: string): Promise<boolean> {
  try {
    await redis.del(key);
    return true;
  } catch (error) {
    console.error(`Cache delete error for key ${key}:`, error);
    return false;
  }
}

/**
 * Delete cache by pattern
 */
export async function deleteCachePattern(pattern: string): Promise<number> {
  try {
    const keys = await redis.keys(pattern);
    if (keys.length === 0) return 0;
    
    await redis.del(...keys);
    return keys.length;
  } catch (error) {
    console.error(`Cache pattern delete error for pattern ${pattern}:`, error);
    return 0;
  }
}

/**
 * Cache or fetch data
 * If data exists in cache, return it. Otherwise, fetch and cache it.
 */
export async function cacheOrFetch<T>(
  key: string,
  fetchFn: () => Promise<T>,
  ttl: number = CACHE_TTL.MEDIUM
): Promise<T> {
  // Try to get from cache first
  const cached = await getCache<T>(key);
  if (cached !== null) {
    console.log(`✅ Cache hit: ${key}`);
    return cached;
  }

  // If not in cache, fetch the data
  console.log(`❌ Cache miss: ${key} - fetching...`);
  const data = await fetchFn();
  
  // Store in cache
  await setCache(key, data, ttl);
  
  return data;
}

/**
 * Invalidate related caches
 * Useful when data is updated
 */
export async function invalidateRelatedCaches(patterns: string[]): Promise<void> {
  try {
    for (const pattern of patterns) {
      await deleteCachePattern(pattern);
    }
    console.log(`🗑️ Invalidated caches for patterns:`, patterns);
  } catch (error) {
    console.error("Cache invalidation error:", error);
  }
}
