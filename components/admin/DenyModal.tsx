"use client";

import { Button } from "@/components/ui/button";

interface DenyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
}

const DenyModal = ({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
}: DenyModalProps) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-2xl bg-white dark:bg-[#111111] dark:border dark:border-[rgba(255,255,255,0.1)] p-8 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-light-500 hover:text-dark-400"
          aria-label="Close"
        >
          <svg
            width="24"
            height="24"
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

        <div className="flex flex-col items-center text-center">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-500">
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
          </div>

          <h2 className="mb-4 text-2xl font-semibold text-dark-400 dark:text-white">
            Deny Account Request
          </h2>
          <p className="mb-6 text-base text-light-500 dark:text-muted-foreground">
            Denying this request will notify the student they're not eligible due to unsuccessful ID card verification.
          </p>

          <Button
            onClick={onConfirm}
            disabled={isLoading}
            className="w-full bg-red-500 text-white hover:bg-red-600 disabled:opacity-50"
          >
            {isLoading ? "Processing..." : "Deny & Notify Student"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DenyModal;

