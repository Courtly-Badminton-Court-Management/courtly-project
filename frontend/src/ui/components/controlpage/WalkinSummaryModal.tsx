"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CalendarRange, Clock3, MapPin, Loader2, X, User, MessageSquare } from "lucide-react";
import type { GroupedSelection } from "@/lib/slot/slotGridModel";

type Props = {
  open: boolean;
  onClose: () => void;
  groups: GroupedSelection[];
  courtNames: string[];
  onConfirm: (customer: {
    name: string;
    method: string;
    detail?: string;
  }) => Promise<void> | void;
  minutesPerCell: number;
  isSubmitting?: boolean;
};

function formatDuration(mins: number) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h && m) return `${h} hr ${m} min`;
  if (h) return `${h} hr`;
  return `${m} min`;
}

export default function WalkinSummaryModal({
  open,
  onClose,
  groups,
  courtNames,
  onConfirm,
  minutesPerCell,
  isSubmitting,
}: Props) {
  const [justSubmitted, setJustSubmitted] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [contactMethod, setContactMethod] = useState("Walk-in (no contact)");
  const [contactDetail, setContactDetail] = useState("");

  useEffect(() => {
    if (!open) {
      setJustSubmitted(false);
      setCustomerName("");
      setContactMethod("Walk-in (no contact)");
      setContactDetail("");
    }
  }, [open]);

  const items = useMemo(
    () =>
      groups.map((g) => ({
        courtLabel: courtNames[g.courtRow - 1] ?? `Court ${g.courtRow}`,
        timeLabel: g.timeLabel,
        durationMins: g.slots * minutesPerCell,
      })),
    [groups, courtNames, minutesPerCell]
  );

  const handleConfirm = async () => {
    if (!customerName.trim()) {
      alert("Please enter customer's name.");
      return;
    }
    setJustSubmitted(true);
    try {
      await onConfirm({
        name: customerName.trim(),
        method: contactMethod,
        detail: contactDetail.trim(),
      });
    } catch (err) {
      console.error(err);
    } finally {
      setJustSubmitted(false);
    }
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md px-4 sm:px-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <motion.div
            className="relative w-full max-h-[90vh] max-w-[500px] rounded-2xl bg-white p-4 sm:p-5 text-center shadow-2xl flex flex-col"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 10 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-3 right-3 rounded-full p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition"
              aria-label="Close modal"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Header */}
            <div className="mb-4">
              <h2 className="text-lg sm:text-xl font-bold text-pine">
                Walk-in Booking Summary
              </h2>
              <p className="text-sm sm:text-[14px] text-neutral-500 mt-1 font-semibold">
                Confirm walk-in details before proceeding.
              </p>
            </div>

            {/* List */}
            <div className="max-h-[45vh] overflow-y-auto space-y-3 mb-5 text-left p-2">
              {items.map((it, i) => (
                <motion.div
                  key={i}
                  layout
                  whileHover={{ scale: 1.00 }}
                  className="rounded-xl border border-gray-100 bg-white/90 p-4 shadow-sm ring-1 ring-black/5 transition"
                >
                  <div className="flex items-start justify-between">
                    <span className="inline-flex items-center rounded-full bg-sea/10 px-2.5 py-1 text-xs font-semibold text-teal-800 ring-1 ring-sea/50">
                      <MapPin className="mr-1 h-3.5 w-3.5" />
                      {it.courtLabel}
                    </span>
                  </div>
                  <div className="mt-3 grid sm:grid-cols-2 gap-2 text-[13px] text-gray-700">
                    <div className="flex items-center gap-2">
                      <CalendarRange className="h-4 w-4 text-gray-400" />
                      <span className="font-medium">Time:</span>
                      {it.timeLabel}
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock3 className="h-4 w-4 text-gray-400" />
                      <span className="font-medium">Duration:</span>
                      {formatDuration(it.durationMins)}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Customer Info Form */}
            <div className="space-y-3 mb-5 text-left">
              <label className="block text-sm font-semibold text-gray-700">
                Customer Name
              </label>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Proud"
                  className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-sea/30 outline-none"
                />
              </div>

              <label className="block text-sm font-semibold text-gray-700 mt-3">
                Contact Method
              </label>
              <select
                value={contactMethod}
                onChange={(e) => setContactMethod(e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-sea/30 outline-none"
              >
                <option>Walk-in (no contact)</option>
                <option>Facebook DM</option>
                <option>Phone Call</option>
                <option>Line</option>
                <option>Other</option>
              </select>

              <label className="block text-sm font-semibold text-gray-700 mt-3">
                Contact Detail (optional)
              </label>
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={contactDetail}
                  onChange={(e) => setContactDetail(e.target.value)}
                  placeholder="e.g. 0936888850 or Hoshitsuki Hokori"
                  className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-sea/30 outline-none"
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row justify-center gap-3 mt-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleConfirm}
                disabled={isSubmitting || justSubmitted}
                className={`w-full h-[44px] rounded-xl text-white font-medium text-sm sm:text-base flex items-center justify-center gap-2 transition-all shadow-sm ${
                  isSubmitting
                    ? "bg-gray-400 cursor-wait"
                    : "bg-pine hover:brightness-110 hover:shadow-lg"
                }`}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  "Confirm Walk-in"
                )}
              </motion.button>
            </div>

            {/* ✨ Glow animation while loading */}
            {isSubmitting && (
              <motion.div
                className="absolute inset-0 rounded-2xl bg-white/40 backdrop-blur-[2px]"
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
