"use client";

import React from "react";

/** What the month view needs for each day */
export type CalendarDay = {
  day: number;          // 1..31
  percent?: number;     // 0..100 (omit if no data)
  dayOff?: boolean;     // true = "Day off" band
};

type Props = {
  title: string;
  days: CalendarDay[];
  weekLabels?: string[];
  onPrevMonth?: () => void;  
  onNextMonth?: () => void;  
};

export default function CalendarModal({
  title,
  days,
  weekLabels = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"],
  onPrevMonth,
  onNextMonth,
}: Props) {
  return (
    <div className="md:col-span-2 rounded-2xl border bg-white p-4 gap-3 shadow-sm flex flex-col h-full">
      {/* Header with chevrons */}
      <div className="mb-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Previous month"
            onClick={onPrevMonth}
            className="h-8 w-8 grid place-items-center rounded-full border border-slate-300 hover:bg-slate-50"
          >
            ‹
          </button>
        <h2 className="text-lg font-semibold">{title}</h2>
          <button
            type="button"
            aria-label="Next month"
            onClick={onNextMonth}
            className="h-8 w-8 grid place-items-center rounded-full border border-slate-300 hover:bg-slate-50"
          >
            ›
          </button>
        </div>
      </div>

      {/* Grid */}
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
              overflow-hidden
              min-h-[90px]
            "
          >
            {/* Day number (top-left) */}
            <div className="px-3 pt-2 pb-9 text-left">
              <div className="text-m font-medium">{d.day}</div>
            </div>

            {/* Full-width band at bottom */}
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
      <div className="absolute inset-x-0 bottom-0 h-7 flex items-center justify-center bg-neutral-200 text-neutral-700 text-[11px] sm:text-xs font-semibold rounded-b-lg">
        Day off
      </div>
    );
  }

  if (typeof percent !== "number") {
    return <div className="absolute inset-x-0 bottom-0 h-7" />;
  }

  const { bandClass, label } = bandForPercent(percent);
  return (
    <div className={`absolute inset-x-0 bottom-0 h-7 flex items-center justify-center rounded-b-lg ${bandClass}`}>
      <span className="px-2 text-white text-[11px] sm:text-xs font-semibold leading-none">
        {label}
      </span>
    </div>
  );
}

/** Map percent → color + label */
function bandForPercent(pct: number): { bandClass: string; label: string } {
  const clamped = Math.max(0, Math.min(100, Math.round(pct)));
  if (clamped >= 100) return { bandClass: "bg-copper-rust", label: "Full" };
  if (clamped >= 50)  return { bandClass: "bg-lion",        label: `${clamped}%` };
  return { bandClass: "bg-pine", label: `${clamped}%` };
}
