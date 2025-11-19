// frontend/src/ui/components/dashboardpage/CheckInModal.tsx
"use client";

import React, { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Coins,
  Loader2,
  User,
  Phone,
  CalendarRange,
  Clock3,
  Hash,
  HandCoins,
  AppWindow,
  MapPinCheck,
} from "lucide-react";
import SlotsBookingCard from "@/ui/components/bookingpage/SlotsBookingCard";

import type { BookingRow, SlotItem } from "@/api-client/extras/types";
import dayjs from "dayjs";

/* ================================================================
   groupSlots helper
================================================================ */
const groupSlots = (slotList: SlotItem[]) => {
  if (!slotList.length) return [];
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

    let buffer = [sorted[0]];
    for (let i = 1; i < sorted.length; i++) {
      if (sorted[i].start_time === sorted[i - 1].end_time) buffer.push(sorted[i]);
      else {
        out.push({ slotItems: [...buffer] });
        buffer = [sorted[i]];
      }
    }
    out.push({ slotItems: [...buffer] });
  });

  return out;
};

/* ================================================================
   StatusBadge
================================================================ */
const StatusBadge = ({ status }: { status?: string }) => {
  if (!status) return null;

  const map: Record<string, string> = {
    booked: "bg-sea/10 text-sea border border-sea/20",
    upcoming: "bg-sea/10 text-sea border border-sea/20",
    checked_in: "bg-pine/10 text-pine border border-pine/20",
    cancelled: "bg-red-100 text-red-600 border border-red-200",
    noshow: "bg-orange-100 text-orange-700",
    end_game: "bg-gray-200 text-gray-700",
  };

  const cls = map[status.toLowerCase()] || "bg-gray-100 text-gray-600";

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${cls}`}>
      {status.replaceAll("_", " ")}
    </span>
  );
};

/* ================================================================
   MAIN MODAL
================================================================ */
export default function CheckInModal({
  open,
  booking,
  isPending,
  onConfirm,
  onClose,
}: {
  open: boolean;
  booking: BookingRow | null;
  isPending: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  if (!open || !booking) return null;

  const slotList = useMemo(() => Object.values(booking.booking_slots || {}), [booking]);
  const groupedSlots = useMemo(() => groupSlots(slotList), [slotList]);
  const totalPrice = booking.total_cost || 0;

  /* Handle click outside modal */
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <AnimatePresence>
      <motion.div
        onClick={handleBackdropClick}
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* MODAL BOX */}
        <motion.div
          className="
            bg-white w-[95%] max-w-4xl rounded-2xl shadow-xl p-6 relative 
            max-h-[85vh] flex flex-col
          "
          initial={{ scale: 0.92, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.92, opacity: 0 }}
        >
          {/* Close button */}
          <button
            className="absolute top-3 right-3 text-neutral-400 hover:text-neutral-600"
            onClick={onClose}
          >
            <X size={22} />
          </button>

          {/* Header */}
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-pine">
            <div className="rounded-full bg-pine/10 p-2">
              <MapPinCheck className="text-sea" />
            </div>
            Confirm Check-in
          </h2>

          {/* ================================================================
              CONTENT (Left scroll only)
          ================================================================= */}
          <div className="flex flex-col lg:flex-row gap-6 flex-1 overflow-hidden">

            {/* LEFT — fixed header + scroll list + fixed total */}
            <div className="lg:w-1/2 pr-4 lg:border-r border-neutral-200 flex flex-col">

              {/* Header stays still */}
              <h3 className="text-base font-semibold text-pine mb-2">
                Booked Slots
              </h3>

              {/* Slot list scroll ONLY this container */}
              <div className="flex-1 overflow-y-auto pr-1 pb-4">
                {groupedSlots.length === 0 ? (
                  <div className="text-neutral-500 text-center py-4">
                    No slot data.
                  </div>
                ) : (
                  groupedSlots.map((g, idx) => (
                    <SlotsBookingCard
                      key={idx}
                      slotItems={g.slotItems}
                      minutesPerCell={30}
                    />
                  ))
                )}
              </div>

              {/* Total stays fixed at the bottom */}
              <div className="pt-4 border-t border-neutral-200 mt-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-neutral-700">
                    Total
                  </span>

                  <div className="flex items-center gap-1">
                    <Coins className="w-4 h-4 text-sea" />
                    <span className="text-[15px] font-bold text-pine">
                      {totalPrice.toLocaleString()} coins
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT — static info */}
            <div className="lg:w-1/2 space-y-6 overflow-hidden">

              {/* Booking Details */}
              <section className="space-y-3">
                <h3 className="text-base font-semibold text-pine">Booking Details</h3>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-neutral-700">
                    <Hash className="w-4 h-4 text-sea" />
                    <span className="font-medium">Booking ID:</span>
                    <span className="font-semibold text-neutral-900">{booking.booking_id}</span>
                  </div>
                  <StatusBadge status={booking.booking_status} />
                </div>

                <div className="flex items-center gap-2 text-sm text-neutral-700">
                  <CalendarRange className="w-4 h-4 text-sea" />
                  <span className="font-medium">Created:</span>
                  <span>{dayjs(booking.created_date).format("DD MMM YYYY · HH:mm")}</span>
                </div>

                <div className="flex items-center gap-2 text-sm text-neutral-700">
                  <Clock3 className="w-4 h-4 text-sea" />
                  <span className="font-medium">Booking Date:</span>
                  <span>{dayjs(booking.booking_date).format("DD MMM YYYY")}</span>
                </div>

                <div className="flex items-center gap-2 text-sm text-neutral-700">
                  <AppWindow className="w-4 h-4 text-sea" />
                  <span className="font-medium">Booking Method:</span>
                  <span className="text-neutral-800 capitalize">
                    {booking.booking_method}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-sm text-neutral-700">
                  <HandCoins className="w-4 h-4 text-sea" />
                  <span className="font-medium">Payment:</span>
                  <span className="text-neutral-800 capitalize">
                    {booking.payment_method}
                  </span>
                </div>
              </section>

              {/* Player Info */}
              <section className="space-y-3 pt-4 border-t border-neutral-200">
                <h3 className="text-base font-semibold text-pine">
                  Player Information
                </h3>

                <div className="flex items-center gap-2 text-sm text-neutral-700">
                  <User className="w-4 h-4 text-sea" />
                  <span className="font-medium">{booking.owner_username}</span>
                </div>

                <div className="flex items-center gap-2 text-sm text-neutral-700">
                  <Phone className="w-4 h-4 text-sea" />
                  <span>{booking.owner_contact}</span>
                </div>
              </section>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-neutral-200 shrink-0">
            <button
              className="px-4 py-2 rounded-lg bg-neutral-200 text-neutral-700 hover:bg-neutral-300 transition"
              onClick={onClose}
              disabled={isPending}
            >
              Close
            </button>

            <button
              className={`px-4 py-2 rounded-lg font-semibold text-white flex gap-2 items-center ${
                isPending ? "bg-sea/70 cursor-not-allowed" : "bg-sea hover:bg-pine"
              }`}
              onClick={onConfirm}
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Checking in...
                </>
              ) : (
                "Confirm Check-in"
              )}
            </button>
          </div>

        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
