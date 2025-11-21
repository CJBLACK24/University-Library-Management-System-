import React from "react";
import {
  getDashboardStats,
  getRecentBorrowRequests,
  getRecentlyAddedBooks,
  getRecentAccountRequests,
} from "@/lib/actions/dashboard";
import StatCard from "@/components/admin/StatCard";
import BorrowRequestsSection from "@/components/admin/BorrowRequestsSection";
import RecentlyAddedBooksSection from "@/components/admin/RecentlyAddedBooksSection";
import AccountRequestsSection from "@/components/admin/AccountRequestsSection";
import AnalyticsChart from "@/components/admin/AnalyticsChart";

const Page = async () => {
  const [statsResult, borrowRequestsResult, booksResult, accountRequestsResult] =
    await Promise.all([
      getDashboardStats(),
      getRecentBorrowRequests(3),
      getRecentlyAddedBooks(6),
      getRecentAccountRequests(6),
    ]);

  const stats = statsResult.data || {
    borrowedBooks: { total: 0, change: 0 },
    totalUsers: { total: 0, change: 0 },
    totalBooks: { total: 0, change: 0 },
  };
  const borrowRequests = borrowRequestsResult.data || [];
  const books = booksResult.data || [];
  const accountRequests = accountRequestsResult.data || [];

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="flex flex-wrap gap-5">
        <StatCard
          label="Borrowed Books"
          count={stats.borrowedBooks.total}
          change={stats.borrowedBooks.change}
        />
        <StatCard
          label="Total Users"
          count={stats.totalUsers.total}
          change={stats.totalUsers.change}
        />
        <StatCard
          label="Total Books"
          count={stats.totalBooks.total}
          change={stats.totalBooks.change}
        />
        <StatCard
          label="Overdue Books"
          count={stats.overdueBooks.total}
          change={stats.overdueBooks.change}
        />
      </div>

      {/* Analytics Chart */}
      <AnalyticsChart />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Left Column */}
        <div className="space-y-6">
          <BorrowRequestsSection requests={borrowRequests} />
          <AccountRequestsSection requests={accountRequests} />
        </div>

        {/* Right Column */}
        <div>
          <RecentlyAddedBooksSection books={books} />
        </div>
      </div>
    </div>
  );
};

export default Page;
