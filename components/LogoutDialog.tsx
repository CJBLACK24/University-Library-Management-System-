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
import LogoutForm from "./LogoutForm";

interface LogoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LogoutDialog({ open, onOpenChange }: LogoutDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-white dark:bg-[#111111] border dark:border-[rgba(255,255,255,0.1)]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-dark-400 dark:text-white">
            Log Out
          </DialogTitle>
          <DialogDescription className="text-sm text-light-500 dark:text-muted-foreground">
            Are you sure you want to log out? You will need to sign in again to access your account.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-row justify-end gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="dark:bg-[#111111] dark:text-white dark:border-[rgba(255,255,255,0.1)]"
          >
            Cancel
          </Button>
          <LogoutForm />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

