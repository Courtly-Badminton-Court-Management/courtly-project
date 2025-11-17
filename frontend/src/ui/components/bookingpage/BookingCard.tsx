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
  if (x === "upcoming") return "Upcoming";
  if (x === "booked") return "UpcomingBooked"; // debug
  return "Unknown";
}

function statusClass(s?: string) {
  const x = (s || "").toLowerCase();
  if (["upcoming"].includes(x))
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
  onCheckin,            // ⭐ NEW (เปิด CheckInModal)
  showCancelButton = true,
  showUserName = false,
  showCheckinButton = false,
  showInlineSlots = true,   // ⭐ NEW MODE
}: {
  booking: BookingRow;
  onCancel?: (b: BookingRow) => void;
  onCheckin?: (b: BookingRow) => void;
  showCancelButton?: boolean;
  showUserName?: boolean;
  showCheckinButton?: boolean;
  showInlineSlots?: boolean; // ⭐ default true
}) {
  const slotItems = Object.values(booking.booking_slots || {});
  const canCancel = booking.able_to_cancel;

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

        {/* ⭐ Inline Slot Details only if enabled */}
        {showInlineSlots && (
          <div className="mt-2">
            <SlotsBookingCard slotItems={slotItems} minutesPerCell={30} />
          </div>
        )}

        {/* Footer */}
        <div className="mt-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex flex-col">
            {showUserName && (
              <p className="text-sm text-neutral-600 mb-1">
                Booked by:{" "}
                <span className="font-medium text-neutral-800">
                  {booking.owner_username}
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

            {/* Checkin Button */}
            {showCheckinButton && (
              <Button
                label="Check In"
                bgColor={
                  (onCheckin && !canCancel)
                    ? "bg-copper-rust hover:bg-red-700"
                    : "bg-neutral-200 hover:bg-neutral-200"
                }
                textColor={(onCheckin && !canCancel) ? "text-white" : "text-gray-400"}
                onClick={() => !canCancel && onCheckin?.(booking)}
                disabled={canCancel}
                className={
                  canCancel
                    ? "transition hover:scale-[1.02] active:scale-[0.98]"
                    : ""
                }
              />
            )}

            {/* Cancel Button*/}
            {showCancelButton && (
              <Button
                label="Cancel Booking"
                bgColor={
                  canCancel
                    ? "bg-copper-rust hover:bg-red-700"
                    : "bg-neutral-200 hover:bg-neutral-200"
                }
                textColor={canCancel ? "text-white" : "text-gray-400"}
                onClick={() => canCancel && onCancel?.(booking)}
                disabled={!canCancel}
                className={
                  canCancel
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
