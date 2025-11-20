"use client";

import React, { useMemo } from "react";
import dayjs from "dayjs";
import { Sparkle, Loader2 } from "lucide-react";
import Link from "next/link";
import type { AvailableSlotsResponse, SlotItem } from "@/api-client/extras/types";

type Props = {
  selectedDate: string; // YYYY-MM-DD
  data?: AvailableSlotsResponse;
  isLoading?: boolean;
  isError?: boolean;
  mode?: "landing" | "player";
};

/* =========================================================================
   Helper: group slots by time range
   ========================================================================= */
function groupByTime(availableSlots: SlotItem[]) {
  const map = new Map<string, SlotItem[]>();
  availableSlots.forEach((slot) => {
    const label = `${slot.start_time} - ${slot.end_time}`;
    if (!map.has(label)) map.set(label, []);
    map.get(label)!.push(slot);
  });
  return Array.from(map.entries()).map(([label, courts]) => ({ label, courts }));
}

/* =========================================================================
   Component
   ========================================================================= */
export default function AvailableSlotPanel({
  selectedDate,
  data,
  isLoading,
  isError,
  mode = "player",
}: Props) {
  const dayData = useMemo(() => {
    if (!data?.days) return null;
    const key = dayjs(selectedDate).format("DD-MM-YY");
    return data.days.find((d) => d.date === key);
  }, [data, selectedDate]);

  const groupedSlots = useMemo(() => {
    if (!dayData?.available_slots?.length) return [];
    return groupByTime(dayData.available_slots);
  }, [dayData]);

  const isLanding = mode === "landing";

  /* =========================================================================
     Render
     ========================================================================= */
  return (
    <div className="flex h-full flex-col rounded-2xl border border-[#1C4532]/30 bg-white p-5 shadow-sm min-h-[420px]">
      {/* Header */}
      <div className="mb-5 border-b-4 border-pine/80 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="rounded-full bg-pine/10 p-2 text-pine">
            <Sparkle size={18} strokeWidth={2.2} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-pine">Available Slots</h2>
            <p className="text-sm font-medium text-neutral-500">
              {dayjs(selectedDate).format("D MMM YYYY")} · View only
            </p>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 rounded-xl bg-neutral-50/70 shadow-inner overflow-hidden flex items-center justify-center">
        {isLoading ? (
          <div className="flex items-center justify-center h-[300px]">
            <Loader2 className="animate-spin text-pine" size={24} />
          </div>
        ) : isError ? (
          <p className="rounded-lg bg-neutral-100 text-center text-sm text-neutral-500 py-3 w-full mx-4">
            Unable to load available slots data. 
            Please try again later.
          </p>
        ) : groupedSlots.length === 0 ? (
          <p className="rounded-lg bg-neutral-100 text-center text-sm text-neutral-500 py-3 w-full mx-4">
            No available slots left on this day.
          </p>

        ) : (
          <div className="scrollbar-thin max-h-[60vh] overflow-y-auto w-full p-4">
            {groupedSlots.map((group, i) => (
              <div key={group.label} className="pb-1">
                <p className="text-sm font-medium text-neutral-500">
                  {group.label}
                </p>
                <div className="flex flex-wrap gap-2">
                  {group.courts.map((slot, idx) => (
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
            ))}
          </div>
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
        <p className="mt-4 text-center text-xs text-neutral-500">
          View only. To book, please use the Booking page.
        </p>
      )}
    </div>
  );
}
