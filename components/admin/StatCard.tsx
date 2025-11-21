import React from "react";

interface StatCardProps {
  label: string;
  count: number;
  change: number;
}

const StatCard = ({ label, count, change }: StatCardProps) => {
  const isPositive = change >= 0;
  const changeColor = isPositive ? "text-green-500" : "text-red-500";
  const arrowIcon = isPositive ? (
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
      <polyline points="18 15 12 9 6 15"></polyline>
    </svg>
  ) : (
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
      <polyline points="6 9 12 15 18 9"></polyline>
    </svg>
  );

  return (
    <div className="stat">
      <div className="stat-info">
        <p className="stat-label">{label}</p>
        <div className={`flex items-center gap-1 ${changeColor}`}>
          {arrowIcon}
          <span className="text-sm font-medium">{Math.abs(change)}</span>
        </div>
      </div>
      <p className="stat-count">{count}</p>
    </div>
  );
};

export default StatCard;

