// src/ui/components/bookingpage/BookingConfirmedModal.tsx
"use client";
import React, { useEffect, useState } from "react";
import Modal from "@/ui/components/basic/Modal";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2, Copy, Check } from "lucide-react";

type Props = {
  open: boolean;
  onClose: () => void;
  bookingNos: string[];
};

export default function BookingConfirmedModal({ open, onClose, bookingNos }: Props) {
  const router = useRouter();
  const [copied, setCopied] = useState<string | null>(null);

  // 🔮 Prefetch หน้าที่จะไปต่อเพื่อให้เปลี่ยนหน้าไวขึ้น
  useEffect(() => {
    if (!open) return;
    router.prefetch("/home");
    router.prefetch("/history");
  }, [open, router]);

  const onCopy = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(code);
      setTimeout(() => setCopied(null), 1500);
    } catch {}
  };

  const count = bookingNos?.length ?? 0;

  return (
    <Modal open={open} onClose={onClose}>
      <div className="mx-auto max-w-lg text-center px-2 py-1">
        <div className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-full bg-green-50">
          <CheckCircle2 className="h-12 w-12 text-pine" aria-hidden />
        </div>

        <h2 className="mb-1 text-2xl font-bold text-onyx">Booking Confirmed!</h2>

        <p className="mb-4 text-sm text-neutral-600">
          {count > 1
            ? `Your ${count} bookings are confirmed and added to Upcoming.`
            : `Your booking is confirmed and added to Upcoming.`}
        </p>

        {/* Booking IDs */}
        <div className="mx-auto mb-5 inline-flex flex-col gap-2 text-left">
          {bookingNos?.map((no, i) => (
            <div
              key={`${no}-${i}`}
              className="flex items-center gap-2 rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2"
              aria-label={`Booking ID ${no}`}
            >
              <span className="text-[13px] font-medium text-neutral-700">Booking ID:</span>
              <code className="rounded bg-white px-2 py-0.5 text-[13px] text-neutral-800">{no}</code>

              <button
                onClick={() => onCopy(no)}
                className="ml-1 inline-flex items-center gap-1 rounded-md border border-neutral-200 bg-white px-2 py-1 text-xs text-neutral-700 hover:bg-neutral-50"
                aria-label={`Copy Booking ID ${no}`}
              >
                {copied === no ? (
                  <>
                    <Check className="h-3.5 w-3.5" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    Copy
                  </>
                )}
              </button>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex flex-col-reverse items-stretch justify-center gap-2 sm:flex-row">
          <button
            onClick={onClose}
            className="rounded-md border border-neutral-200 px-4 py-2 text-[15px] font-medium text-neutral-800 hover:bg-neutral-50"
          >
            Keep Browsing
          </button>

          {/* ใช้ Link (prefetch on by default) */}
          <Link
            href="/history"
            className="rounded-md border border-teal-200 bg-white px-4 py-2 text-center text-[15px] font-semibold text-teal-700 hover:bg-teal-50"
          >
            View Booking History
          </Link>

          <Link
            href="/home"
            className="rounded-md bg-teal-700 px-4 py-2 text-center text-[15px] font-semibold text-white hover:bg-teal-800"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </Modal>
  );
}
