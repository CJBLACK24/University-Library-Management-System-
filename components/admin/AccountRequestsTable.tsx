"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import { approveAccountRequest, rejectAccountRequest } from "@/lib/actions/account-request";
import { Button } from "@/components/ui/button";
import config from "@/lib/config";
import dayjs from "dayjs";
import ApproveModal from "@/components/admin/ApproveModal";
import DenyModal from "@/components/admin/DenyModal";

interface AccountRequest {
  id: string;
  fullName: string;
  email: string;
  universityId: number;
  universityCard: string;
  createdAt: Date | string | null;
}

interface AccountRequestsTableProps {
  requests: AccountRequest[];
  initialSortOrder: "asc" | "desc";
}

const AccountRequestsTable = ({
  requests,
  initialSortOrder,
}: AccountRequestsTableProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">(initialSortOrder);
  const [isPending, startTransition] = useTransition();
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [denyModalOpen, setDenyModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const handleSort = (newSortOrder: "asc" | "desc") => {
    setSortOrder(newSortOrder);
    const params = new URLSearchParams(searchParams.toString());
    params.set("sortOrder", newSortOrder);
    router.push(`/admin/account-requests?${params.toString()}`);
  };

  const handleApprove = (userId: string) => {
    setSelectedUserId(userId);
    setApproveModalOpen(true);
  };

  const handleDeny = (userId: string) => {
    setSelectedUserId(userId);
    setDenyModalOpen(true);
  };

  const confirmApprove = async () => {
    if (!selectedUserId) return;
    
    startTransition(async () => {
      await approveAccountRequest(selectedUserId);
      setApproveModalOpen(false);
      setSelectedUserId(null);
      router.refresh();
    });
  };

  const confirmDeny = async () => {
    if (!selectedUserId) return;
    
    startTransition(async () => {
      await rejectAccountRequest(selectedUserId);
      setDenyModalOpen(false);
      setSelectedUserId(null);
      router.refresh();
    });
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return "N/A";
    return dayjs(date).format("MMM D YYYY");
  };

  const getUniversityCardUrl = (cardPath: string) => {
    if (cardPath.startsWith("http")) {
      return cardPath;
    }
    return `${config.env.imagekit.urlEndpoint}/${cardPath.replace(/^\/+/, "")}`;
  };

  return (
    <>
      <div className="w-full overflow-x-auto">
        <div className="mb-4 flex items-center justify-end gap-2">
          <div className="relative">
            <button
              onClick={() => handleSort(sortOrder === "asc" ? "desc" : "asc")}
              className="flex items-center gap-1 text-sm font-medium text-dark-400 dark:text-white hover:text-dark-600 dark:hover:text-white/80"
            >
              {sortOrder === "asc" ? "Oldest to Recent" : "Recent to Oldest"}
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
                {sortOrder === "asc" ? (
                  <polyline points="18 15 12 9 6 15"></polyline>
                ) : (
                  <polyline points="6 9 12 15 18 9"></polyline>
                )}
              </svg>
            </button>
          </div>
        </div>

        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-gray-200 dark:border-[rgba(255,255,255,0.1)]">
              <th className="px-4 py-3 text-left text-sm font-semibold text-dark-400 dark:text-white">
                Name
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-dark-400 dark:text-white">
                Date Joined
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-dark-400 dark:text-white">
                University ID No
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-dark-400 dark:text-white">
                University ID Card
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-dark-400 dark:text-white">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {requests.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-8 text-center text-sm text-light-500 dark:text-muted-foreground"
                >
                  No account requests found
                </td>
              </tr>
            ) : (
              requests.map((request) => (
                <tr
                  key={request.id}
                  className="border-b border-gray-100 dark:border-[rgba(255,255,255,0.1)] hover:bg-light-300/50 dark:hover:bg-dark-600/50 transition-colors"
                >
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-primary-admin text-white">
                          {getInitials(request.fullName)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium text-dark-400 dark:text-white">
                          {request.fullName}
                        </p>
                        <p className="text-xs text-light-500 dark:text-muted-foreground">{request.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-dark-400 dark:text-white">
                    {formatDate(request.createdAt)}
                  </td>
                  <td className="px-4 py-4 text-sm text-dark-400 dark:text-white">
                    {request.universityId}
                  </td>
                  <td className="px-4 py-4">
                    <a
                      href={getUniversityCardUrl(request.universityCard)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-primary-admin hover:underline"
                    >
                      View ID Card
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
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                    </a>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() => handleApprove(request.id)}
                        disabled={isPending}
                        className="bg-green-500 text-white hover:bg-green-600 disabled:opacity-50"
                      >
                        Approve Account
                      </Button>
                      <button
                        onClick={() => handleDeny(request.id)}
                        disabled={isPending}
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600 disabled:opacity-50"
                        aria-label="Deny account"
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
                          <line x1="18" y1="6" x2="6" y2="18"></line>
                          <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <ApproveModal
        isOpen={approveModalOpen}
        onClose={() => {
          setApproveModalOpen(false);
          setSelectedUserId(null);
        }}
        onConfirm={confirmApprove}
        isLoading={isPending}
      />

      <DenyModal
        isOpen={denyModalOpen}
        onClose={() => {
          setDenyModalOpen(false);
          setSelectedUserId(null);
        }}
        onConfirm={confirmDeny}
        isLoading={isPending}
      />
    </>
  );
};

export default AccountRequestsTable;

