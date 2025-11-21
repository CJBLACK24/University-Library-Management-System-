import { NextResponse } from "next/server";
import { getDashboardStats } from "@/lib/analytics";
import { cacheOrFetch, CACHE_KEYS, CACHE_TTL } from "@/lib/cache";
import { checkRateLimit, apiRateLimit } from "@/lib/rate-limit";

export async function GET(request: Request) {
  try {
    // Rate limiting
    const ip = request.headers.get("x-forwarded-for") ?? "127.0.0.1";
    const { success, headers } = await checkRateLimit(ip, apiRateLimit);

    if (!success) {
      return NextResponse.json(
        { error: "Too many requests" },
        { status: 429, headers }
      );
    }

    // Get stats with caching
    const stats = await cacheOrFetch(
      CACHE_KEYS.ANALYTICS.DASHBOARD,
      getDashboardStats,
      CACHE_TTL.LONG // Cache for 15 minutes
    );

    return NextResponse.json(stats, { headers });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard statistics" },
      { status: 500 }
    );
  }
}
