import React from "react";
import Link from "next/link";
import BookCover from "@/components/BookCover";
import dayjs from "dayjs";

interface BorrowRequest {
  id: string;
  borrowDate: Date | string;
  dueDate: Date | string;
  status: "BORROWED" | "RETURNED";
  book: {
    id: string;
    title: string;
    author: string;
    genre: string;
    coverUrl: string;
    coverColor: string;
  };
  user: {
    id: string;
    fullName: string;
  };
}

interface BorrowRequestsSectionProps {
  requests: BorrowRequest[];
}

const BorrowRequestsSection = ({ requests }: BorrowRequestsSectionProps) => {
  const formatDate = (date: Date | string | null) => {
    if (!date) return "N/A";
    return dayjs(date).format("MM/DD/YY");
  };

  if (requests.length === 0) {
    return (
      <div className="w-full rounded-2xl bg-white dark:bg-[#111111] dark:border dark:border-[rgba(255,255,255,0.1)] dark:shadow-none p-7">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-dark-400 dark:text-white">Borrow Requests</h2>
          <Link
            href="/admin/book-requests"
            className="text-sm text-primary-admin hover:underline dark:text-gray-400"
          >
            View all
          </Link>
        </div>
        <div className="flex flex-col items-center justify-center py-12">
          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-light-300 dark:bg-dark-600">
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-light-500 dark:text-muted-foreground"
            >
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
            </svg>
          </div>
          <p className="text-center text-base font-medium text-dark-400 dark:text-white">
            No Pending Book Requests
          </p>
          <p className="mt-2 text-center text-sm text-light-500 dark:text-muted-foreground">
            There are no borrow book requests awaiting your review at this time.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full rounded-2xl bg-white dark:bg-[#111111] dark:border dark:border-[rgba(255,255,255,0.1)] dark:shadow-none p-7">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-dark-400 dark:text-white">Borrow Requests</h2>
        <Link
          href="/admin/book-requests"
          className="text-sm text-primary-admin hover:underline dark:text-gray-400"
        >
          View all
        </Link>
      </div>
      <div className="space-y-4">
        {requests.map((request) => (
          <div key={request.id} className="book-stripe">
            <div className="relative h-16 w-12 flex-shrink-0 border border-[rgba(255,255,255,0.1)] dark:border-[rgba(255,255,255,0.1)] rounded-sm">
              <BookCover
                variant="small"
                coverColor={request.book.coverColor}
                coverImage={request.book.coverUrl}
              />
            </div>
            <div className="flex flex-1 flex-col">
              <p className="title">{request.book.title}</p>
              <div className="author">
                <p>By {request.book.author}</p>
                <div></div>
                <p>{request.book.genre}</p>
              </div>
              <div className="user">
                <div className="avatar">
                  <p>{request.user.fullName}</p>
                </div>
                <div className="borrow-date">
                  <p>{formatDate(request.dueDate)}</p>
                </div>
              </div>
            </div>
            <Link
              href={`/admin/book-requests/${request.book.id}`}
              className="flex-shrink-0"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-dark-400 dark:text-white"
              >
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BorrowRequestsSection;

