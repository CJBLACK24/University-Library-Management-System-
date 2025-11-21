import { NextRequest, NextResponse } from "next/server";
import { getTrendData } from "@/lib/analytics";
import { cacheOrFetch, CACHE_KEYS, CACHE_TTL } from "@/lib/cache";
import { checkRateLimit, apiRateLimit } from "@/lib/rate-limit";

export async function GET(request: NextRequest) {
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

    // Get days parameter from query
    const searchParams = request.nextUrl.searchParams;
    const days = parseInt(searchParams.get("days") || "30");

    // Validate days parameter
    if (days < 1 || days > 365) {
      return NextResponse.json(
        { error: "Days parameter must be between 1 and 365" },
        { status: 400 }
      );
    }

    // Get trends with caching
    const trends = await cacheOrFetch(
      `${CACHE_KEYS.ANALYTICS.TRENDS}:${days}`,
      () => getTrendData(days),
      CACHE_TTL.LONG // Cache for 15 minutes
    );

    return NextResponse.json(trends, { headers });
  } catch (error) {
    console.error("Trends data error:", error);
    return NextResponse.json(
      { error: "Failed to fetch trends data" },
      { status: 500 }
    );
  }
}
