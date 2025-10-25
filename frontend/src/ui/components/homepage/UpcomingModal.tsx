"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import Button from "@/ui/components/basic/Button";
import {
  CalendarRange,
  Clock3,
  Coins,
  MapPin,
  CalendarDays,
  Loader2,
} from "lucide-react";
import dayjs from "dayjs";

export type SlotItem = {
  status: string;
  start_time: string;
  end_time: string;
  court: number;
  court_name: string;
  price_coin: number;
};

export type BookingRow = {
  created_date: string;
  booking_id: string;
  user: string;
  total_cost: string | number;
  booking_date: string;
  booking_status: string;
  able_to_cancel: boolean;
  booking_slots: Record<string, SlotItem>;
};

/* ======================== Helper Functions ======================== */
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

/* ======================== Group Slots Logic ======================== */
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
export default function UpcomingModal({
  bookings,
  isLoading = false,
  onCancel,
}: {
  bookings: BookingRow[];
  isLoading?: boolean;
  onCancel?: (booking: BookingRow) => void;
}) {
  const router = useRouter();

  // ✅ Fade animation
  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
      @keyframes fadeUp {
        from { opacity: 0; transform: translateY(6px); }
        to { opacity: 1; transform: translateY(0); }
      }
    `;
    document.head.appendChild(style);
    return () => style.remove();
  }, []);

  /* ======================== Loading State ======================== */
  if (isLoading) {
    return (
      <aside className="rounded-2xl border border-platinum bg-white p-8 shadow-sm text-center">
        <div className="flex flex-col items-center justify-center space-y-3 animate-[fadeUp_0.4s_ease]">
          <div className="relative">
            <img
              src="/brand/shuttlecock.png"
              alt="Courtly shuttlecock"
              className="h-12 w-12 animate-[spin_1.3s_linear_infinite]"
            />
          </div>
          <p className="text-sm font-medium text-pine">Fetching your upcoming games...</p>
        </div>
      </aside>
    );
  }

  /* ======================== Empty State ======================== */
  if (!bookings?.length) {
    return (
      <aside className="rounded-2xl border border-platinum bg-white p-6 shadow-sm transition hover:shadow-md text-center">
        <div className="flex flex-col items-center gap-3 animate-[fadeUp_0.4s_ease]">
          <div className="rounded-full bg-pine/10 p-2 text-pine">
          <CalendarDays className="h-6 w-6 text-pine" />
          </div>
          <h3 className="text-lg font-semibold text-pine">No Upcoming Games 🏸</h3>
          <p className="text-sm text-gray-500">
            Book a court and get ready to play!
          </p>
          <Button
            label="Wanna book now?"
            bgColor="bg-sea hover:bg-pine"
            textColor="text-white"
            className="mt-3"
            onClick={() => router.push("/booking")}
          />
        </div>
      </aside>
    );
  }

  /* ======================== Main Content ======================== */
  return (
    <aside className="rounded-2xl border border-platinum bg-white p-6 shadow-sm transition hover:shadow-md">
      <div className="flex items-center gap-2 mb-5">
        <div className="rounded-full bg-pine/10 p-2 text-pine">
          <CalendarDays className="h-6 w-6 text-pine" />
          </div>
        <h3 className="text-lg font-bold text-pine">Upcoming Booking</h3>
      </div>

      <ul className="space-y-5 animate-[fadeUp_0.4s_ease]">
        {bookings.map((bk, i) => {
          const slots = Object.values(bk.booking_slots || {});
          const grouped = groupSlots(slots);

          return (
            <li
              key={`${bk.booking_id}-${i}`}
              className="relative overflow-hidden rounded-2xl border border-neutral-200 bg-gradient-to-b from-white to-neutral-50 shadow-sm hover:shadow-md transition-all duration-200"
            >
              <div className="absolute left-0 top-0 h-1.5 w-full bg-gradient-to-r from-sea to-pine"></div>

              <div className="p-4 sm:p-5">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
                  <div>
                    <div className="text-xs text-gray-500">Booking ID</div>
                    <div className="font-mono text-[15px] font-semibold text-walnut tracking-tight">
                      {bk.booking_id}
                    </div>
                  </div>
                  <span
                    className={`inline-flex items-center justify-center rounded-full px-3 py-1 text-xs font-semibold ${statusClass(
                      bk.booking_status
                    )}`}
                  >
                    {statusLabel(bk.booking_status)}
                  </span>
                </div>

                <div className="mb-4 flex items-center text-sm text-gray-600">
                  <CalendarRange className="h-4 w-4 mr-1 text-gray-400" />
                  {dayjs(bk.booking_date).format("DD MMMM YYYY")}
                </div>

                <ul className="space-y-3">
                  {grouped.map((it, idx) => (
                    <li
                      key={`${bk.booking_id}-${i}-${it.court}-${it.timeLabel}-${idx}`}
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

                <div className="mt-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-center gap-2 text-[15px] font-bold text-gray-900">
                    <Coins className="h-4 w-4 opacity-80" />
                    {typeof bk.total_cost === "number"
                      ? `${bk.total_cost.toLocaleString()} coins`
                      : bk.total_cost}
                  </div>

                  <Button
                    label="Cancel Booking"
                    bgColor={
                      bk.able_to_cancel
                        ? "bg-copper-rust hover:bg-red-700"
                        : "bg-neutral-200 hover:bg-neutral-200"
                    }
                    textColor={
                      bk.able_to_cancel ? "text-white" : "text-gray-400"
                    }
                    onClick={() => bk.able_to_cancel && onCancel?.(bk)}
                    disabled={!bk.able_to_cancel}
                    className={
                      bk.able_to_cancel
                        ? "transition hover:scale-[1.02] active:scale-[0.98]"
                        : ""
                    }
                  />
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
