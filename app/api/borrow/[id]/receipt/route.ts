import { NextRequest, NextResponse } from "next/server";
import { db } from "@/database/drizzle";
import { borrowRecords, books, users } from "@/database/schema";
import { eq } from "drizzle-orm";
import { checkRateLimit, apiRateLimit } from "@/lib/rate-limit";
import { generateBorrowReceipt } from "@/lib/pdf-generator";

/**
 * GET /api/borrow/[id]/receipt - Download borrow receipt as PDF
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Rate limiting
    const ip = request.headers.get("x-forwarded-for") ?? "127.0.0.1";
    const { success } = await checkRateLimit(ip, apiRateLimit);

    if (!success) {
      return NextResponse.json(
        { error: "Too many requests" },
        { status: 429 }
      );
    }

    // Get borrow record with user and book details
    const record = await db
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

    if (!record[0]) {
      return NextResponse.json(
        { error: "Borrow record not found" },
        { status: 404 }
      );
    }

    // Generate PDF receipt
    const pdfBuffer = await generateBorrowReceipt({
      borrowId: record[0].borrow.id,
      userName: record[0].user.fullName,
      userEmail: record[0].user.email,
      universityId: record[0].user.universityId,
      bookTitle: record[0].book.title,
      bookAuthor: record[0].book.author,
      borrowDate: record[0].borrow.borrowDate,
      dueDate: record[0].borrow.dueDate,
      status: record[0].borrow.status,
    });

    // Return PDF as downloadable file
    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="borrow-receipt-${id.substring(0, 8)}.pdf"`,
      },
    });
  } catch (error) {
    console.error("Generate receipt error:", error);
    return NextResponse.json(
      { error: "Failed to generate receipt" },
      { status: 500 }
    );
  }
}
