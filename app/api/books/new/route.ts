import { NextRequest, NextResponse } from "next/server";
import { db } from "@/database/drizzle";
import { books } from "@/database/schema";
import { desc } from "drizzle-orm";
import dayjs from "dayjs";
import { cacheOrFetch, CACHE_KEYS, CACHE_TTL } from "@/lib/cache";
import { checkRateLimit, searchRateLimit } from "@/lib/rate-limit";

/**
 * GET /api/books/new - Get newly added books
 */
export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.headers.get("x-forwarded-for") ?? "127.0.0.1";
    const { success, headers } = await checkRateLimit(ip, searchRateLimit);

    if (!success) {
      return NextResponse.json(
        { error: "Too many requests" },
        { status: 429, headers }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get("limit") || "10");
    const days = parseInt(searchParams.get("days") || "30"); // New within last 30 days

    // Get new books
    const newBooks = await cacheOrFetch(
      `${CACHE_KEYS.BOOKS.NEW}:${limit}:${days}`,
      async () => {
        const sinceDate = dayjs().subtract(days, "day").toDate();
        
        return await db
          .select()
          .from(books)
          .orderBy(desc(books.createdAt))
          .limit(limit);
      },
      CACHE_TTL.LONG // Cache for 15 minutes
    );

    return NextResponse.json({ books: newBooks }, { headers });
  } catch (error) {
    console.error("Get new books error:", error);
    return NextResponse.json(
      { error: "Failed to fetch new books" },
      { status: 500 }
    );
  }
}
