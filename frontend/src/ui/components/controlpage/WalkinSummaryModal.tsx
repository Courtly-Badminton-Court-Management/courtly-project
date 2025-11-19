"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CalendarRange,
  Clock3,
  MapPin,
  Loader2,
  X,
  User,
  MessageSquare,
  Phone,
  CreditCard,
} from "lucide-react";
import type { GroupedSelection } from "@/lib/slot/slotGridModel";

type Props = {
  open: boolean;
  onClose: () => void;
  groups: GroupedSelection[];
  courtNames: string[];
  onConfirm: (customer: {
    name: string;
    paymentMethod: string;
    contactMethod: string;
    contactDetail?: string;
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

  // 🆕 payment method state (ใช้ค่า value ให้ตรง backend)
  const [paymentMethod, setPaymentMethod] = useState<string>("cash");

  useEffect(() => {
    if (!open) {
      setJustSubmitted(false);
      setCustomerName("");
      setContactMethod("Walk-in (no contact)");
      setContactDetail("");
      setPaymentMethod("cash");
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
        paymentMethod, // 🧾 ใช้สำหรับ payment_method
        contactMethod, // 📞 วิธีติดต่อ
        contactDetail: contactDetail.trim() || undefined,
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
            className="relative flex w-full max-h-[90vh] max-w-[500px] flex-col rounded-2xl bg-white p-4 text-center shadow-2xl sm:p-5"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 10 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute right-3 top-3 rounded-full p-1.5 text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-700"
              aria-label="Close modal"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Header */}
            <div className="mb-4">
              <h2 className="text-lg font-bold text-pine sm:text-xl">
                Walk-in Booking Summary
              </h2>
              <p className="mt-1 text-sm font-semibold text-neutral-500 sm:text-[14px]">
                Confirm walk-in details before proceeding.
              </p>
            </div>

            {/* List */}
            <div className="mb-5 max-h-[45vh] space-y-3 overflow-y-auto p-2 text-left">
              {items.map((it, i) => (
                <motion.div
                  key={i}
                  layout
                  whileHover={{ scale: 1.0 }}
                  className="rounded-xl border border-gray-100 bg-white/90 p-4 shadow-sm ring-1 ring-black/5 transition"
                >
                  <div className="flex items-start justify-between">
                    <span className="inline-flex items-center rounded-full bg-sea/10 px-2.5 py-1 text-xs font-semibold text-teal-800 ring-1 ring-sea/50">
                      <MapPin className="mr-1 h-3.5 w-3.5" />
                      {it.courtLabel}
                    </span>
                  </div>
                  <div className="mt-3 grid gap-2 text-[13px] text-gray-700 sm:grid-cols-2">
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
            <div className="mb-5 space-y-3 text-left">
              {/* Customer Name */}
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
                  className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sea/30"
                />
              </div>

              {/* 🆕 Payment Method */}
              <label className="mt-3 block text-sm font-semibold text-gray-700">
                Payment Method
              </label>
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-gray-400" />
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sea/30"
                >
                  <option value="cash">Cash</option>
                  <option value="mobile-banking">
                    Mobile Banking / PromptPay
                  </option>
                  <option value="transfer">Bank Transfer</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Contact Method */}
              <label className="mt-3 block text-sm font-semibold text-gray-700">
                Contact Method
              </label>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-gray-400" />
                <select
                  value={contactMethod}
                  onChange={(e) => setContactMethod(e.target.value)}
                  className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sea/30"
                >
                  <option>Walk-in (no contact)</option>
                  <option>Facebook DM</option>
                  <option>Phone Call</option>
                  <option>Line</option>
                  <option>Other</option>
                </select>
              </div>

              {/* Contact Detail */}
              <label className="mt-3 block text-sm font-semibold text-gray-700">
                Contact Detail (optional)
              </label>
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={contactDetail}
                  onChange={(e) => setContactDetail(e.target.value)}
                  placeholder="e.g. 0987654321 or Line ID"
                  className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sea/30"
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="mt-3 flex flex-col justify-center gap-3 sm:flex-row">
              <motion.button
                whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                whileTap={{ scale: isSubmitting ? 1 : 0.97 }}
                onClick={handleConfirm}
                disabled={isSubmitting || justSubmitted}
                className={`flex h-[44px] w-full items-center justify-center gap-2 rounded-xl text-sm font-medium text-white shadow-sm transition-all sm:text-base ${
                  isSubmitting
                    ? "cursor-wait bg-gray-400"
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
