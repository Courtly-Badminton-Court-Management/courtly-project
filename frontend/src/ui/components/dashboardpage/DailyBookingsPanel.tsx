"use client";

import React, { useMemo } from "react";
import dayjs from "dayjs";
import { ClipboardList, Clock3 } from "lucide-react";
import BookingCard from "@/ui/components/bookingpage/BookingCard";
import type { BookingRow } from "@/api-client/extras/types";

type Props = {
  selectedDate: string;
  groupedBookings: Record<string, BookingRow[]>;
  totalBookingsToday: number;
  isLoading?: boolean;
  isError?: boolean;
  onCheckIn?: (b: BookingRow) => void;
};

export default function DailyBookingsPanel({
  selectedDate,
  groupedBookings,
  totalBookingsToday,
  isLoading,
  isError,
  onCheckIn,
}: Props) {
  const bookings = groupedBookings[selectedDate] || [];
  const totalToday = totalBookingsToday;
  const leftToCheckin = bookings.length;

  /* -------------------------------------------------------------
      COUNTING STATS
     ------------------------------------------------------------- */


  return (
    <div className="flex h-full flex-col rounded-2xl border border-pine/30 bg-white p-5 shadow-sm">
      {/* Header */}
      <div className="mb-5 border-b-4 border-pine/80 pb-2 flex items-center justify-between">
        
        {/* LEFT SECTION */}
        <div className="flex items-center gap-2">
          <div className="rounded-full bg-pine/10 p-2 text-pine">
            <ClipboardList size={18} strokeWidth={2.2} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-pine">Daily Bookings</h2>
            <p className="text-sm font-medium text-neutral-500">
              {dayjs(selectedDate).format("DD MMMM YYYY")}
            </p>
          </div>
        </div>

        {/* RIGHT SECTION — Bookings Stats */}
        <div className="text-right">
          <div className="text-sm font-semibold text-sea">
            {leftToCheckin} bookings left
          </div>
          <div className="text-xs text-dimgray">
            ({totalToday} bookings today)
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="scrollbar-thin max-h-[70vh] overflow-y-auto rounded-xl bg-neutral-50/70 p-4 shadow-inner">
        {isLoading ? (
          <p className="text-center text-neutral-600">Loading...</p>
        ) : isError ? (
          <p className="text-center text-red-500">Failed to load.</p>
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
                showUserName={true}
                showCancelButton={true}
                showCheckinButton={true}
                onCheckin={() => onCheckIn?.(b)}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
