//frontend/src/ui/components/dashboardpage/CheckInModal.tsx
"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle2 } from "lucide-react";
import SlotsBookingCard from "@/ui/components/bookingpage/SlotsBookingCard";
import type { BookingRow } from "@/api-client/extras/types";

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

  const slotItems = Object.values(booking.booking_slots || {});

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="bg-white w-[90%] max-w-lg rounded-2xl shadow-xl p-6 relative"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
        >
          <button
            className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
            onClick={onClose}
          >
            <X size={22} />
          </button>

          <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-pine">
            <CheckCircle2 className="text-sea" /> Check-in Booking
          </h2>

          {/* Slot Details */}
          <div className="mb-4">
            <SlotsBookingCard slotItems={slotItems} minutesPerCell={30} />
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 mt-6">
            <button
              className="px-4 py-2 rounded-lg bg-neutral-200 text-neutral-700 hover:bg-neutral-300"
              onClick={onClose}
            >
              Close
            </button>

            <button
              className={`px-4 py-2 rounded-lg font-semibold text-white ${
                isPending ? "bg-green-400" : "bg-sea hover:bg-pine"
              }`}
              onClick={onConfirm}
              disabled={isPending}
            >
              {isPending ? "Checking in..." : "Confirm Check-in"}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
