// src/ui/components/bookingpage/DateNavigator.tsx
"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";

/** เพิ่มเติม: ใช้แบบ controlled ก็ได้ (ส่ง value เข้ามา), หรือปล่อยให้คอมโพเนนต์จัดการเองก็ได้ */
type Props = {
  /** ถ้าส่ง value เข้ามา คอมโพเนนต์จะเป็น controlled; ถ้าไม่ส่ง จะ default เป็นวันนี้ */
  value?: Date;
  /** เมื่อวันที่เปลี่ยน */
  onChange?: (date: Date) => void;

  /** ป้ายกลาง (ถ้าไม่อยากใช้ฟอร์แมตในคอมโพเนนต์) */
  dateLabelOverride?: string;

  /** กำหนดกรอบวันได้เอง; ถ้าไม่ส่งมา จะ default: today..today+1เดือน */
  minDate?: Date;
  maxDate?: Date;

  className?: string;
};

/* ========================== Utils ========================== */
function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}
function addDays(d: Date, n: number) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}
function addMonths(d: Date, n: number) {
  const x = new Date(d);
  x.setMonth(x.getMonth() + n);
  return x;
}
function clampDate(d: Date, min: Date, max: Date) {
  if (d < min) return min;
  if (d > max) return max;
  return d;
}
function fmtYYYYMMDD(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
function formatDateLabel(d: Date) {
  // ตัวอย่าง: Tue, 14 Oct 2025 (ปรับได้ตามที่ชอบ)
  return d.toLocaleDateString(undefined, {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function DateNavigator({
  value,
  onChange,
  dateLabelOverride,
  minDate,
  maxDate,
  className = "",
}: Props) {
  const today = useMemo(() => startOfDay(new Date()), []);
  const min = useMemo(() => startOfDay(minDate ?? today), [minDate, today]);
  const max = useMemo(
    () => startOfDay(maxDate ?? addMonths(today, 1)),
    [maxDate, today]
  );

  // ถ้า parent ไม่ส่ง value มา ใช้ internal state (uncontrolled)
  const [internalDate, setInternalDate] = useState<Date>(() =>
    clampDate(startOfDay(value ?? today), min, max)
  );

  // ถ้า value เปลี่ยนจากภายนอก อัปเดตภายในด้วย
  useEffect(() => {
    if (value) setInternalDate(clampDate(startOfDay(value), min, max));
  }, [value, min, max]);

  // sync ขอบเขตใหม่ (กรณี min/max เปลี่ยน)
  useEffect(() => {
    setInternalDate((d) => clampDate(d, min, max));
  }, [min, max]);

  const date = value ?? internalDate;
  const setDate = (d: Date) => {
    const clamped = clampDate(startOfDay(d), min, max);
    if (!value) setInternalDate(clamped);
    onChange?.(clamped);
  };

  const canPrev = date > min;
  const canNext = date < max;

  // ใช้ native <input type="date"> เพื่อได้ปฏิทิน + min/max ทันที
  const hiddenInputRef = useRef<HTMLInputElement>(null);
  const openPicker = () => hiddenInputRef.current?.showPicker?.() ?? hiddenInputRef.current?.click();

  return (
    <div
      className={`flex items-center justify-between gap-1 rounded-xl  bg-white px-2 py-1.5 text-neutral-800 `}
      role="group"
      aria-label="Date navigation"
    >
      {/* Prev / Today */}
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => canPrev && setDate(addDays(date, -1))}
          aria-label="Previous day"
          disabled={!canPrev}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg transition
                     hover:text-dimgray disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        </button>

        {/* <button
          type="button"
          onClick={() => setDate(today)}
          className="hidden md:inline-flex h-9 items-center gap-1 rounded-lg border border-emerald-200 px-2.5 text-[13px] font-medium
                     text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition"
          aria-label="Jump to today"
          disabled={today < min || today > max}
        >
          Today
        </button> */}
      </div>

      {/* Center label (click -> calendar) */}
      <button
        type="button"
        onClick={openPicker}
        className="group w-55 mx-auto flex max-w-full items-center justify-center gap-2 rounded-lg px-3 py-1.5 bg-neutral-50
                   hover:bg-neutral-100 transition"
        aria-label="Open calendar"
        title="Open calendar"
      >
        <Calendar className="h-4 w-4 text-neutral-500 group-hover:text-neutral-700" aria-hidden="true" />
        <span className="truncate text-[15px] font-semibold">
          {dateLabelOverride ?? formatDateLabel(date)}
        </span>
        {/* ปลีกย่อย: แสดง “(Today)” ถ้าวันนี้ */}
        {fmtYYYYMMDD(date) === fmtYYYYMMDD(today) && (
          <span className="text-[12px] font-medium text-emerald-600">(Today)</span>
        )}
      </button>

      {/* Next */}
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => canNext && setDate(addDays(date, 1))}
          aria-label="Next day"
          disabled={!canNext}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg transition
                     hover:text-dimgray disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      {/* Hidden native date input (ใช้ min/max บังคับช่วงวัน) */}
      <input
        ref={hiddenInputRef}
        type="date"
        className="sr-only"
        value={fmtYYYYMMDD(date)}
        min={fmtYYYYMMDD(min)}
        max={fmtYYYYMMDD(max)}
        onChange={(e) => {
          const v = e.target.value; // yyyy-mm-dd
          const [y, m, d] = v.split("-").map(Number);
          const picked = startOfDay(new Date(y, (m ?? 1) - 1, d ?? 1));
          setDate(picked);
        }}
      />
    </div>
  );
}
