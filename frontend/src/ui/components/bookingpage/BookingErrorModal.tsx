"use client";

import { motion, AnimatePresence } from "framer-motion";
import { CircleX, X } from "lucide-react";

type Props = {
  open: boolean;
  message?: string;
  onClose: () => void;
};

export default function BookingErrorModal({ open, message, onClose }: Props) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative w-[360px] rounded-xl bg-white p-6 shadow-xl"
          >
            {/* close button */}
            <button
              onClick={onClose}
              className="absolute right-3 top-3 rounded-full p-1 hover:bg-neutral-100"
              aria-label="Close"
            >
              <X className="h-5 w-5 text-neutral-600" />
            </button>

            <div className="flex flex-col items-center text-center">

            {/* ไอคอนเช็ค */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 15, delay: 0.1 }}
              className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-cherry/10"
            >
              <CircleX className="h-11 w-11 text-cherry" />
            </motion.div>
              
              <h2 className="text-lg font-bold text-cherry mb-1">
                Booking Unsuccessful!
              </h2>
              <p className="text-sm text-neutral-700 mb-5">
                {message || "Something went wrong. Please try again."}
              </p>
              <button
                onClick={onClose}
                className="rounded-lg bg-pine px-5 py-2 text-white font-medium hover:bg-pine/90 transition-colors"
              >
                Find Another Slot
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
