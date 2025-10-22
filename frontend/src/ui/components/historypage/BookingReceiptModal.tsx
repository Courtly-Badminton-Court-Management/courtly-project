"use client";
import React, { useMemo } from "react";
import Modal from "@/ui/components/basic/Modal";
import { CalendarRange, Clock3, Coins, MapPin } from "lucide-react";
import dayjs from "dayjs";

type SlotItem = {
  status: string;
  start_time: string;
  end_time: string;
  court: number;
  court_name: string;
  price_coin: number;
};

type BookingRow = {
  created_date: string;
  booking_id: string;
  total_cost: string | number;
  booking_date: string;
  booking_status: string;
  able_to_cancel: boolean;
  booking_slots: Record<string, SlotItem>;
};

type Props = {
  open: boolean;
  onClose: () => void;
  booking: BookingRow | null;
};

function formatDuration(mins: number) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h && m) return `${h} hr ${m} min`;
  if (h) return `${h} hr`;
  return `${m} min`;
}

export default function BookingReceiptModal({ open, onClose, booking }: Props) {
  const slots = useMemo(() => Object.values(booking?.booking_slots || {}), [booking]);
  const hasSlots = slots.length > 0;

  const totalPrice =
    typeof booking?.total_cost === "number"
      ? booking.total_cost
      : parseInt(String(booking?.total_cost).replace(/[^\d]/g, "")) || 0;

  const items = useMemo(() => {
  if (!hasSlots) return [];


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

  // ✅ ภายในแต่ละ court แยกกลุ่มต่อเนื่อง
  Object.entries(grouped).forEach(([court, arr]) => {
    const sorted = [...arr].sort((a, b) =>
      a.start_time.localeCompare(b.start_time)
    );

    let start = sorted[0];
    let prevEnd = sorted[0].end_time;
    let slotCount = 1;
    let priceSum = sorted[0].price_coin;

    for (let i = 1; i <= sorted.length; i++) {
      const cur = sorted[i];
      // ถ้าไม่มี cur แล้ว หรือเวลาไม่ต่อเนื่อง → ปิดกลุ่ม
      if (!cur || cur.start_time !== prevEnd) {
        out.push({
          court,
          timeLabel: `${start.start_time}–${prevEnd}`,
          durationMins: slotCount * 30,
          price: priceSum,
        });

        if (cur) {
          // เริ่มกลุ่มใหม่
          start = cur;
          prevEnd = cur.end_time;
          slotCount = 1;
          priceSum = cur.price_coin;
        }
      } else {
        // ถ้าต่อเนื่อง → ขยายกลุ่ม
        prevEnd = cur.end_time;
        slotCount++;
        priceSum += cur.price_coin;
      }
    }
  });

  return out.sort((a, b) => a.court.localeCompare(b.court));
}, [slots, hasSlots]);


  const Footer = (
    <div className="rounded-2xl border border-gray-100 bg-white/95 shadow-[0_-6px_20px_-10px_rgba(0,0,0,0.06)] backdrop-blur">
      <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-5">
        <div className="text-base font-extrabold text-gray-900">Total</div>
        <div className="flex items-center gap-2 text-base font-extrabold text-gray-900">
          <Coins className="h-4 w-4 opacity-80" />
          {totalPrice.toLocaleString()} coins
        </div>
      </div>
    </div>
  );

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Booking Details"
      subtitle="Booking details and slot information."
      footer={Footer}
    >
      {!booking ? (
        <div className="text-center text-gray-500 py-6">No booking selected.</div>
      ) : (
        <div className="space-y-4 pr-1 pb-2">
          <div className="text-sm text-gray-700 mb-4">
            <div className="text-[15px] font-bold text-gray-800 mb-1">
              Booking ID:{" "}
              <span className="text-sea font-semibold">{booking.booking_id}</span>
            </div>
            <div className="text-[13px] text-gray-500">
              Created At: {dayjs(booking.created_date).format("DD MMMM YYYY HH:mm")}
            </div>
            <div className="mt-2 text-[13px]">
              Booking Date:{" "}
              <span className="font-semibold">
                {dayjs(booking.booking_date).format("DD MMMM YYYY")}
              </span>
            </div>
          </div>

          {!hasSlots ? (
            <div className="rounded-2xl border border-gray-200 bg-gray-50 py-6 text-center text-gray-500">
              No slot data.
            </div>
          ) : (
            <ul className="space-y-3">
              {items.map((it, i) => (
                <li
                  key={i}
                  className="rounded-2xl bg-white/80 shadow-sm ring-1 ring-black/5"
                >
                  <div className="p-4 sm:p-5">
                    <div className="flex items-start justify-between gap-3">
                      <span className="inline-flex items-center rounded-full bg-sea/10 px-2.5 py-1 text-xs font-semibold text-teal-800 ring-1 ring-inset ring-sea/50">
                        <MapPin className="mr-1 h-3.5 w-3.5" />
                        {it.court}
                      </span>
                      <div className="flex items-center gap-1 text-sm font-bold text-gray-900">
                        <Coins className="h-4 w-4 opacity-80" />
                        {it.price.toLocaleString()} coins
                      </div>
                    </div>

                    <div className="mt-3 grid gap-2 text-[13px] text-gray-700 sm:grid-cols-2">
                      <div className="flex items-center gap-2">
                        <CalendarRange className="h-4 w-4 text-gray-400" />
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
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </Modal>
  );
}
