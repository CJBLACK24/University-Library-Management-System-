"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { updateBorrowStatus } from "@/lib/actions/borrow-request";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import BookCover from "@/components/BookCover";
import dayjs from "dayjs";
import { Button } from "@/components/ui/button";

interface BorrowRequest {
  id: string;
  borrowDate: Date | string;
  dueDate: Date | string;
  returnDate: Date | string | null;
  status: "BORROWED" | "RETURNED";
  displayStatus: "BORROWED" | "RETURNED" | "LATE_RETURN";
  createdAt: Date | string | null;
  book: {
    id: string;
    title: string;
    coverUrl: string;
    coverColor: string;
  };
  user: {
    id: string;
    fullName: string;
    email: string;
  };
}

interface BorrowRequestsTableProps {
  requests: BorrowRequest[];
  initialSortOrder: "asc" | "desc";
}

const BorrowRequestsTable = ({
  requests,
  initialSortOrder,
}: BorrowRequestsTableProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">(initialSortOrder);
  const [expandedStatusId, setExpandedStatusId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const dropdownRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!expandedStatusId) return;

      const dropdownElement = dropdownRefs.current.get(expandedStatusId);
      if (
        dropdownElement &&
        !dropdownElement.contains(event.target as Node)
      ) {
        setExpandedStatusId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [expandedStatusId]);

  const handleSort = (newSortOrder: "asc" | "desc") => {
    setSortOrder(newSortOrder);
    const params = new URLSearchParams(searchParams.toString());
    params.set("sortOrder", newSortOrder);
    router.push(`/admin/book-requests?${params.toString()}`);
  };

  const handleStatusChange = async (
    borrowId: string,
    newStatus: "BORROWED" | "RETURNED"
  ) => {
    startTransition(async () => {
      await updateBorrowStatus(borrowId, newStatus);
      setExpandedStatusId(null);
      router.refresh();
    });
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return "N/A";
    return dayjs(date).format("MMM D YYYY");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "BORROWED":
        return "bg-purple-100 text-purple-800";
      case "RETURNED":
        return "bg-teal-100 text-teal-800";
      case "LATE_RETURN":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "BORROWED":
        return "Borrowed";
      case "RETURNED":
        return "Returned";
      case "LATE_RETURN":
        return "Late Return";
      default:
        return status;
    }
  };

  const handleGenerateReceipt = (request: BorrowRequest) => {
    // TODO: Implement receipt generation
    console.log("Generate receipt for:", request.id);
  };

  return (
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
              Book
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-dark-400 dark:text-white">
              User Requested
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-dark-400 dark:text-white">
              Status
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-dark-400 dark:text-white">
              Borrowed date
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-dark-400 dark:text-white">
              Return date
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-dark-400 dark:text-white">
              Due Date
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-dark-400 dark:text-white">
              Receipt
            </th>
          </tr>
        </thead>
        <tbody>
          {requests.length === 0 ? (
            <tr>
              <td
                colSpan={7}
                className="px-4 py-8 text-center text-sm text-light-500 dark:text-muted-foreground"
              >
                No borrow requests found
              </td>
            </tr>
          ) : (
            requests.map((request) => (
              <tr
                key={request.id}
                className="border-b border-gray-100 dark:border-dark-300 hover:bg-light-300/50 dark:hover:bg-dark-600/50 transition-colors"
              >
                <td className="px-4 py-4">
                  <Link
                    href={`/admin/book-requests/${request.book.id}`}
                    className="flex items-center gap-3 hover:opacity-80"
                  >
                    <div className="relative h-12 w-8 flex-shrink-0 border border-white/10 dark:border-white/10 rounded-sm">
                      <BookCover
                        variant="small"
                        coverColor={request.book.coverColor}
                        coverImage={request.book.coverUrl}
                      />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-dark-400 dark:text-white line-clamp-1">
                        {request.book.title}
                      </p>
                    </div>
                  </Link>
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary-admin text-white text-xs">
                        {getInitials(request.user.fullName)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium text-dark-400 dark:text-white">
                        {request.user.fullName}
                      </p>
                      <p className="text-xs text-light-500 dark:text-muted-foreground">
                        {request.user.email}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div
                    className="relative"
                    ref={(el) => {
                      if (el) {
                        dropdownRefs.current.set(request.id, el);
                      } else {
                        dropdownRefs.current.delete(request.id);
                      }
                    }}
                  >
                    <button
                      onClick={() =>
                        setExpandedStatusId(
                          expandedStatusId === request.id ? null : request.id
                        )
                      }
                      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(
                        request.displayStatus
                      )}`}
                    >
                      {getStatusLabel(request.displayStatus)}
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className={`transition-transform ${
                          expandedStatusId === request.id ? "rotate-180" : ""
                        }`}
                      >
                        <polyline points="6 9 12 15 18 9"></polyline>
                      </svg>
                    </button>
                    {expandedStatusId === request.id && (
                      <div className="absolute left-0 top-full z-10 mt-1 w-40 rounded-md border border-gray-200 dark:border-[rgba(255,255,255,0.1)] bg-white dark:bg-[#111111] shadow-lg">
                        <button
                          onClick={() =>
                            handleStatusChange(request.id, "BORROWED")
                          }
                          className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-light-300 dark:hover:bg-dark-600"
                        >
                          <span className="text-dark-400 dark:text-white">Borrowed</span>
                          {request.displayStatus === "BORROWED" && (
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="text-primary-admin"
                            >
                              <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                          )}
                        </button>
                        <button
                          onClick={() =>
                            handleStatusChange(request.id, "RETURNED")
                          }
                          className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-light-300 dark:hover:bg-dark-600"
                        >
                          <span className="text-dark-400 dark:text-white">Returned</span>
                          {request.displayStatus === "RETURNED" && (
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="text-primary-admin"
                            >
                              <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-4 py-4 text-sm text-dark-400 dark:text-white">
                  {formatDate(request.borrowDate)}
                </td>
                <td className="px-4 py-4 text-sm text-dark-400 dark:text-white">
                  {formatDate(request.returnDate)}
                </td>
                <td className="px-4 py-4 text-sm text-dark-400 dark:text-white">
                  {formatDate(request.dueDate)}
                </td>
                <td className="px-4 py-4">
                  <Button
                    onClick={() => handleGenerateReceipt(request)}
                    variant="outline"
                    className="border-primary-admin text-primary-admin hover:bg-primary-admin hover:text-white"
                  >
                    Generate
                  </Button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default BorrowRequestsTable;

