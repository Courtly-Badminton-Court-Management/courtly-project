"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";

type Props = {
  bookingId: string;
  open: boolean;
  isPending?: boolean;
  onConfirm: () => void;
  onClose: () => void;
};

export default function CancelConfirmModal({
  bookingId,
  open,
  isPending,
  onConfirm,
  onClose,
}: Props) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md px-4 sm:px-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="relative w-full max-w-[400px] sm:max-w-[420px] rounded-2xl bg-white p-6 sm:p-8 text-center shadow-2xl"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 10 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            {/* Header */}
            <h2 className="text-lg sm:text-xl font-bold text-onyx mb-2 sm:mb-3">
              Want to <span className="text-cherry">Cancel</span> this booking?
            </h2>
            <p className="text-sm sm:text-[15px] text-neutral-600 mb-6 sm:mb-8 leading-relaxed px-2 sm:px-0">
              Booking{" "}
              <strong className="text-neutral-800 break-all">
                {bookingId}
              </strong>{" "}
              will be cancelled and coins refunded according to the policy.
            </p>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 w-full">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="w-full sm:w-[160px] h-[44px] rounded-lg border border-neutral-300 bg-neutral-100 text-neutral-700 font-medium text-sm sm:text-base transition-all shadow-sm hover:bg-neutral-200 hover:shadow-md focus:ring-2 focus:ring-sea/30 disabled:opacity-60"
                onClick={onClose}
                disabled={isPending}
              >
                Keep This Booking
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="w-full sm:w-[160px] h-[44px] rounded-lg bg-cherry text-white font-medium text-sm sm:text-base transition-all shadow-sm hover:brightness-110 hover:shadow-lg focus:ring-2 focus:ring-rose-200 flex items-center justify-center gap-2 disabled:opacity-60"
                onClick={onConfirm}
                disabled={isPending}
              >
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Cancelling…</span>
                  </>
                ) : (
                  "Confirm Cancel"
                )}
              </motion.button>
            </div>

            {/* Glow loading overlay */}
            {isPending && (
              <motion.div
                className="absolute inset-0 rounded-2xl bg-white/30 backdrop-blur-[2px]"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0.4, 0] }}
                transition={{ repeat: Infinity, duration: 1.2 }}
              />
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
