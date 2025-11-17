"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { CalendarCheck, Loader2 } from "lucide-react";
import Button from "@/ui/components/basic/Button";
import type { BookingRow } from "@/api-client/extras/types";
import BookingCard from "@/ui/components/bookingpage/BookingCard";
import { fa } from "zod/v4/locales";

export default function UpcomingModal({
  bookings,
  isLoading = false,
  onCancel,
}: {
  bookings: BookingRow[];
  isLoading?: boolean;
  onCancel?: (booking: BookingRow) => void;
}) {
  const router = useRouter();

  // ✅ Fade animation
  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
      @keyframes fadeUp {
        from { opacity: 0; transform: translateY(6px); }
        to { opacity: 1; transform: translateY(0); }
      }
    `;
    document.head.appendChild(style);
    return () => style.remove();
  }, []);

/* ======================== Loading State ======================== */
if (isLoading) {
  return (
    <aside className="rounded-2xl border border-platinum bg-white p-6 shadow-sm transition hover:shadow-md">
      {/* Header */}
      <div className="mb-5 border-b-4 border-pine/80 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="rounded-full bg-pine/10 p-2 text-pine">
            <CalendarCheck size={18} strokeWidth={2.2} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-pine">Upcoming Booking</h2>
            <p className="text-sm font-medium text-neutral-500">
              Free cancellation up to 24 hrs before playtime.
            </p>
          </div>
        </div>
      </div>

      {/* Loading Spinner */}
      <div className="flex items-center justify-center h-[180px]">
        <Loader2 className="animate-spin text-pine" size={28} />
      </div>
    </aside>
  );
}



  /* ======================== Empty State ======================== */
  if (!bookings?.length) {
    return (
      <aside className="rounded-2xl border border-platinum bg-white p-6 shadow-sm transition hover:shadow-md text-center">
        <div className="flex flex-col items-center gap-3 animate-[fadeUp_0.4s_ease]">
          <div className="rounded-full bg-pine/10 p-2 text-pine">
            <CalendarCheck size={18} strokeWidth={2.2} />
          </div>
          <h3 className="text-lg font-semibold text-pine">
            No Upcoming Games 🏸
          </h3>
          <p className="text-sm text-gray-500">
            Book a court and get ready to play!
          </p>
          <Button
            label="Wanna book now?"
            bgColor="bg-sea hover:bg-pine"
            textColor="text-white"
            className="mt-3"
            onClick={() => router.push("/booking")}
          />
        </div>
      </aside>
    );
  }

  /* ======================== Main Content ======================== */
  return (
    <aside className="rounded-2xl border border-platinum bg-white p-6 shadow-sm transition hover:shadow-md">
      {/* Header */}
      <div className="mb-5 border-b-4 border-pine/80 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="rounded-full bg-pine/10 p-2 text-pine">
            <CalendarCheck size={18} strokeWidth={2.2} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-pine">
              Upcoming Booking
            </h2>
            <p className="text-sm font-medium text-neutral-500">
              Free cancellation up to 24 hrs before playtime.
            </p>
          </div>
        </div>
      </div>

      {/* Booking List */}
      <ul className="space-y-5 animate-[fadeUp_0.4s_ease]">
        {bookings.map((bk) => (
          <BookingCard
            key={bk.booking_id}
            booking={bk}
            onCancel={onCancel}
            showUserName={false}
            showCancelButton={true}
            showInlineSlots={true}
            showCheckinButton={false}
          />
        ))}
      </ul>
    </aside>
  );
}
