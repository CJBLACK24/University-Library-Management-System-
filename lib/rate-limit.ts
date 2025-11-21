import { Ratelimit } from "@upstash/ratelimit";
import redis from "@/database/redis";

/**
 * Rate limiting for API routes
 * Prevents DDoS attacks and abuse
 */

// General API rate limit: 10 requests per 10 seconds
export const apiRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "10 s"),
  analytics: true,
  prefix: "ratelimit:api",
});

// Strict rate limit for sensitive operations (login, signup): 5 requests per 1 minute
export const authRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "1 m"),
  analytics: true,
  prefix: "ratelimit:auth",
});

// Book search rate limit: 20 requests per 10 seconds
export const searchRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(20, "10 s"),
  analytics: true,
  prefix: "ratelimit:search",
});

// Borrow book rate limit: 3 requests per 1 minute
export const borrowRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(3, "1 m"),
  analytics: true,
  prefix: "ratelimit:borrow",
});

/**
 * Helper function to check rate limit and return appropriate response
 */
export async function checkRateLimit(
  identifier: string,
  rateLimit: Ratelimit = apiRateLimit
) {
  const { success, limit, remaining, reset } = await rateLimit.limit(identifier);

  return {
    success,
    limit,
    remaining,
    reset,
    headers: {
      "X-RateLimit-Limit": limit.toString(),
      "X-RateLimit-Remaining": remaining.toString(),
      "X-RateLimit-Reset": reset.toString(),
    },
  };
}
