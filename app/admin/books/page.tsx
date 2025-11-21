import React, { Suspense } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getBooksWithSearch } from "@/lib/actions/book-admin";
import BooksTable from "@/components/admin/BooksTable";

interface PageProps {
  searchParams?: Promise<{
    search?: string;
    sortBy?: "title" | "date";
    sortOrder?: "asc" | "desc";
  }> | {
    search?: string;
    sortBy?: "title" | "date";
    sortOrder?: "asc" | "desc";
  };
}

const Page = async ({ searchParams }: PageProps) => {
  const params = searchParams instanceof Promise 
    ? await searchParams 
    : searchParams || {};
  
  const search = params?.search || "";
  const sortBy = (params?.sortBy as "title" | "date") || "title";
  const sortOrder = (params?.sortOrder as "asc" | "desc") || "asc";

  const result = await getBooksWithSearch(search, sortBy, sortOrder);
  const booksData = (result.data || []).map((book) => ({
    id: book.id,
    title: book.title,
    author: book.author,
    genre: book.genre,
    coverUrl: book.coverUrl,
    coverColor: book.coverColor,
    createdAt: book.createdAt,
  }));

  return (
    <section className="w-full rounded-2xl bg-white dark:bg-[#111111] dark:border dark:border-[rgba(255,255,255,0.1)] dark:shadow-none p-7">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-xl font-semibold text-dark-400 dark:text-white">All Books</h2>
        <Button className="bg-primary-admin text-white hover:bg-primary-admin/90" asChild>
          <Link href="/admin/books/new">
            + Create a New Book
          </Link>
        </Button>
      </div>

      <Suspense fallback={<div>Loading...</div>}>
        <BooksTable
          books={booksData}
          initialSortBy={sortBy}
          initialSortOrder={sortOrder}
        />
      </Suspense>
    </section>
  );
};

export default Page;
