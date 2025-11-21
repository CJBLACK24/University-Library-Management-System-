import React, { Suspense } from "react";
import { db } from "@/database/drizzle";
import { books } from "@/database/schema";
import { ilike, or, sql, desc, asc, eq } from "drizzle-orm";
import BookList from "@/components/BookList";
import Image from "next/image";
import LibraryFilters from "@/components/LibraryFilters";

interface PageProps {
  searchParams?: Promise<{
    q?: string;
    genre?: string;
    sortBy?: "title" | "date" | "rating";
    sortOrder?: "asc" | "desc";
    page?: string;
  }>;
}

const ITEMS_PER_PAGE = 12;

async function getBooks(params: {
  q?: string;
  genre?: string;
  sortBy?: "title" | "date" | "rating";
  sortOrder?: "asc" | "desc";
  page?: string;
}) {
  const search = params.q || "";
  const genre = params.genre || "";
  const sortBy = params.sortBy || "title";
  const sortOrder = params.sortOrder || "asc";
  const page = parseInt(params.page || "1", 10);
  const offset = (page - 1) * ITEMS_PER_PAGE;

  let query = db.select().from(books);

  // Apply search filter
  if (search) {
    query = query.where(
      or(
        ilike(books.title, `%${search}%`),
        ilike(books.author, `%${search}%`),
        ilike(books.genre, `%${search}%`)
      )!
    );
  }

  // Apply genre filter
  if (genre) {
    const currentWhere = search
      ? or(
          ilike(books.title, `%${search}%`),
          ilike(books.author, `%${search}%`),
          ilike(books.genre, `%${search}%`)
        )!
      : undefined;
    
    if (currentWhere) {
      query = query.where(sql`${currentWhere} AND ${books.genre} = ${genre}`);
    } else {
      query = query.where(eq(books.genre, genre));
    }
  }

  // Apply sorting
  if (sortBy === "title") {
    query = sortOrder === "asc" 
      ? query.orderBy(asc(books.title))
      : query.orderBy(desc(books.title));
  } else if (sortBy === "date") {
    query = sortOrder === "asc"
      ? query.orderBy(asc(books.createdAt))
      : query.orderBy(desc(books.createdAt));
  } else if (sortBy === "rating") {
    query = sortOrder === "asc"
      ? query.orderBy(asc(books.rating))
      : query.orderBy(desc(books.rating));
  }

  // Get total count for pagination
  const countQuery = db
    .select({ count: sql<number>`COUNT(*)::int` })
    .from(books);
  
  if (search || genre) {
    const whereCondition = search
      ? or(
          ilike(books.title, `%${search}%`),
          ilike(books.author, `%${search}%`),
          ilike(books.genre, `%${search}%`)
        )!
      : undefined;
    
    if (whereCondition && genre) {
      countQuery.where(sql`${whereCondition} AND ${books.genre} = ${genre}`);
    } else if (whereCondition) {
      countQuery.where(whereCondition);
    } else if (genre) {
      countQuery.where(eq(books.genre, genre));
    }
  }

  const [totalResult] = await countQuery;
  const total = totalResult?.count || 0;
  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  // Apply pagination
  const result = await query.limit(ITEMS_PER_PAGE).offset(offset);

  // Get unique genres for filter
  const allGenres = await db
    .selectDistinct({ genre: books.genre })
    .from(books);

  return {
    books: result,
    total,
    totalPages,
    currentPage: page,
    genres: allGenres.map((g) => g.genre),
  };
}

const Page = async ({ searchParams }: PageProps) => {
  const params = searchParams instanceof Promise 
    ? await searchParams 
    : searchParams || {};

  const { books, total, totalPages, currentPage, genres } = await getBooks(params);

  return (
    <div className="flex flex-col gap-10">
      <section className="flex flex-col items-center gap-6 text-center">
        <p className="text-sm tracking-widest text-light-500">
          DISCOVER YOUR NEXT GREAT READ:
        </p>
        <h1 className="max-w-3xl font-bebas-neue text-6xl leading-tight text-white">
          Explore Our
          <br />
          <span className="text-primary">Complete Library</span>
        </h1>
      </section>

      <Suspense fallback={<div className="text-white">Loading filters...</div>}>
        <LibraryFilters
          initialSearch={params.q}
          initialGenre={params.genre}
          initialSortBy={params.sortBy || "title"}
          initialSortOrder={params.sortOrder || "asc"}
          genres={genres}
        />
      </Suspense>

      <div className="flex items-center justify-between">
        <h2 className="font-bebas-neue text-4xl text-light-100">
          {params.q ? `Search Results (${total})` : `All Books (${total})`}
        </h2>
      </div>

      {books.length > 0 ? (
        <>
          <BookList title="" books={books as Book[]} />
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div id="pagination" className="mt-4">
              {currentPage > 1 && (
                <a
                  href={`/library?${new URLSearchParams({
                    ...(params.q && { q: params.q }),
                    ...(params.genre && { genre: params.genre }),
                    ...(params.sortBy && { sortBy: params.sortBy }),
                    ...(params.sortOrder && { sortOrder: params.sortOrder }),
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
                      href={`/library?${new URLSearchParams({
                        ...(params.q && { q: params.q }),
                        ...(params.genre && { genre: params.genre }),
                        ...(params.sortBy && { sortBy: params.sortBy }),
                        ...(params.sortOrder && { sortOrder: params.sortOrder }),
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
                  href={`/library?${new URLSearchParams({
                    ...(params.q && { q: params.q }),
                    ...(params.genre && { genre: params.genre }),
                    ...(params.sortBy && { sortBy: params.sortBy }),
                    ...(params.sortOrder && { sortOrder: params.sortOrder }),
                    page: String(currentPage + 1),
                  }).toString()}`}
                  className="pagination-btn_dark"
                >
                  {">"}
                </a>
              )}
            </div>
          )}
        </>
      ) : (
        <div className="flex h-64 items-center justify-center rounded-xl bg-dark-300 text-center">
          <p className="max-w-lg text-lg text-light-200">
            No books found. Try adjusting your search or filters.
          </p>
        </div>
      )}
    </div>
  );
};

export default Page;

