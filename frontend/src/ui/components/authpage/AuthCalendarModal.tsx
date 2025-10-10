"use client";

import React from "react";

/** What the month view needs for each day */
export type CalendarDay = {
  day: number;          // 1..31
  percent?: number;     // 0..100 (omit if no data)
  dayOff?: boolean;     // true = show "Day off" band, ignore percent
};

export default function AuthCalendarModal({
  title,
  days,
  weekLabels = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"],
  rightNote,
  onPrevMonth,
  onNextMonth,
  onDayClick,
}: {
  title: string;
  days: CalendarDay[];
  weekLabels?: string[];
  rightNote?: string;
  onPrevMonth?: () => void;
  onNextMonth?: () => void;
  onDayClick?: (day: number) => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      {/* header: prev/title/next + optional note */}
      <div className="mb-1 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Previous month"
            onClick={onPrevMonth}
            className="grid h-8 w-8 place-items-center rounded-full border border-neutral-300 hover:bg-neutral-50"
          >
            ‹
          </button>
          <h2 className="text-lg font-semibold">{title}</h2>
          <button
            type="button"
            aria-label="Next month"
            onClick={onNextMonth}
            className="grid h-8 w-8 place-items-center rounded-full border border-neutral-300 hover:bg-neutral-50"
          >
            ›
          </button>
        </div>

        {rightNote ? (
          <div className="text-sm text-neutral-500">{rightNote}</div>
        ) : null}
      </div>

      {/* calendar grid */}
      <div className="grid grid-cols-7 gap-2">
        {weekLabels.map((d) => (
          <div
            key={d}
            className="pb-1 text-center text-xs font-semibold text-neutral-500"
          >
            {d}
          </div>
        ))}

        {days.map((d) => (
          <button
            key={d.day}
            type="button"
            onClick={() => onDayClick?.(d.day)}
            className="
              relative rounded-lg border bg-white text-left
              min-h-[92px] overflow-hidden
              transition-colors hover:border-emerald-300
              focus:outline-none focus:ring-2 focus:ring-emerald-200
            "
          >
            {/* day number (top-left) with padding bottom reserved for band */}
            <div className="px-3 pt-2 pb-9">
              <div className="text-m font-medium">{d.day}</div>
            </div>

            {/* bottom band */}
            <DayBand percent={d.percent} dayOff={d.dayOff} />
          </button>
        ))}
      </div>
    </div>
  );
}

/** Full-width band at the bottom of each tile */
function DayBand({ percent, dayOff }: { percent?: number; dayOff?: boolean }) {
  if (dayOff) {
    return (
      <div
        className="
          absolute inset-x-0 bottom-0 h-7 rounded-b-lg
          flex items-center justify-center
          bg-neutral-200 text-neutral-700
          text-[11px] sm:text-xs font-semibold
        "
      >
        Day off
      </div>
    );
  }

  if (typeof percent !== "number") {
    return <div className="absolute inset-x-0 bottom-0 h-7" />;
  }

  const { bandClass, label } = bandForPercent(percent);

  return (
    <div
      className={`
        absolute inset-x-0 bottom-0 h-7 rounded-b-lg
        flex items-center justify-center
        ${bandClass}
      `}
    >
      <span className="px-2 text-white text-[11px] sm:text-xs font-semibold leading-none">
        {label}
      </span>
    </div>
  );
}

/** Map % → color class + label */
function bandForPercent(pct: number): { bandClass: string; label: string } {
  const clamped = Math.max(0, Math.min(100, Math.round(pct)));
  if (clamped >= 100) return { bandClass: "bg-copper-rust", label: "Full" }; // red
  if (clamped >= 50)  return { bandClass: "bg-lion", label: `${clamped}%` }; // amber
  return { bandClass: "bg-pine", label: `${clamped}%` };                      // green
}
