"use client";

import React from "react";
import { useRouter } from "next/navigation";

type ReceiptItem = {
  courtNo: number;
  courtName: string;
  dateLabel: string;   // e.g. "5 Sep 2025"
  timeLabel: string;   // e.g. "17:00 - 19:00"
  coins: number;       // positive integer; จะแสดงเป็น -coins
};

export type BookingReceipt = {
  bookingId?: string | null;   // ถ้ามีหลาย ID ให้ส่งอันแรกมาก็ได้
  items: ReceiptItem[];
  totalCoins: number;          // sum(items.coins)
};

type Props = {
  open: boolean;
  onClose: () => void;
  receipt: BookingReceipt | null;
};

export default function BookingReceiptModal({ open, onClose, receipt }: Props) {
  const router = useRouter();
  if (!open || !receipt) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-xl">
        {/* top check */}
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 h-12 w-12 rounded-full bg-teal-700 text-white grid place-items-center text-2xl">
          ✓
        </div>

        {/* header */}
        <div className="px-6 pt-10 text-center">
          <h2 className="text-3xl font-extrabold text-teal-800 tracking-tight">
            BOOKING CONFIRMED!
          </h2>
          <p className="mt-1 text-sm text-neutral-500">
            Your booking has been successfully recorded.
          </p>
        </div>

        {/* body */}
        <div className="px-6 pb-6 pt-5">
          <div className="flex items-center justify-between text-sm font-extrabold text-neutral-800">
            <span>Booking ID</span>
            <span className="tabular-nums">
              {receipt.bookingId ?? "-"}
            </span>
          </div>

          <div className="mt-4 border-t" />

          {/* line items */}
          {receipt.items.map((it, i) => (
            <div key={i} className="py-4 border-b last:border-b-0">
              <div className="grid grid-cols-2 gap-y-1 text-sm">
                <div className="font-semibold text-neutral-500">Court No.</div>
                <div className="text-right font-semibold">{it.courtName || `Court ${it.courtNo}`}</div>

                <div className="font-semibold text-neutral-500">Date</div>
                <div className="text-right">{it.dateLabel}</div>

                <div className="font-semibold text-neutral-500">Time</div>
                <div className="text-right tabular-nums">{it.timeLabel}</div>

                <div className="font-semibold text-neutral-500">Coins Deducted</div>
                <div className="text-right font-bold tabular-nums text-rose-600">-{it.coins}</div>
              </div>
            </div>
          ))}

          {/* total */}
          <div className="mt-3 flex items-center justify-between text-base font-extrabold">
            <span>Total Coins Deducted</span>
            <span className="tabular-nums text-rose-700">-{receipt.totalCoins}</span>
          </div>

          {/* actions */}
          <div className="mt-6 flex items-center justify-center gap-3">
            <button
              onClick={() => {
                onClose();
                router.push("/history");
              }}
              className="rounded-lg bg-teal-700 px-5 py-2.5 text-white font-semibold hover:bg-teal-600"
            >
              View Booking History
            </button>
            <button
              onClick={onClose}
              className="rounded-lg border border-neutral-300 px-4 py-2 text-neutral-700 hover:bg-neutral-50"
            >
              Close
            </button>
          </div>
        </div>

        {/* close X */}
        <button
          className="absolute right-3 top-3 text-2xl text-neutral-500 hover:text-neutral-700"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>
      </div>
    </div>
  );
}
