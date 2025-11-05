"use client";

import React from "react";
import dayjs from "dayjs";
import { ClipboardList } from "lucide-react";
import BookingCard, { BookingRow } from "@/ui/components/bookingpage/BookingCard";

type DailyBookingPanelProps = {
  selectedDate: string; // YYYY-MM-DD
  groupedBookings: Record<string, BookingRow[]>;
  isLoading?: boolean;
  isError?: boolean;
};

export default function DailyBookingPanel({
  selectedDate,
  groupedBookings,
  isLoading,
  isError,
}: DailyBookingPanelProps) {
  const bookings = groupedBookings[selectedDate] || [];

  return (
    <div className="flex h-full flex-col rounded-2xl border border-[#1C4532]/30 bg-white p-5 shadow-sm">
      {/* Header */}
      <div className="mb-5 border-b-4 border-pine/80 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="rounded-full bg-pine/10 p-2 text-pine">
            <ClipboardList size={18} strokeWidth={2.2} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-pine">Daily Bookings</h2>
            <p className="text-sm font-medium text-neutral-500">
              {dayjs(selectedDate).format("D MMM YYYY")} · Manager view
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="scrollbar-thin max-h-[60vh] overflow-y-auto rounded-xl bg-neutral-50/70 p-4 shadow-inner">
        {isLoading ? (
          <div className="flex h-56 flex-col items-center justify-center text-neutral-500">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-pine border-t-transparent mb-3" />
            <p className="text-sm">Fetching booking data...</p>
          </div>
        ) : isError ? (
          <p className="text-center text-sm text-red-500">
            Unable to load bookings.
          </p>
        ) : bookings.length === 0 ? (
          <p className="rounded-lg bg-neutral-100 text-center text-sm text-neutral-500 py-3">
            No bookings on this day.
          </p>
        ) : (
          <ul className="space-y-4">
            {bookings.map((b) => (
              <BookingCard
                key={b.booking_id}
                booking={b}
                showCancelButton={false}
                showUserName={true}
                showCheckinButton={true}
              />
            ))}
          </ul>
        )}
      </div>

      {/* Footer */}
      <p className="mt-4 text-center text-sm text-neutral-500">
        *For management view only. To update status, go to Manager Logs.
      </p>
    </div>
  );
}
