// src/ui/components/bookingpage/DateNavigator.tsx
"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import dayjs from "dayjs";

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

/* ========================== Utils (dayjs) ========================== */
const startOfDay = (d: Date) => dayjs(d).startOf("day");
const addDays = (d: Date, n: number) => startOfDay(d).add(n, "day");
const addMonths = (d: Date, n: number) => startOfDay(d).add(n, "month");
const clampDate = (d: dayjs.Dayjs, min: dayjs.Dayjs, max: dayjs.Dayjs) =>
  d.isBefore(min) ? min : d.isAfter(max) ? max : d;
const fmtYYYYMMDD = (d: dayjs.Dayjs) => d.format("YYYY-MM-DD");
const formatDateLabel = (d: dayjs.Dayjs) => d.format("ddd, MMM D, YYYY");

export default function DateNavigator({
  value,
  onChange,
  dateLabelOverride,
  minDate,
  maxDate,
  className = "",
}: Props) {
  // ✅ กัน hydration mismatch: render หลังจาก client mount
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // คำนวณกรอบวันด้วย dayjs (อิง local tz ของผู้ใช้)
  const today = useMemo(() => startOfDay(new Date()), []);
  const min = useMemo(
    () => startOfDay(minDate ?? today.toDate()),
    [minDate, today]
  );
  const max = useMemo(
    () => startOfDay(maxDate ?? addMonths(today.toDate(), 1).toDate()),
    [maxDate, today]
  );

  // state ภายในกรณี uncontrolled
  const [internalDate, setInternalDate] = useState<dayjs.Dayjs>(() => {
    const initial = startOfDay(value ?? today.toDate());
    return clampDate(initial, min, max);
  });

  // sync จากภายนอกเมื่อ value เปลี่ยน (controlled)
  useEffect(() => {
    if (!value) return;
    const next = clampDate(startOfDay(value), min, max);
    setInternalDate(next);
  }, [value, min, max]);

  // sync เมื่อกรอบวันเปลี่ยน
  useEffect(() => {
    setInternalDate((d) => clampDate(d, min, max));
  }, [min, max]);

  const date = value ? clampDate(startOfDay(value), min, max) : internalDate;

  const setDate = (d: dayjs.Dayjs) => {
    const clamped = clampDate(startOfDay(d.toDate()), min, max);
    if (!value) setInternalDate(clamped);
    onChange?.(clamped.toDate());
  };

  const canPrev = date.isAfter(min, "day");
  const canNext = date.isBefore(max, "day");

  // ใช้ native <input type="date"> เพื่อได้ปฏิทิน + min/max ทันที
  const hiddenInputRef = useRef<HTMLInputElement>(null);
  const openPicker = () =>
    hiddenInputRef.current?.showPicker?.() ??
    hiddenInputRef.current?.click();

  // ก่อน mount: อย่า render label วันที่ (กัน SSR text mismatch)
  if (!mounted) {
    return (
      <div
        className={`flex items-center justify-between gap-1 rounded-xl bg-white px-2 py-1.5 text-neutral-800 ${className}`}
        role="group"
        aria-label="Date navigation"
      >
        <div className="h-9 w-9" />
        <div className="h-6 w-40 rounded bg-neutral-100" />
        <div className="h-9 w-9" />
      </div>
    );
  }

  return (
    <div
      className={`flex items-center justify-between gap-1 rounded-xl bg-white px-2 py-1.5 text-neutral-800 ${className}`}
      role="group"
      aria-label="Date navigation"
    >
      {/* Prev */}
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => canPrev && setDate(addDays(date.toDate(), -1))}
          aria-label="Previous day"
          disabled={!canPrev}
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg transition
                     hover:text-dimgray disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      {/* Center label (click -> calendar) */}
      <button
        type="button"
        onClick={openPicker}
        className="group w-60 mx-auto flex max-w-full items-center justify-center gap-2 rounded-lg px-3 py-1.5 bg-neutral-50
                   hover:bg-neutral-100 transition"
        aria-label="Open calendar"
        title="Open calendar"
      >
        <Calendar
          className="h-4 w-4 text-neutral-500 group-hover:text-neutral-700"
          aria-hidden="true"
        />
        <span className="truncate text-[15px] font-semibold" suppressHydrationWarning>
          {dateLabelOverride ?? formatDateLabel(date)}
        </span>
        {date.isSame(today, "day") && (
          <span className="text-[12px] font-medium text-emerald-600">
            (Today)
          </span>
        )}
      </button>

      {/* Next */}
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => canNext && setDate(addDays(date.toDate(), 1))}
          aria-label="Next day"
          disabled={!canNext}
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg transition
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
          const picked = dayjs(e.target.value, "YYYY-MM-DD");
          if (picked.isValid()) setDate(picked);
        }}
      />
    </div>
  );
}
