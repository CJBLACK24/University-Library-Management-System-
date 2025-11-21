"use client";

import React, { useState, useEffect } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { getChartData } from "@/lib/actions/dashboard";

type Period = "7d" | "30d" | "90d";

interface ChartDataPoint {
  date: string;
  borrowedBooks: number;
  newUsers: number;
  newBooks: number;
}

const AnalyticsChart = () => {
  const [period, setPeriod] = useState<Period>("30d");
  const [data, setData] = useState<ChartDataPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const result = await getChartData(period);
      if (result.success) {
        setData(result.data);
      }
      setLoading(false);
    };

    fetchData();
  }, [period]);

  const periodButtons = [
    { label: "Last 7 days", value: "7d" as Period },
    { label: "Last 30 days", value: "30d" as Period },
    { label: "Last 3 months", value: "90d" as Period },
  ];

  return (
    <div className="rounded-lg bg-[#0a0a0a] dark:bg-[#0a0a0a] border border-[rgba(255,255,255,0.08)] dark:border-[rgba(255,255,255,0.08)] p-6">
      <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h3 className="text-lg font-semibold text-light-100 dark:text-white">
            Library Activity
          </h3>
          <p className="text-sm text-light-400 dark:text-muted-foreground">
            Total for the last {period === "7d" ? "7 days" : period === "30d" ? "30 days" : "3 months"}
          </p>
        </div>

        <div className="inline-flex items-center rounded-lg border border-light-400 dark:border-[rgba(255,255,255,0.2)] bg-transparent p-1 gap-1">
          {periodButtons.map((btn) => (
            <button
              key={btn.value}
              onClick={() => setPeriod(btn.value)}
              className={`rounded-md px-4 py-2 text-sm font-medium transition-all duration-200 ${
                period === btn.value
                  ? "bg-light-300 dark:bg-[rgba(255,255,255,0.1)] text-dark-400 dark:text-white shadow-sm"
                  : "bg-transparent text-light-400 dark:text-muted-foreground hover:text-dark-400 dark:hover:text-white"
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex h-[400px] items-center justify-center">
          <div className="text-light-400">Loading chart data...</div>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart
            data={data}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorBorrowed" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#888888" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#888888" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6b7280" stopOpacity={0.6} />
                <stop offset="95%" stopColor="#6b7280" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="colorBooks" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#9ca3af" stopOpacity={0.5} />
                <stop offset="95%" stopColor="#9ca3af" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" opacity={0.3} vertical={false} />
            <XAxis
              dataKey="date"
              stroke="#888888"
              style={{ fontSize: "12px" }}
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                });
              }}
            />
            <YAxis
              stroke="#888888"
              style={{ fontSize: "12px" }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              cursor={{ stroke: "#333333", strokeWidth: 1, strokeDasharray: "3 3" }}
              contentStyle={{
                backgroundColor: "#0a0a0a",
                border: "1px solid #333333",
                borderRadius: "10px",
                color: "#ffffff",
                padding: "12px",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.5)",
              }}
              labelStyle={{ color: "#e5e7eb", marginBottom: "8px", fontWeight: 600 }}
            />
            <Legend
              wrapperStyle={{ paddingTop: "20px" }}
              iconType="circle"
              formatter={(value) => (
                <span style={{ color: "#888888", fontSize: "14px" }}>
                  {value}
                </span>
              )}
            />
            <Area
              type="natural"
              dataKey="borrowedBooks"
              stroke="#888888"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorBorrowed)"
              name="Borrowed Books"
            />
            <Area
              type="natural"
              dataKey="newUsers"
              stroke="#6b7280"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorUsers)"
              name="New Users"
            />
            <Area
              type="natural"
              dataKey="newBooks"
              stroke="#9ca3af"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorBooks)"
              name="New Books"
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default AnalyticsChart;
