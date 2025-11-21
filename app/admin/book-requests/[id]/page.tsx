import React from "react";
import { db } from "@/database/drizzle";
import { books } from "@/database/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import BookCover from "@/components/BookCover";
import dayjs from "dayjs";
import BookVideo from "@/components/BookVideo";

interface PageProps {
  params: {
    id: string;
  };
}

const Page = async ({ params }: PageProps) => {
  const [book] = await db
    .select()
    .from(books)
    .where(eq(books.id, params.id))
    .limit(1);

  if (!book) {
    notFound();
  }

  const formatDate = (date: Date | string | null) => {
    if (!date) return "N/A";
    return dayjs(date).format("MM/DD/YY");
  };

  return (
    <section className="w-full rounded-2xl bg-white dark:bg-[#111111] dark:border dark:border-[rgba(255,255,255,0.1)] dark:shadow-none p-7">
      <div className="mb-6">
        <Link
          href="/admin/book-requests"
          className="inline-flex items-center gap-2 text-sm text-dark-400 dark:text-white hover:text-dark-600 dark:hover:text-white/80"
        >
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
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
          Go back
        </Link>
      </div>

      <div className="mb-6 flex items-center gap-2 text-sm text-light-500 dark:text-muted-foreground">
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
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="16" y1="2" x2="16" y2="6"></line>
          <line x1="8" y1="2" x2="8" y2="6"></line>
          <line x1="3" y1="10" x2="21" y2="10"></line>
        </svg>
        Created at: {formatDate(book.createdAt)}
      </div>

      <div className="mb-8 flex flex-col gap-6 lg:flex-row">
        <div className="flex flex-1 justify-center">
          <BookCover
            variant="wide"
            coverColor={book.coverColor}
            coverImage={book.coverUrl}
          />
        </div>

        <div className="flex flex-1 flex-col gap-4">
          <h1 className="text-3xl font-bold text-dark-400 dark:text-white">{book.title}</h1>
          <p className="text-lg text-dark-400 dark:text-white">By {book.author}</p>
          <p className="text-base text-light-500 dark:text-muted-foreground">{book.genre}</p>
          <Link href={`/admin/books/${book.id}/edit`}>
            <Button className="bg-primary-admin text-white hover:bg-primary-admin/90">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mr-2"
              >
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
              Edit Book
            </Button>
          </Link>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="mb-4 text-xl font-semibold text-dark-400 dark:text-white">Summary</h2>
        <div className="prose max-w-none">
          <p className="text-base leading-relaxed text-dark-400 dark:text-white whitespace-pre-line">
            {book.summary}
          </p>
        </div>
      </div>

      <div>
        <h2 className="mb-4 text-xl font-semibold text-dark-400 dark:text-white">Video</h2>
        <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-dark-300">
          <BookVideo videoUrl={book.videoUrl} />
        </div>
      </div>
    </section>
  );
};

export default Page;

