import React from "react";
import BookList from "@/components/BookList";
import dummyBooks from "../../../dummybooks.json";
import Image from "next/image";
import Link from "next/link";

const Page = async ({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) => {
  const { q = "" } = await searchParams;
  const term = q.toString().trim().toLowerCase();

  const allBooks = dummyBooks as unknown as Book[];
  const filtered = term
    ? allBooks.filter((b) => {
        const hay = `${b.title} ${b.author} ${b.genre}`.toLowerCase();
        return hay.includes(term);
      })
    : allBooks;

  return (
    <div className="flex flex-col gap-10">
      <section className="flex flex-col items-center gap-6 text-center">
        <p className="text-sm tracking-widest text-light-500">
          DISCOVER YOUR NEXT GREAT READ:
        </p>
        <h1 className="max-w-3xl font-bebas-neue text-6xl leading-tight text-white">
          Explore and Search for
          <br />
          <span className="text-primary">Any Book</span> In Our Library
        </h1>

        <form
          action="/search"
          className="relative w-full max-w-2xl"
          suppressHydrationWarning
        >
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2">
            <Image
              src="/icons/search-fill.svg"
              alt="search"
              width={18}
              height={18}
              className="opacity-80"
            />
          </span>
          <input
            name="q"
            defaultValue={q}
            placeholder="Triller Mystry"
            className="w-full rounded-md bg-dark-300 px-11 py-3 text-white outline-none placeholder:text-light-500"
          />
        </form>
      </section>

      <div className="flex items-center justify-between">
        <h2 className="font-bebas-neue text-4xl text-light-100">
          Search Results
        </h2>

        <button className="flex items-center gap-2 rounded-md bg-dark-300 px-3 py-2 text-sm text-light-100">
          <span className="opacity-80">Filter by:</span>
          <span className="font-medium text-white">Department</span>
          <Image src="/icons/arrow-down.svg" alt="down" width={14} height={14} />
        </button>
      </div>

      <BookList title="" books={filtered} />

      <div className="mt-4 flex justify-end">
        <div className="flex items-center gap-2">
          <button className="rounded bg-dark-300 px-2 py-1 text-white">{"<"}</button>
          <button className="rounded bg-primary px-2 py-1 text-white">1</button>
          <button className="rounded bg-dark-300 px-2 py-1 text-white">...</button>
          <button className="rounded bg-dark-300 px-2 py-1 text-white">10</button>
          <button className="rounded bg-dark-300 px-2 py-1 text-white">{">"}</button>
        </div>
      </div>
    </div>
  );
};

export default Page;

