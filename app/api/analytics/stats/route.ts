import { NextRequest, NextResponse } from "next/server";
import { getTopBorrowedBooks, getRecentActivities } from "@/lib/analytics";
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

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get("type") || "all";

    let data: any = {};

    if (type === "all" || type === "top-books") {
      const topBooks = await cacheOrFetch(
        `${CACHE_KEYS.ANALYTICS.STATS}:top-books`,
        () => getTopBorrowedBooks(5),
        CACHE_TTL.MEDIUM
      );
      data.topBooks = topBooks;
    }

    if (type === "all" || type === "recent-activities") {
      const recentActivities = await cacheOrFetch(
        `${CACHE_KEYS.ANALYTICS.STATS}:recent-activities`,
        () => getRecentActivities(10),
        CACHE_TTL.SHORT // Shorter cache for activities
      );
      data.recentActivities = recentActivities;
    }

    return NextResponse.json(data, { headers });
  } catch (error) {
    console.error("Stats error:", error);
    return NextResponse.json(
      { error: "Failed to fetch statistics" },
      { status: 500 }
    );
  }
}
