"use client";

import React from "react";
import Image from "next/image";
import Button from "@/ui/components/basic/Button";
import dynamic from "next/dynamic";

const Field = dynamic(() => import("@/ui/components/basic/Field"), { ssr: false });

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
  const canSubmit =
    !!values.amount &&
    Number(values.amount) >= 100 &&
    !!values.date &&
    !!values.time &&
    !!values.slip;

  return (
    <section className="rounded-2xl border bg-white p-5 shadow-sm">
      <h3 className="mb-5 text-2xl font-bold">Top-Up Wallet</h3>

      {/* ─────────────────── Header: QR + Bank Info + Guidelines ─────────────────── */}
      <div className="mb-8 grid gap-6 md:grid-cols-[1.5fr_1.8fr]">
        {/* Left: QR + Bank Info */}
        <div className="rounded-3xl border p-6 shadow-sm h-full">
          <div className="grid items-center gap-5 md:grid-cols-[160px_1fr]">
            <div className="flex flex-col items-center">
              <Image
                src="/brand/qr-code.png"
                alt="PromptPay QR"
                width={150}
                height={150}
                className="rounded-lg object-contain"
                priority
              />
              <span className="mt-2 text-base text-neutral-500">
                PromptPay QR
              </span>
            </div>

            <div>
              <div className="mb-2 text-3xl font-extrabold">Kbank</div>
              <div className="mb-1 text-lg font-semibold">
                Acc No:{" "}
                <span className="font-medium tracking-wide">
                  123-456-789
                </span>
              </div>
              <div className="text-lg font-semibold">
                Name: <span className="font-medium">Court’s Owner</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Top-up Guidelines */}
        <div className="rounded-3xl border p-6 shadow-sm h-full">
          <div className="mb-4 text-2xl font-bold">Top-Up Guidelines</div>
          <ul className="space-y-3 text-lg leading-relaxed text-neutral-800 md:text-xl">
            <li>• Minimum top-up: <b>100 THB</b>.</li>
            <li>• Upload a clear transfer slip image (JPG/PNG).</li>
            <li>• Coins are credited after admin verification.</li>
          </ul>
        </div>
      </div>

      {/* ──────────────────────────── Form Section ──────────────────────────── */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Amount */}
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
        <div>
          <label className="mb-1 block font-medium text-gray-700">
            Upload your payment slip
          </label>

          <div className="relative">
            {/* Hidden file input overlay */}
            <input
              type="file"
              accept="image/*"
              id="slipUpload"
              className="absolute inset-0 z-10 cursor-pointer opacity-0"
              onChange={(e) => {
                const file = e.target.files?.[0] ?? null;
                onChange({ slip: file });
              }}
            />

            {/* Visible styled input box */}
            <div
              className={`
                flex items-center justify-between
                w-full rounded-xl border px-3 py-2.5 outline-none 
                shadow-[0_2px_0_rgba(0,0,0,.12)] border-platinum
                focus-within:shadow-none focus-within:ring-2 focus-within:ring-cambridge
                transition hover:border-cambridge hover:bg-emerald-50/20
              `}
            >
              <span className="text-sm font-medium text-onyx truncate">
                {values.slip ? values.slip.name : "Choose payment slip file"}
              </span>

              {/* Right icon */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 flex-shrink-0 text-black opacity-70"
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
              <div className="relative h-20 w-20 overflow-hidden rounded-xl border bg-neutral-50">
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



      {/* ───────────────────────────── Buttons ───────────────────────────── */}
      <div className="mt-6 flex gap-2">
        <Button
          label={loading ? "Submitting..." : "Submit Request"}
          disabled={!canSubmit || loading}
          onClick={onSubmit}
        />
        <Button
          label="Reset"
          bgColor="bg-neutral-200"
          textColor="text-neutral-800"
          onClick={onReset}
          disabled={loading}
        />
      </div>
    </div>  
    </section>
  );
}