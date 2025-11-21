"use server";

import { db } from "@/database/drizzle";
import { borrowRecords, books, users } from "@/database/schema";
import { eq, desc, asc, or, ilike, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import dayjs from "dayjs";

export async function updateBorrowStatus(
  borrowId: string,
  status: "BORROWED" | "RETURNED"
) {
  try {
    const updateData: any = { status };
    
    // If marking as returned, set return date
    if (status === "RETURNED") {
      updateData.returnDate = dayjs().format("YYYY-MM-DD");
    }

    await db
      .update(borrowRecords)
      .set(updateData)
      .where(eq(borrowRecords.id, borrowId));
    
    revalidatePath("/admin/book-requests");
    return { success: true };
  } catch (error) {
    console.error("Error updating borrow status:", error);
    return { success: false, error: "Failed to update borrow status" };
  }
}

export async function getBorrowRequests(
  search?: string,
  sortOrder: "asc" | "desc" = "asc"
) {
  try {
    let query = db
      .select({
        id: borrowRecords.id,
        borrowDate: borrowRecords.borrowDate,
        dueDate: borrowRecords.dueDate,
        returnDate: borrowRecords.returnDate,
        status: borrowRecords.status,
        createdAt: borrowRecords.createdAt,
        book: {
          id: books.id,
          title: books.title,
          coverUrl: books.coverUrl,
          coverColor: books.coverColor,
        },
        user: {
          id: users.id,
          fullName: users.fullName,
          email: users.email,
        },
      })
      .from(borrowRecords)
      .innerJoin(books, eq(borrowRecords.bookId, books.id))
      .innerJoin(users, eq(borrowRecords.userId, users.id));

    if (search) {
      query = query.where(
        or(
          ilike(books.title, `%${search}%`),
          ilike(books.author, `%${search}%`),
          ilike(books.genre, `%${search}%`),
          ilike(users.fullName, `%${search}%`),
          ilike(users.email, `%${search}%`)
        )!
      );
    }

    query = sortOrder === "asc"
      ? query.orderBy(asc(borrowRecords.createdAt))
      : query.orderBy(desc(borrowRecords.createdAt));

    const result = await query;
    
    // Calculate status (BORROWED, RETURNED, or Late Return)
    const processedResult = result.map((record) => {
      let displayStatus = record.status;
      const today = dayjs();
      const dueDate = dayjs(record.dueDate);

      // If borrowed and past due date, mark as "Late Return"
      if (
        record.status === "BORROWED" &&
        !record.returnDate &&
        dueDate.isBefore(today, "day")
      ) {
        displayStatus = "LATE_RETURN" as any;
      }

      return {
        ...record,
        displayStatus,
      };
    });

    return { success: true, data: processedResult };
  } catch (error) {
    console.error("Error fetching borrow requests:", error);
    return { success: false, error: "Failed to fetch borrow requests", data: [] };
  }
}

