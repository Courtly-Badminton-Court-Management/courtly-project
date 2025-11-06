"use client";

import React from "react";
import { CalendarRange, Clock3, Coins, MapPin } from "lucide-react";
import dayjs from "dayjs";
import Button from "@/ui/components/basic/Button";
import type { SlotItem, BookingRow } from "@/api-client/extras/types";


/* ======================== Utils ======================== */
function formatDuration(mins: number) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h && m) return `${h} hr ${m} min`;
  if (h) return `${h} hr`;
  return `${m} min`;
}

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

/* ======================== Group Slots ======================== */
function groupSlots(slots: SlotItem[]) {
  const grouped: Record<string, SlotItem[]> = {};

  for (const s of slots) {
    grouped[s.court_name] ??= [];
    grouped[s.court_name].push(s);
  }

  const out: {
    court: string;
    timeLabel: string;
    durationMins: number;
    price: number;
  }[] = [];

  Object.entries(grouped).forEach(([court, arr]) => {
    const sorted = [...arr].sort((a, b) =>
      a.start_time.localeCompare(b.start_time)
    );

    let start = sorted[0];
    let prevEnd = sorted[0].end_time;
    let slotCount = 1;
    let priceSum = sorted[0].price_coin ?? 0;

    for (let i = 1; i <= sorted.length; i++) {
      const cur = sorted[i];
      if (!cur || cur.start_time !== prevEnd) {
        out.push({
          court,
          timeLabel: `${start.start_time}–${prevEnd}`,
          durationMins: slotCount * 30,
          price: priceSum ?? 0,
        });
        if (cur) {
          start = cur;
          prevEnd = cur.end_time;
          slotCount = 1;
          priceSum = cur.price_coin ?? 0;
        }
      } else {
        prevEnd = cur.end_time;
        slotCount++;
        priceSum += cur.price_coin ?? 0;
      }
    }
  });

  return out.sort((a, b) => a.court.localeCompare(b.court));
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
  const slots = Object.values(booking.booking_slots || {});
  const grouped = groupSlots(slots);

  return (
    <li className="relative overflow-hidden rounded-2xl border border-neutral-200 bg-gradient-to-b from-white to-neutral-50 shadow-sm hover:shadow-md transition-all duration-200">
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

        {/* Slot Groups */}
        <ul className="space-y-3">
          {grouped.map((it, idx) => (
            <li
              key={`${booking.booking_id}-${it.court}-${idx}`}
              className="rounded-xl border border-gray-100 bg-gray-50 p-4 shadow-sm transition hover:bg-gray-100/80"
            >
              <div className="flex items-start justify-between gap-3">
                <span className="inline-flex items-center rounded-full bg-sea/10 px-2.5 py-1 text-xs font-semibold text-teal-800 ring-1 ring-inset ring-sea/50">
                  <MapPin className="mr-1 h-3.5 w-3.5" />
                  {it.court}
                </span>
                <div className="flex items-center gap-1 text-sm font-bold text-gray-900">
                  <Coins className="h-4 w-4 opacity-80" />
                  {(it.price ?? 0).toLocaleString()} coins
                </div>
              </div>
              <div className="mt-3 grid gap-2 text-[13px] text-gray-700 sm:grid-cols-2">
                <div className="flex items-center gap-2">
                  <Clock3 className="h-4 w-4 text-gray-400" />
                  <span className="font-medium">Time:</span>
                  <span className="text-gray-800">{it.timeLabel}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock3 className="h-4 w-4 text-gray-400" />
                  <span className="font-medium">Duration:</span>
                  <span className="text-gray-800">
                    {formatDuration(it.durationMins)}
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ul>

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
