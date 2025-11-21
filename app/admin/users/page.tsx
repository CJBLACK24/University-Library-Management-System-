import React from "react";
import { getUsersWithBorrowCounts } from "@/lib/actions/user";
import UsersTable from "@/components/admin/UsersTable";
import { Suspense } from "react";

interface PageProps {
  searchParams?: Promise<{
    search?: string;
    sortBy?: "name" | "date";
    sortOrder?: "asc" | "desc";
  }> | {
    search?: string;
    sortBy?: "name" | "date";
    sortOrder?: "asc" | "desc";
  };
}

const Page = async ({ searchParams }: PageProps) => {
  const params = searchParams instanceof Promise 
    ? await searchParams 
    : searchParams || {};
  
  const search = params?.search || "";
  const sortBy = (params?.sortBy as "name" | "date") || "name";
  const sortOrder = (params?.sortOrder as "asc" | "desc") || "asc";

  const result = await getUsersWithBorrowCounts(search, sortBy, sortOrder);
  const usersData = result.data || [];

  return (
    <section className="w-full rounded-2xl bg-white dark:bg-[#111111] dark:border dark:border-[rgba(255,255,255,0.1)] dark:shadow-none p-7">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-dark-400 dark:text-white">All Users</h2>
      </div>

      <Suspense fallback={<div>Loading...</div>}>
        <UsersTable
          users={usersData}
          initialSortBy={sortBy}
          initialSortOrder={sortOrder}
        />
      </Suspense>
    </section>
  );
};

export default Page;

