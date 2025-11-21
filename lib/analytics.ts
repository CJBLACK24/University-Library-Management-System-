import { db } from "@/database/drizzle";
import { books, users, borrowRecords } from "@/database/schema";
import { count, eq, sql, and, gte } from "drizzle-orm";
import dayjs from "dayjs";

/**
 * Analytics utility functions for dashboard statistics
 */

export interface DashboardStats {
  totalUsers: number;
  totalBooks: number;
  totalBorrowedBooks: number;
  pendingRequests: number;
  newUsersThisMonth: number;
  newBooksThisMonth: number;
  borrowsThisMonth: number;
  availableBooks: number;
}

export interface TrendData {
  date: string;
  borrowed: number;
  returned: number;
  newUsers: number;
  newBooks: number;
}

/**
 * Get dashboard statistics
 */
export async function getDashboardStats(): Promise<DashboardStats> {
  const startOfMonth = dayjs().startOf("month").toDate();

  // Run queries in parallel for better performance
  const [
    totalUsersResult,
    totalBooksResult,
    borrowedBooksResult,
    pendingRequestsResult,
    newUsersResult,
    newBooksResult,
    borrowsThisMonthResult,
    availableBooksResult,
  ] = await Promise.all([
    // Total users
    db.select({ count: count() }).from(users),
    
    // Total books
    db.select({ count: count() }).from(books),
    
    // Currently borrowed books
    db
      .select({ count: count() })
      .from(borrowRecords)
      .where(eq(borrowRecords.status, "BORROWED")),
    
    // Pending account requests
    db
      .select({ count: count() })
      .from(users)
      .where(eq(users.status, "PENDING")),
    
    // New users this month
    db
      .select({ count: count() })
      .from(users)
      .where(gte(users.createdAt, startOfMonth)),
    
    // New books this month
    db
      .select({ count: count() })
      .from(books)
      .where(gte(books.createdAt, startOfMonth)),
    
    // Borrows this month
    db
      .select({ count: count() })
      .from(borrowRecords)
      .where(gte(borrowRecords.borrowDate, startOfMonth)),
    
    // Available books (sum of available copies)
    db
      .select({ 
        total: sql<number>`COALESCE(SUM(${books.availableCopies}), 0)` 
      })
      .from(books),
  ]);

  return {
    totalUsers: totalUsersResult[0]?.count || 0,
    totalBooks: totalBooksResult[0]?.count || 0,
    totalBorrowedBooks: borrowedBooksResult[0]?.count || 0,
    pendingRequests: pendingRequestsResult[0]?.count || 0,
    newUsersThisMonth: newUsersResult[0]?.count || 0,
    newBooksThisMonth: newBooksResult[0]?.count || 0,
    borrowsThisMonth: borrowsThisMonthResult[0]?.count || 0,
    availableBooks: Number(availableBooksResult[0]?.total) || 0,
  };
}

/**
 * Get trend data for charts (last 30 days)
 */
export async function getTrendData(days: number = 30): Promise<TrendData[]> {
  const startDate = dayjs().subtract(days, "day").startOf("day").toDate();
  
  // Get borrow trends
  const borrowTrends = await db
    .select({
      date: sql<string>`DATE(${borrowRecords.borrowDate})`,
      borrowed: count(),
    })
    .from(borrowRecords)
    .where(gte(borrowRecords.borrowDate, startDate))
    .groupBy(sql`DATE(${borrowRecords.borrowDate})`)
    .orderBy(sql`DATE(${borrowRecords.borrowDate})`);

  // Get return trends
  const returnTrends = await db
    .select({
      date: sql<string>`DATE(${borrowRecords.returnDate})`,
      returned: count(),
    })
    .from(borrowRecords)
    .where(
      and(
        eq(borrowRecords.status, "RETURNED"),
        gte(borrowRecords.returnDate, startDate)
      )
    )
    .groupBy(sql`DATE(${borrowRecords.returnDate})`)
    .orderBy(sql`DATE(${borrowRecords.returnDate})`);

  // Get new users trend
  const userTrends = await db
    .select({
      date: sql<string>`DATE(${users.createdAt})`,
      newUsers: count(),
    })
    .from(users)
    .where(gte(users.createdAt, startDate))
    .groupBy(sql`DATE(${users.createdAt})`)
    .orderBy(sql`DATE(${users.createdAt})`);

  // Get new books trend
  const bookTrends = await db
    .select({
      date: sql<string>`DATE(${books.createdAt})`,
      newBooks: count(),
    })
    .from(books)
    .where(gte(books.createdAt, startDate))
    .groupBy(sql`DATE(${books.createdAt})`)
    .orderBy(sql`DATE(${books.createdAt})`);

  // Merge all trends by date
  const trendMap = new Map<string, TrendData>();
  
  // Initialize all dates with zeros
  for (let i = 0; i < days; i++) {
    const date = dayjs().subtract(i, "day").format("YYYY-MM-DD");
    trendMap.set(date, {
      date,
      borrowed: 0,
      returned: 0,
      newUsers: 0,
      newBooks: 0,
    });
  }

  // Populate with actual data
  borrowTrends.forEach((item) => {
    const existing = trendMap.get(item.date) || trendMap.values().next().value;
    existing.borrowed = item.borrowed;
  });

  returnTrends.forEach((item) => {
    const existing = trendMap.get(item.date) || trendMap.values().next().value;
    existing.returned = item.returned;
  });

  userTrends.forEach((item) => {
    const existing = trendMap.get(item.date) || trendMap.values().next().value;
    existing.newUsers = item.newUsers;
  });

  bookTrends.forEach((item) => {
    const existing = trendMap.get(item.date) || trendMap.values().next().value;
    existing.newBooks = item.newBooks;
  });

  // Convert to array and sort by date
  return Array.from(trendMap.values()).sort((a, b) => 
    a.date.localeCompare(b.date)
  );
}

/**
 * Get top borrowed books
 */
export async function getTopBorrowedBooks(limit: number = 5) {
  const result = await db
    .select({
      bookId: borrowRecords.bookId,
      title: books.title,
      author: books.author,
      coverUrl: books.coverUrl,
      borrowCount: count(),
    })
    .from(borrowRecords)
    .innerJoin(books, eq(borrowRecords.bookId, books.id))
    .groupBy(borrowRecords.bookId, books.title, books.author, books.coverUrl)
    .orderBy(sql`COUNT(*) DESC`)
    .limit(limit);

  return result;
}

/**
 * Get recent activities
 */
export async function getRecentActivities(limit: number = 10) {
  const recentBorrows = await db
    .select({
      id: borrowRecords.id,
      type: sql<string>`'BORROW'`,
      userName: users.fullName,
      bookTitle: books.title,
      date: borrowRecords.borrowDate,
      status: borrowRecords.status,
    })
    .from(borrowRecords)
    .innerJoin(users, eq(borrowRecords.userId, users.id))
    .innerJoin(books, eq(borrowRecords.bookId, books.id))
    .orderBy(sql`${borrowRecords.borrowDate} DESC`)
    .limit(limit);

  return recentBorrows;
}
