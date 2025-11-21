import React from "react";
import Link from "next/link";
import BookForm from "@/components/admin/forms/BookForm";

const Page = () => {
  return (
    <section className="w-full rounded-2xl bg-white dark:bg-[#111111] dark:border dark:border-[rgba(255,255,255,0.1)] dark:shadow-none p-7">
      <div className="mb-6">
        <Link
          href="/admin/books"
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

      <div className="w-full max-w-2xl">
        <BookForm type="create" />
      </div>
    </section>
  );
};
export default Page;
