"use server";

import { db } from "@/database/drizzle";
import { borrowRecords, books, users } from "@/database/schema";
import { eq, sql, desc, gte, lt, and } from "drizzle-orm";
import dayjs from "dayjs";

export async function getDashboardStats() {
  try {
    const now = dayjs();
    const sevenDaysAgo = now.subtract(7, "day").toDate();
    const fourteenDaysAgo = now.subtract(14, "day").toDate();

    // Get total borrowed books (all time)
    const totalBorrowed = await db
      .select({ count: sql<number>`COUNT(*)::int` })
      .from(borrowRecords);

    // Get total users
    const totalUsers = await db
      .select({ count: sql<number>`COUNT(*)::int` })
      .from(users);

    // Get total books
    const totalBooks = await db
      .select({ count: sql<number>`COUNT(*)::int` })
      .from(books);

    // Get recent borrowed books (last 7 days)
    const recentBorrowed = await db
      .select({ count: sql<number>`COUNT(*)::int` })
      .from(borrowRecords)
      .where(gte(borrowRecords.createdAt, sevenDaysAgo));

    // Get previous borrowed books (7-14 days ago)
    const previousBorrowed = await db
      .select({ count: sql<number>`COUNT(*)::int` })
      .from(borrowRecords)
      .where(
        and(
          gte(borrowRecords.createdAt, fourteenDaysAgo),
          lt(borrowRecords.createdAt, sevenDaysAgo)
        )!
      );

    // Get recent users (last 7 days)
    const recentUsers = await db
      .select({ count: sql<number>`COUNT(*)::int` })
      .from(users)
      .where(gte(users.createdAt, sevenDaysAgo));

    // Get previous users (7-14 days ago)
    const previousUsers = await db
      .select({ count: sql<number>`COUNT(*)::int` })
      .from(users)
      .where(
        and(
          gte(users.createdAt, fourteenDaysAgo),
          lt(users.createdAt, sevenDaysAgo)
        )!
      );

    // Get recent books (last 7 days)
    const recentBooks = await db
      .select({ count: sql<number>`COUNT(*)::int` })
      .from(books)
      .where(gte(books.createdAt, sevenDaysAgo));

    // Get previous books (7-14 days ago)
    const previousBooks = await db
      .select({ count: sql<number>`COUNT(*)::int` })
      .from(books)
      .where(
        and(
          gte(books.createdAt, fourteenDaysAgo),
          lt(books.createdAt, sevenDaysAgo)
        )!
      );

    // Get overdue books
    const overdueBooks = await db
      .select({ count: sql<number>`COUNT(*)::int` })
      .from(borrowRecords)
      .where(
        and(
          eq(borrowRecords.status, "BORROWED"),
          lt(borrowRecords.dueDate, sql`CURRENT_DATE`)
        )
      );

    return {
      success: true,
      data: {
        borrowedBooks: {
          total: totalBorrowed[0]?.count || 0,
          change: (recentBorrowed[0]?.count || 0) - (previousBorrowed[0]?.count || 0),
        },
        totalUsers: {
          total: totalUsers[0]?.count || 0,
          change: (recentUsers[0]?.count || 0) - (previousUsers[0]?.count || 0),
        },
        totalBooks: {
          total: totalBooks[0]?.count || 0,
          change: (recentBooks[0]?.count || 0) - (previousBooks[0]?.count || 0),
        },
        overdueBooks: {
          total: overdueBooks[0]?.count || 0,
          change: 0, // No historical tracking for now
        },
      },
    };
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return {
      success: false,
      data: {
        borrowedBooks: { total: 0, change: 0 },
        totalUsers: { total: 0, change: 0 },
        totalBooks: { total: 0, change: 0 },
        overdueBooks: { total: 0, change: 0 },
      },
    };
  }
}

