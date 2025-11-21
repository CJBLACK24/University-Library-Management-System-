"use client";

import React from "react";

interface DownloadReceiptButtonProps {
  receiptId: string;
}

const DownloadReceiptButton = ({ receiptId }: DownloadReceiptButtonProps) => {
  const handleDownload = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const link = document.createElement("a");
    link.href = `/api/receipts/${receiptId}`;
    link.download = `receipt-${receiptId}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <button
      type="button"
      onClick={handleDownload}
      className="absolute bottom-2 right-2 z-10 flex items-center gap-2 rounded-md bg-primary px-3 py-1.5 text-sm text-dark-100 hover:bg-primary/90"
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
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
        <polyline points="7 10 12 15 17 10"></polyline>
        <line x1="12" y1="15" x2="12" y2="3"></line>
      </svg>
      Download Receipt
    </button>
  );
};

export default DownloadReceiptButton;

