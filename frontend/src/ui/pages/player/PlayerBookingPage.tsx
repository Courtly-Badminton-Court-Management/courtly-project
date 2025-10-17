// \src\ui\pages\player\PlayerBookingPage.tsx
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
import BookingDateNavigator from "@/ui/components/bookingpage/BookingDateNavigator";

/* =========================================================================
   CONFIG
   ========================================================================= */
const CLUB_ID = 1;

/* =========================================================================
   PAGE
   ========================================================================= */
export default function PlayerBookingPage() {
  // ✅ ใช้วันที่ปัจจุบัน (timezone Bangkok)
  const today = new Date(Date.now() + 7 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

  const [ymd, setYmd] = useState<string>(today);
  const [selected, setSelected] = useState<SelectedSlot[]>([]);
  const [openSummary, setOpenSummary] = useState(false);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [bookingNos, setBookingNos] = useState<string[]>([]);

  // data
  const { cols, grid, priceGrid, courtIds, courtNames, minutesPerCell, isLoading } = useDayGrid({
    clubId: CLUB_ID,
    ymd,
  });
  const { balance: coins } = useWalletBalance();

  // clear selected slots whenever the day changes (one-day booking rule)
  useEffect(() => {
    setSelected([]);
  }, [ymd]);

  // grouping (คิดราคาจริงจาก priceGrid)
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
      exists ? prev.filter((s) => `${s.courtRow}-${s.colIdx}` !== key) : [...prev, { courtRow, colIdx }]
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
      alert(e?.message || "Booking failed");
    }
  }

  function shiftDay(delta: number) {
    setYmd((prev) => ymdAddDays(prev, delta));
    setSelected([]); // clear immediately on click too
  }

  const dateLabel = ymdLabel(ymd);

  return (
    <div className="mx-auto max-w-[1100px] px-4 py-6">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-extrabold tracking-tight">Booking Slots</h1>
        <div className="flex items-center gap-4">
          <div className="text-sm font-semibold text-gray-700">
            {selected.length} {selected.length === 1 ? "slot" : "slots"} selected
          </div>
          <button
            onClick={() => setOpenSummary(true)}
            className={classNames(
              "rounded-xl px-4 py-2 text-sm font-bold transition-colors",
              selected.length ? "bg-teal-800 text-white hover:bg-teal-700" : "bg-neutral-200 text-neutral-500 cursor-not-allowed"
            )}
            disabled={!selected.length || isLoading}
          >
            Book the courts!
          </button>
        </div>
      </div>

      {/* Controls row: Date (left) + Legend (right) */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <BookingDateNavigator
          dateLabel={dateLabel}
          onPrev={() => shiftDay(-1)}
          onNext={() => shiftDay(1)}
        />

        {/* Legend ด้านขวา */}
        <PlayerSlotStatusLegend className="sm:ml-4" />
      </div>

      {/* Grid */}
      <SlotGrid
        cols={cols as Col[]}
        grid={grid}
        courtNames={courtNames}
        selected={selected}
        onToggle={toggleSelect}
      />

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