export async function getRecentBorrowRequests(limit: number = 3) {
  try {
    const requests = await db
      .select({
        id: borrowRecords.id,
        borrowDate: borrowRecords.borrowDate,
        dueDate: borrowRecords.dueDate,
        status: borrowRecords.status,
        book: {
          id: books.id,
          title: books.title,
          author: books.author,
          genre: books.genre,
          coverUrl: books.coverUrl,
          coverColor: books.coverColor,
        },
        user: {
          id: users.id,
          fullName: users.fullName,
        },
      })
      .from(borrowRecords)
      .innerJoin(books, eq(borrowRecords.bookId, books.id))
      .innerJoin(users, eq(borrowRecords.userId, users.id))
      .where(eq(borrowRecords.status, "BORROWED"))
      .orderBy(desc(borrowRecords.createdAt))
      .limit(limit);

    return { success: true, data: requests };
  } catch (error) {
    console.error("Error fetching recent borrow requests:", error);
    return { success: false, data: [] };
  }
}

export async function getRecentlyAddedBooks(limit: number = 6) {
  try {
    const recentBooks = await db
      .select()
      .from(books)
      .orderBy(desc(books.createdAt))
      .limit(limit);

    return { success: true, data: recentBooks };
  } catch (error) {
    console.error("Error fetching recently added books:", error);
    return { success: false, data: [] };
  }
}

export async function getRecentAccountRequests(limit: number = 6) {
  try {
    const requests = await db
      .select({
        id: users.id,
        fullName: users.fullName,
        email: users.email,
      })
      .from(users)
      .where(eq(users.status, "PENDING"))
      .orderBy(desc(users.createdAt))
      .limit(limit);

    return { success: true, data: requests };
  } catch (error) {
    console.error("Error fetching recent account requests:", error);
    return { success: false, data: [] };
  }
}

export async function getChartData(period: "7d" | "30d" | "90d") {
  try {
    const now = dayjs();
    let startDate: Date;
    let days: number;

    // Determine date range based on period
    switch (period) {
      case "7d":
        startDate = now.subtract(7, "day").toDate();
        days = 7;
        break;
      case "30d":
        startDate = now.subtract(30, "day").toDate();
        days = 30;
        break;
      case "90d":
        startDate = now.subtract(90, "day").toDate();
        days = 90;
        break;
      default:
        startDate = now.subtract(30, "day").toDate();
        days = 30;
    }

    // Fetch borrowed books data
    const borrowedData = await db
      .select({
        date: sql<string>`DATE(${borrowRecords.createdAt})`,
        count: sql<number>`COUNT(*)::int`,
      })
      .from(borrowRecords)
      .where(gte(borrowRecords.createdAt, startDate))
      .groupBy(sql`DATE(${borrowRecords.createdAt})`)
      .orderBy(sql`DATE(${borrowRecords.createdAt})`);

    // Fetch new users data
    const usersData = await db
      .select({
        date: sql<string>`DATE(${users.createdAt})`,
        count: sql<number>`COUNT(*)::int`,
      })
      .from(users)
      .where(gte(users.createdAt, startDate))
      .groupBy(sql`DATE(${users.createdAt})`)
      .orderBy(sql`DATE(${users.createdAt})`);

    // Fetch new books data
    const booksData = await db
      .select({
        date: sql<string>`DATE(${books.createdAt})`,
        count: sql<number>`COUNT(*)::int`,
      })
      .from(books)
      .where(gte(books.createdAt, startDate))
      .groupBy(sql`DATE(${books.createdAt})`)
      .orderBy(sql`DATE(${books.createdAt})`);

    // Create a map for each data type
    const borrowedMap = new Map(
      borrowedData.map((item) => [item.date, item.count])
    );
    const usersMap = new Map(usersData.map((item) => [item.date, item.count]));
    const booksMap = new Map(booksData.map((item) => [item.date, item.count]));

    // Generate data points for all dates in the range
    const chartData = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = now.subtract(i, "day");
      const dateStr = date.format("YYYY-MM-DD");
      const displayDate = date.format("MMM D");

      chartData.push({
        date: displayDate,
        borrowedBooks: borrowedMap.get(dateStr) || 0,
        newUsers: usersMap.get(dateStr) || 0,
        newBooks: booksMap.get(dateStr) || 0,
      });
    }

    return { success: true, data: chartData };
  } catch (error) {
    console.error("Error fetching chart data:", error);
    return { success: false, data: [] };
  }
}
