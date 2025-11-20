"use client";

import React, { useMemo } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import { Wallet } from "lucide-react";

const Field = dynamic(() => import("@/ui/components/basic/Field"), {
  ssr: false,
});

export type TopupFormValues = {
  amount: number | "";
  date: string;
  time: string;
  slip: File | null;
  note?: string;
};

type TopupFormProps = {
  values: TopupFormValues;
  onChange: (patch: Partial<TopupFormValues>) => void;
  onSubmit: () => void;
  onReset: () => void;
  loading?: boolean;
};

export default function PlayerTopupForm({
  values,
  onChange,
  onSubmit,
  onReset,
  loading = false,
}: TopupFormProps) {
  
  /* 🟢 ป้องกันบัค upload slip ซ้ำ */
  const fileInputKey = useMemo(() => Math.random(), [values.slip]);

  const canSubmit =
    !!values.amount &&
    Number(values.amount) >= 100 &&
    !!values.date &&
    !!values.time &&
    !!values.slip;

  return (
    <aside
      className="
        h-full flex flex-col 
        rounded-2xl border border-platinum bg-white 
        p-6 shadow-sm transition hover:shadow-md
      "
    >
      {/* Header */}
      <div className="mb-5 border-b-4 border-pine/80 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="rounded-full bg-pine/10 p-2 text-pine">
            <Wallet size={18} strokeWidth={2.2} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-pine">Top-Up Wallet</h2>
            <p className="text-sm font-medium text-neutral-500">
              Upload your slip and fill in payment details below.
            </p>
          </div>
        </div>
      </div>

      {/* Form Section */}
      <div className="grid gap-5 md:grid-cols-2">

        {/* Amount — full width */}
        <div className="md:col-span-2">
          <Field
            label="Payment amount (THB)"
            type="number"
            min={100}
            placeholder="Minimum 100"
            value={values.amount}
            onChange={(e) =>
              onChange({
                amount: e.target.value === "" ? "" : Number(e.target.value),
              })
            }
          />
        </div>

        {/* Date */}
        <Field
          label="Date of payment"
          type="date"
          value={values.date}
          onChange={(e) => onChange({ date: e.target.value })}
        />

        {/* Time */}
        <Field
          label="Time of payment"
          type="time"
          value={values.time}
          onChange={(e) => onChange({ time: e.target.value })}
        />

        {/* Upload Slip */}
        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-semibold text-gray-700">
            Upload your payment slip
          </label>

          <div className="relative">
            {/* Hidden file input */}
            <input
              key={fileInputKey}
              type="file"
              accept="image/*"
              className="absolute inset-0 z-10 cursor-pointer opacity-0"
              onChange={(e) => {
                const file = e.target.files?.[0] ?? null;
                onChange({ slip: file });
              }}
            />

            {/* Visible box */}
            <div
              className="
                flex items-center justify-between w-full 
                rounded-xl border border-platinum px-3 py-2.5 
                shadow-sm hover:border-pine/60 transition
              "
            >
              <span className="text-sm font-medium text-onyx truncate">
                {values.slip ? values.slip.name : "Choose payment slip file"}
              </span>

              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-pine/80"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4v16m8-8H4"
                />
              </svg>
            </div>
          </div>

          <p className="mt-1 text-xs text-neutral-500">
            JPG or PNG only • Max 5 MB
          </p>

          {values.slip && (
            <div className="mt-3 flex items-center gap-3">
              <div className="relative h-20 w-20 rounded-xl border border-platinum overflow-hidden bg-neutral-50">
                <Image
                  src={URL.createObjectURL(values.slip)}
                  alt="Slip Preview"
                  fill
                  className="object-contain"
                />
              </div>
              <div className="text-sm text-neutral-600">
                <b>Preview:</b> {values.slip.name}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Buttons */}
      <div className="mt-6 flex flex-col sm:flex-row gap-2">

        {/* Submit */}
        <button
          type="button"
          onClick={onSubmit}
          disabled={!canSubmit || loading}
          className="
            rounded-xl px-4 py-2.5 text-sm font-semibold text-white
            bg-pine hover:bg-cambridge
            disabled:bg-platinum disabled:text-white
            transition-colors
            scale-100 hover:scale-[1.02] active:scale-95 duration-150
          "
        >
          {loading ? "Submitting..." : "Submit Request"}
        </button>

        {/* Reset */}
        <button
          type="button"
          onClick={onReset}
          disabled={loading}
          className="
            rounded-xl px-4 py-2.5 text-sm font-semibold
            text-white bg-dimgray hover:bg-[#c8c8c8]
            disabled:bg-[#e0e0e0] disabled:text-[#777]
            transition-colors
          "
        >
          Reset
        </button>

      </div>
    </aside>
  );
}
