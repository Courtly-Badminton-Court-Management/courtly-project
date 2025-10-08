"use client";
import React from "react";
import Modal from "@/ui/components/basic/Modal";

type Props = {
  open: boolean;
  onClose: () => void;
  bookingNos: string[];
};
export default function BookingConfirmedModal({ open, onClose, bookingNos }: Props) {
  return (
    <Modal open={open} onClose={onClose} >
      <div className="text-center">
        <div className="text-3xl text-green-600 mb-2">✓</div>
        <h2 className="font-bold text-2xl mb-2">Booking Confirmed!</h2>
        {bookingNos?.map((no, i) => (
          <div key={i} className="text-sm text-gray-600">
            Booking ID: {no}
          </div>
        ))}
        <button onClick={onClose} className="mt-4 px-4 py-2 bg-teal-700 text-white rounded-md">
          Close
        </button>
      </div>
    </Modal>
  );
}
