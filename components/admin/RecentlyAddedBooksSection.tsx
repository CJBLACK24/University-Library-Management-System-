import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import BookCover from "@/components/BookCover";
import dayjs from "dayjs";

interface Book {
  id: string;
  title: string;
  author: string;
  genre: string;
  coverUrl: string;
  coverColor: string;
  createdAt: Date | string | null;
}

interface RecentlyAddedBooksSectionProps {
  books: Book[];
}

const RecentlyAddedBooksSection = ({
  books,
}: RecentlyAddedBooksSectionProps) => {
  const formatDate = (date: Date | string | null) => {
    if (!date) return "N/A";
    return dayjs(date).format("MM/DD/YY");
  };

  return (
    <div className="w-full rounded-2xl bg-white dark:bg-[#111111] dark:border dark:border-[rgba(255,255,255,0.1)] dark:shadow-none p-7">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-dark-400 dark:text-white">
          Recently Added Books
        </h2>
        <Link
          href="/admin/books"
          className="text-sm text-primary-admin hover:underline dark:text-gray-400"
        >
          View all
        </Link>
      </div>
      <Link href="/admin/books/new" className="mb-4 block">
        <div className="add-new-book_btn">
          <div>
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-black dark:text-white"
            >
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </div>
          <p>Add New Book</p>
        </div>
      </Link>
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {books.map((book) => (
          <div key={book.id} className="book-stripe">
            <div className="relative h-16 w-12 flex-shrink-0 border border-[rgba(255,255,255,0.1)] dark:border-[rgba(255,255,255,0.1)] rounded-sm">
              <BookCover
                variant="small"
                coverColor={book.coverColor}
                coverImage={book.coverUrl}
              />
            </div>
            <div className="flex flex-1 flex-col">
              <p className="title">{book.title}</p>
              <div className="author">
                <p>By {book.author}</p>
                <div></div>
                <p>{book.genre}</p>
              </div>
              <div className="borrow-date">
                <p>{formatDate(book.createdAt)}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentlyAddedBooksSection;

