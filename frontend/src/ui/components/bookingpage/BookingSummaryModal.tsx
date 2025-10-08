"use client";
import React from "react";
import Modal from "@/ui/components/basic/Modal";
import type { GroupedSelection } from "@/lib/booking/model";

type Props = {
  open: boolean;
  onClose: () => void;
  groups: GroupedSelection[];
  courtNames: string[];
  totalPrice: number;
  notEnough: boolean;
  onConfirm: () => void;
  /** นาทีต่อช่อง จาก cols จริง */
  minutesPerCell: number;
};

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
  return (
    <Modal open={open} onClose={onClose}>
      <h2 className="font-bold text-xl mb-4">Booking Summary</h2>
      {groups.map((g, i) => (
        <div key={i} className="border p-2 mb-2 rounded-md text-sm">
          Court: {courtNames[g.courtRow - 1] ?? `Court ${g.courtRow}`} <br />
          Time: {g.timeLabel} <br />
          Duration: {(g.slots * minutesPerCell) / 60} hr <br />
          {/* 💰 ใช้ราคาจริงที่ sum แล้ว */}
          Price: {g.price} coins
        </div>
      ))}
      <div className="flex justify-between font-bold mt-4">
        <span>Total</span>
        <span>{totalPrice} coins</span>
      </div>
      <div className="flex justify-end gap-2 mt-4">
        <button onClick={onClose} className="px-3 py-1 border rounded-md">
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={notEnough}
          className={`px-3 py-1 rounded-md text-white ${
            notEnough ? "bg-gray-400 cursor-not-allowed" : "bg-teal-700 hover:bg-teal-600"
          }`}
        >
          Confirm
        </button>
      </div>
    </Modal>
  );
}
