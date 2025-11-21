"use server";

import { db } from "@/database/drizzle";
import { books, borrowRecords, users } from "@/database/schema";
import { eq } from "drizzle-orm";
import dayjs from "dayjs";
import { sendBookBorrowedEmail, sendBookReceiptEmail } from "@/lib/email-service";
import { generateReceiptPDF, ReceiptData } from "@/lib/pdf-receipt";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { workflowClient } from "@/lib/workflow";
import config from "@/lib/config";

export const borrowBook = async (params: BorrowBookParams) => {
  const { userId, bookId } = params;

  try {
    // Get book and user details
    const [book] = await db
      .select()
      .from(books)
      .where(eq(books.id, bookId))
      .limit(1);

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!book || !user) {
      return {
        success: false,
        error: "Book or user not found",
      };
    }

    // Testing: if unavailable, pretend we have at least 1 copy
    const currentAvailable =
      book.availableCopies <= 0 ? 1 : book.availableCopies;

    const borrowDate = dayjs().toDate();
    const dueDate = dayjs().add(7, "day").toDate();

    const record = await db.insert(borrowRecords).values({
      userId,
      bookId,
      dueDate: dueDate.toISOString().split("T")[0],
      status: "BORROWED",
    }).returning();

    await db
      .update(books)
      .set({ availableCopies: Math.max(currentAvailable - 1, 0) })
      .where(eq(books.id, bookId));

    const borrowRecord = record[0];

    // Format dates for emails
    const borrowDateFormatted = dayjs(borrowDate).format("MMMM D, YYYY");
    const dueDateFormatted = dayjs(dueDate).format("MMMM D, YYYY");
    const duration = 7;

    // Send book borrowed confirmation email (fire and forget)
    sendBookBorrowedEmail(
      user.email,
      user.fullName,
      book.title,
      borrowDateFormatted,
      dueDateFormatted
    ).catch((err) => console.error("Failed to send borrow email:", err));

    // Generate PDF receipt
    const receiptId = borrowRecord.id.substring(0, 8).toUpperCase();
    const receiptData: ReceiptData = {
      receiptId,
      studentName: user.fullName,
      studentEmail: user.email,
      bookTitle: book.title,
      bookAuthor: book.author,
      bookGenre: book.genre,
      borrowDate: borrowDateFormatted,
      dueDate: dueDateFormatted,
      duration,
      dateIssued: dayjs().format("DD/MM/YYYY"),
    };

    // Generate PDF and save it
    try {
      const pdfBuffer = await generateReceiptPDF(receiptData);
      
      if (pdfBuffer) {
        // Save PDF to public/receipts directory
        const receiptsDir = join(process.cwd(), "public", "receipts");
        await mkdir(receiptsDir, { recursive: true });
        const pdfPath = join(receiptsDir, `${receiptId}.pdf`);
        await writeFile(pdfPath, pdfBuffer);

        // Send receipt email with download link
        const receiptUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/receipts/${receiptId}`;
        sendBookReceiptEmail(
          user.email,
          user.fullName,
          book.title,
          borrowDateFormatted,
          dueDateFormatted,
          receiptUrl
        ).catch((err) => console.error("Failed to send receipt email:", err));
      }
    } catch (pdfError) {
      console.error("Failed to generate PDF receipt:", pdfError);
      // Continue even if PDF generation fails
    }

    // Trigger borrow reminder workflow (fire and forget)
    try {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      await workflowClient.trigger({
        url: `${baseUrl}/api/workflows/borrow-reminder`,
        body: {
          borrowRecordId: borrowRecord.id,
          userId,
          bookId,
          dueDate: dueDate.toISOString().split("T")[0],
        },
      });
    } catch (workflowError) {
      console.error("Failed to trigger borrow reminder workflow:", workflowError);
      // Continue even if workflow trigger fails
    }

    return {
      success: true,
      data: JSON.parse(JSON.stringify(borrowRecord)),
      receiptId,
    };
  } catch (error) {
    console.log(error);

    return {
      success: false,
      error: "An error occurred while borrowing the book",
    };
  }
};
