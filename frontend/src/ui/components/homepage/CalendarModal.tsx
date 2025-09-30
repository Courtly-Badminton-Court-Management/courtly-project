"use client";

import React from "react";

/** What the month view needs for each day */
export type CalendarDay = {
  day: number;             // 1..31
  percent?: number;        // 0..100 (omit if no data)
  dayOff?: boolean;        // true = show "Day off" band, ignore percent
};

export default function CalendarModal({
  title,
  days,
  weekLabels = ["SUN","MON","TUE","WED","THU","FRI","SAT"],
}: {
  title: string;           // e.g. "September 2025"
  days: CalendarDay[];     // at least number of days in month
  weekLabels?: string[];
}) {
  return (
   <div className="md:col-span-2 rounded-2xl border bg-white p-4 gap-3 shadow-sm flex flex-col h-full">
    <div className="mb-4 flex items-center justify-between shrink-0">
        <h2 className="text-lg font-semibold">September 2025</h2>
    </div>

      {/* grid */}
      <div className="grid grid-cols-7 gap-2">
        {weekLabels.map((d) => (
          <div key={d} className="pb-1 text-center text-xs font-semibold text-neutral-500">
            {d}
          </div>
        ))}

        {days.map((d) => (
          <div
            key={d.day}
            className="
              relative rounded-lg border bg-white hover:border-emerald-300
              overflow-hidden            /* ensures the band uses the same rounded corners */
              min-h-[90px]              /* keep a nice, slightly taller day tile */
            "
          >
            {/* day number — top-left, with space reserved for the band at the bottom */}
            <div className="px-3 pt-2 pb-9 text-left">
              <div className="text-m font-medium">{d.day}</div>
            </div>

            {/* full-width band anchored to bottom */}
            <DayBand percent={d.percent} dayOff={d.dayOff} />
          </div>
        ))}
      </div>
    </div>
  );
}

/** The full-width band at bottom of each day cell */
function DayBand({ percent, dayOff }: { percent?: number; dayOff?: boolean }) {
  if (dayOff) {
    return (
      <div
        className="
          absolute inset-x-0 bottom-0 h-7
          flex items-center justify-center
          bg-neutral-200 text-neutral-700
          text-[11px] sm:text-xs font-semibold rounded-b-lg 
        "
      >
        Day off
      </div>
    );
  }

  if (typeof percent !== "number") {
    // reserve the same height so the cell height is consistent
    return <div className="absolute inset-x-0 bottom-0 h-7" />;
  }

  const { bandClass, label } = bandForPercent(percent);

  return (
    <div
      className={`
        absolute inset-x-0 bottom-0 h-7
        flex items-center justify-center rounded-b-lg 
        ${bandClass}
      `}
    >
      <span className="px-2 text-white text-[11px] sm:text-xs font-semibold leading-none">
        {label}
      </span>
    </div>
  );
}

/** Map percent → color + label */
function bandForPercent(pct: number): { bandClass: string; label: string } {
  const clamped = Math.max(0, Math.min(100, Math.round(pct)));
  if (clamped >= 100) {
    // red
    return { bandClass: "bg-copper-rust", label: "Full" };
  }
  if (clamped >= 50) {
    // yellow / amber
    return { bandClass: "bg-lion", label: `${clamped}%` };
  }
  // green
  return { bandClass: "bg-pine", label: `${clamped}%` };
}
