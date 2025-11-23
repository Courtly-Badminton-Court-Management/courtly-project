// frontend/src/ui/pages/manager/ManagerControlPage.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

import DateNavigator from "@/ui/components/bookingpage/DateNavigator";
import ManagerSlotStatusLegend from "@/ui/components/controlpage/ManagerSlotStatusLegend";
import WalkinSummaryModal from "@/ui/components/controlpage/WalkinSummaryModal";
import WalkinConfirmedModal from "@/ui/components/controlpage/WalkinConfirmedModal";
import BookingErrorModal from "@/ui/components/bookingpage/BookingErrorModal";

import { useMonthView } from "@/api-client/extras/slots";
import { useUpdateSlotStatus } from "@/api-client/extras/update_slots";
import { useBookingCreateWithBody } from "@/api-client/extras/booking";

import {
  buildDayGridFromMonthView,
  buildPlaceholderGrid,
} from "@/lib/slot/buildDayGridFromMonthView";
import { groupSelectionsWithPrice } from "@/lib/slot/groupSelections";
import type {
  Col,
  ManagerSelectedSlot,
  GridCell,
} from "@/lib/slot/slotGridModel";

const SlotGridManager = dynamic(
  () => import("@/ui/components/controlpage/SlotGridManager"),
  { ssr: false }
);

// Shape of payload sent to the booking API for walk-in/admin bookings
type CreateBookingPayload = {
  club: number;
  booking_method: string;
  owner_username: string;
  owner_contact: string;
  payment_method: string;
  slots: string[];
};

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
function readStatus(cell: GridCell): string {
  return String((cell as any)?.status ?? "").trim().toLowerCase();
}
function normalizeForManager(
  statusRaw: string
): "available" | "maintenance" | string {
  const status = (statusRaw || "").toLowerCase();
  if (status === "available") return "available";
  if (status === "maintenance") return "maintenance";
  return status;
}

/* =========================================================================
   CONFIG
   ========================================================================= */
// const CLUB_ID = Number(process.env.NEXT_PUBLIC_CLUB_ID);
const CLUB_ID = 1;

