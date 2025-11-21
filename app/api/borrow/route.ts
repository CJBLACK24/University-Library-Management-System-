import { NextRequest, NextResponse } from "next/server";
import { db } from "@/database/drizzle";
import { borrowRecords, books, users } from "@/database/schema";
import { eq, and, desc } from "drizzle-orm";
import { cacheOrFetch, CACHE_KEYS, CACHE_TTL, deleteCache } from "@/lib/cache";
import { checkRateLimit, apiRateLimit, borrowRateLimit } from "@/lib/rate-limit";
import { sendEmail } from "@/lib/workflow";
import dayjs from "dayjs";

/**
 * GET /api/borrow - Get all borrow records with pagination
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

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const userId = searchParams.get("userId");
    const status = searchParams.get("status");

    const offset = (page - 1) * limit;

    // Build conditions
    const conditions = [];
    if (userId) conditions.push(eq(borrowRecords.userId, userId));
    if (status) conditions.push(eq(borrowRecords.status, status as any));

    const cacheKey = `${CACHE_KEYS.BORROW.RECORDS}:page:${page}:limit:${limit}:user:${userId}:status:${status}`;

    const result = await cacheOrFetch(
      cacheKey,
      async () => {
        const totalCount = await db
          .select({ count: db.$count(borrowRecords) })
          .from(borrowRecords)
          .where(conditions.length > 0 ? and(...conditions) : undefined);

        const records = await db
          .select({
            id: borrowRecords.id,
            borrowDate: borrowRecords.borrowDate,
            dueDate: borrowRecords.dueDate,
            returnDate: borrowRecords.returnDate,
            status: borrowRecords.status,
            user: {
              id: users.id,
              fullName: users.fullName,
              email: users.email,
              universityId: users.universityId,
            },
            book: {
              id: books.id,
              title: books.title,
              author: books.author,
              coverUrl: books.coverUrl,
            },
          })
          .from(borrowRecords)
          .innerJoin(users, eq(borrowRecords.userId, users.id))
          .innerJoin(books, eq(borrowRecords.bookId, books.id))
          .where(conditions.length > 0 ? and(...conditions) : undefined)
          .orderBy(desc(borrowRecords.borrowDate))
          .limit(limit)
          .offset(offset);

        return {
          records,
          pagination: {
            page,
            limit,
            total: totalCount[0]?.count || 0,
            totalPages: Math.ceil((totalCount[0]?.count || 0) / limit),
          },
        };
      },
      CACHE_TTL.MEDIUM
    );

    return NextResponse.json(result, { headers });
  } catch (error) {
    console.error("Get borrow records error:", error);
    return NextResponse.json(
      { error: "Failed to fetch borrow records" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/borrow - Borrow a book
 */
export async function POST(request: NextRequest) {
  try {
    // Stricter rate limiting for borrow action
    const ip = request.headers.get("x-forwarded-for") ?? "127.0.0.1";
    const { success, headers } = await checkRateLimit(ip, borrowRateLimit);

    if (!success) {
      return NextResponse.json(
        { error: "Too many borrow requests. Please try again later." },
        { status: 429, headers }
      );
    }

    const body = await request.json();
    const { userId, bookId, daysToReturn = 14 } = body;

    if (!userId || !bookId) {
      return NextResponse.json(
        { error: "Missing userId or bookId" },
        { status: 400 }
      );
    }

    // Check if book exists and has available copies
    const book = await db
      .select()
      .from(books)
      .where(eq(books.id, bookId))
      .limit(1);

    if (!book[0]) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }

    if (book[0].availableCopies <= 0) {
      return NextResponse.json(
        { error: "No copies available for this book" },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user[0]) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if user already has this book borrowed
    const existingBorrow = await db
      .select()
      .from(borrowRecords)
      .where(
        and(
          eq(borrowRecords.userId, userId),
          eq(borrowRecords.bookId, bookId),
          eq(borrowRecords.status, "BORROWED")
        )
      );

    if (existingBorrow.length > 0) {
      return NextResponse.json(
        { error: "You have already borrowed this book" },
        { status: 400 }
      );
    }

    // Calculate due date
    const dueDate = dayjs().add(daysToReturn, "day").format("YYYY-MM-DD");

    // Create borrow record
    const borrowRecord = await db
      .insert(borrowRecords)
      .values({
        userId,
        bookId,
        dueDate,
        status: "BORROWED",
      })
      .returning();

    // Decrease available copies
    await db
      .update(books)
      .set({ availableCopies: book[0].availableCopies - 1 })
      .where(eq(books.id, bookId));

    // Send confirmation email
    try {
      await sendEmail({
        email: user[0].email,
        subject: "Book Borrowed Successfully",
        message: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #10b981;">Book Borrowed Successfully! 📚</h2>
            <p>Hello ${user[0].fullName},</p>
            <p>You have successfully borrowed:</p>
            <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 5px 0;"><strong>Book:</strong> ${book[0].title}</p>
              <p style="margin: 5px 0;"><strong>Author:</strong> ${book[0].author}</p>
              <p style="margin: 5px 0;"><strong>Borrow Date:</strong> ${dayjs().format("MMMM D, YYYY")}</p>
              <p style="margin: 5px 0;"><strong>Due Date:</strong> ${dayjs(dueDate).format("MMMM D, YYYY")}</p>
            </div>
            <p>Please return the book on or before the due date to avoid Late fees.</p>
            <p>You can download your receipt from your profile page.</p>
            <p>Happy reading!<br/>University Library Team</p>
          </div>
        `,
      });
    } catch (emailError) {
      console.error("Failed to send borrow confirmation email:", emailError);
    }

    // Invalidate caches
    await deleteCache(CACHE_KEYS.BOOKS.DETAIL(bookId));
    await deleteCache(CACHE_KEYS.BOOKS.ALL);
    await deleteCache(CACHE_KEYS.BORROW.RECORDS);
    await deleteCache(CACHE_KEYS.ANALYTICS.DASHBOARD);

    return NextResponse.json(
      { 
        borrow: borrowRecord[0], 
        message: "Book borrowed successfully" 
      },
      { status: 201, headers }
    );
  } catch (error) {
    console.error("Borrow book error:", error);
    return NextResponse.json(
      { error: "Failed to borrow book" },
      { status: 500 }
    );
  }
}
