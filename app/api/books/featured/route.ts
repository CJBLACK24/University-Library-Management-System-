import { NextRequest, NextResponse } from "next/server";
import { db } from "@/database/drizzle";
import { books } from "@/database/schema";
import { desc, gte } from "drizzle-orm";
import { cacheOrFetch, CACHE_KEYS, CACHE_TTL } from "@/lib/cache";
import { checkRateLimit, searchRateLimit } from "@/lib/rate-limit";

/**
 * GET /api/books/featured - Get featured books
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

    // Get featured books (high rating + available copies)
    const featuredBooks = await cacheOrFetch(
      `${CACHE_KEYS.BOOKS.FEATURED}:${limit}`,
      async () => {
        return await db
          .select()
          .from(books)
          .where(gte(books.rating, 4)) // Rating 4 or higher
          .orderBy(desc(books.rating))
          .limit(limit);
      },
      CACHE_TTL.VERY_LONG // Cache for 1 hour
    );

    return NextResponse.json({ books: featuredBooks }, { headers });
  } catch (error) {
    console.error("Get featured books error:", error);
    return NextResponse.json(
      { error: "Failed to fetch featured books" },
      { status: 500 }
    );
  }
}
