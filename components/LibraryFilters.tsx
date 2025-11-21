"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";

interface LibraryFiltersProps {
  initialSearch?: string;
  initialGenre?: string;
  initialSortBy: "title" | "date" | "rating";
  initialSortOrder: "asc" | "desc";
  genres: string[];
}

const LibraryFilters = ({
  initialSearch = "",
  initialGenre = "",
  initialSortBy,
  initialSortOrder,
  genres,
}: LibraryFiltersProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(initialSearch);
  const [genre, setGenre] = useState(initialGenre);
  const [sortBy, setSortBy] = useState(initialSortBy);
  const [sortOrder, setSortOrder] = useState(initialSortOrder);
  const [isPending, startTransition] = useTransition();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search) params.set("q", search);
    if (genre) params.set("genre", genre);
    params.set("sortBy", sortBy);
    params.set("sortOrder", sortOrder);
    params.set("page", "1");
    
    startTransition(() => {
      router.push(`/library?${params.toString()}`);
    });
  };

  const handleFilterChange = (newGenre: string) => {
    const newGenreValue = newGenre === genre ? "" : newGenre;
    setGenre(newGenreValue);
    
    const params = new URLSearchParams();
    if (search) params.set("q", search);
    if (newGenreValue) params.set("genre", newGenreValue);
    params.set("sortBy", sortBy);
    params.set("sortOrder", sortOrder);
    params.set("page", "1");
    
    startTransition(() => {
      router.push(`/library?${params.toString()}`);
    });
  };

  const handleSortChange = (newSortBy: "title" | "date" | "rating") => {
    const newSortOrder =
      sortBy === newSortBy && sortOrder === "asc" ? "desc" : "asc";
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
    
    const params = new URLSearchParams();
    if (search) params.set("q", search);
    if (genre) params.set("genre", genre);
    params.set("sortBy", newSortBy);
    params.set("sortOrder", newSortOrder);
    params.set("page", "1");
    
    startTransition(() => {
      router.push(`/library?${params.toString()}`);
    });
  };

  return (
    <div className="w-full space-y-4">
      {/* Search Bar */}
      <form onSubmit={handleSearch} className="relative w-full max-w-2xl mx-auto">
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
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by title, author, or genre..."
          className="w-full rounded-md bg-dark-300 px-11 py-3 text-white outline-none placeholder:text-light-500"
        />
        <button
          type="submit"
          disabled={isPending}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-dark-100 hover:bg-primary/90 disabled:opacity-50"
        >
          Search
        </button>
      </form>

      {/* Filters and Sort */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Genre Filter */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-light-500">Filter by Genre:</span>
          <div className="flex flex-wrap gap-2">
            {genres.slice(0, 10).map((g) => (
              <button
                key={g}
                onClick={() => handleFilterChange(g)}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  genre === g
                    ? "bg-primary text-dark-100"
                    : "bg-dark-300 text-light-100 hover:bg-dark-600"
                }`}
              >
                {g}
              </button>
            ))}
            {genre && (
              <button
                onClick={() => handleFilterChange("")}
                className="rounded-md bg-red-500/20 px-3 py-1.5 text-sm font-medium text-red-400 hover:bg-red-500/30"
              >
                Clear Filter
              </button>
            )}
          </div>
        </div>

        {/* Sort Options */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-light-500">Sort by:</span>
          <button
            onClick={() => handleSortChange("title")}
            className={`flex items-center gap-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              sortBy === "title"
                ? "bg-primary text-dark-100"
                : "bg-dark-300 text-light-100 hover:bg-dark-600"
            }`}
          >
            Title
            {sortBy === "title" && (
              <svg
                width="14"
                height="14"
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
          <button
            onClick={() => handleSortChange("date")}
            className={`flex items-center gap-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              sortBy === "date"
                ? "bg-primary text-dark-100"
                : "bg-dark-300 text-light-100 hover:bg-dark-600"
            }`}
          >
            Date
            {sortBy === "date" && (
              <svg
                width="14"
                height="14"
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
          <button
            onClick={() => handleSortChange("rating")}
            className={`flex items-center gap-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              sortBy === "rating"
                ? "bg-primary text-dark-100"
                : "bg-dark-300 text-light-100 hover:bg-dark-600"
            }`}
          >
            Rating
            {sortBy === "rating" && (
              <svg
                width="14"
                height="14"
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
      </div>
    </div>
  );
};

export default LibraryFilters;

