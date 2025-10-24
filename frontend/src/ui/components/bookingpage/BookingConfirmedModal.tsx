"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2, Copy, Check, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import CopyToClipboard from "../basic/CopyToClipboard";

type Props = {
  open: boolean;
  onClose: () => void;
  bookingNos: string[];
};

export default function BookingConfirmedModalStandalone({
  open,
  onClose,
  bookingNos,
}: Props) {
  const router = useRouter();
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    router.prefetch("/home");
    router.prefetch("/history");

    const esc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", esc);
    return () => document.removeEventListener("keydown", esc);
  }, [open, router, onClose]);

  const onCopy = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(code);
      setTimeout(() => setCopied(null), 1500);
    } catch {}
  };



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
          {/* Modal body */}
          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            transition={{ type: "spring", stiffness: 160, damping: 18 }}
            className="relative mx-3 w-full max-w-lg sm:max-w-xl rounded-2xl bg-white px-6 py-6 text-center shadow-2xl"
          >
            {/* ปุ่มปิด */}
            <button
              onClick={onClose}
              className="absolute right-3 top-3 rounded-full p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 transition"
            >
              <X className="h-5 w-5" />
            </button>

            {/* ไอคอนเช็ค */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 15, delay: 0.1 }}
              className="mx-auto mb-3 grid h-16 w-16 place-items-center rounded-full bg-green-50"
            >
              <CheckCircle2 className="h-14 w-14 text-pine" aria-hidden />
            </motion.div>

            <h2 className="mb-1 text-2xl font-bold text-pine">
              Booking Confirmed!
            </h2>

            <p className="mb-4 text-sm text-neutral-600">
              {bookingNos.length > 1
                ? `Your bookings is confirmed and added to your Booking History.`
                : `Your booking is confirmed and added to Upcoming.`}
            </p>

            {/* 🎟 Booking ID */}
            {bookingNos?.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mb-5 flex flex-col items-center gap-2"
              >
                <p className="text-sm font-semibold text-onyx">
                  Booking ID:  <CopyToClipboard text={bookingNos.length > 1 ? bookingNos : ""}/> 
                </p>
                
              </motion.div>
            )}

            {/* ปุ่ม actions */}
            <div className="flex flex-col sm:flex-row justify-center items-stretch gap-2 mt-6">
              <Link
                href="/home"
                className="rounded-md bg-teal-700 px-4 py-2 text-[15px] font-semibold text-white hover:bg-teal-800 transition-all"
              >
                Back to Home
              </Link>
              <Link
                href="/history"
                className="rounded-md border border-teal-200 bg-white px-4 py-2 text-[15px] font-semibold text-teal-700 hover:bg-teal-50 transition-all"
              >
                View Booking History
              </Link>
              <button
                onClick={onClose}
                className="rounded-md border border-neutral-200 px-4 py-2 text-[15px] font-medium text-neutral-800 hover:bg-neutral-50 transition-all"
              >
                Keep Browsing
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
