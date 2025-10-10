"use client";

import React from "react";
import Button from "@/ui/components/basic/Button";

/* ── Types ─────────────────────────────────────────────────────────── */
export type SlotItem = {
  id: string;
  status: "available" | "booked" | "cancelled";
  start_time: string;
  end_time: string;
  court: number;
  courtName: string;
};

export type BookingItem = {
  bookingId: string;
  dateISO: string;
  slots: SlotItem[];
};

export type UpcomingModalProps = {
  bookings: BookingItem[];
  onCancel?: (booking: BookingItem) => void;
  onViewDetail?: (booking: BookingItem) => void;
};

/* ── helpers ───────────────────────────────────────────────────────── */
function fmtDateShort(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
function timeRange(a: string, b: string) {
  return `${a} – ${b}`;
}

export default function UpcomingModal({
  bookings,
  onCancel,
  onViewDetail,
}: UpcomingModalProps) {
  return (
    <aside className="rounded-2xl border bg-white p-4 shadow-sm">
      <h3 className="mb-3 text-lg font-semibold">Upcoming Booking</h3>

      {bookings.length === 0 ? (
        <div className="rounded-xl border border-dashed p-6 text-sm text-neutral-500">
          No upcoming bookings.
        </div>
      ) : (
        <ul className="space-y-4">
          {bookings.map((bk) => (
            <li key={bk.bookingId} className="rounded-xl border p-4">
              {/* Booking ID row with actions */}
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm text-neutral-600">
                  <div className="text-neutral-500">Booking ID:</div>
                  <div className="font-mono text-base">{bk.bookingId}</div>
                </div>
               <div className="flex flex-row items-center gap-2">
                <Button 
                        label="Cancel Booking"
                        bgColor="bg-copper-rust hover:bg-red-700 active:bg-gray-400"
                        textColor="text-white"
                        onClick={() => onCancel?.(bk)}
                    />
                </div>
              </div>

              {/* Slots inside grouped booking */}
              <div className="divide-y divide-neutral-200">
                {bk.slots.map((s) => (
                  <div
                    key={`${bk.bookingId}-${s.id}`}
                    className="py-3"
                  >
                    <div className="text-lg font-semibold">Court {s.courtName}</div>
                    <div className="text-sm text-neutral-600">
                      {fmtDateShort(bk.dateISO)}, {timeRange(s.start_time, s.end_time)}
                    </div>
                  </div>
                ))}
              </div>
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
}
