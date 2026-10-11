"use client";

import React, { useState, FormEvent, ChangeEvent } from "react";
import { CustomerData, EducationLevel, MaritalStatus } from "../types";

interface CustomerFormProps {
  onSubmit: (data: CustomerData) => Promise<void>;
  isLoading: boolean;
}

const DEFAULT_VALUES: CustomerData = {
  Year_Birth: 1975,
  Education: "Graduation",
  Marital_Status: "Married",
  Income: 55000,
  Kidhome: 0,
  Teenhome: 1,
  Dt_Customer: "04-10-2013",
  Recency: 34,
  NumWebVisitsMonth: 5,
  NumDealsPurchases: 2,
  NumWebPurchases: 4,
  NumCatalogPurchases: 3,
  NumStorePurchases: 6,
  Complain: 0,
  AcceptedCmp1: 0,
  AcceptedCmp2: 0,
  AcceptedCmp3: 0,
  AcceptedCmp4: 0,
  AcceptedCmp5: 0,
  Response: 0,
};

const EDUCATION_OPTIONS: EducationLevel[] = [
  "2n Cycle",
  "Basic",
  "Graduation",
  "Master",
  "PhD",
];

const MARITAL_STATUS_OPTIONS: MaritalStatus[] = [
  "Single",
  "Married",
  "Together",
  "Divorced",
  "Widow",
  "Alone",
  "Absurd",
  "YOLO",
];

export default function CustomerForm({
  onSubmit,
  isLoading,
}: CustomerFormProps) {
  const [formData, setFormData] = useState<CustomerData>(DEFAULT_VALUES);

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    if (type === "number") {
      setFormData((prev) => ({
        ...prev,
        [name]: value === "" ? null : Number(value),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleCheckboxChange = (name: keyof CustomerData) => {
    setFormData((prev) => ({
      ...prev,
      [name]: prev[name] === 1 ? 0 : 1,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  const handleResetToExample = () => {
    setFormData(DEFAULT_VALUES);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 1. Demographics Section */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-sm">
        <div className="flex items-center space-x-3 mb-5 border-b border-slate-800/80 pb-3">
          <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-100">
              Customer Demographics
            </h3>
            <p className="text-xs text-slate-400">
              Personal attributes and household composition
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Birth Year
            </label>
            <input
              type="number"
              name="Year_Birth"
              min={1900}
              max={2010}
              required
              value={formData.Year_Birth ?? ""}
              onChange={handleInputChange}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Education Level
            </label>
            <select
              name="Education"
              value={formData.Education}
              onChange={handleInputChange}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
            >
              {EDUCATION_OPTIONS.map((edu) => (
                <option key={edu} value={edu}>
                  {edu}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Marital Status
            </label>
            <select
              name="Marital_Status"
              value={formData.Marital_Status}
              onChange={handleInputChange}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
            >
              {MARITAL_STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Annual Income ($)
            </label>
            <input
              type="number"
              name="Income"
              min={0}
              max={700000}
              placeholder="e.g. 54000"
              value={formData.Income ?? ""}
              onChange={handleInputChange}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Small Children (Kidhome)
            </label>
            <input
              type="number"
              name="Kidhome"
              min={0}
              max={2}
              required
              value={formData.Kidhome}
              onChange={handleInputChange}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Teenagers (Teenhome)
            </label>
            <input
              type="number"
              name="Teenhome"
              min={0}
              max={2}
              required
              value={formData.Teenhome}
              onChange={handleInputChange}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
            />
          </div>
        </div>
      </div>

      {/* 2. Engagement & Web Activity Section */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-sm">
        <div className="flex items-center space-x-3 mb-5 border-b border-slate-800/80 pb-3">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-100">
              Engagement & Purchasing Channels
            </h3>
            <p className="text-xs text-slate-400">
              Tenure, visits, recency, and purchase habits
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Enrollment Date (DD-MM-YYYY)
            </label>
            <input
              type="text"
              name="Dt_Customer"
              pattern="^\d{2}-\d{2}-\d{4}$"
              placeholder="04-10-2013"
              required
              value={formData.Dt_Customer}
              onChange={handleInputChange}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Recency (Days since last order)
            </label>
            <input
              type="number"
              name="Recency"
              min={0}
              max={99}
              required
              value={formData.Recency}
              onChange={handleInputChange}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Web Visits / Month
            </label>
            <input
              type="number"
              name="NumWebVisitsMonth"
              min={0}
              max={20}
              required
              value={formData.NumWebVisitsMonth}
              onChange={handleInputChange}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Deals Purchases
            </label>
            <input
              type="number"
              name="NumDealsPurchases"
              min={0}
              max={15}
              required
              value={formData.NumDealsPurchases}
              onChange={handleInputChange}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Web Purchases
            </label>
            <input
              type="number"
              name="NumWebPurchases"
              min={0}
              max={27}
              required
              value={formData.NumWebPurchases}
              onChange={handleInputChange}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Catalog Purchases
            </label>
            <input
              type="number"
              name="NumCatalogPurchases"
              min={0}
              max={28}
              required
              value={formData.NumCatalogPurchases}
              onChange={handleInputChange}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Store Purchases
            </label>
            <input
              type="number"
              name="NumStorePurchases"
              min={0}
              max={13}
              required
              value={formData.NumStorePurchases}
              onChange={handleInputChange}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
            />
          </div>

          <div className="flex items-center pt-5">
            <label className="relative flex items-center space-x-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={formData.Complain === 1}
                onChange={() => handleCheckboxChange("Complain")}
                className="w-5 h-5 rounded text-rose-500 bg-slate-950 border-slate-700 focus:ring-rose-500/30 focus:ring-offset-0 focus:ring-2"
              />
              <span className="text-xs font-medium text-slate-200">
                Customer Filed Complaint
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* 3. Marketing Campaigns Section */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-sm">
        <div className="flex items-center space-x-3 mb-5 border-b border-slate-800/80 pb-3">
          <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"
              />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-100">
              Marketing Campaign Responses
            </h3>
            <p className="text-xs text-slate-400">
              Select which promotional campaigns the customer accepted
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { key: "AcceptedCmp1", label: "Campaign 1" },
            { key: "AcceptedCmp2", label: "Campaign 2" },
            { key: "AcceptedCmp3", label: "Campaign 3" },
            { key: "AcceptedCmp4", label: "Campaign 4" },
            { key: "AcceptedCmp5", label: "Campaign 5" },
            { key: "Response", label: "Last Campaign" },
          ].map(({ key, label }) => {
            const isChecked = formData[key as keyof CustomerData] === 1;
            return (
              <button
                key={key}
                type="button"
                onClick={() => handleCheckboxChange(key as keyof CustomerData)}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-medium transition-all ${
                  isChecked
                    ? "bg-indigo-600/20 border-indigo-500 text-indigo-300 shadow-sm shadow-indigo-500/20"
                    : "bg-slate-950/70 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                }`}
              >
                <div
                  className={`w-3.5 h-3.5 rounded-full mb-1.5 transition-colors ${
                    isChecked ? "bg-indigo-400 ring-2 ring-indigo-400/30" : "bg-slate-700"
                  }`}
                />
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={handleResetToExample}
          className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors"
        >
          Reset to Sample Data
        </button>

        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-sky-500 via-indigo-500 to-purple-600 hover:from-sky-400 hover:via-indigo-400 hover:to-purple-500 text-white font-medium text-sm rounded-xl shadow-lg shadow-indigo-500/25 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-slate-950 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {isLoading ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <span>Predicting Spending & Segment...</span>
            </>
          ) : (
            <>
              <span>Run AI Prediction</span>
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
