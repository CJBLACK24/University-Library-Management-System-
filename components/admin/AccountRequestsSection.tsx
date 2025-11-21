import React from "react";
import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";

interface AccountRequest {
  id: string;
  fullName: string;
  email: string;
}

interface AccountRequestsSectionProps {
  requests: AccountRequest[];
}

const AccountRequestsSection = ({
  requests,
}: AccountRequestsSectionProps) => {
  if (requests.length === 0) {
    return (
      <div className="w-full rounded-2xl bg-white dark:bg-[#111111] dark:border dark:border-[rgba(255,255,255,0.1)] dark:shadow-none p-7">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-dark-400 dark:text-white">
            Account Requests
          </h2>
          <Link
            href="/admin/account-requests"
            className="text-sm text-primary-admin hover:underline dark:text-gray-400"
          >
            View all
          </Link>
        </div>
        <div className="flex flex-col items-center justify-center py-12">
          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-light-300 dark:bg-dark-600">
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-light-500 dark:text-muted-foreground"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <line x1="19" y1="8" x2="19" y2="14"></line>
              <line x1="22" y1="11" x2="16" y2="11"></line>
            </svg>
          </div>
          <p className="text-center text-base font-medium text-dark-400 dark:text-white">
            No Pending Account Requests
          </p>
          <p className="mt-2 text-center text-sm text-light-500 dark:text-muted-foreground">
            There are currently no account requests awaiting approval.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full rounded-2xl bg-white dark:bg-[#111111] dark:border dark:border-[rgba(255,255,255,0.1)] dark:shadow-none p-7">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-dark-400 dark:text-white">
          Account Requests
        </h2>
        <Link
          href="/admin/account-requests"
          className="text-sm text-primary-admin hover:underline dark:text-gray-400"
        >
          View all
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {requests.map((request) => (
          <div key={request.id} className="user-card">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="bg-primary-admin text-white text-lg">
                {getInitials(request.fullName)}
              </AvatarFallback>
            </Avatar>
            <p className="name">{request.fullName}</p>
            <p className="email">{request.email}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AccountRequestsSection;

