"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Printer, X } from "lucide-react";

type Props = {
  open: boolean;
  onClose: () => void;
  bookingNos: string[];
};

export default function WalkinConfirmedModal({
  open,
  onClose,
  bookingNos,
}: Props) {
  // mock data (เพราะ backend ยังไม่ส่ง response จริง)
  const mockCustomer = {
    name: "Proud (Walk-in)",
    method: "Phone Call",
    contact: "093-688-8850",
  };

  const mockSummary = [
    { court: "Court 1", time: "10:00-10:30", price: 100 },
    { court: "Court 2", time: "10:30-11:00", price: 100 },
  ];

  const total = mockSummary.reduce((s, x) => s + x.price, 0);

  useEffect(() => {
    const esc = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", esc);
    return () => document.removeEventListener("keydown", esc);
  }, [onClose]);

  if (!open) return null;

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
          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: "spring", stiffness: 180, damping: 18 }}
            className="relative mx-3 w-full max-w-md rounded-2xl bg-white px-6 py-6 text-center shadow-2xl border border-gray-100"
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute right-3 top-3 rounded-full p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 transition"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Header icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 18 }}
              className="mx-auto mb-3 grid h-16 w-16 place-items-center rounded-full bg-green-50"
            >
              <CheckCircle2 className="h-14 w-14 text-green-600" />
            </motion.div>

            <h2 className="text-2xl font-bold text-pine">Walk-in Confirmed</h2>
            <p className="text-sm text-neutral-600 mb-5">
              The booking has been recorded successfully.
            </p>

            {/* Receipt Card */}
            <div className="rounded-xl border border-gray-200 bg-neutral-50 p-4 text-left mb-5">
              {/* Booking No */}
              {bookingNos.length > 0 && (
                <div className="mb-2 text-sm font-semibold text-gray-800">
                  Booking ID:&nbsp;
                  <span className="text-pine font-bold">
                    {bookingNos.join(", ")}
                  </span>
                </div>
              )}

              {/* Customer info */}
              <div className="text-sm mb-3 text-gray-700">
                <p>
                  <span className="font-semibold">Customer:</span>{" "}
                  {mockCustomer.name}
                </p>
                <p>
                  <span className="font-semibold">Contact:</span>{" "}
                  {mockCustomer.method} ({mockCustomer.contact})
                </p>
              </div>

              {/* Table of slots */}
              <div className="rounded-lg bg-white shadow-inner p-3 border border-gray-100">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-600 border-b border-gray-200">
                      <th className="pb-1">Court</th>
                      <th className="pb-1">Time</th>
                      <th className="pb-1 text-right">Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockSummary.map((s, i) => (
                      <tr key={i}>
                        <td className="py-1 font-medium text-gray-800">
                          {s.court}
                        </td>
                        <td className="py-1 text-gray-700">{s.time}</td>
                        <td className="py-1 text-right text-gray-900">
                          {s.price.toLocaleString()} ฿
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="mt-2 border-t border-gray-200 pt-2 flex justify-between text-sm font-semibold text-gray-800">
                  <span>Total</span>
                  <span>{total.toLocaleString()} ฿</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row justify-center gap-2 mt-4">
              <button
                onClick={() => window.print()}
                className="flex items-center justify-center gap-2 rounded-md bg-pine px-4 py-2 text-white text-sm font-semibold hover:bg-pine/90 transition"
              >
                <Printer className="h-4 w-4" />
                Print / Save as PDF
              </button>
              <button
                onClick={onClose}
                className="rounded-md border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-800 hover:bg-neutral-50 transition"
              >
                Done
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
