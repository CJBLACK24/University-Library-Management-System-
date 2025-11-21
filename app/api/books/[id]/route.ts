import { NextRequest, NextResponse } from "next/server";
import { db } from "@/database/drizzle";
import { books } from "@/database/schema";
import { eq } from "drizzle-orm";
import { getCache, setCache, deleteCache, CACHE_KEYS, CACHE_TTL } from "@/lib/cache";
import { checkRateLimit, apiRateLimit } from "@/lib/rate-limit";

/**
 * GET /api/books/[id] - Get book by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Rate limiting
    const ip = request.headers.get("x-forwarded-for") ?? "127.0.0.1";
    const { success, headers } = await checkRateLimit(ip, apiRateLimit);

    if (!success) {
      return NextResponse.json(
        { error: "Too many requests" },
        { status: 429, headers }
      );
    }

    // Try cache first
    const cached = await getCache(CACHE_KEYS.BOOKS.DETAIL(id));
    if (cached) {
      return NextResponse.json(cached, { headers });
    }

    // Get book from database
    const book = await db
      .select()
      .from(books)
      .where(eq(books.id, id))
      .limit(1);

    if (!book[0]) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }

    // Cache the result
    await setCache(CACHE_KEYS.BOOKS.DETAIL(id), book[0], CACHE_TTL.LONG);

    return NextResponse.json(book[0], { headers });
  } catch (error) {
    console.error("Get book error:", error);
    return NextResponse.json(
      { error: "Failed to fetch book" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/books/[id] - Update book
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

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
    
    // Filter out undefined values
    const updateData: any = {};
    const allowedFields = [
      "title", "author", "genre", "rating", "coverUrl", "coverColor",
      "description", "totalCopies", "availableCopies", "videoUrl", "summary"
    ];

    allowedFields.forEach(field => {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    });

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No fields to update" },
        { status: 400 }
      );
    }

    // Update book
    const updatedBook = await db
      .update(books)
      .set(updateData)
      .where(eq(books.id, id))
      .returning();

    if (!updatedBook[0]) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }

    // Invalidate caches
    await deleteCache(CACHE_KEYS.BOOKS.DETAIL(id));
    await deleteCache(CACHE_KEYS.BOOKS.ALL);
    await deleteCache(CACHE_KEYS.BOOKS.FEATURED);
    await deleteCache(CACHE_KEYS.BOOKS.NEW);

    return NextResponse.json(
      { book: updatedBook[0], message: "Book updated successfully" },
      { headers }
    );
  } catch (error) {
    console.error("Update book error:", error);
    return NextResponse.json(
      { error: "Failed to update book" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/books/[id] - Delete book
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Rate limiting
    const ip = request.headers.get("x-forwarded-for") ?? "127.0.0.1";
    const { success, headers } = await checkRateLimit(ip, apiRateLimit);

    if (!success) {
      return NextResponse.json(
        { error: "Too many requests" },
        { status: 429, headers }
      );
    }

    // Delete book
    const deletedBook = await db
      .delete(books)
      .where(eq(books.id, id))
      .returning();

    if (!deletedBook[0]) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }

    // Invalidate caches
    await deleteCache(CACHE_KEYS.BOOKS.DETAIL(id));
    await deleteCache(CACHE_KEYS.BOOKS.ALL);
    await deleteCache(CACHE_KEYS.BOOKS.FEATURED);
    await deleteCache(CACHE_KEYS.BOOKS.NEW);
    await deleteCache(CACHE_KEYS.ANALYTICS.DASHBOARD);

    return NextResponse.json(
      { message: "Book deleted successfully" },
      { headers }
    );
  } catch (error) {
    console.error("Delete book error:", error);
    return NextResponse.json(
      { error: "Failed to delete book" },
      { status: 500 }
    );
  }
}
