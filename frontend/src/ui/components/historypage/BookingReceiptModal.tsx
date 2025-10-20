"use client";

import React, { useMemo } from "react";
import dayjs from "dayjs";
import Modal from "@/ui/components/basic/Modal";
import { CalendarRange, Clock3, Coins, MapPin } from "lucide-react";
import { historyBookingToGroups } from "@/lib/booking/historyToGroups";

type BookingRow = {
  booking_no?: string;
  booking_id?: string;
  status?: string;
  created_at?: string;
  created_date?: string;
  booking_date?: string;
  total_cost?: number | string;
  slots?: any[];
};

const MINUTES_PER_CELL = 30; // ปรับตามระบบ

const resolveBookingNo = (b?: BookingRow | null) => b?.booking_no ?? b?.booking_id ?? "";
const fmtCoins = (v: unknown) =>
  typeof v === "number" ? `${v} coins` : /coins$/i.test(String(v)) ? String(v) : `${v ?? 0} coins`;

const statusLabel = (s?: string) => {
  const x = (s || "").toLowerCase();
  if (x === "endgame" || x === "end_game" || x === "completed") return "End Game";
  if (x === "no_show" || x === "no-show") return "No-show";
  if (x === "cancelled") return "Cancelled";
  return "Upcoming";
};
const statusPillClass = (s?: string) => {
  const x = (s || "").toLowerCase();
  if (x === "endgame" || x === "end_game" || x === "completed")
    return "bg-neutral-100 text-neutral-600 ring-1 ring-neutral-200";
  if (x === "no_show" || x === "no-show")
    return "bg-neutral-100 text-neutral-600 ring-1 ring-neutral-200";
  if (x === "cancelled") return "bg-rose-100 text-rose-700 ring-1 ring-rose-200";
  return "bg-[#f2e8e8] text-[#6b3b3b] ring-1 ring-[#d8c0c0]";
};

function formatDuration(mins: number) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h && m) return `${h} hr ${m} min`;
  if (h) return `${h} hr`;
  return `${m} min`;
}

export default function BookingReceiptModal({
  open,
  onClose,
  booking,
}: {
  open: boolean;
  onClose: () => void;
  booking: BookingRow | null;
}) {
  if (!booking) return null;

  const bookingNo = resolveBookingNo(booking);

  // group เหมือน summary modal
  const groups = useMemo(
    () => historyBookingToGroups(booking as any, MINUTES_PER_CELL, 0),
    [booking],
  );

  const items = useMemo(
    () =>
      groups.map((g) => ({
        courtLabel: `Court ${g.courtRow}`,
        timeLabel: g.timeLabel,
        durationText: formatDuration(g.slots * MINUTES_PER_CELL),
        priceText: fmtCoins(g.price),
      })),
    [groups],
  );

  const totalCoins =
    booking.total_cost !== undefined
      ? fmtCoins(booking.total_cost)
      : fmtCoins(groups.reduce((sum, g) => sum + (g.price || 0), 0));

  const status = booking.status ?? "upcoming";
  const createdAt = booking.created_at ?? booking.created_date ?? undefined;
  const bookingDate =
    booking.booking_date ??
    booking.slots?.[0]?.slot_service_date ??
    booking.slots?.[0]?.service_date ??
    undefined;

  return (
    <Modal open={open} onClose={onClose} title="Booking Summary">
      <div className="p-2" />

      {/* Header */}
      <div className="px-4 text-center">
        <div className="text-[15px] text-[#2a756a]">
          Booking ID:{" "}
          <span className="font-semibold underline underline-offset-4">
            {bookingNo || "-"}
          </span>
        </div>
        <div className="mt-1 text-sm text-neutral-500">
          Create At: {createdAt ? dayjs(createdAt).format("D MMMM YYYY HH:mm") : "-"}
        </div>
      </div>

      {/* Date + Status */}
      <div className="mt-4 flex items-center justify-between px-4 text-[15px]">
        <div className="font-semibold text-neutral-800">
          Booking Date:{" "}
          <span className="font-bold">
            {bookingDate ? dayjs(bookingDate).format("D MMMM YYYY") : "-"}
          </span>
        </div>
        <div>
          <span
            className={`inline-flex items-center gap-2 rounded-md px-3 py-1 text-sm ${statusPillClass(
              status,
            )}`}
          >
            <span className="h-3 w-3 rounded-sm bg-neutral-400" />
            {statusLabel(status)}
          </span>
        </div>
      </div>

      {/* Items (เหมือน Summary ตอนจอง) */}
      <div className="mt-4 space-y-3 px-4">
        {items.length === 0 && (
          <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4 text-center text-neutral-500">
            No slot data.
          </div>
        )}

        {items.map((it, i) => (
          <div key={i} className="rounded-2xl border border-neutral-200 bg-white p-3">
            <div className="flex items-start justify-between">
              <span className="inline-flex items-center rounded-full bg-[#e5f2ef] px-3 py-1 text-[#2a756a]">
                <MapPin className="mr-1 h-4 w-4" />
                <span className="text-[14px] font-semibold">{it.courtLabel}</span>
              </span>
              <div className="flex items-center gap-2 text-[15px] font-semibold text-neutral-800">
                <Coins className="h-4 w-4" />
                {it.priceText}
              </div>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-3 text-[15px] text-neutral-700 max-[460px]:grid-cols-1">
              <div className="flex items-center gap-2">
                <CalendarRange className="h-4 w-4 text-neutral-500" />
                <span className="text-neutral-500">Time:</span>
                <span className="font-medium">{it.timeLabel}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock3 className="h-4 w-4 text-neutral-500" />
                <span className="text-neutral-500">Duration:</span>
                <span className="font-medium">{it.durationText}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Total */}
      <div className="mt-4 flex items-center justify-between rounded-b-2xl px-4 pb-4 pt-2 text-[17px] font-semibold">
        <div>Total</div>
        <div className="flex items-center gap-2">
          <Coins className="h-5 w-5" />
          {totalCoins}
        </div>
      </div>
    </Modal>
  );
}
