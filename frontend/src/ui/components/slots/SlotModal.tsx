"use client";

import React, { useMemo } from "react";
import { TimeSlot } from "./TimeSlot";
import type { DaySlotsData, Slot } from "./types";

export type SlotModalProps = {
  dayData: DaySlotsData;
  onPrevDay?: () => void;
  onNextDay?: () => void;
};


export function SlotModal({ dayData, onPrevDay, onNextDay }: SlotModalProps) {
  // 1) Sort by time
  const sorted = useMemo(
    () => Object.values(dayData.slotList).sort((a, b) => a.time.localeCompare(b.time)),
    [dayData.slotList]
  );

  // 2) Only slots with ≥1 FREE court and status=open
  const freeOnly: Slot[] = useMemo(
    () =>
      sorted
        .map((s) => ({
          ...s,
          courts: s.status === "open" ? s.courts.filter((c) => c.available) : [],
        }))
        .filter((s) => s.courts.length > 0),
    [sorted]
  );

  return (
    <aside className="">      
    <header className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">{toReadableDate(dayData.date)}</h2>
        <div className="flex items-center gap-2">
          <button
            className="h-8 w-8 rounded-full grid place-items-center border border-slate-300 hover:bg-slate-50"
            onClick={onPrevDay}
            aria-label="Previous day"
          >
            ‹
          </button>
          <button
            className="h-8 w-8 rounded-full grid place-items-center border border-slate-300 hover:bg-slate-50"
            onClick={onNextDay}
            aria-label="Next day"
          >
            ›
          </button>
        </div>
      </header>

      {/* List (scrollable) */}
      <div className="space-y-3 max-h-[32rem] overflow-auto pr-1">
        {freeOnly.length === 0 ? (
          <div className="rounded-xl border border-slate-200 p-6 text-sm text-slate-500">
            No free slots today.
          </div>
        ) : (
          freeOnly.map((slot, i) => <TimeSlot key={slot.id} slot={slot} withDivider={i > 0} />)
        )}
      </div>
    </aside>
  );
}

function toReadableDate(d: string) {
  const [dd, mm, yy] = d.split("-").map((s) => parseInt(s, 10));
  const date = new Date(2000 + yy, mm - 1, dd);
  return date.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}