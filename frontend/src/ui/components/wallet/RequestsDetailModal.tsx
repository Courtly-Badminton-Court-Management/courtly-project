"use client";

import Image from "next/image";
import { X } from "lucide-react";
import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import type { TopupRow } from "@/ui/components/wallet/TopupApprovalTable";

export type TopupDetailRow = TopupRow & {
  slipUrl?: string | null;
};

type Props = {
  open: boolean;
  data: TopupDetailRow | null;
  onClose: () => void;
  onApprove?: () => void;
  onReject?: () => void;
  loadingApprove?: boolean;
  loadingReject?: boolean;
};

export default function RequestsDetailModal({
  open,
  data,
  onClose,
  onApprove,
  onReject,
  loadingApprove = false,
  loadingReject = false,
}: Props) {
  const modalRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    if (!open) return;

    const handler = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handler);
    return () => {
      document.removeEventListener("mousedown", handler);
    };
  }, [open, onClose]);

  // ❗ ต้องให้ hooks รันก่อน แล้วค่อย return null ได้
  if (!open || !data) return null;

  return (
    <div
      className="
        fixed inset-0 z-[999]
        flex items-center justify-center
        bg-black/40 backdrop-blur-sm
        animate-fade
      "
    >
      <div
        ref={modalRef}
        className="
          relative w-full max-w-4xl
          max-h-[100vh] bg-white rounded-2xl shadow-2xl
          flex flex-col overflow-hidden
          animate-pop
        "
      >
        {/* Glows */}
        <div className="absolute -top-16 left-0 w-40 h-40 bg-emerald-200/30 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 right-0 w-40 h-40 bg-pine/20 blur-3xl pointer-events-none" />

        {/* Close */}
        <button
          onClick={onClose}
          className="
            absolute right-4 top-4 z-20 
            rounded-full p-2 bg-white/80 backdrop-blur-sm
            hover:bg-neutral-100 shadow
          "
        >
          <X className="w-5 h-5 text-neutral-500" />
        </button>

        {/* Header */}
        <header className="px-6 pt-6 pb-4 border-b border-platinum bg-white/80 backdrop-blur-sm">
          <h2 className="text-xl font-bold text-pine">Top-Up Request Detail</h2>
          <p className="text-xs text-neutral-500 mt-1">
            Request ID: {data.id}
          </p>
        </header>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          <div className="grid gap-6 md:grid-cols-[320px_1fr]">
            {/* Slip image */}
            <div className="rounded-xl border border-platinum p-3 shadow-sm">
              <div className="flex aspect-[3/4] items-center justify-center bg-neutral-100 rounded-lg overflow-hidden">
                {data.slipUrl ? (
                  <Image
                    src={data.slipUrl}
                    alt="Slip"
                    width={600}
                    height={800}
                    unoptimized
                    className="w-full h-full object-contain bg-white"
                  />
                ) : (
                  <span className="text-neutral-400 text-sm">
                    No slip uploaded
                  </span>
                )}
              </div>
            </div>

            {/* Info */}
            <div className="space-y-4 text-sm">
              <FieldRow label="User" value={data.username} />
              <FieldRow label="Amount" value={`${data.amount} Coins`} />
              <FieldRow label="Datetime" value={data.dt} />
              <FieldRow
                label="Status"
                value={
                  <span
                    className={
                      data.status === "Approved"
                        ? "text-emerald-700 font-semibold"
                        : data.status === "Pending"
                        ? "text-walkin font-semibold"
                        : "text-cherry font-semibold"
                    }
                  >
                    {data.status}
                  </span>
                }
              />
            </div>
          </div>
        </div>

        {/* Footer sticky */}
        <footer
          className="
            px-6 py-4 border-t border-platinum bg-white
            sticky bottom-0 flex justify-end gap-2
          "
        >
          {data.status === "Pending" ? (
            <>
              <button
                onClick={onReject}
                disabled={loadingReject}
                className="
                  rounded-xl bg-cherry px-5 py-2 text-sm font-semibold text-white
                  hover:bg-rose-700 transition disabled:opacity-60
                "
              >
                {loadingReject ? "Rejecting..." : "Reject"}
              </button>

              <button
                onClick={onApprove}
                disabled={loadingApprove}
                className="
                  rounded-xl bg-pine px-5 py-2 text-sm font-semibold text-white
                  hover:bg-emerald-800 transition disabled:opacity-60
                "
              >
                {loadingApprove ? "Approving..." : "Approve"}
              </button>
            </>
          ) : (
            <button
              onClick={onClose}
              className="
                rounded-xl bg-neutral-200 px-5 py-2 text-sm font-semibold text-neutral-900
                hover:bg-neutral-300
              "
            >
              Close
            </button>
          )}
        </footer>
      </div>
    </div>
  );
}

/* Shared field row */
function FieldRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] font-medium text-neutral-500 uppercase tracking-[0.06em]">
        {label}
      </span>

      <div
        className="
          w-full 
          rounded-lg 
          border border-neutral-200/70 
          bg-neutral-50
          px-3 py-2 
          text-sm text-neutral-800
          shadow-sm
          transition-all
          hover:border-neutral-300
        "
      >
        {value}
      </div>
    </div>
  );
}
