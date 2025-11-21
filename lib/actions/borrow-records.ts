"use server";

import { db } from "@/database/drizzle";
import { borrowRecords, books, users } from "@/database/schema";
import { eq, or, ilike, sql, desc, asc, and } from "drizzle-orm";

const ITEMS_PER_PAGE = 20;

export async function getBorrowRecords(
  search?: string,
  status?: string,
  sortBy: "date" | "dueDate" = "date",
  sortOrder: "asc" | "desc" = "desc",
  page: number = 1
) {
  try {
    const offset = (page - 1) * ITEMS_PER_PAGE;

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
          author: books.author,
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

    const conditions: any[] = [];

    // Apply search filter
    if (search) {
      conditions.push(
        or(
          ilike(books.title, `%${search}%`),
          ilike(books.author, `%${search}%`),
          ilike(users.fullName, `%${search}%`),
          ilike(users.email, `%${search}%`)
        )!
      );
    }

    // Apply status filter
    if (status) {
      conditions.push(eq(borrowRecords.status, status as any));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions)!);
    }

    // Apply sorting
    if (sortBy === "date") {
      query = sortOrder === "asc"
        ? query.orderBy(asc(borrowRecords.borrowDate))
        : query.orderBy(desc(borrowRecords.borrowDate));
    } else if (sortBy === "dueDate") {
      query = sortOrder === "asc"
        ? query.orderBy(asc(borrowRecords.dueDate))
        : query.orderBy(desc(borrowRecords.dueDate));
    }

    // Get total count
    const countQuery = db
      .select({ count: sql<number>`COUNT(*)::int` })
      .from(borrowRecords)
      .innerJoin(books, eq(borrowRecords.bookId, books.id))
      .innerJoin(users, eq(borrowRecords.userId, users.id));

    if (conditions.length > 0) {
      countQuery.where(and(...conditions)!);
    }

    const [totalResult] = await countQuery;
    const total = totalResult?.count || 0;
    const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

    // Apply pagination
    const result = await query.limit(ITEMS_PER_PAGE).offset(offset);

    return {
      success: true,
      data: result,
      total,
      totalPages,
      currentPage: page,
    };
  } catch (error) {
    console.error("Error fetching borrow records:", error);
    return {
      success: false,
      error: "Failed to fetch borrow records",
      data: [],
      total: 0,
      totalPages: 0,
      currentPage: 1,
    };
  }
}

