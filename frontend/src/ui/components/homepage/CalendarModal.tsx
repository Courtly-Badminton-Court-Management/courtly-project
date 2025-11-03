"use client";

import React, { useState, useMemo } from "react";
import dayjs from "dayjs";
import weekday from "dayjs/plugin/weekday";
import isoWeek from "dayjs/plugin/isoWeek";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { mockAvailableSlotsNov25 } from "@/lib/slot/mockAvailableSlotsNov25";

dayjs.extend(weekday);
dayjs.extend(isoWeek);
dayjs.extend(customParseFormat);

type CalendarModalProps = {
  onSelectDate?: (date: string) => void;
};

const getColorByPercent = (p: number) => {
  if (p === 0) return "bg-dimgray";
  if (p <= 0.3) return "bg-cherry";
  if (p <= 0.6) return "bg-lion";
  return "bg-cambridge";
};

export default function CalendarModal({ onSelectDate }: CalendarModalProps) {
  const data = mockAvailableSlotsNov25;

  // ✅ ใช้ month format ใหม่ YYYY-MM
  const [month, setMonth] = useState(dayjs().startOf("month"));
  const [selected, setSelected] = useState<string | null>(null);

  const handleSelect = (date: string) => {
    setSelected(date);
    onSelectDate?.(date);
  };

  const goToPrevMonth = () => setMonth(month.subtract(1, "month"));
  const goToNextMonth = () => setMonth(month.add(1, "month"));

  const firstDay = month.startOf("month");
  const startOffset = (firstDay.isoWeekday() + 6) % 7;
  const daysInMonth = month.daysInMonth();

  // ✅ ตอนนี้ backend ส่ง date เป็น YYYY-MM-DD แล้ว
  const dayMap = new Map(
    data.days.map((d) => [dayjs(d.date, "YYYY-MM-DD", true).format("YYYY-MM-DD"), d])
  );

  const cells = useMemo(() => {
    return Array.from({ length: startOffset + daysInMonth }, (_, i) => {
      if (i < startOffset) return null;
      const date = firstDay.add(i - startOffset, "day");
      const formatted = date.format("YYYY-MM-DD");
      const backend = dayMap.get(formatted);
      return {
        date,
        percent: backend?.percent ?? 0,
      };
    });
  }, [month, data]);

  return (
    <div className="flex h-full flex-col rounded-2xl border border-[#1C4532]/30 bg-white p-5 shadow-sm">
      {/* Header */}
      <div className="mb-5 border-b-4 border-pine/80 pb-2 flex items-center justify-between">
        <div className="flex">
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

      {/* Calendar grid */}
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
                className={`relative flex flex-col items-center justify-center rounded-lg border border-platinum bg-white transition-all overflow-hidden h-[70px] w-full
                  ${
                    selected === cell.date.format("YYYY-MM-DD")
                      ? "ring-2 ring-cambridge shadow-sm"
                      : "hover:bg-cambridge/10 hover:ring-1 ring-cambridge"
                  }`}
              >
                <span className="font-semibold text-neutral-700 z-10 mb-5">
                  {cell.date.date()}
                </span>

                {/* % bar */}
                <div className="absolute bottom-0 left-0 w-full h-[16px] bg-neutral-200 overflow-hidden flex justify-left">
                  <div
                    className={`${getColorByPercent(cell.percent)} h-full transition-all duration-300`}
                    style={{ width: `${Math.round(cell.percent * 100)}%` }}
                  ></div>
                  <span className="absolute inset-0 flex items-center justify-center text-[10px] font-semibold text-white">
                    {Math.round(cell.percent * 100)}%
                  </span>
                </div>
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
}
