"use client";

import { useEffect } from "react";
import { X, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

type Props = {
  open: boolean;
  onClose: () => void;
  onGoHistory?: () => void; // function ให้ scroll ลงไปดู Transaction History
};

export default function SuccessfulRequestModal({
  open,
  onClose,
  onGoHistory,
}: Props) {
  // Esc to close
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          {/* Modal Body */}
          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            transition={{ type: "spring", stiffness: 160, damping: 18 }}
            className="
              relative mx-3 w-full max-w-lg sm:max-w-xl 
              rounded-2xl bg-white px-6 py-7 shadow-2xl text-center
            "
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="
                absolute right-3 top-3 rounded-full p-1 
                text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 
                transition
              "
            >
              <X className="h-5 w-5" />
            </button>

            {/* Success Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                type: "spring",
                stiffness: 260,
                damping: 15,
                delay: 0.1,
              }}
              className="
                mx-auto mb-3 grid h-16 w-16 place-items-center 
                rounded-full bg-green-50
              "
            >
              <CheckCircle2 className="h-14 w-14 text-pine" aria-hidden />
            </motion.div>

            {/* Title */}
            <h2 className="text-2xl font-bold text-pine mb-1">
              Top-up Request Submitted!
            </h2>

            {/* Message */}
            <p className="mb-5 text-sm text-neutral-600 max-w-md mx-auto leading-relaxed">
              Your request has been successfully submitted.  
              Once verified, your coins will be added into your wallet.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-center items-stretch gap-3 mt-6">

              {/* Go Booking */}
              <Link
                href="/booking"
                className="
                  
                  rounded-md bg-teal-700 px-4 py-2 
                  text-[15px] font-semibold text-white 
                  hover:bg-teal-800 transition-all
                "
              >
                Go Book the Court Now!
              </Link>

              {/* Go to Transaction History */}
              <button
                onClick={() => {
                  onClose();
                  onGoHistory?.();
                }}
                className="
                  rounded-md border border-teal-200 bg-white px-4 py-2 
                  text-[15px] font-semibold text-teal-700 
                  hover:bg-teal-50 transition-all
                "
              >
                View Transactions
              </button>

              {/* Close */}
              <button
                onClick={onClose}
                className="
                  rounded-md border border-neutral-200 px-4 py-2 
                  text-[15px] font-medium text-neutral-800 
                  hover:bg-neutral-50 transition-all
                "
              >
                Close
              </button>

            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
