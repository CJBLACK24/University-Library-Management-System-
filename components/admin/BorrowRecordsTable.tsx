"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import BookCover from "@/components/BookCover";
import { Search } from "lucide-react";
import dayjs from "dayjs";

interface BorrowRecord {
  id: string;
  borrowDate: Date | string;
  dueDate: Date | string;
  returnDate: Date | string | null;
  status: "BORROWED" | "RETURNED";
  createdAt: Date | string | null;
  book: {
    id: string;
    title: string;
    author: string;
    coverUrl: string;
    coverColor: string;
  };
  user: {
    id: string;
    fullName: string;
    email: string;
  };
}

interface BorrowRecordsTableProps {
  records: BorrowRecord[];
  initialSearch: string;
  initialStatus: string;
  initialSortBy: "date" | "dueDate";
  initialSortOrder: "asc" | "desc";
  currentPage: number;
  totalPages: number;
}

const BorrowRecordsTable = ({
  records,
  initialSearch,
  initialStatus,
  initialSortBy,
  initialSortOrder,
  currentPage,
  totalPages,
}: BorrowRecordsTableProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(initialSearch);
  const [status, setStatus] = useState(initialStatus);
  const [sortBy, setSortBy] = useState<"date" | "dueDate">(initialSortBy);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">(initialSortOrder);
  const [isPending, startTransition] = useTransition();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateURL();
  };

  const handleStatusChange = (newStatus: string) => {
    setStatus(newStatus === status ? "" : newStatus);
    updateURL(newStatus === status ? "" : newStatus);
  };

  const handleSort = (newSortBy: "date" | "dueDate") => {
    const newSortOrder =
      sortBy === newSortBy && sortOrder === "asc" ? "desc" : "asc";
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
    updateURL(status, newSortBy, newSortOrder);
  };

  const updateURL = (
    newStatus?: string,
    newSortBy?: "date" | "dueDate",
    newSortOrder?: "asc" | "desc"
  ) => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (newStatus !== undefined ? newStatus : status) {
      params.set("status", newStatus !== undefined ? newStatus : status);
    }
    params.set("sortBy", (newSortBy || sortBy).toString());
    params.set("sortOrder", (newSortOrder || sortOrder).toString());
    params.set("page", "1");

    startTransition(() => {
      router.push(`/admin/borrow-records?${params.toString()}`);
    });
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return "N/A";
    return dayjs(date).format("MMM D, YYYY");
  };

  const getStatusBadge = (status: string) => {
    if (status === "BORROWED") {
      return (
        <span className="rounded-full bg-yellow-100 px-2.5 py-1 text-xs font-medium text-yellow-800">
          Borrowed
        </span>
      );
    }
    return (
      <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-800">
        Returned
      </span>
    );
  };

  return (
    <div className="w-full space-y-4">
      {/* Search and Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <form onSubmit={handleSearch} className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 dark:text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by book, user..."
              className="w-full rounded-md border border-gray-300 dark:border-[rgba(255,255,255,0.1)] dark:shadow-none bg-white dark:bg-[#111111] pl-10 pr-4 py-2 text-sm text-dark-400 dark:text-white focus:border-primary focus:outline-none"
            />
          </div>
        </form>

        <div className="flex items-center gap-2">
          <span className="text-sm text-dark-400 dark:text-white">Status:</span>
          <button
            onClick={() => handleStatusChange("BORROWED")}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              status === "BORROWED"
                ? "bg-primary-admin text-white"
                : "bg-gray-100 dark:bg-dark-600 text-dark-400 dark:text-white hover:bg-gray-200 dark:hover:bg-dark-500"
            }`}
          >
            Borrowed
          </button>
          <button
            onClick={() => handleStatusChange("RETURNED")}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              status === "RETURNED"
                ? "bg-primary-admin text-white"
                : "bg-gray-100 dark:bg-dark-600 text-dark-400 dark:text-white hover:bg-gray-200 dark:hover:bg-dark-500"
            }`}
          >
            Returned
          </button>
          {status && (
            <button
              onClick={() => handleStatusChange("")}
              className="rounded-md bg-red-100 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-200"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="w-full overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-gray-200 dark:border-[rgba(255,255,255,0.1)]">
              <th className="px-4 py-3 text-left text-sm font-semibold text-dark-400 dark:text-white">
                Book
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-dark-400 dark:text-white">
                User
              </th>
              <th
                className="px-4 py-3 text-left text-sm font-semibold text-dark-400 dark:text-white cursor-pointer hover:text-dark-600 dark:hover:text-white/80"
                onClick={() => handleSort("date")}
              >
                <div className="flex items-center gap-1">
                  Borrow Date
                  {sortBy === "date" && (
                    <span>{sortOrder === "asc" ? "↑" : "↓"}</span>
                  )}
                </div>
              </th>
              <th
                className="px-4 py-3 text-left text-sm font-semibold text-dark-400 dark:text-white cursor-pointer hover:text-dark-600 dark:hover:text-white/80"
                onClick={() => handleSort("dueDate")}
              >
                <div className="flex items-center gap-1">
                  Due Date
                  {sortBy === "dueDate" && (
                    <span>{sortOrder === "asc" ? "↑" : "↓"}</span>
                  )}
                </div>
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-dark-400 dark:text-white">
                Return Date
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-dark-400 dark:text-white">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {records.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-sm text-light-500 dark:text-muted-foreground">
                  No records found
                </td>
              </tr>
            ) : (
              records.map((record) => (
                <tr
                  key={record.id}
                  className="border-b border-gray-100 dark:border-[rgba(255,255,255,0.1)] hover:bg-light-300/50 dark:hover:bg-dark-600/50 transition-colors"
                >
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="relative h-12 w-8 flex-shrink-0 border border-[rgba(255,255,255,0.1)] dark:border-[rgba(255,255,255,0.1)] rounded-sm">
                        <BookCover
                          variant="small"
                          coverColor={record.book.coverColor}
                          coverImage={record.book.coverUrl}
                        />
                      </div>
                      <div>
                        <Link
                          href={`/admin/book-requests/${record.book.id}`}
                          className="text-sm font-medium text-dark-400 dark:text-white hover:text-primary-admin dark:hover:text-primary-admin"
                        >
                          {record.book.title}
                        </Link>
                        <p className="text-xs text-light-500 dark:text-muted-foreground">{record.book.author}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary-admin text-white text-xs">
                          {getInitials(record.user.fullName)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium text-dark-400 dark:text-white">
                          {record.user.fullName}
                        </p>
                        <p className="text-xs text-light-500 dark:text-muted-foreground">{record.user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-dark-400 dark:text-white">
                    {formatDate(record.borrowDate)}
                  </td>
                  <td className="px-4 py-4 text-sm text-dark-400 dark:text-white">
                    {formatDate(record.dueDate)}
                  </td>
                  <td className="px-4 py-4 text-sm text-dark-400 dark:text-white">
                    {formatDate(record.returnDate)}
                  </td>
                  <td className="px-4 py-4">{getStatusBadge(record.status)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div id="pagination" className="mt-4">
          {currentPage > 1 && (
            <a
              href={`/admin/borrow-records?${new URLSearchParams({
                ...(search && { search }),
                ...(status && { status }),
                sortBy: sortBy.toString(),
                sortOrder: sortOrder.toString(),
                page: String(currentPage - 1),
              }).toString()}`}
              className="pagination-btn_dark"
            >
              {"<"}
            </a>
          )}

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
            if (
              pageNum === 1 ||
              pageNum === totalPages ||
              (pageNum >= currentPage - 2 && pageNum <= currentPage + 2)
            ) {
              return (
                <a
                  key={pageNum}
                  href={`/admin/borrow-records?${new URLSearchParams({
                    ...(search && { search }),
                    ...(status && { status }),
                    sortBy: sortBy.toString(),
                    sortOrder: sortOrder.toString(),
                    page: String(pageNum),
                  }).toString()}`}
                  className={pageNum === currentPage ? "pagination-btn_light" : "pagination-btn_dark"}
                >
                  {pageNum}
                </a>
              );
            } else if (
              pageNum === currentPage - 3 ||
              pageNum === currentPage + 3
            ) {
              return (
                <span key={pageNum} className="pagination-btn_dark">
                  ...
                </span>
              );
            }
            return null;
          })}

          {currentPage < totalPages && (
            <a
              href={`/admin/borrow-records?${new URLSearchParams({
                ...(search && { search }),
                ...(status && { status }),
                sortBy: sortBy.toString(),
                sortOrder: sortOrder.toString(),
                page: String(currentPage + 1),
              }).toString()}`}
              className="pagination-btn_dark"
            >
              {">"}
            </a>
          )}
        </div>
      )}
    </div>
  );
};

export default BorrowRecordsTable;

