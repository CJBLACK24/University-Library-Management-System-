import React, { Suspense } from "react";
import { getBorrowRecords } from "@/lib/actions/borrow-records";
import BorrowRecordsTable from "@/components/admin/BorrowRecordsTable";

interface PageProps {
  searchParams?: Promise<{
    search?: string;
    status?: string;
    sortBy?: "date" | "dueDate";
    sortOrder?: "asc" | "desc";
    page?: string;
  }>;
}

const Page = async ({ searchParams }: PageProps) => {
  const params = searchParams instanceof Promise 
    ? await searchParams 
    : searchParams || {};
  
  const search = params?.search || "";
  const status = params?.status || "";
  const sortBy = (params?.sortBy as "date" | "dueDate") || "date";
  const sortOrder = (params?.sortOrder as "asc" | "desc") || "desc";
  const page = parseInt(params?.page || "1", 10);

  const result = await getBorrowRecords(search, status, sortBy, sortOrder, page);
  const recordsData = result.data || [];
  const totalPages = result.totalPages || 1;
  const currentPage = result.currentPage || 1;

  return (
    <section className="w-full rounded-2xl bg-white dark:bg-[#111111] dark:border dark:border-[rgba(255,255,255,0.1)] dark:shadow-none p-7">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-dark-400 dark:text-white">Borrow Records</h2>
        <p className="mt-1 text-sm text-light-500 dark:text-muted-foreground">
          Complete history of all book borrows and returns
        </p>
      </div>

      <Suspense fallback={<div>Loading...</div>}>
        <BorrowRecordsTable
          records={recordsData}
          initialSearch={search}
          initialStatus={status}
          initialSortBy={sortBy}
          initialSortOrder={sortOrder}
          currentPage={currentPage}
          totalPages={totalPages}
        />
      </Suspense>
    </section>
  );
};

export default Page;

