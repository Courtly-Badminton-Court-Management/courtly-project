"use client";

import React, { useMemo } from "react";
import Modal from "@/ui/components/basic/Modal";
import { Loader2, Coins } from "lucide-react";
import dayjs from "dayjs";
import SlotsBookingCard from "@/ui/components/bookingpage/SlotsBookingCard";

import type { SlotItem, BookingRow } from "@/api-client/extras/types";

type Props = {
  open: boolean;
  onClose: () => void;
  booking: BookingRow | null;
  isLoading?: boolean;
};

export default function BookingReceiptModal({
  open,
  onClose,
  booking,
  isLoading,
}: Props) {
  /* ================================================================
     Loading
  ================================================================ */
  if (isLoading) {
    return (
      <Modal open={open} onClose={onClose} title="Booking Details">
        <div className="flex flex-col items-center justify-center py-14 text-gray-500">
          <Loader2 className="h-7 w-7 animate-spin mb-3" />
          Loading booking details…
        </div>
      </Modal>
    );
  }

  /* ================================================================
     No booking
  ================================================================ */
  if (!booking) {
    return (
      <Modal open={open} onClose={onClose} title="Booking Details">
        <div className="text-center text-gray-500 py-6">
          No booking selected.
        </div>
      </Modal>
    );
  }

  /* ================================================================
     Extract & group slot data
  ================================================================ */
  const slotList = useMemo<SlotItem[]>(
    () => Object.values(booking.booking_slots || {}),
    [booking]
  );

  const totalPrice = booking.total_cost || 0;
  const hasSlots = slotList.length > 0;

  const grouped = useMemo(() => {
    if (!hasSlots) return [];

    const byCourt: Record<string, SlotItem[]> = {};
    slotList.forEach((s) => {
      byCourt[s.court_name] ??= [];
      byCourt[s.court_name].push(s);
    });

    const out: { slotItems: SlotItem[] }[] = [];

    Object.values(byCourt).forEach((arr) => {
      const sorted = [...arr].sort((a, b) =>
        a.start_time.localeCompare(b.start_time)
      );

      let buffer: SlotItem[] = [sorted[0]];

      for (let i = 1; i < sorted.length; i++) {
        const prev = sorted[i - 1];
        const curr = sorted[i];

        if (curr.start_time === prev.end_time) {
          buffer.push(curr);
        } else {
          out.push({ slotItems: [...buffer] });
          buffer = [curr];
        }
      }

      out.push({ slotItems: [...buffer] });
    });

    return out;
  }, [slotList, hasSlots]);

  /* ================================================================
     Status Capsule UI
  ================================================================ */
  const statusBadge = (status?: string) => {
    if (!status) return null;
    const s = status.toLowerCase();

    const styles: Record<string, string> = {
      upcoming: "bg-sea/10 text-sea border border-sea/20",
      cancelled: "bg-red-100 text-red-600 border border-red-200",
      end_game: "bg-gray-200 text-gray-700",
      checkin: "bg-cambridge/10 text-cambridge border border-cambridge/40",
      noshow: "bg-orange-100 text-orange-700",
    };

    const cls =
      styles[s] || "bg-gray-100 text-gray-600 border border-gray-200";

    return (
      <span
        className={
          "inline-flex items-center px-3 py-1 rounded-full text-[12px] font-medium " +
          cls
        }
      >
        {status.replaceAll("_", " ")}
      </span>
    );
  };

  /* ================================================================
     Footer
  ================================================================ */
  const Footer = (
    <div className="rounded-2xl border border-gray-200 bg-white backdrop-blur-sm">
      <div className="flex items-center justify-between px-6 py-4">
        <span className="font-extrabold text-gray-900 text-lg">Total</span>
        <span className="flex items-center gap-2 font-extrabold text-gray-900 text-lg">
          <Coins className="h-5 w-5 opacity-80" />
          {totalPrice.toLocaleString()} coins
        </span>
      </div>
    </div>
  );

  /* ================================================================
     MAIN RENDER
  ================================================================ */
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Booking Details"
      subtitle="Booking receipt and slot breakdown."
      footer={Footer}
    >
      <div className="space-y-6 pb-3 pr-1">

        {/* =======================
            BOOKING INFO (Improved UI)
        ======================= */}
        <div className="space-y-3 text-[14px] text-gray-700">

          {/* ID + Status */}
          <div className="flex items-center justify-between">
            <div className="font-bold text-gray-900">
              Booking ID:{" "}
              <span className="text-sea font-semibold">
                {booking.booking_id}
              </span>
            </div>

            {statusBadge(booking.booking_status)}
          </div>

          {/* Created */}
          <div>
            <span className="font-medium text-gray-600">Created At:</span>{" "}
            {dayjs(booking.created_date).format("DD MMM YYYY HH:mm")}
          </div>

          {/* Booking Date */}
          <div>
            <span className="font-medium text-gray-600">Booking Date:</span>{" "}
            {dayjs(booking.booking_date).format("DD MMM YYYY")}
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200"></div>

        {/* =======================
            SLOT LIST (CLEAN)
        ======================= */}
        {!hasSlots ? (
          <div className="text-gray-500 text-center py-8">
            No slot data.
          </div>
        ) : (
          <div>
            {grouped.map((g, idx) => (
              <SlotsBookingCard
                key={idx}
                slotItems={g.slotItems}
                minutesPerCell={30}
              />
            ))}
          </div>
        )}

      </div>
    </Modal>
  );
}
