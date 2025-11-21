"use client";

import { Button } from "@/components/ui/button";

interface ApproveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
}

const ApproveModal = ({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
}: ApproveModalProps) => {
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
          <div className="mb-4 flex flex-col items-center">
            <div className="mb-2 flex h-20 w-20 items-center justify-center rounded-full bg-green-500">
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
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
            <div className="relative -mt-4 flex gap-2">
              <div className="h-12 w-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                R
              </div>
              <div className="h-12 w-12 rounded-full bg-green-500 flex items-center justify-center text-white font-bold -ml-4">
                Y
              </div>
            </div>
          </div>

          <h2 className="mb-4 text-2xl font-semibold text-dark-400 dark:text-white">
            Approve Book Request
          </h2>
          <p className="mb-6 text-base text-light-500 dark:text-muted-foreground">
            Approve the student's account request and grant access. A confirmation email will be sent upon approval.
          </p>

          <Button
            onClick={onConfirm}
            disabled={isLoading}
            className="w-full bg-green-500 text-white hover:bg-green-600 disabled:opacity-50"
          >
            {isLoading ? "Processing..." : "Approve & Send Confirmation"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ApproveModal;

