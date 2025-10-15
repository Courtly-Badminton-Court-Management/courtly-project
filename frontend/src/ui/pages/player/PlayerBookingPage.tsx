// src/ui/pages/player/PlayerBookingPage.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { classNames, ymdAddDays, ymdLabel } from "@/lib/booking/datetime";
import SlotGrid from "@/ui/components/bookingpage/SlotGrid";
import BookingSummaryModal from "@/ui/components/bookingpage/BookingSummaryModal";
import BookingConfirmedModal from "@/ui/components/bookingpage/BookingConfirmedModal";
import { useDayGrid, useWalletBalance, useCreateBookings } from "@/lib/booking/api";
import type { Col, SelectedSlot } from "@/lib/booking/model";
import { groupSelectionsWithPrice } from "@/lib/booking/groupSelections";
import PlayerSlotStatusLegend from "@/ui/components/bookingpage/PlayerSlotStatusLegend";
import DateNavigator from "@/ui/components/bookingpage/DateNavigator";
import FloatingLegend from "@/ui/components/bookingpage/FloatingLegend";

/* =========================================================================
   Utils (local) — ช่วยจัดการ date <-> ymd และ clamp ภายในช่วงที่อนุญาต
   ========================================================================= */
function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}
function addMonths(d: Date, n: number) {
  const x = new Date(d);
  x.setMonth(x.getMonth() + n);
  return x;
}
function clamp(d: Date, min: Date, max: Date) {
  if (d < min) return min;
  if (d > max) return max;
  return d;
}
function ymdFromDate(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
function dateFromYmd(ymd: string) {
  const [y, m, d] = ymd.split("-").map(Number);
  return startOfDay(new Date(y, (m ?? 1) - 1, d ?? 1));
}

/* =========================================================================
   CONFIG
   ========================================================================= */
const CLUB_ID = 1;

export default function PlayerBookingPage() {
  // ขอบเขตวัน: วันนี้ .. วันนี้+1เดือน
  const today = useMemo(() => startOfDay(new Date()), []);
  const minDate = today;
  const maxDate = useMemo(() => startOfDay(addMonths(today, 1)), [today]);

  // default เริ่มที่ Today (ห้ามย้อนหลัง)
  const [ymd, setYmd] = useState<string>(() => ymdFromDate(today));
  const [selected, setSelected] = useState<SelectedSlot[]>([]);
  const [openSummary, setOpenSummary] = useState(false);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [bookingNos, setBookingNos] = useState<string[]>([]);

  const { cols, grid, priceGrid, courtIds, courtNames, minutesPerCell, isLoading } =
    useDayGrid({ clubId: CLUB_ID, ymd });
  const { balance: coins } = useWalletBalance();

  useEffect(() => setSelected([]), [ymd]);

  const groups = useMemo(
    () => groupSelectionsWithPrice(selected, cols),
    [selected, cols, priceGrid]
  );

  const totalPrice = groups.reduce((s, g) => s + g.price, 0);
  const notEnough = coins !== null && totalPrice > coins;
  const { create, isCreating } = useCreateBookings();

  function toggleSelect(courtRow: number, colIdx: number) {
    const key = `${courtRow}-${colIdx}`;
    const exists = selected.some((s) => `${s.courtRow}-${s.colIdx}` === key);
    setSelected((prev) =>
      exists
        ? prev.filter((s) => `${s.courtRow}-${s.colIdx}` !== key)
        : [...prev, { courtRow, colIdx }]
    );
  }

  async function handleConfirm() {
    try {
      const items = groups.map((g) => {
        const start = cols[g.startIdx].start;
        const end = cols[g.endIdx].end;
        const courtId = courtIds[g.courtRow - 1] ?? g.courtRow;
        return { court: courtId, date: ymd, start, end };
      });

      const res: any = await create(CLUB_ID, items);

      const ids: string[] = (() => {
        if (!res) return [];
        if (Array.isArray(res.bookings)) {
          return res.bookings
            .map((b: any) => b.booking_no ?? b.bookingNo ?? b.id ?? b.code)
            .filter(Boolean)
            .map(String);
        }
        const single = res.booking_no ?? res.bookingNo ?? res.id ?? res.code ?? null;
        return single ? [String(single)] : [];
      })();

      setBookingNos(ids);
      setOpenSummary(false);
      setOpenConfirm(true);
      setSelected([]);
    } catch (e: any) {
      alert(e?.message || "Booking failed. Please try again.");
    }
  }

  // ปรับให้ shiftDay เคารพช่วง min/max เสมอ
  function shiftDay(delta: number) {
    const next = dateFromYmd(ymd);
    next.setDate(next.getDate() + delta);
    const clamped = clamp(startOfDay(next), minDate, maxDate);
    setYmd(ymdFromDate(clamped));
    setSelected([]);
  }


  const selCount = selected.length;

  return (
    <div className="mx-auto max-w-[1100px] px-4 py-6">
      {/* Title and subtext */}
      <div className="mb-4">
        <h1 className="text-[22px] font-bold tracking-tight text-pine">
          Let’s Book Your Game!
        </h1>
        <p className="text-[14px] font-semibold tracking-tight text-dimgray">
          Choose your court and time below to make a booking.
        </p>
        
      </div>

      {/* Header row: Date navigator + actions all in one line */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <DateNavigator
          // ใช้แบบ controlled + ปฏิทิน
          value={dateFromYmd(ymd)}
          onChange={(d) => setYmd(ymdFromDate(clamp(startOfDay(d), minDate, maxDate)))}
          minDate={minDate}
          maxDate={maxDate}
          // ถ้าอยากคงปุ่มลูกศรไว้ด้วย ก็ยังเรียกเดิมได้ (คอมโพเนนต์จะ disable ให้เองเมื่อถึงขอบ)
          // dateLabelOverride={dateLabel} // ถ้าอยากคงรูปแบบ label จาก ymdLabel
          className=""
        />

        <div className="flex items-center gap-4">
          <div className="text-sm font-semibold text-gray-700">
            {selCount > 0
              ? `${selCount} ${selCount === 1 ? "slot selected" : "slots selected"}`
              : "0 slots selected"}
          </div>
          <button
            onClick={() => setOpenSummary(true)}
            className={classNames(
              "rounded-xl px-4 py-2 text-sm font-bold transition-colors",
              selCount
                ? "bg-teal-800 text-white hover:bg-teal-700"
                : "bg-neutral-200 text-neutral-500 cursor-not-allowed"
            )}
            disabled={!selCount || isLoading}
          >
            {selCount ? "Review your Booking" : "Select any Slot to book!"}
          </button>
        </div>
      </div>

      {/* Grid */}
      <SlotGrid
        cols={cols as Col[]}
        grid={grid}
        courtNames={courtNames}
        selected={selected}
        onToggle={toggleSelect}
      />

      {/* Bottom info section (legend + helper) */}
      <div className="mt-5 flex flex-col gap-2 pt-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="sm:order-1 order-2">
          <PlayerSlotStatusLegend />
        </div>
        <p className="sm:order-2 order-1 text-sm text-gray-600 text-left sm:text-right">
          💡 1 slot = 30 minutes = 100 coins · Coins are captured when you confirm
        </p>
      </div>

      {/* floating legend — shows on all viewports */}
      <FloatingLegend helperText="💡 1 slot = 30 minutes = 100 coins · Coins are captured when you confirm" />

      {/* Summary Modal */}
      <BookingSummaryModal
        open={openSummary}
        onClose={() => setOpenSummary(false)}
        groups={groups}
        courtNames={courtNames}
        totalPrice={totalPrice}
        notEnough={notEnough || isCreating}
        onConfirm={handleConfirm}
        minutesPerCell={minutesPerCell}
      />

      {/* Confirmed Modal */}
      <BookingConfirmedModal
        open={openConfirm}
        onClose={() => setOpenConfirm(false)}
        bookingNos={bookingNos}
      />
    </div>
  );
}
