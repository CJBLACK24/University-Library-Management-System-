import React from "react";
import Link from "next/link";
import BookCover from "@/components/BookCover";
import { cn } from "@/lib/utils";
import Image from "next/image";
import dayjs from "dayjs";

type BorrowMeta = {
  borrowDate?: string | Date | null;
  dueDate?: string | Date | null;
  returnDate?: string | Date | null;
  status?: "BORROWED" | "RETURNED";
};

type Props = Book & { isLoanedBook?: boolean; borrowMeta?: BorrowMeta };

const BookCard = ({
  id,
  title,
  author,
  genre,
  coverColor,
  coverUrl,
  isLoanedBook = false,
  borrowMeta,
}: Props) => {
  const borrowDate = borrowMeta?.borrowDate ? dayjs(borrowMeta.borrowDate) : null;
  const due = borrowMeta?.dueDate ? dayjs(borrowMeta.dueDate) : null;
  const returned = borrowMeta?.returnDate ? dayjs(borrowMeta.returnDate) : null;
  const today = dayjs();

  let subtitle: string | null = null;
  let badgeIcon: string | null = null;
  let statusColor: string = "text-light-100";

  if (returned) {
    subtitle = `Returned on ${returned.format("D")}${getOrdinalSuffix(returned.date())} ${returned.format("MMM")}`;
    badgeIcon = "/icons/check.svg";
    statusColor = "text-green-400";
  } else if (due && due.isBefore(today, "day")) {
    subtitle = `Overdue Return`;
    badgeIcon = "/icons/warning.svg";
    statusColor = "text-red-400";
  } else if (due) {
    const daysLeft = due.diff(today, "day") + 1;
    subtitle = `${String(daysLeft).padStart(2, "0")} days left to due`;
    badgeIcon = "/icons/clock.svg";
  }

  // Format borrowed date as "Borrowed on November 16"
  const formattedBorrowDate = borrowDate 
    ? `Borrowed on ${borrowDate.format("MMMM D")}`
    : null;

  return (
  <li className={cn(isLoanedBook && "w-full")}>
    <Link
      href={`/books/${id}`}
      className={cn(
        isLoanedBook && "w-full flex flex-col items-center rounded-lg border-2 border-dark-800 dark:border-cyan-400/40 dark:shadow-[0_0_8px_rgba(34,211,238,0.3)] bg-dark-300 dark:bg-dark-500 p-5 hover:border-dark-700 dark:hover:border-cyan-400/60 transition-colors"
      )}
    >
      <div className="relative w-full flex justify-center">
        <BookCover coverColor={coverColor} coverImage={coverUrl} />
        {borrowMeta?.status === "BORROWED" && due && due.isBefore(today, "day") && (
          <div className="absolute top-0 right-0">
            <div className="bg-red-500 rounded-full p-1">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 9v4"></path>
                <path d="M12 17h.01"></path>
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
              </svg>
            </div>
          </div>
        )}
      </div>

      <div className={cn("mt-4 w-full text-center", !isLoanedBook && "xs:max-w-40 max-w-28")}>
        {isLoanedBook ? (
          <>
            <p className="book-title">{title} - By {author}</p>
            <p className="book-genre">{genre}</p>
          </>
        ) : (
          <>
            <p className="book-title">{title}</p>
            <p className="book-genre">{genre}</p>
          </>
        )}
      </div>

      {isLoanedBook && (
        <div className="mt-3 w-full space-y-2 text-left">
          {formattedBorrowDate && (
            <div className="book-loaned">
              <Image
                src="/icons/book.svg"
                alt="borrowed"
                width={18}
                height={18}
                className="object-contain flex-shrink-0 brightness-0 invert"
              />
              <p className="text-light-100 text-sm">{formattedBorrowDate}</p>
            </div>
          )}
          {subtitle && (
            <div className="book-loaned">
              <Image
                src={badgeIcon || "/icons/calendar.svg"}
                alt="status"
                width={18}
                height={18}
                className="object-contain flex-shrink-0 brightness-0 invert"
              />
              <p className={cn("text-sm", statusColor)}>{subtitle}</p>
            </div>
          )}
        </div>
      )}
    </Link>
  </li>
  );
};

// Helper function to get ordinal suffix (1st, 2nd, 3rd, 4th, etc.)
function getOrdinalSuffix(day: number): string {
  if (day > 3 && day < 21) return "th";
  switch (day % 10) {
    case 1: return "st";
    case 2: return "nd";
    case 3: return "rd";
    default: return "th";
  }
}

export default BookCard;
