"use client";

import React from "react";
import { PredictionResult } from "../types";

interface ResultCardProps {
  result: PredictionResult | null;
  isLoading: boolean;
}

const SEGMENT_THEMES: Record<
  number,
  {
    badgeClass: string;
    borderClass: string;
    glowClass: string;
    iconColor: string;
  }
> = {
  // Cluster 0: Gold / Yellow for VIP
  0: {
    badgeClass:
      "bg-amber-400/10 text-amber-300 border-amber-400/30 ring-1 ring-amber-400/20",
    borderClass: "border-amber-500/40",
    glowClass: "from-amber-500/15 via-yellow-500/5 to-transparent",
    iconColor: "text-amber-400",
  },
  // Cluster 1: Blue for High-Potential
  1: {
    badgeClass:
      "bg-sky-400/10 text-sky-300 border-sky-400/30 ring-1 ring-sky-400/20",
    borderClass: "border-sky-500/40",
    glowClass: "from-sky-500/15 via-blue-500/5 to-transparent",
    iconColor: "text-sky-400",
  },
  // Cluster 2: Green for Stable Mid
  2: {
    badgeClass:
      "bg-emerald-400/10 text-emerald-300 border-emerald-400/30 ring-1 ring-emerald-400/20",
    borderClass: "border-emerald-500/40",
    glowClass: "from-emerald-500/15 via-teal-500/5 to-transparent",
    iconColor: "text-emerald-400",
  },
  // Cluster 3: Gray for Low
  3: {
    badgeClass:
      "bg-slate-500/15 text-slate-300 border-slate-500/30 ring-1 ring-slate-400/10",
    borderClass: "border-slate-700/60",
    glowClass: "from-slate-600/10 via-slate-700/5 to-transparent",
    iconColor: "text-slate-400",
  },
};

export default function ResultCard({ result, isLoading }: ResultCardProps) {
  if (isLoading) {
    return (
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-2xl backdrop-blur-sm animate-pulse space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-4 w-32 bg-slate-800 rounded" />
          <div className="h-6 w-24 bg-slate-800 rounded-full" />
        </div>
        <div>
          <div className="h-3 w-28 bg-slate-800 rounded mb-2" />
          <div className="h-12 w-48 bg-slate-800 rounded-lg" />
        </div>
        <div className="p-4 bg-slate-950/60 rounded-xl space-y-2">
          <div className="h-4 w-36 bg-slate-800 rounded" />
          <div className="h-3 w-full bg-slate-800 rounded" />
          <div className="h-3 w-5/6 bg-slate-800 rounded" />
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="bg-slate-900/60 border border-dashed border-slate-800 rounded-2xl p-8 text-center backdrop-blur-sm flex flex-col items-center justify-center min-h-[380px]">
        <div className="w-14 h-14 rounded-2xl bg-slate-800/60 flex items-center justify-center text-slate-500 mb-4">
          <svg
            className="w-7 h-7"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
        </div>
        <h4 className="text-slate-200 font-semibold mb-1">
          Awaiting Customer Profile
        </h4>
        <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
          Configure the demographics, engagement parameters, and campaigns on the
          left, then trigger the AI model to see predicted value and segmentation.
        </p>
      </div>
    );
  }

  const theme =
    SEGMENT_THEMES[result.cluster_id] ?? SEGMENT_THEMES[3];

  const formattedSpending = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(result.predicted_spending);

  return (
    <div
      className={`relative overflow-hidden bg-gradient-to-b ${theme.glowClass} bg-slate-900/90 border ${theme.borderClass} rounded-2xl p-7 shadow-2xl backdrop-blur-md transition-all duration-300`}
    >
      {/* Top Header Badge */}
      <div className="flex items-start justify-between gap-3 mb-6">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
            Machine Learning Inference
          </span>
          <h3 className="text-base font-semibold text-slate-100">
            Customer Profile Summary
          </h3>
        </div>

        <div
          className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${theme.badgeClass}`}
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-current"></span>
          </span>
          <span>
            {result.customer_segment} (Cluster {result.cluster_id})
          </span>
        </div>
      </div>

      {/* Predicted Spending Section */}
      <div className="mb-6 p-5 bg-slate-950/70 border border-slate-800/80 rounded-xl">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-medium text-slate-400">
            Predicted Total Spending
          </span>
          <span className="text-[10px] text-slate-500 font-mono">
            XGBoost Model
          </span>
        </div>
        <div className="text-4xl md:text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-slate-300">
          {formattedSpending}
        </div>
        <p className="text-[11px] text-slate-400 mt-2">
          Estimated 2-year total customer expenditure across retail and online
          channels.
        </p>
      </div>

      {/* Marketing Strategy Section */}
      <div className="p-5 bg-slate-950/90 border border-slate-800 rounded-xl space-y-2">
        <div className="flex items-center space-x-2">
          <svg
            className={`w-4 h-4 ${theme.iconColor}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
            Recommended Action & Strategy
          </h4>
        </div>
        <p className="text-sm text-slate-300 leading-relaxed font-normal">
          {result.marketing_strategy}
        </p>
      </div>

      {/* Micro Metrics bar */}
      <div className="mt-5 pt-4 border-t border-slate-800/60 grid grid-cols-2 gap-3 text-center">
        <div className="p-2.5 rounded-lg bg-slate-950/40 border border-slate-800/40">
          <span className="text-[10px] uppercase tracking-wider text-slate-400 block mb-0.5">
            Model Engine
          </span>
          <span className="text-xs font-semibold text-slate-200">
            K-Means + XGBoost
          </span>
        </div>
        <div className="p-2.5 rounded-lg bg-slate-950/40 border border-slate-800/40">
          <span className="text-[10px] uppercase tracking-wider text-slate-400 block mb-0.5">
            Decision Protocol
          </span>
          <span className="text-xs font-semibold text-slate-200">
            High Precision
          </span>
        </div>
      </div>
    </div>
  );
}
