import { NextRequest, NextResponse } from "next/server";
import { db } from "@/database/drizzle";
import { books } from "@/database/schema";
import { like, or, eq, desc, gte, lte, and, SQL } from "drizzle-orm";
import { cacheOrFetch, CACHE_KEYS, CACHE_TTL, deleteCache } from "@/lib/cache";
import { checkRateLimit, apiRateLimit } from "@/lib/rate-limit";

/**
 * GET /api/books - Get all books with pagination, search, and filters
 */
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
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const search = searchParams.get("search") || "";
    const genre = searchParams.get("genre") || "";
    const author = searchParams.get("author") || "";
    const minRating = searchParams.get("minRating");
    const onlyAvailable = searchParams.get("available") === "true";

    // Calculate offset
    const offset = (page - 1) * limit;

    // Build where conditions
    const conditions: SQL[] = [];
    
    if (search) {
      const searchCondition = or(
        like(books.title, `%${search}%`),
        like(books.author, `%${search}%`),
        like(books.description, `%${search}%`)
      );
      if (searchCondition) {
        conditions.push(searchCondition);
      }
    }

    if (genre) {
      conditions.push(like(books.genre, `%${genre}%`));
    }

    if (author) {
      conditions.push(like(books.author, `%${author}%`));
    }

    if (minRating) {
      conditions.push(gte(books.rating, parseInt(minRating)));
    }

    if (onlyAvailable) {
      conditions.push(gte(books.availableCopies, 1));
    }

    // Cache key
    const cacheKey = `${CACHE_KEYS.BOOKS.ALL}:page:${page}:limit:${limit}:search:${search}:genre:${genre}:author:${author}:rating:${minRating}:available:${onlyAvailable}`;

    const result = await cacheOrFetch(
      cacheKey,
      async () => {
        // Get total count
        const totalCount = await db
          .select({ count: db.$count(books) })
          .from(books)
          .where(conditions.length > 0 ? and(...conditions) : undefined);

        // Get books
        const booksList = await db
          .select()
          .from(books)
          .where(conditions.length > 0 ? and(...conditions) : undefined)
          .orderBy(desc(books.createdAt))
          .limit(limit)
          .offset(offset);

        return {
          books: booksList,
          pagination: {
            page,
            limit,
            total: totalCount[0]?.count || 0,
            totalPages: Math.ceil((totalCount[0]?.count || 0) / limit),
          },
        };
      },
      CACHE_TTL.LONG
    );

    return NextResponse.json(result, { headers });
  } catch (error) {
    console.error("Get books error:", error);
    return NextResponse.json(
      { error: "Failed to fetch books" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/books - Create a new book
 */
export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const {
      title,
      author,
      genre,
      rating,
      coverUrl,
      coverColor,
      description,
      totalCopies,
      availableCopies,
      videoUrl,
      summary,
    } = body;

    // Validate required fields
    if (!title || !author || !genre || !coverUrl || !description) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create book
    const newBook = await db
      .insert(books)
      .values({
        title,
        author,
        genre,
        rating: rating || 0,
        coverUrl,
        coverColor: coverColor || "#000000",
        description,
        totalCopies: totalCopies || 1,
        availableCopies: availableCopies ?? totalCopies ?? 1,
        videoUrl: videoUrl || "",
        summary: summary || description.substring(0, 200),
      })
      .returning();

    // Invalidate caches
    await deleteCache(CACHE_KEYS.BOOKS.ALL);
    await deleteCache(CACHE_KEYS.BOOKS.FEATURED);
    await deleteCache(CACHE_KEYS.BOOKS.NEW);
    await deleteCache(CACHE_KEYS.ANALYTICS.DASHBOARD);

    return NextResponse.json(
      { book: newBook[0], message: "Book created successfully" },
      { status: 201, headers }
    );
  } catch (error) {
    console.error("Create book error:", error);
    return NextResponse.json(
      { error: "Failed to create book" },
      { status: 500 }
    );
  }
}
