import { NextRequest, NextResponse } from "next/server";
import { db } from "@/database/drizzle";
import { borrowRecords, books, users } from "@/database/schema";
import { eq } from "drizzle-orm";
import { checkRateLimit, apiRateLimit } from "@/lib/rate-limit";
import { sendEmail } from "@/lib/workflow";
import { deleteCache, CACHE_KEYS } from "@/lib/cache";
import dayjs from "dayjs";

/**
 * PATCH /api/borrow/[id]/return - Return a borrowed book
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

    // Get borrow record with user and book info
    const borrowRecord = await db
      .select({
        borrow: borrowRecords,
        user: users,
        book: books,
      })
      .from(borrowRecords)
      .innerJoin(users, eq(borrowRecords.userId, users.id))
      .innerJoin(books, eq(borrowRecords.bookId, books.id))
      .where(eq(borrowRecords.id, id))
      .limit(1);

    if (!borrowRecord[0]) {
      return NextResponse.json(
        { error: "Borrow record not found" },
        { status: 404 }
      );
    }

    if (borrowRecord[0].borrow.status === "RETURNED") {
      return NextResponse.json(
        { error: "Book already returned" },
        { status: 400 }
      );
    }

    // Update borrow record
    const returnDate = new Date().toISOString().split("T")[0];
    const updatedRecord = await db
      .update(borrowRecords)
      .set({
        status: "RETURNED",
        returnDate,
      })
      .where(eq(borrowRecords.id, id))
      .returning();

    // Increase available copies
    await db
      .update(books)
      .set({
        availableCopies: borrowRecord[0].book.availableCopies + 1,
      })
      .where(eq(books.id, borrowRecord[0].borrow.bookId));

    // Check if returned late
    const isLate = dayjs(returnDate).isAfter(
      dayjs(borrowRecord[0].borrow.dueDate)
    );
    const daysLate = isLate
      ? dayjs(returnDate).diff(dayjs(borrowRecord[0].borrow.dueDate), "day")
      : 0;

    // Send return confirmation email
    try {
      await sendEmail({
        email: borrowRecord[0].user.email,
        subject: "Book Returned Successfully",
        message: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #10b981;">Book Returned Successfully! ✅</h2>
            <p>Hello ${borrowRecord[0].user.fullName},</p>
            <p>Thank you for returning:</p>
            <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 5px 0;"><strong>Book:</strong> ${borrowRecord[0].book.title}</p>
              <p style="margin: 5px 0;"><strong>Author:</strong> ${borrowRecord[0].book.author}</p>
              <p style="margin: 5px 0;"><strong>Borrowed:</strong> ${dayjs(borrowRecord[0].borrow.borrowDate).format("MMMM D, YYYY")}</p>
              <p style="margin: 5px 0;"><strong>Due Date:</strong> ${dayjs(borrowRecord[0].borrow.dueDate).format("MMMM D, YYYY")}</p>
              <p style="margin: 5px 0;"><strong>Returned:</strong> ${dayjs(returnDate).format("MMMM D, YYYY")}</p>
            </div>
            ${
              isLate
                ? `<p style="color: #ef4444;"><strong>Note:</strong> This book was returned ${daysLate} day(s) late. Late fees may apply.</p>`
                : `<p style="color: #10b981;">Book returned on time. Thank you!</p>`
            }
            <p>We hope you enjoyed the book!</p>
            <p>Best regards,<br/>University Library Team</p>
          </div>
        `,
      });
    } catch (emailError) {
      console.error("Failed to send return confirmation email:", emailError);
    }

    // Invalidate caches
    await deleteCache(CACHE_KEYS.BOOKS.DETAIL(borrowRecord[0].borrow.bookId));
    await deleteCache(CACHE_KEYS.BOOKS.ALL);
    await deleteCache(CACHE_KEYS.BORROW.RECORDS);
    await deleteCache(CACHE_KEYS.ANALYTICS.DASHBOARD);

    return NextResponse.json(
      {
        record: updatedRecord[0],
        isLate,
        daysLate,
        message: "Book returned successfully",
      },
      { headers }
    );
  } catch (error) {
    console.error("Return book error:", error);
    return NextResponse.json(
      { error: "Failed to return book" },
      { status: 500 }
    );
  }
}
