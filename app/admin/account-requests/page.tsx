import React, { Suspense } from "react";
import { getAccountRequests } from "@/lib/actions/account-request";
import AccountRequestsTable from "@/components/admin/AccountRequestsTable";

interface PageProps {
  searchParams?: Promise<{
    search?: string;
    sortOrder?: "asc" | "desc";
  }> | {
    search?: string;
    sortOrder?: "asc" | "desc";
  };
}

const Page = async ({ searchParams }: PageProps) => {
  const params = searchParams instanceof Promise 
    ? await searchParams 
    : searchParams || {};
  
  const search = params?.search || "";
  const sortOrder = (params?.sortOrder as "asc" | "desc") || "asc";

  const result = await getAccountRequests(search, sortOrder);
  const requestsData = result.data || [];

  return (
    <section className="w-full rounded-2xl bg-white dark:bg-[#111111] dark:border dark:border-[rgba(255,255,255,0.1)] dark:shadow-none p-7">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-dark-400 dark:text-white">
          Account Registration Requests
        </h2>
      </div>

      <Suspense fallback={<div>Loading...</div>}>
        <AccountRequestsTable
          requests={requestsData}
          initialSortOrder={sortOrder}
        />
      </Suspense>
    </section>
  );
};

export default Page;

