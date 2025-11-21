"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { deleteBook } from "@/lib/actions/book-admin";
import dayjs from "dayjs";
import BookCover from "@/components/BookCover";

interface Book {
  id: string;
  title: string;
  author: string;
  genre: string;
  coverUrl: string;
  coverColor: string;
  createdAt: Date | string | null;
}

interface BooksTableProps {
  books: Book[];
  initialSortBy: "title" | "date";
  initialSortOrder: "asc" | "desc";
}

const BooksTable = ({ books, initialSortBy, initialSortOrder }: BooksTableProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [sortBy, setSortBy] = useState<"title" | "date">(initialSortBy);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">(initialSortOrder);
  const [isPending, startTransition] = useTransition();

  const handleSort = (newSortBy: "title" | "date") => {
    const newSortOrder =
      sortBy === newSortBy && sortOrder === "asc" ? "desc" : "asc";
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);

    const params = new URLSearchParams(searchParams.toString());
    params.set("sortBy", newSortBy);
    params.set("sortOrder", newSortOrder);
    router.push(`/admin/books?${params.toString()}`);
  };

  const handleDelete = async (bookId: string) => {
    if (confirm("Are you sure you want to delete this book?")) {
      startTransition(async () => {
        await deleteBook(bookId);
        router.refresh();
      });
    }
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return "N/A";
    return dayjs(date).format("MMM D YYYY");
  };

  return (
    <div className="w-full overflow-x-auto">
      <div className="mb-4 flex items-center justify-end gap-2">
        <button
          onClick={() => handleSort("title")}
          className="flex items-center gap-1 text-sm font-medium text-dark-400 dark:text-white hover:text-dark-600 dark:hover:text-white/80"
        >
          A-Z
          {sortBy === "title" && (
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {sortOrder === "asc" ? (
                <polyline points="18 15 12 9 6 15"></polyline>
              ) : (
                <polyline points="6 9 12 15 18 9"></polyline>
              )}
            </svg>
          )}
        </button>
      </div>

      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-gray-200 dark:border-[rgba(255,255,255,0.1)]">
            <th className="px-4 py-3 text-left text-sm font-semibold text-dark-400 dark:text-white">
              Book Title
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-dark-400 dark:text-white">
              Author
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-dark-400 dark:text-white">
              Genre
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-dark-400 dark:text-white">
              Date Created
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-dark-400 dark:text-white">
              Action
            </th>
          </tr>
        </thead>
        <tbody>
          {books.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-4 py-8 text-center text-sm text-light-500 dark:text-muted-foreground">
                No books found
              </td>
            </tr>
          ) : (
            books.map((book) => (
              <tr
                key={book.id}
                className="border-b border-gray-100 dark:border-[rgba(255,255,255,0.1)] hover:bg-light-300/50 dark:hover:bg-dark-600/50 transition-colors"
              >
                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    <div className="relative h-12 w-8 flex-shrink-0 border border-[rgba(255,255,255,0.1)] dark:border-[rgba(255,255,255,0.1)] rounded-sm">
                      <BookCover
                        variant="small"
                        coverColor={book.coverColor}
                        coverImage={book.coverUrl}
                      />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-dark-400 dark:text-white line-clamp-1">
                        {book.title}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4 text-sm text-dark-400 dark:text-white">
                  {book.author}
                </td>
                <td className="px-4 py-4 text-sm text-dark-400 dark:text-white">
                  {book.genre}
                </td>
                <td className="px-4 py-4 text-sm text-dark-400 dark:text-white">
                  {formatDate(book.createdAt)}
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    <Link
                      href={`/admin/books/${book.id}/edit`}
                      className="text-primary-admin dark:text-primary-admin hover:text-primary-admin/80 dark:hover:text-primary-admin/80"
                      aria-label="Edit book"
                    >
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                      </svg>
                    </Link>
                    <button
                      onClick={() => handleDelete(book.id)}
                      disabled={isPending}
                      className="text-red-400 hover:text-red-600 disabled:opacity-50"
                      aria-label="Delete book"
                    >
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default BooksTable;

