"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";

interface User {
  id: string;
  fullName: string;
  email: string;
  role: "USER" | "ADMIN" | null;
}

interface DeleteUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  users: User[];
  onConfirm: () => void;
  isPending?: boolean;
}

export function DeleteUserDialog({
  open,
  onOpenChange,
  users,
  onConfirm,
  isPending = false,
}: DeleteUserDialogProps) {
  const handleDelete = () => {
    onConfirm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-white dark:bg-[#111111] border dark:border-[rgba(255,255,255,0.1)]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-dark-400 dark:text-white">
            Delete Users
          </DialogTitle>
          <DialogDescription className="text-sm text-light-500 dark:text-muted-foreground">
            Are you sure you want to delete these users? This action is permanent and cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-3">
          {users.map((user) => (
            <div
              key={user.id}
              className="flex flex-row items-center gap-3 rounded-xl border border-light-400 dark:border-[rgba(255,255,255,0.1)] bg-light-300 dark:bg-[#111111] dark:shadow-none px-4 py-3"
            >
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-amber-100 dark:bg-amber-100 text-dark-400 dark:text-dark-400">
                  {getInitials(user.fullName)}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col flex-1 min-w-0">
                <p className="font-semibold text-sm text-dark-400 dark:text-white truncate">
                  {user.fullName}
                </p>
                <p className="text-xs text-light-500 dark:text-muted-foreground truncate">
                  {user.email}
                </p>
              </div>
              <div className="text-xs font-medium text-dark-400 dark:text-white">
                {user.role || "User"}
              </div>
            </div>
          ))}
        </div>

        <DialogFooter className="flex-row justify-end gap-2 sm:gap-0 mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
            className="dark:bg-[#111111] dark:text-white dark:border-[rgba(255,255,255,0.1)]"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isPending}
            className="bg-red-500 hover:bg-red-600 text-white"
          >
            Delete users
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