export default function ManagerControlPage() {
  const today = useMemo(() => startOfDay(new Date()), []);
  const minDate = today;
  const maxDate = useMemo(
    () => startOfDay(addMonths(today, 1)),
    [today]
  );

  const [ymd, setYmd] = useState<string>(() => ymdFromDate(today));
  const CURRENT_MONTH = useMemo(() => ymd.slice(0, 7), [ymd]);

  const [selected, setSelected] = useState<ManagerSelectedSlot[]>([]);
  const [selectionMode, setSelectionMode] = useState<
    "available" | "maintenance" | null
  >(null);

  const [openSummary, setOpenSummary] = useState(false);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [bookingNos, setBookingNos] = useState<string[]>([]);
  const [errorModal, setErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isBatchLoading, setIsBatchLoading] = useState(false);

  // ======= Hooks =======
  const mv = useMonthView(CURRENT_MONTH);
  const updateStatusMut = useUpdateSlotStatus();
  const bookingMut = useBookingCreateWithBody(CURRENT_MONTH);

  const base = useMemo(
    () => buildDayGridFromMonthView(mv.data, ymd),
    [mv.data, ymd]
  );
  const { cols, grid, priceGrid, courtNames, minutesPerCell } = useMemo(() => {
    if (mv.isLoading || !base.cols.length || !base.grid.length) {
      return buildPlaceholderGrid();
    }
    return base;
  }, [mv.isLoading, base]);

  // ======= Selection =======
  useEffect(() => {
    setSelected([]);
    setSelectionMode(null);
  }, [ymd]);

  const groups = useMemo(
    () => groupSelectionsWithPrice(selected, cols as Col[], priceGrid),
    [selected, cols, priceGrid]
  );

  const selCount = selected.length;
  const isLoading =
    mv.isLoading || updateStatusMut.isPending || bookingMut.isPending || isBatchLoading;

  // ======= Toggle Select =======
  function toggleSelect(courtRow: number, colIdx: number, slotId?: string) {
    const status = normalizeForManager(
      readStatus(grid[courtRow - 1][colIdx])
    );

    if (!selectionMode) {
      setSelectionMode(status as "available" | "maintenance");
    }

    if (selectionMode && selectionMode !== status) {
      setSelected([{ courtRow, colIdx, slotId: slotId ?? "" }]);
      setSelectionMode(status as "available" | "maintenance");
      return;
    }

    const key = `${courtRow}-${colIdx}-${slotId}`;
    const exists = selected.some(
      (s) => `${s.courtRow}-${s.colIdx}-${s.slotId}` === key
    );
    setSelected((prev) =>
      exists
        ? prev.filter(
            (s) => `${s.courtRow}-${s.colIdx}-${s.slotId}` !== key
          )
        : [...prev, { courtRow, colIdx, slotId: slotId ?? "" }]
    );
  }

  function clearSelection() {
    setSelected([]);
  }

  // ======= Maintenance Toggle =======
  async function handleSetMaintenance() {
    if (!selected.length) {
      alert("Please select at least one slot.");
      return;
    }

    // รวม slotIds ทั้งหมดที่เลือก
    const slotIds = selected
      .map((s) => s.slotId)
      .filter((id): id is string => Boolean(id));

    if (!slotIds.length) {
      alert("Cannot find any valid slot IDs. Please try selecting again.");
      return;
    }

    const newStatus: "available" | "maintenance" =
      selectionMode === "maintenance" ? "available" : "maintenance";

    setIsBatchLoading(true);

    try {
      // 🔥 ยิงทีเดียวด้วย list ทั้งหมด
      await updateStatusMut.mutateAsync({
        slotIds,
        status: newStatus,
        month: CURRENT_MONTH,
      });
    } catch (error) {
      // console.error("❌ Update slot failed:", error);
      // alert("Some slots failed to update. Please check the console.");
    } finally {
      setIsBatchLoading(false);
      setSelected([]);
      setSelectionMode(null);
    }
  }

  // ======= Walk-in =======
  async function handleConfirm(customer: {
    name: string;
    paymentMethod: string;
    contactMethod: string;
    contactDetail?: string;
  }) {
    if (!selected.length) {
      alert("Please select at least one slot.");
      return;
    }

    const slotIds = selected
      .map((s) => s.slotId)
      .filter((id): id is string => Boolean(id));

    if (!slotIds.length) {
      alert("Cannot find any valid slot IDs. Please try selecting again.");
      return;
    }

    setIsBatchLoading(true);

    try {
      const payload: CreateBookingPayload = {
        club: CLUB_ID,
        booking_method: customer.contactMethod,
        owner_username: customer.name,
        owner_contact: customer.contactDetail || "walk-in (no contact)",
        payment_method: customer.paymentMethod,
        slots: slotIds,
      };

      const res = await bookingMut.mutateAsync(payload);

      if (res && (res as any).booking_id) {
        setBookingNos([(res as any).booking_id]);
      } else {
        setBookingNos([]);
      }

      setOpenSummary(false);
      setOpenConfirm(true);
      setSelected([]);
      setSelectionMode(null);
    } catch (e: any) {
      // console.error("❌ Walk-in booking failed:", e);
      const status = e?.response?.status;
      let msg = "";
      if (status === 409) {
        msg =
          "This slot has just been taken. Please choose another available time.";
      } else if (e?.response?.data?.detail) {
        msg = e.response.data.detail;
      } else {
        msg = e?.message || "Walk-in booking failed. Please try again.";
      }
      setErrorMessage(msg);
      setErrorModal(true);
      setOpenSummary(false);
    } finally {
      setIsBatchLoading(false);
    }
  }

  // ======= Date shift (ถ้าจะเอาไปใช้ที่อื่นต่อได้) =======
  function shiftDay(delta: number) {
    const next = dateFromYmd(ymd);
    next.setDate(next.getDate() + delta);
    const clamped = clamp(startOfDay(next), minDate, maxDate);
    setYmd(ymdFromDate(clamped));
    setSelected([]);
    setSelectionMode(null);
  }

  /* ========================== UI ========================== */
  return (
    <div className="relative mx-auto my-auto">
      {isBatchLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-2 text-white">
            <Loader2 className="animate-spin h-8 w-8" />
            <p className="font-semibold text-sm">Updating slots...</p>
          </div>
        </div>
      )}

      {/* ===== Header ===== */}
      <div className="mb-4">
        <div className="flex items-end">
          <h1 className="text-2xl font-bold tracking-tight text-pine">
            Manage Court Slots
          </h1>
          <p className="text-l pl-2 font-bold tracking-tight text-pine/80">
            (30 Minutes/Slot)
          </p>
        </div>
        <p className="text-s font-semibold tracking-tight text-dimgray">
          You can mark slots as maintenance or create walk-in bookings.
        </p>
      </div>

      {/* ===== Controls ===== */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <DateNavigator
          value={dateFromYmd(ymd)}
          onChange={(d) =>
            setYmd(
              ymdFromDate(
                clamp(startOfDay(d), minDate, maxDate)
              )
            )
          }
          minDate={minDate}
          maxDate={maxDate}
        />

        <div className="flex items-center gap-3">
          <button
            onClick={handleSetMaintenance}
            className={`rounded-xl text-white px-4 py-2 text-sm font-semibold transition-all ${
              selCount
                ? "bg-maintenance hover:bg-gray-600"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
            disabled={!selected.length || isLoading}
          >
            {selectionMode === "maintenance"
              ? "Set as Available"
              : "Set as Maintenance"}
          </button>

          <button
            onClick={() => setOpenSummary(true)}
            disabled={!selected.length || isLoading}
            className={`rounded-xl px-4 py-2 text-sm font-bold transition-colors ${
              selCount
                ? "bg-walkin text-white hover:bg-[var(--color-walkin)]/80"
                : "bg-neutral-200 text-neutral-500 cursor-not-allowed"
            }`}
          >
            {selCount
              ? `Book Walk-in (${selCount} selected)`
              : "Select Slot!"}
          </button>
        </div>
      </div>

      {/* ===== Grid ===== */}
      <SlotGridManager
        cols={cols as Col[]}
        grid={grid}
        courtNames={courtNames}
        currentDate={ymd}
        selected={selected}
        selectionMode={selectionMode}
        setSelectionMode={setSelectionMode}
        onToggle={toggleSelect}
        clearSelection={clearSelection}
      />

      {/* ===== Legend ===== */}
      <div className="mt-5 mb-5 flex flex-col gap-2 pt-3 sm:flex-row sm:items-center sm:justify-between">
        <ManagerSlotStatusLegend />
        {selCount > 0 && (
          <p className="text-sm font-semibold text-pine sm:order-2 order-1">
            {selCount} slot{selCount > 1 ? "s" : ""} selected
          </p>
        )}
      </div>

      {/* ===== Modals ===== */}
      <WalkinSummaryModal
        open={openSummary}
        onClose={() => setOpenSummary(false)}
        groups={groups}
        courtNames={courtNames}
        onConfirm={handleConfirm}
        minutesPerCell={minutesPerCell}
        isSubmitting={isLoading}
      />

      <WalkinConfirmedModal
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
