// src/ui/components/bookingpage/BookingSummaryModal.tsx
"use client";
import React, { useEffect, useMemo, useState } from "react";
import Modal from "@/ui/components/basic/Modal";
import type { GroupedSelection } from "@/lib/booking/slotGridModel";
import { CalendarRange, Clock3, Coins, MapPin } from "lucide-react";
import Link from "next/link";

type Props = {
  open: boolean;
  onClose: () => void;
  groups: GroupedSelection[];
  courtNames: string[];
  totalPrice: number;
  notEnough: boolean;
  onConfirm: () => void;
  minutesPerCell: number;
};

function formatDuration(mins: number) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h && m) return `${h} hr ${m} min`;
  if (h) return `${h} hr`;
  return `${m} min`;
}

export default function BookingSummaryModal({
  open,
  onClose,
  groups,
  courtNames,
  totalPrice,
  notEnough,
  onConfirm,
  minutesPerCell,
}: Props) {
  // ป้องกัน warning เด้งหลังผู้ใช้กด Confirm
  const [justSubmitted, setJustSubmitted] = useState(false);

  // เปิด/ปิดใหม่ รีเซ็ตสถานะ
  useEffect(() => {
    if (!open) setJustSubmitted(false);
  }, [open]);

  const items = useMemo(
    () =>
      groups.map((g) => ({
        courtLabel: courtNames[g.courtRow - 1] ?? `Court ${g.courtRow}`,
        timeLabel: g.timeLabel,
        durationMins: g.slots * minutesPerCell,
        price: g.price,
      })),
    [groups, courtNames, minutesPerCell]
  );

  // กดคอนเฟิร์ม: ซ่อน warning ทันที แล้วค่อยส่งต่อ
  function handleConfirm() {
    if (notEnough || items.length === 0) return;
    setJustSubmitted(true);
    onConfirm();
  }

  const Footer = (
    <div className="rounded-2xl border border-gray-100 bg-white/95 shadow-[0_-6px_20px_-10px_rgba(0,0,0,0.06)] backdrop-blur">
      <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-5">
        <div className="text-base font-extrabold text-gray-900">Total</div>
        <div className="flex items-center gap-2 text-base font-extrabold text-gray-900">
          <Coins className="h-4 w-4 opacity-80" />
          {totalPrice.toLocaleString()} coins
        </div>
      </div>

      {/* แสดงเฉพาะตอนเงินไม่พอ "และ" ยังไม่ได้กดยืนยันในรอบนี้ */}
      {notEnough && !justSubmitted && (
        <div className="mx-4 mb-2 flex items-center justify-between rounded-lg bg-amber-50 px-3 py-2 text-xs font-medium text-amber-900 ring-1 ring-inset ring-amber-200">
          <span>Not enough coins to confirm this booking.</span>
          <Link href={"/wallet"} className="underline underline-offset-2 font-semibold hover:opacity-90">
            Top-up your wallet →
          </Link>
        </div>
      )}

      <div className="flex justify-end gap-2 border-t border-gray-100 px-4 py-3 sm:px-5">
        <button
          onClick={onClose}
          className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
        >
          Cancel
        </button>
        <button
          onClick={handleConfirm}
          disabled={notEnough || items.length === 0}
          className={`rounded-xl px-4 py-2 text-sm font-bold text-white ${
            notEnough || items.length === 0
              ? "cursor-not-allowed bg-gray-300"
              : "bg-teal-700 hover:bg-teal-600 shadow-sm"
          }`}
        >
          Confirm
        </button>
      </div>
    </div>
  );

  return (
    <Modal 
        open={open} 
        onClose={onClose} 
        title="Booking Summary" 
        subtitle="Review your selection before confirming." 
        footer={Footer}
        >

      <ul className="space-y-3 pr-1 pb-2">
        {items.map((it, i) => (
          <li key={i} className="rounded-2xl bg-white/80 shadow-sm ring-1 ring-black/5">
            <div className="p-4 sm:p-5">
              <div className="flex items-start justify-between gap-3">
                <span className="inline-flex items-center rounded-full bg-teal-50 px-2.5 py-1 text-xs font-semibold text-teal-800 ring-1 ring-inset ring-teal-200">
                  <MapPin className="mr-1 h-3.5 w-3.5" />
                  {it.courtLabel}
                </span>
                <div className="flex items-center gap-1 text-sm font-bold text-gray-900">
                  <Coins className="h-4 w-4 opacity-80" />
                  {it.price.toLocaleString()} coins
                </div>
              </div>

              <div className="mt-3 grid gap-2 text-[13px] text-gray-700 sm:grid-cols-2">
                <div className="flex items-center gap-2">
                  <CalendarRange className="h-4 w-4 text-gray-400" />
                  <span className="font-medium">Time:</span>
                  <span className="text-gray-800">{it.timeLabel}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock3 className="h-4 w-4 text-gray-400" />
                  <span className="font-medium">Duration:</span>
                  <span className="text-gray-800">{formatDuration(it.durationMins)}</span>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </Modal>
  );
}
