// src/ui/pages/player/PlayerBookingPage.tsx
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

import type { Col, SelectedSlot } from "@/lib/booking/slotGridModel";
import { groupSelectionsWithPrice } from "@/lib/booking/groupSelections";
import {
  buildDayGridFromMonthView,
  buildPlaceholderGrid,
} from "@/lib/booking/buildDayGridFromMonthView";

// custom hooks
import { useMonthView } from "@/api-client/extras/slots";
import { useBookingCreateWithBody } from "@/api-client/extras/booking";
import { useWalletMeRetrieve } from "@/api-client/endpoints/wallet/wallet";
import dayjs from "dayjs";
import CourtlyLoading from "@/ui/components/basic/LoadingOverlay";

/* =========================================================================
   Local Utilities
   ========================================================================= */
function startOfDay(d: Date) { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; }
function addMonths(d: Date, n: number) { const x = new Date(d); x.setMonth(x.getMonth() + n); return x; }
function clamp(d: Date, min: Date, max: Date) { if (d < min) return min; if (d > max) return max; return d; }
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
   Config
   ========================================================================= */
const CLUB_ID = Number(process.env.NEXT_PUBLIC_CLUB_ID);

export default function PlayerBookingPage() {
  // Date range: today → today + 1 month
  const today = useMemo(() => startOfDay(new Date()), []);
  const minDate = today;
  const maxDate = useMemo(() => startOfDay(addMonths(today, 1)), [today]);

  // Default to today (no past dates)
  const [ymd, setYmd] = useState<string>(() => ymdFromDate(today));
  const CURRENT_MONTH = useMemo(() => ymd.slice(0, 7), [ymd]); // "YYYY-MM"

  const [selected, setSelected] = useState<SelectedSlot[]>([]);
  const [openSummary, setOpenSummary] = useState(false);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [bookingNos, setBookingNos] = useState<string[]>([]);
  const [errorModal, setErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Load real month-view data
  const mv = useMonthView(CLUB_ID, CURRENT_MONTH);

  // Convert month-view data into a daily grid
  const base = useMemo(
    () => buildDayGridFromMonthView(mv.data, ymd),
    [mv.data, ymd]
  );

  // If still loading or no data → show placeholder grid
  const { cols, grid, priceGrid, courtIds, courtNames, minutesPerCell } =
    useMemo(() => {
      if (mv.isLoading || !base.cols.length || !base.grid.length) {
        return buildPlaceholderGrid();
      }
      return base;
    }, [mv.isLoading, base]);

  // Retrieve wallet balance
  const { data: wallet } = useWalletMeRetrieve();
  const coins = useMemo(() => {
    // @ts-ignore
    if (typeof wallet?.balance === "number") return wallet.balance as number;
    // @ts-ignore
    return null;
  }, [wallet]);

  // Clear selection when the day changes
  useEffect(() => setSelected([]), [ymd]);

  // Calculate price groups from grid
  const groups = useMemo(
    () => groupSelectionsWithPrice(selected, cols as Col[], priceGrid),
    [selected, cols, priceGrid]
  );
  const totalPrice = groups.reduce((s, g) => s + g.price, 0);
  const notEnough = coins !== null && totalPrice > coins;

  // Mutation for creating booking
  const bookingMut = useBookingCreateWithBody(CLUB_ID, CURRENT_MONTH);

  function toggleSelect(courtRow: number, colIdx: number) {
    const key = `${courtRow}-${colIdx}`;
    const exists = selected.some((s) => `${s.courtRow}-${s.colIdx}` === key);
    setSelected((prev) =>
      exists ? prev.filter((s) => `${s.courtRow}-${s.colIdx}` !== key) : [...prev, { courtRow, colIdx }]
    );
  }

  function handleConfirm() {
    if (!groups.length) { alert("Please select at least one slot."); return; }
    if (notEnough) { alert("Your wallet balance is not enough."); return; }

    const items = groups.map((g) => {
      const start = (cols[g.startIdx] as Col).start;
      const end = (cols[g.endIdx] as Col).end;
      const court = courtIds[g.courtRow - 1] ?? g.courtRow;
      return { court, date: ymd, start, end };
    });

    bookingMut.mutate(
      { club: CLUB_ID, items },
      {
        onSuccess: (res: any) => {
          setBookingNos(res?.booking?.booking_no);
          setOpenSummary(false);
          setOpenConfirm(true);
          setSelected([]);
        },
        onError: (e: any) => {
          const status = e?.response?.status;
          let msg = "";

          if (status === 409) {
            msg = "This slot has just been taken. Please choose another available time.";
          } else if (e?.response?.data?.detail) {
            msg = e.response.data.detail;
          } else {
            msg = e?.message || "Booking failed. Please try again.";
          }

          setErrorMessage(msg);
          setErrorModal(true);
          setOpenSummary(false);
        },
      }
    );
  }

  // Shift day while staying within min/max bounds
  function shiftDay(delta: number) {
    const next = dateFromYmd(ymd);
    next.setDate(next.getDate() + delta);
    const clamped = clamp(startOfDay(next), minDate, maxDate);
    setYmd(ymdFromDate(clamped));
    setSelected([]);
  }

  const selCount = selected.length;
  const isLoading = mv.isLoading || bookingMut.isPending;

  return (
    <div className="mx-auto my-auto">
      {/* Title and subtitle */}
      <div className="mb-4">
        <div className="flex items-end">
          <h1 className="text-2xl font-bold tracking-tight text-pine">
            Let’s Book Your Game!
          </h1>
          <p className="text-l pl-2 font-bold tracking-tight text-pine/80">
            (30 Minutes/Slot)
          </p>
        </div>
        <p className="text-s font-semibold tracking-tight text-dimgray">
          Choose your court and time below to make a booking.
        </p>
      </div>

      {/* Header Row */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <DateNavigator
          value={dateFromYmd(ymd)}
          onChange={(d) =>
            setYmd(ymdFromDate(clamp(startOfDay(d), minDate, maxDate)))
          }
          minDate={minDate}
          maxDate={maxDate}
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

      {/* Slot Grid */}
      <SlotGrid
        cols={cols as Col[]}
        grid={grid}
        courtNames={courtNames}
        selected={selected}
        onToggle={toggleSelect}
        currentDate={dayjs(today).format("YYYY-MM-DD")}
      />

      {/* Info section below grid */}
      <div className="mt-5 mb-5 flex flex-col gap-2 pt-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="sm:order-1 order-2">
          <PlayerSlotStatusLegend />
        </div>
        <p className="sm:order-2 order-1 text-sm text-gray-600 text-left sm:text-right">
          💡 A slot = {minutesPerCell} minutes = 100 coins · Coins are captured when you confirm
        </p>
      </div>

      {/* Floating Legend */}
      <FloatingLegend />

      {/* Booking Summary Modal */}
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

      {/* Booking Confirmed Modal */}
      <BookingConfirmedModal
        open={openConfirm}
        onClose={() => setOpenConfirm(false)}
        bookingNos={bookingNos}
      />

      {/* Error Modal */}
      <BookingErrorModal
        open={errorModal}
        message={errorMessage}
        onClose={() => setErrorModal(false)}
      />

      {/* Loading Overlay (optional) */}
      {/* <CourtlyLoading isLoading={isLoading} text="Loading ..." /> */}
    </div>
  );
}
