// frontend/src/ui/pages/player/PlayerBookingPage.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import SlotGrid from "@/ui/components/bookingpage/SlotGrid";
import BookingSummaryModal from "@/ui/components/bookingpage/BookingSummaryModal";
import BookingConfirmedModal from "@/ui/components/bookingpage/BookingConfirmedModal";
import BookingErrorModal from "@/ui/components/bookingpage/BookingErrorModal";
import PlayerSlotStatusLegend from "@/ui/components/bookingpage/PlayerSlotStatusLegend";
import DateNavigator from "@/ui/components/bookingpage/DateNavigator";
import FloatingLegend from "@/ui/components/bookingpage/FloatingLegend";
import { classNames } from "@/lib/booking/datetime";

import type { Col, SelectedSlot } from "@/lib/slot/slotGridModel";
import { groupSelectionsWithPrice } from "@/lib/slot/groupSelections";
import {
  buildDayGridFromMonthView,
  buildPlaceholderGrid,
} from "@/lib/slot/buildDayGridFromMonthView";

import { useMonthView } from "@/api-client/extras/slots";
import { useWalletBalanceRetrieve } from "@/api-client/endpoints/wallet/wallet";
import { useAuthMeRetrieve } from "@/api-client/endpoints/auth/auth";
import { useBookingCreateWithBody } from "@/api-client/extras/booking";
import type { CreateBookingPayload } from "@/api-client/extras/booking";

/* =========================================================================
   Utils
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
   Component
   ========================================================================= */
export default function PlayerBookingPage() {
  const today = useMemo(() => startOfDay(new Date()), []);
  const minDate = today;
  const maxDate = useMemo(() => startOfDay(addMonths(today, 1)), [today]);
  const [ymd, setYmd] = useState(() => ymdFromDate(today));

  const CURRENT_MONTH = useMemo(() => ymd.slice(0, 7), [ymd]);
  const [selected, setSelected] = useState<SelectedSlot[]>([]);
  const [openSummary, setOpenSummary] = useState(false);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [bookingNos, setBookingNos] = useState<string[]>([]);
  const [errorModal, setErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const mv = useMonthView(CURRENT_MONTH);
  const base = useMemo(
    () => buildDayGridFromMonthView(mv.data, ymd),
    [mv.data, ymd]
  );

  const { cols, grid, priceGrid, courtIds, courtNames, minutesPerCell } =
    useMemo(() => {
      if (mv.isLoading || !base.cols.length || !base.grid.length)
        return buildPlaceholderGrid();
      return base;
    }, [mv.isLoading, base]);

  const { data: wallet } = useWalletBalanceRetrieve<{ balance: number }>();
  const { data: profile } = useAuthMeRetrieve<{ username: string; email: string }>();
  const coins = typeof wallet?.balance === "number" ? wallet.balance : null;

  useEffect(() => setSelected([]), [ymd]);

  const groups = useMemo(
    () => groupSelectionsWithPrice(selected, cols as Col[], priceGrid),
    [selected, cols, priceGrid]
  );
  const totalPrice = groups.reduce((s, g) => s + g.price, 0);
  const notEnough = coins !== null && totalPrice > coins;

  // ✅ ใช้ hook extras ใหม่
  const bookingMut = useBookingCreateWithBody(CURRENT_MONTH);

  const toggleSelect = (courtRow: number, colIdx: number, slotId?: string) => {
  const key = `${courtRow}-${colIdx}`;
  const exists = selected.some(
    (s) => `${s.courtRow}-${s.colIdx}` === key
  );
  setSelected((prev) =>
    exists
      ? prev.filter((s) => `${s.courtRow}-${s.colIdx}` !== key)
      : [...prev, { courtRow, colIdx, slotId }] // ✅ เก็บ slotId ด้วย
  );
};

  const handleConfirm = async () => {
    if (!groups.length) {
      alert("Please select at least one slot.");
      return;
    }
    if (notEnough) {
      alert("Your wallet balance is not enough.");
      return;
    }

    try {
      // 🧩 Derive slot IDs จาก selected cells
      const slotIds = selected
        .map((s) => s.slotId)
        .filter((id): id is string => Boolean(id));

      const payload: CreateBookingPayload = {
        club: 1,
        booking_method: "courtly web application",
        owner_username: profile?.username ?? "unknown_user",
        owner_contact: profile?.email ?? "unknown@example.com",
        payment_method: "coin",
        slots: slotIds,
      };

      const res = await bookingMut.mutateAsync(payload);

      setBookingNos([res?.booking_id]);
      setOpenSummary(false);
      setOpenConfirm(true);
      setSelected([]);
    } catch (e: any) {
      const status = e?.response?.status;
      let msg = "";
      if (status === 409) {
        msg = "This slot has just been taken. Please choose another one.";
      } else if (e?.response?.data?.detail) {
        msg = e.response.data.detail;
      } else {
        msg = e?.message || "Booking failed. Please try again.";
      }
      setErrorMessage(msg);
      setErrorModal(true);
      setOpenSummary(false);
    }
  };

  const shiftDay = (delta: number) => {
    const next = dateFromYmd(ymd);
    next.setDate(next.getDate() + delta);
    const clamped = clamp(startOfDay(next), minDate, maxDate);
    setYmd(ymdFromDate(clamped));
    setSelected([]);
  };

  const selCount = selected.length;
  const isLoading = mv.isLoading || bookingMut.isPending;

  return (
    <div className="mx-auto my-auto">
      {/* Title */}
      <div className="mb-4">
        <div className="flex items-end">
          <h1 className="text-2xl font-bold tracking-tight text-pine">
            Let’s Book Your Game!
          </h1>
          <p className="pl-2 text-l font-bold tracking-tight text-pine/80">
            (30 Minutes/Slot)
          </p>
        </div>
        <p className="text-s font-semibold tracking-tight text-dimgray">
          Choose your court and time below to make a booking.
        </p>
      </div>

      {/* Header row */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <DateNavigator
          value={dateFromYmd(ymd)}
          onChange={(d) =>
            setYmd(ymdFromDate(clamp(startOfDay(d), minDate, maxDate)))
          }
          minDate={minDate}
          maxDate={maxDate}
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
        currentDate={ymd}
      />

      {/* Bottom Info */}
      <div className="mt-5 mb-5 flex flex-col gap-2 pt-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="sm:order-1 order-2">
          <PlayerSlotStatusLegend />
        </div>
        <p className="sm:order-2 order-1 text-sm text-gray-600 text-left sm:text-right">
          💡 A slot = {minutesPerCell} minutes = 100 coins
        </p>
      </div>

      <FloatingLegend />

      {/* Modals */}
      <BookingSummaryModal
        open={openSummary}
        onClose={() => setOpenSummary(false)}
        groups={groups}
        courtNames={courtNames}
        totalPrice={totalPrice}
        notEnough={notEnough || bookingMut.isPending}
        onConfirm={handleConfirm}
        minutesPerCell={minutesPerCell}
        isSubmitting={isLoading}
      />

      <BookingConfirmedModal
        open={openConfirm}
        onClose={() => setOpenConfirm(false)}
        bookingNos={bookingNos}
      />

      <BookingErrorModal
        open={errorModal}
        message={errorMessage}
        onClose={() => setErrorModal(false)}
      />
    </div>
  );
}
