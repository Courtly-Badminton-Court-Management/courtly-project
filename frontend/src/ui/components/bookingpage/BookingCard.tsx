"use client";

import React from "react";
import { CalendarRange, Coins } from "lucide-react";
import dayjs from "dayjs";
import Button from "@/ui/components/basic/Button";
import SlotsBookingCard from "@/ui/components/bookingpage/SlotsBookingCard";
import type { BookingRow } from "@/api-client/extras/types";

/* ======================== Utils ======================== */
function statusLabel(s?: string) {
  const x = (s || "").toLowerCase();
  if (x === "end_game" || x === "endgame") return "End Game";
  if (x === "cancelled") return "Cancelled";
  if (x === "no_show" || x === "no-show") return "No-show";
  if (x === "confirmed") return "Upcoming";
  return "Unknown";
}

function statusClass(s?: string) {
  const x = (s || "").toLowerCase();
  if (["confirmed"].includes(x))
    return "bg-sea/10 text-sea ring-1 ring-inset ring-sea/30";
  if (["cancelled"].includes(x))
    return "bg-rose-100 text-rose-700 ring-1 ring-rose-200";
  if (["end_game", "endgame"].includes(x))
    return "bg-neutral-100 text-neutral-600 ring-1 ring-neutral-200";
  return "bg-neutral-100 text-neutral-500 ring-1 ring-neutral-200";
}

/* ======================== Component ======================== */
export default function BookingCard({
  booking,
  onCancel,
  showCancelButton = true,
  showUserName = false,
  showCheckinButton = false,
}: {
  booking: BookingRow;
  onCancel?: (b: BookingRow) => void;
  showCancelButton?: boolean;
  showUserName?: boolean;
  showCheckinButton?: boolean;
}) {
  const slotItems = Object.values(booking.booking_slots || {});

  return (
    <li className="relative overflow-hidden rounded-2xl border border-neutral-200 bg-gradient-to-b from-white to-neutral-50 shadow-sm hover:shadow-md transition-all duration-200">
      {/* Top highlight bar */}
      <div className="absolute left-0 top-0 h-1.5 w-full bg-gradient-to-r from-sea to-pine" />

      <div className="p-4 sm:p-5">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
          <div>
            <div className="text-xs text-gray-500">Booking ID</div>
            <div className="font-mono text-[15px] font-semibold text-walnut tracking-tight">
              {booking.booking_id}
            </div>
          </div>
          <span
            className={`inline-flex items-center justify-center rounded-full px-3 py-1 text-xs font-semibold ${statusClass(
              booking.booking_status
            )}`}
          >
            {statusLabel(booking.booking_status)}
          </span>
        </div>

        {/* Date */}
        <div className="mb-4 flex items-center text-sm text-gray-600">
          <CalendarRange className="h-4 w-4 mr-1 text-gray-400" />
          {dayjs(booking.booking_date).format("DD MMMM YYYY")}
        </div>

        {/* ✅ Slot Summary (ใช้ SlotsBookingCard แทน groupSlots เดิม) */}
        <SlotsBookingCard slotItems={slotItems} minutesPerCell={30} />

        {/* Footer */}
        <div className="mt-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex flex-col">
            {showUserName && (
              <p className="text-sm text-neutral-600 mb-1">
                Booked by:{" "}
                <span className="font-medium text-neutral-800">
                  {booking.user}
                </span>
              </p>
            )}
            <div className="flex items-center gap-2 text-[15px] font-bold text-gray-900">
              <Coins className="h-4 w-4 opacity-80" />
              {typeof booking.total_cost === "number"
                ? `${booking.total_cost.toLocaleString()} coins`
                : booking.total_cost}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {showCheckinButton && (
              <Button
                label="Check-in"
                bgColor="bg-sea hover:bg-pine"
                textColor="text-white"
                onClick={() => {}}
              />
            )}

            {showCancelButton && (
              <Button
                label="Cancel Booking"
                bgColor={
                  booking.able_to_cancel
                    ? "bg-copper-rust hover:bg-red-700"
                    : "bg-neutral-200 hover:bg-neutral-200"
                }
                textColor={
                  booking.able_to_cancel ? "text-white" : "text-gray-400"
                }
                onClick={() =>
                  booking.able_to_cancel && onCancel?.(booking)
                }
                disabled={!booking.able_to_cancel}
                className={
                  booking.able_to_cancel
                    ? "transition hover:scale-[1.02] active:scale-[0.98]"
                    : ""
                }
              />
            )}
          </div>
        </div>
      </div>
    </li>
  );
}
