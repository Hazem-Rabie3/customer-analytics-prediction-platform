"use client";

import React, { useState } from "react";
import CustomerForm from "../components/CustomerForm";
import ResultCard from "../components/ResultCard";
import { CustomerData, PredictionResult } from "../types";

export default function DashboardPage() {
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handlePredict = async (data: CustomerData) => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => null);
        throw new Error(
          errJson?.error ||
            `Prediction failed with status code ${response.status}`
        );
      }

      const resData: PredictionResult = await response.json();
      setResult(resData);
    } catch (err: any) {
      console.error("Prediction request failed:", err);
      setErrorMessage(
        err.message || "An unexpected error occurred while running prediction."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Background Glow Accents */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      {/* Top Navbar */}
      <header className="relative z-10 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 via-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                />
              </svg>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-base tracking-tight text-white">
                  CustomerML
                </span>
                <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 rounded border border-indigo-500/30">
                  v2.0
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Predictive Spending & Behavioral Clustering
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs text-slate-300">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>FastAPI Backend Active</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Hero Title */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-100">
            Customer Analytics Dashboard
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Input granular customer demographic, web engagement, and campaign
            interaction data to compute predicted lifetime spending and automated
            segment marketing actions.
          </p>
        </div>

        {/* Global Error Alert */}
        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start space-x-3 text-rose-300 animate-fade-in">
            <svg
              className="w-5 h-5 text-rose-400 shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div className="text-xs sm:text-sm">
              <span className="font-semibold block mb-0.5">
                Prediction Request Error
              </span>
              <span>{errorMessage}</span>
            </div>
          </div>
        )}

        {/* Responsive Split Layout: Form Left/Top, Result Right/Bottom */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left / Top Form (7 Columns) */}
          <div className="lg:col-span-7 xl:col-span-8">
            <CustomerForm onSubmit={handlePredict} isLoading={isLoading} />
          </div>

          {/* Right / Bottom Sticky Result Card (5 Columns) */}
          <div className="lg:col-span-5 xl:col-span-4 lg:sticky lg:top-24 space-y-4">
            <ResultCard result={result} isLoading={isLoading} />

            {/* Explanatory Info Card */}
            <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/60 text-xs text-slate-400 space-y-2">
              <div className="font-semibold text-slate-300 flex items-center space-x-1.5">
                <svg
                  className="w-3.5 h-3.5 text-indigo-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>Segment Taxonomy Reference</span>
              </div>
              <ul className="space-y-1 pl-4 list-disc text-slate-400 text-[11px]">
                <li>
                  <strong className="text-amber-300">Cluster 0 (VIP):</strong>{" "}
                  Premium buyers, high basket size, discount-insensitive.
                </li>
                <li>
                  <strong className="text-sky-300">Cluster 1 (High-Potential):</strong>{" "}
                  Prime candidates for re-engagement and welcome incentives.
                </li>
                <li>
                  <strong className="text-emerald-300">Cluster 2 (Stable Mid):</strong>{" "}
                  Consistent spenders ideal for category cross-sell.
                </li>
                <li>
                  <strong className="text-slate-300">Cluster 3 (Low):</strong>{" "}
                  Cost-optimized automated email marketing candidate.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-800/60 py-6 text-center text-xs text-slate-500 mt-auto">
        <p>Customer Analytics ML Platform &bull; FastAPI + Scikit-Learn + Next.js App Router</p>
      </footer>
    </div>
  );
}
