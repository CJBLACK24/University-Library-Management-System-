"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import { updateUserRole, deleteUser } from "@/lib/actions/user";
import { Button } from "@/components/ui/button";
import config from "@/lib/config";
import dayjs from "dayjs";
import { DeleteUserDialog } from "./DeleteUserDialog";

interface User {
  id: string;
  fullName: string;
  email: string;
  universityId: number;
  universityCard: string;
  role: "USER" | "ADMIN" | null;
  createdAt: Date | string | null;
  booksBorrowed: number;
}

interface UsersTableProps {
  users: User[];
  initialSortBy: "name" | "date";
  initialSortOrder: "asc" | "desc";
}

const UsersTable = ({ users, initialSortBy, initialSortOrder }: UsersTableProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [sortBy, setSortBy] = useState<"name" | "date">(initialSortBy);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">(initialSortOrder);
  const [expandedRoleId, setExpandedRoleId] = useState<string | null>(null);
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const dropdownRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const rowMenuRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (expandedRoleId) {
        const dropdownElement = dropdownRefs.current.get(expandedRoleId);
        if (
          dropdownElement &&
          !dropdownElement.contains(event.target as Node)
        ) {
          setExpandedRoleId(null);
        }
      }
      
      if (expandedRowId) {
        const menuElement = rowMenuRefs.current.get(expandedRowId);
        if (
          menuElement &&
          !menuElement.contains(event.target as Node)
        ) {
          setExpandedRowId(null);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [expandedRoleId, expandedRowId]);

  const handleSort = (newSortBy: "name" | "date") => {
    const newSortOrder =
      sortBy === newSortBy && sortOrder === "asc" ? "desc" : "asc";
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);

    const params = new URLSearchParams(searchParams.toString());
    params.set("sortBy", newSortBy);
    params.set("sortOrder", newSortOrder);
    router.push(`/admin/users?${params.toString()}`);
  };

  const handleRoleChange = async (userId: string, newRole: "USER" | "ADMIN") => {
    startTransition(async () => {
      await updateUserRole(userId, newRole);
      setExpandedRoleId(null);
      router.refresh();
    });
  };

  const handleDeleteClick = (user: User) => {
    setSelectedUsers([user]);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    startTransition(async () => {
      for (const user of selectedUsers) {
        await deleteUser(user.id);
      }
      setSelectedUsers([]);
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
    <div className="w-full overflow-x-auto">
      <div className="mb-4 flex items-center justify-end gap-2">
        <button
          onClick={() => handleSort("name")}
          className="flex items-center gap-1 text-sm font-medium text-dark-400 dark:text-white hover:text-dark-600 dark:hover:text-white/80"
        >
          A-Z
          {sortBy === "name" && (
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
          )}
        </button>
      </div>

      <div className="rounded-md border border-gray-200 dark:border-[rgba(255,255,255,0.1)] overflow-hidden">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-gray-200 dark:border-[rgba(255,255,255,0.1)] bg-gray-50 dark:bg-[#1a1a1a]">
              <th className="px-6 py-3 text-left text-xs font-semibold text-dark-400 dark:text-white uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-dark-400 dark:text-white uppercase tracking-wider">
                Date Joined
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-dark-400 dark:text-white uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-dark-400 dark:text-white uppercase tracking-wider">
                Books Borrowed
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-dark-400 dark:text-white uppercase tracking-wider">
                University ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-dark-400 dark:text-white uppercase tracking-wider">
                ID Card
              </th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-dark-400 dark:text-white uppercase tracking-wider">
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-[#111111] divide-y divide-gray-200 dark:divide-[rgba(255,255,255,0.1)]">
            {users.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-sm text-light-500 dark:text-muted-foreground">
                  No users found
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr
                  key={user.id}
                  className="hover:bg-gray-50 dark:hover:bg-[#1a1a1a] transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-amber-100 dark:bg-amber-100 text-dark-400 dark:text-dark-400 text-sm">
                          {getInitials(user.fullName)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium text-dark-400 dark:text-white">
                          {user.fullName}
                        </p>
                        <p className="text-xs text-light-500 dark:text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-400 dark:text-white">
                    {formatDate(user.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div
                      className="relative"
                      ref={(el) => {
                        if (el) {
                          dropdownRefs.current.set(user.id, el);
                        } else {
                          dropdownRefs.current.delete(user.id);
                        }
                      }}
                    >
                      <button
                        onClick={() =>
                          setExpandedRoleId(
                            expandedRoleId === user.id ? null : user.id
                          )
                        }
                        className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ${
                          user.role === "ADMIN"
                            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400"
                        }`}
                      >
                        {user.role || "USER"}
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
                            expandedRoleId === user.id ? "rotate-180" : ""
                          }`}
                        >
                          <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                      </button>
                      {expandedRoleId === user.id && (
                        <div className="absolute left-0 top-full z-10 mt-1 w-32 rounded-md border border-gray-200 dark:border-[rgba(255,255,255,0.1)] dark:shadow-none bg-white dark:bg-[#111111] shadow-lg">
                          <button
                            onClick={() => handleRoleChange(user.id, "USER")}
                            className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-light-300 dark:hover:bg-dark-600"
                          >
                            <span className="text-dark-400 dark:text-white">User</span>
                            {user.role === "USER" && (
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
                            onClick={() => handleRoleChange(user.id, "ADMIN")}
                            className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-light-300 dark:hover:bg-dark-600"
                          >
                            <span className="text-dark-400 dark:text-white">Admin</span>
                            {user.role === "ADMIN" && (
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-400 dark:text-white">
                    {user.booksBorrowed || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-400 dark:text-white">
                    {user.universityId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <a
                      href={getUniversityCardUrl(user.universityCard)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-primary-admin hover:underline"
                    >
                      View
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
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                        <polyline points="15 3 21 3 21 9"></polyline>
                        <line x1="10" y1="14" x2="21" y2="3"></line>
                      </svg>
                    </a>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div
                      className="relative inline-block"
                      ref={(el) => {
                        if (el) {
                          rowMenuRefs.current.set(user.id, el);
                        } else {
                          rowMenuRefs.current.delete(user.id);
                        }
                      }}
                    >
                      <button
                        onClick={() =>
                          setExpandedRowId(
                            expandedRowId === user.id ? null : user.id
                          )
                        }
                        className="text-light-500 dark:text-muted-foreground hover:text-dark-400 dark:hover:text-white transition-colors"
                        aria-label="Row options"
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
                          <circle cx="12" cy="12" r="1"></circle>
                          <circle cx="12" cy="5" r="1"></circle>
                          <circle cx="12" cy="19" r="1"></circle>
                        </svg>
                      </button>
                      {expandedRowId === user.id && (
                        <div className="absolute right-0 top-full z-10 mt-1 w-48 rounded-md border border-gray-200 dark:border-[rgba(255,255,255,0.1)] dark:shadow-none bg-white dark:bg-[#111111] shadow-lg">
                          <button
                            onClick={() => {
                              handleDeleteClick(user);
                              setExpandedRowId(null);
                            }}
                            className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
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
                              <polyline points="3 6 5 6 21 6"></polyline>
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            </svg>
                            Delete User
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <DeleteUserDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        users={selectedUsers}
        onConfirm={handleDeleteConfirm}
        isPending={isPending}
      />
    </div>
  );
};

export default UsersTable;

