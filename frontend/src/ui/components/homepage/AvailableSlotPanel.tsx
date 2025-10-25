"use client";

import React, { useMemo } from "react";
import dayjs from "dayjs";
import { Sparkle } from "lucide-react";
import { useMonthView } from "@/api-client/extras/slots";
import { groupAvailableSlotsByTime } from "@/lib/booking/groupAvailableSlots";
import Link from "next/link";

type Props = {
  clubId: number;
  selectedDate: string; // YYYY-MM-DD
  mode?: "landing" | "player";
};


export default function AvailableSlotPanel({
  clubId,
  selectedDate,
  mode = "player",
}: Props) {
  const month = dayjs(selectedDate).format("YYYY-MM");
  const { data, isLoading, isError } = useMonthView(clubId, month);

  const dayData = useMemo(() => {
    if (!data?.days) return null;
    const key = dayjs(selectedDate).format("DD-MM-YY");
    return data.days.find((d) => d.date === key);
  }, [data, selectedDate]);

  const groupedSlots = useMemo(
    () => groupAvailableSlotsByTime(dayData?.booking_slots || {}),
    [dayData]
  );

  const isLanding = mode === "landing";

  return (
    <div className="flex h-full flex-col rounded-2xl border border-[#1C4532]/30 bg-white p-5 shadow-sm">
      {/* Header */}
      <div className="mb-5 border-b-4 border-pine/80 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="rounded-full bg-pine/10 p-2 text-pine">
            <Sparkle size={18} strokeWidth={2.2} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-pine">
              Available Slots
            </h2>
            <p className="text-sm font-medium text-neutral-500">
              {dayjs(selectedDate).format("D MMM YYYY")} · View only
            </p>
          </div>
        </div>

        {/* <span className="rounded-full bg-pine/10 px-3 py-1 text-xs font-semibold text-pine">
          Preview Mode
        </span> */}
      </div>

      {/* Slot list */}
      <div className="scrollbar-thin max-h-[60vh] overflow-y-auto rounded-xl bg-neutral-50/70 p-4 shadow-inner">
        {isLoading ? (
          <div className="flex h-56 flex-col items-center justify-center text-neutral-500">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-pine border-t-transparent mb-3" />
            <p className="text-sm">Fetching latest availability...</p>
          </div>
        ) : isError ? (
          <p className="text-center text-sm text-red-500">
            Unable to load available slots.
          </p>
        ) : groupedSlots.length === 0 ? (
          <p className="rounded-lg bg-neutral-100 text-center text-sm text-neutral-500 py-3">
            No available slots today.
          </p>
        ) : (
          groupedSlots.map((group, i) => (
            <div key={group.label} className="pb-5">
              <p className="mb-2 text-sm font-semibold text-neutral-700">
                {group.label}
              </p>
              <div className="flex flex-wrap gap-2">
                {group.courts.map((slot: any, idx: number) => (
                  <div
                    key={idx}
                    className="cursor-default select-none rounded-lg border border-pine/30 bg-pine/10 px-3 py-1.5 text-sm font-medium text-pine hover:bg-pine/20 transition"
                  >
                    {slot.court_name || `Court ${slot.court}`}
                  </div>
                ))}
              </div>
              {i < groupedSlots.length - 1 && (
                <div className="my-5 h-px w-full bg-neutral-200" />
              )}
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      {isLanding ? (
        <div className="mt-5 flex flex-col items-center text-center">
          <p className="text-sm text-neutral-600 mb-2">
            Want to book your court?
          </p>
          <Link
  href="/booking"
  prefetch
  className="rounded-xl bg-gradient-to-r from-pine to-cambridge px-6 py-2 text-sm font-semibold text-white shadow-md hover:opacity-100 hover:scale-105 transition-all duration-200 inline-block"
>
  Go to Booking Page 🏸
</Link>
          <p className="mt-1 text-xs text-neutral-400">
            Sign up to unlock booking
          </p>
        </div>
      ) : (
        <p className="mt-4 text-center text-sm text-neutral-500">
          *View only. To book, please use the Booking page.
        </p>
      )}
    </div>
  );
}
