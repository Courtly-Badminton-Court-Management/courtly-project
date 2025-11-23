// frontend/src/ui/components/controlpage/WalkinSummaryModal.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CalendarRange,
  Clock3,
  MapPin,
  BookCheck,
  Loader2,
  X,
  User,
  MessageSquare,
  Phone,
  CreditCard,
} from "lucide-react";
import type { GroupedSelection } from "@/lib/slot/slotGridModel";
import GlobalErrorModal from "@/ui/components/basic/GlobalErrorModal";


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

  const isBusy = !!isSubmitting || justSubmitted;
  const isConfirmDisabled = isBusy || !customerName.trim();



  const [error, setError] = useState("");
  const [openError, setOpenError] = useState(false);
  const handleConfirm = async () => {
    if (isConfirmDisabled) return;

    setJustSubmitted(true);
    try {
      await onConfirm({
        name: customerName.trim(),
        paymentMethod, // 🧾 ใช้สำหรับ payment_method
        contactMethod, // 📞 วิธีติดต่อ
        contactDetail: contactDetail.trim() || undefined,
      });
    } catch (err) {
        setError(err instanceof Error ? err.message : "An unexpected error occurred.");
        setOpenError(true);
    } finally {
      setJustSubmitted(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <AnimatePresence>
      {open && (
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
              disabled={isBusy}
            >
              <X size={22} />
            </button>

            {/* Header (same vibe as CheckInModal) */}
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-pine">
              <div className="rounded-full bg-pine/10 p-2">
                <BookCheck className="text-sea" />
              </div>
              Manager Booking Summary
            </h2>

            {/* ================================================================
                CONTENT — 2 columns like CheckInModal
            ================================================================= */}
            <div className="flex flex-col lg:flex-row gap-6 flex-1 overflow-hidden">
              {/* LEFT — Selected slots (scroll only left side) */}
              <div className="lg:w-1/2 pr-4 lg:border-r border-neutral-200 flex flex-col">
                <h3 className="text-base font-semibold text-pine mb-2">
                  Selected Slots
                </h3>

                <div className="flex-1 overflow-y-auto pr-1 pb-4 space-y-3">
                  {items.length === 0 ? (
                    <div className="text-neutral-500 text-center py-4 text-sm">
                      No slots selected.
                    </div>
                  ) : (
                    items.map((it, i) => (
                      <motion.div
                        key={`${it.courtLabel}-${it.timeLabel}-${i}`}
                        layout
                        whileHover={{ scale: 1.01 }}
                        className="rounded-xl border border-gray-100 bg-white/90 p-4 shadow-sm ring-1 ring-black/5 transition"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <span className="inline-flex items-center rounded-full bg-sea/10 px-2.5 py-1 text-xs font-semibold text-teal-800 ring-1 ring-sea/50">
                            <MapPin className="mr-1 h-3.5 w-3.5" />
                            {it.courtLabel}
                          </span>
                        </div>

                        <div className="grid gap-2 text-[13px] text-gray-700 sm:grid-cols-2">
                          <div className="flex items-center gap-2">
                            <CalendarRange className="h-4 w-4 text-gray-400" />
                            <span className="font-medium">Time:</span>
                            <span>{it.timeLabel}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock3 className="h-4 w-4 text-gray-400" />
                            <span className="font-medium">Duration:</span>
                            <span>{formatDuration(it.durationMins)}</span>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </div>

              {/* RIGHT — Customer info form */}
              <div className="lg:w-1/2 space-y-4 overflow-y-auto pr-1">
                {/* Section title */}
                <section className="space-y-3">
                  <h3 className="text-base font-semibold text-pine">
                    Customer Information
                  </h3>

                  {/* Customer Name */}
                  <div className="space-y-1">
                    <label className="block text-sm font-semibold text-gray-700">
                      Customer Name
                    </label>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="e.g. Elon Musk"
                        className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sea/30"
                      />
                    </div>
                  </div>

                  {/* Payment Method */}
                  <div className="space-y-1">
                    <label className="block text-sm font-semibold text-gray-700">
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
                  </div>

                  {/* Contact Method */}
                  <div className="space-y-1">
                    <label className="block text-sm font-semibold text-gray-700">
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
                  </div>

                  {/* Contact Detail */}
                  <div className="space-y-1">
                    <label className="block text-sm font-semibold text-gray-700">
                      Contact Detail (optional)
                    </label>
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        value={contactDetail}
                        onChange={(e) => setContactDetail(e.target.value)}
                        placeholder="e.g. 098765XXXX, Line user, Facebook name"
                        className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sea/30"
                      />
                    </div>
                  </div>
                </section>
              </div>
            </div>

            {/* Footer — buttons style like CheckInModal */}
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-neutral-200 shrink-0">
              <button
                className="px-4 py-2 rounded-lg bg-neutral-200 text-neutral-700 hover:bg-neutral-300 transition"
                onClick={onClose}
                disabled={isBusy}
              >
                Cancel
              </button>

              <button
                className={`px-4 py-2 rounded-lg font-semibold text-white flex gap-2 items-center transition ${
                  isConfirmDisabled
                    ? "bg-pine/30 cursor-not-allowed"
                    : "bg-pine hover:bg-sea"
                }`}
                onClick={handleConfirm}
                disabled={isConfirmDisabled}
              >
                {isBusy ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Processing...
                  </>
                ) : (
                  "Confirm Booking"
                )}
              </button>
            </div>

            {/* ✨ Glow animation while loading */}
            {isBusy && (
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
