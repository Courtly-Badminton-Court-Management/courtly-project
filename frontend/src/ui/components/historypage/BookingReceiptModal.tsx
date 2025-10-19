"use client";

import React, { useMemo } from "react";
import dayjs from "dayjs";
import Modal from "@/ui/components/basic/Modal";
import { CalendarRange, Clock3, Coins, MapPin } from "lucide-react";

/** ==== Types (ยืดหยุ่นตาม backend) ==== */
type SlotItem = {
  slot?: number;
  slot_court?: number; court?: number;

  slot_service_date?: string;  service_date?: string;

  slot_start_at?: string | null; start_at?: string | null; start_time?: string | null; start?: string | null;
  slot_end_at?: string | null;   end_at?: string | null;   end_time?: string | null;   end?: string | null;

  price_coins?: number | string; price?: number | string;
};

type BookingRow = {
  id?: number | string;
  booking_no?: string;
  booking_id?: string;
  user?: string;
  status?: string;
  created_at?: string;
  created_date?: string;
  booking_date?: string;
  total_cost?: number | string;
  able_to_cancel?: boolean;
  slots?: SlotItem[];
};

/** ==== Helpers ==== */
const resolveBookingNo = (b?: BookingRow | null) =>
  b?.booking_no ?? b?.booking_id ?? "";

const fmtCoins = (v: unknown) => {
  if (v === null || v === undefined) return "0 coins";
  if (typeof v === "number") return `${v} coins`;
  const s = String(v).trim();
  return /coins$/i.test(s) ? s : `${s} coins`;
};

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

const toHHmm = (v?: string | null) => {
  if (!v) return null;
  const m = v.match(/\d{1,2}:\d{2}/);
  return m ? m[0] : dayjs(v).isValid() ? dayjs(v).format("HH:mm") : null;
};

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

  const rows = useMemo(() => {
    const list = booking.slots ?? [];
    return list.map((s, idx) => {
      const court = s.slot_court ?? s.court;
      const serviceDate =
        s.slot_service_date ?? s.service_date ?? booking.booking_date ?? null;

      const start =
        toHHmm(s.slot_start_at ?? s.start_at ?? s.start_time ?? s.start ?? null);
      const end =
        toHHmm(s.slot_end_at ?? s.end_at ?? s.end_time ?? s.end ?? null);

      // duration
      let durationText = "-";
      if (start && end) {
        const [sh, sm] = start.split(":").map(Number);
        const [eh, em] = end.split(":").map(Number);
        const mins = eh * 60 + em - (sh * 60 + sm);
        if (mins > 0) {
          const h = Math.floor(mins / 60);
          const m = mins % 60;
          durationText = [h ? `${h} hr` : "", m ? `${m} min` : ""]
            .filter(Boolean)
            .join(" ")
            .trim() || "0 min";
        }
      }

      const price = s.price_coins ?? s.price ?? 0;

      return {
        key: `${s.slot ?? court ?? idx}-${start ?? "?"}-${end ?? "?"}`,
        court,
        priceText: fmtCoins(price),
        timeText: start && end ? `${start} - ${end}` : "-",
        durationText,
        dateText: serviceDate ? dayjs(serviceDate).format("D MMMM YYYY") : "-",
      };
    });
  }, [booking]);

  const totalText =
    booking.total_cost !== undefined
      ? fmtCoins(booking.total_cost)
      : fmtCoins(
          (booking.slots ?? []).reduce((sum, s) => {
            const raw = s.price_coins ?? s.price ?? 0;
            const n =
              typeof raw === "number"
                ? raw
                : Number(String(raw).replace(/[^\d.-]/g, "")) || 0;
            return sum + n;
          }, 0),
        );

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

      {/* Slot list */}
      <div className="mt-4 space-y-3 px-4">
        {rows.length === 0 && (
          <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4 text-center text-neutral-500">
            No slot data.
          </div>
        )}

        {rows.map((r) => (
          <div key={r.key} className="rounded-2xl border border-neutral-200 bg-white p-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2 rounded-full bg-[#e5f2ef] px-3 py-1 text-[#2a756a]">
                <MapPin className="h-4 w-4" />
                <span className="text-[14px] font-semibold">
                  Court {r.court ?? "-"}
                </span>
              </div>

              <div className="flex items-center gap-2 text-[15px] font-semibold text-neutral-800">
                <Coins className="h-4 w-4" />
                {r.priceText}
              </div>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-3 text-[15px] text-neutral-700 max-[460px]:grid-cols-1">
              <div className="flex items-center gap-2">
                <CalendarRange className="h-4 w-4 text-neutral-500" />
                <span className="text-neutral-500">Time:</span>
                <span className="font-medium">{r.timeText}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock3 className="h-4 w-4 text-neutral-500" />
                <span className="text-neutral-500">Duration:</span>
                <span className="font-medium">{r.durationText}</span>
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
          {totalText}
        </div>
      </div>
    </Modal>
  );
}
