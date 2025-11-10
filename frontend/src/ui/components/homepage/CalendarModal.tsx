"use client";

import React, { useState, useMemo } from "react";
import dayjs from "dayjs";
import weekday from "dayjs/plugin/weekday";
import isoWeek from "dayjs/plugin/isoWeek";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { CalendarDays, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

dayjs.extend(weekday);
dayjs.extend(isoWeek);
dayjs.extend(customParseFormat);

/* =========================================================================
   Props
   ========================================================================= */
type CalendarModalProps = {
  data?: any;
  isLoading?: boolean;
  isError?: boolean;
  onSelectDate?: (date: string) => void;
};

/* =========================================================================
   Helpers
   ========================================================================= */
const getColorByPercent = (p: number) => {
  if (p === 0) return "bg-dimgray";
  if (p <= 30) return "bg-cherry";
  if (p <= 60) return "bg-lion";
  return "bg-cambridge";
};

/* =========================================================================
   Component
   ========================================================================= */
export default function CalendarModal({
  data,
  isLoading,
  isError,
  onSelectDate,
}: CalendarModalProps) {
  const [month, setMonth] = useState(dayjs().startOf("month"));
  const [selected, setSelected] = useState<string | null>(null);

  const handleSelect = (date: string) => {
    setSelected(date);
    onSelectDate?.(date);
  };

  const goToPrevMonth = () => setMonth(month.subtract(1, "month"));
  const goToNextMonth = () => setMonth(month.add(1, "month"));

  /* =========================================================================
     Build calendar grid
     ========================================================================= */
  const firstDay = month.startOf("month");
  const startOffset = (firstDay.isoWeekday() + 6) % 7; // จันทร์เป็น column แรก
  const daysInMonth = month.daysInMonth();

  const dayMap = useMemo(() => {
    if (!data?.days) return new Map();
    return new Map(data.days.map((d: any) => [d.date, d]));
  }, [data]);

  const cells = useMemo(() => {
    return Array.from({ length: startOffset + daysInMonth }, (_, i) => {
      if (i < startOffset) return null;
      const date = firstDay.add(i - startOffset, "day");
      const key = dayjs(date).format("DD-MM-YY");
      const backend = dayMap.get(key);
      return {
        date,
        percent: backend?.available_percent ? backend.available_percent * 100 : 0,
      };
    });
  }, [month, data]);

  /* =========================================================================
     Render
     ========================================================================= */
  return (
    <div className="flex h-full flex-col rounded-2xl border border-[#1C4532]/30 bg-white p-5 shadow-sm">
      {/* Header */}
      <div className="mb-5 border-b-4 border-pine/80 pb-2 flex items-center justify-between">
        <div className="flex items-center">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-pine/10 p-2 text-pine">
              <CalendarDays size={18} strokeWidth={2.2} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-pine">Courtly Calendar</h2>
              <p className="text-sm font-medium text-neutral-500">
                {month.format("MMMM YYYY")} · Overview
              </p>
            </div>
          </div>

          {/* Month navigation */}
          <div className="ml-5 flex items-center gap-2">
            <button
              onClick={goToPrevMonth}
              className="flex items-center justify-center rounded-full text-pine p-1 hover:bg-pine/20 hover:scale-105 transition-all duration-200"
              aria-label="Previous month"
            >
              <ChevronLeft size={18} strokeWidth={2.2} />
            </button>
            <button
              onClick={goToNextMonth}
              className="flex items-center justify-center rounded-full text-pine p-1 hover:bg-pine/20 hover:scale-105 transition-all duration-200"
              aria-label="Next month"
            >
              <ChevronRight size={18} strokeWidth={2.2} />
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="hidden md:flex items-center gap-4 text-sm font-medium text-neutral-500">
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 bg-cambridge rounded-full" /> Available
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 bg-lion rounded-full" /> Medium
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 bg-cherry rounded-full" /> Almost Full
          </div>
        </div>
      </div>

      {/* Loading / Error */}
      {isLoading && (
        <div className="flex items-center justify-center h-[300px]">
          <Loader2 className="animate-spin text-pine" size={24} />
        </div>
      )}
      {isError && (
        <div className="text-center text-cherry font-medium">
          Failed to load data 😢
        </div>
      )}

      {/* Calendar grid */}
      {!isLoading && !isError && (
        <div className="rounded-xl bg-neutral-50/70 p-4 shadow-inner">
          <div className="grid grid-cols-7 text-center text-sm font-medium text-neutral-500 mb-2">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
              <div key={d} className="font-semibold">
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2 text-center">
            {cells.map((cell, idx) =>
              !cell ? (
                <div key={`empty-${idx}`} />
              ) : (
                <button
                  key={cell.date.format("YYYY-MM-DD")}
                  onClick={() => handleSelect(cell.date.format("YYYY-MM-DD"))}
                  className={`relative flex flex-col items-center justify-center rounded-lg border border-platinum bg-white transition-all overflow-hidden h-[70px]
                    ${
                      selected === cell.date.format("YYYY-MM-DD")
                        ? "ring-2 ring-cambridge shadow-sm"
                        : "hover:bg-cambridge/10 hover:ring-1 ring-cambridge"
                    }`}
                >
                  <span className="font-semibold text-neutral-700 z-10 mb-5">
                    {cell.date.date()}
                  </span>
                  <div className="absolute bottom-0 left-0 w-full h-[16px] bg-neutral-200 overflow-hidden flex justify-left">
                    <div
                      className={`${getColorByPercent(cell.percent)} h-full transition-all duration-300`}
                      style={{ width: `${Math.round(cell.percent)}%` }}
                    ></div>
                    <span className="absolute inset-0 flex items-center justify-center text-[10px] font-semibold text-white">
                      {Math.round(cell.percent)}%
                    </span>
                  </div>
                </button>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}
