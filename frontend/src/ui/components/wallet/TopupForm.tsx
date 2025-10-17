"use client";

import Button from "@/ui/components/basic/Button";
import React from "react";

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
};

export default function TopupForm({
  values,
  onChange,
  onSubmit,
  onReset,
}: TopupFormProps) {
  const canSubmit =
    !!values.amount &&
    Number(values.amount) >= 100 &&
    !!values.date &&
    !!values.time &&
    !!values.slip;

  return (
    <section className="rounded-2xl border bg-white p-5 shadow-sm">
      <h3 className="mb-4 text-xl font-semibold">Top-Up Wallet</h3>

      {/* QR + Guidelines */}
      <div className="mb-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border p-4">
          <div className="mb-3 h-36 w-36 rounded-lg bg-neutral-100" />
          <div className="text-2xl font-semibold">Kbank</div>
          <div className="text-lg">Acc No: 123-456-789</div>
          <div className="text-lg">Name: Court’s Owner</div>
          <div className="mt-2 text-sm text-neutral-500">PromptPayQR</div>
        </div>

        <div className="rounded-2xl border p-4">
          <div className="text-lg font-semibold mb-2">Top-Up Guidelines</div>
          <ul className="list-disc pl-5 space-y-1 text-neutral-700">
            <li>Minimum top-up: <b>100 THB</b>.</li>
            <li>Upload a clear transfer slip image (JPG/PNG).</li>
            <li>Coins are credited after admin verification.</li>
          </ul>
        </div>
      </div>

      {/* Form */}
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Payment amount (THB)*">
          <input
            type="number"
            min={100}
            placeholder="Minimum 100"
            value={values.amount}
            onChange={(e) =>
              onChange({ amount: e.target.value === "" ? "" : Number(e.target.value) })
            }
            className="w-full rounded-xl border px-3 py-2"
          />
        </Field>
        <Field label="Date of payment*">
          <input
            type="date"
            value={values.date}
            onChange={(e) => onChange({ date: e.target.value })}
            className="w-full rounded-xl border px-3 py-2"
          />
        </Field>
        <Field label="Time of payment*">
          <input
            type="time"
            value={values.time}
            onChange={(e) => onChange({ time: e.target.value })}
            className="w-full rounded-xl border px-3 py-2"
          />
        </Field>
        <Field label="Upload your payment slip*">
          <input
            type="file"
            onChange={(e) => onChange({ slip: e.target.files?.[0] ?? null })}
            className="w-full rounded-xl border px-3 py-2"
          />
        </Field>

        <Field label="Note (optional)">
          <input
            type="text"
            placeholder="reference, bank name, etc."
            value={values.note ?? ""}
            onChange={(e) => onChange({ note: e.target.value })}
            className="w-full rounded-xl border px-3 py-2"
          />
        </Field>
      </div>

      <div className="mt-5 flex gap-2">
        <Button label="Submit Request" disabled={!canSubmit} onClick={onSubmit} />
        <Button
          label="Reset"
          bgColor="bg-neutral-200"
          textColor="text-neutral-800"
          onClick={onReset}
        />
      </div>
    </section>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="grid gap-1">
      <span className="text-sm font-medium">{label}</span>
      {children}
    </label>
  );
}
