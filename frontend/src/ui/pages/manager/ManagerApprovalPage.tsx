"use client";

import { useState } from "react";
import Image from "next/image";
import TopupApproval, { TopupRow } from "@/ui/components/wallet/TopupApproval";
import {
  useWalletTopupsList,
  useWalletTopupsApproveCreate,
  useWalletTopupsRejectCreate,
} from "@/api-client/endpoints/wallet/wallet";

// Extend TopupRow locally to include slip URL used in modal
type ModalTopupRow = TopupRow & {
  slipUrl?: string | null;
};

export default function ManagerApprovalPage() {
  /* ────────────── Queries ────────────── */
  const { data: topups, isLoading, refetch } = useWalletTopupsList();
  const [open, setOpen] = useState<ModalTopupRow | null>(null);

  /* ────────────── Mutations ────────────── */
  const approveMutation = useWalletTopupsApproveCreate({
    mutation: {
      onSuccess: () => {
        refetch();
        setOpen(null);
      },
    },
  });

  const rejectMutation = useWalletTopupsRejectCreate({
    mutation: {
      onSuccess: () => {
        refetch();
        setOpen(null);
      },
    },
  });

  /* ────────────── Data Mapping ────────────── */
  const rows: ModalTopupRow[] =
    topups?.map((t: any) => {
      const displayUser =
        t.user_display_name?.trim?.() ||
        t.user_email?.trim?.() ||
        (t.user ? `User #${t.user}` : "Unknown User");

      return {
        id: String(t.id),
        user: displayUser,
        amount: t.amount_thb,
        dt: new Date(t.created_at).toLocaleString("en-GB", {
          dateStyle: "medium",
          timeStyle: "short",
        }),
        status:
          t.status === "pending"
            ? "Pending"
            : t.status === "approved"
            ? "Approved"
            : "Rejected",
        slipUrl: t.slip_path || null,
      };
    }) ?? [];

  /* ────────────── Loading / Empty ────────────── */
  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center text-gray-500">
        Loading top-up requests...
      </div>
    );
  }

  if (!rows.length) {
    return (
      <div className="flex h-[80vh] items-center justify-center text-gray-500">
        No top-up requests found.
      </div>
    );
  }

  /* ────────────── Actions ────────────── */
  const handleApprove = async () => {
    if (!open) return;
    await approveMutation.mutateAsync({ id: open.id, data: {} as any });
  };

  const handleReject = async () => {
    if (!open) return;
    await rejectMutation.mutateAsync({ id: open.id, data: {} as any });
  };

  /* ────────────── UI ────────────── */
  return (
    <main className="mx-auto max-w-6xl p-4 md:p-8">
      {/* Table Section */}
      <TopupApproval
        rows={rows}
        onView={(row) => {
          // row is TopupRow (no slipUrl), so find its extended data from rows[]
          const full = rows.find((r) => r.id === row.id) ?? row;
          setOpen(full as ModalTopupRow);
        }}
      />

      {/* Modal Section */}
      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
          <div className="w-full max-w-3xl rounded-2xl bg-white p-6 shadow-xl">
            {/* Header */}
            <div className="mb-4 flex items-start justify-between">
              <h3 className="text-2xl font-extrabold">
                {open.status === "Pending"
                  ? "Top-Up Approval"
                  : "Top-Up Detail"}
              </h3>
              <button
                type="button"
                onClick={() => setOpen(null)}
                className="rounded-full p-2 text-2xl text-neutral-500 hover:bg-neutral-100"
              >
                ×
              </button>
            </div>

            {/* Main Content */}
            <div className="grid gap-6 md:grid-cols-[320px_1fr]">
              {/* Slip Preview */}
              <div className="rounded-xl border p-3">
                <div className="flex aspect-[3/4] w-full items-center justify-center overflow-hidden rounded-lg bg-neutral-100">
                  {open.slipUrl ? (
                    <Image
                      src={open.slipUrl}
                      alt="Payment slip"
                      width={600}
                      height={800}
                      unoptimized
                      className="h-full w-full bg-white object-contain"
                    />
                  ) : (
                    <span className="text-gray-400">No slip uploaded</span>
                  )}
                </div>
              </div>

              {/* Info Section */}
              <div className="space-y-4">
                <p className="text-lg">
                  <b>Request ID:</b> {open.id}
                </p>
                <p className="text-lg">
                  <b>User:</b> {open.user}
                </p>
                <p className="text-lg">
                  <b>Amount:</b> {open.amount} Coins
                </p>
                <p className="text-lg">
                  <b>Datetime:</b> {open.dt}
                </p>
                <p className="text-lg">
                  <b>Status:</b>{" "}
                  <span
                    className={
                      open.status === "Approved"
                        ? "font-bold text-emerald-700"
                        : open.status === "Pending"
                        ? "font-bold text-amber-600"
                        : "font-bold text-rose-700"
                    }
                  >
                    {open.status}
                  </span>
                </p>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="mt-8 flex justify-end gap-3">
              {open.status === "Pending" ? (
                <>
                  <button
                    type="button"
                    onClick={handleReject}
                    disabled={rejectMutation.isPending}
                    className="rounded-xl bg-rose-600 px-6 py-2 font-semibold text-white hover:opacity-90 disabled:opacity-60"
                  >
                    {rejectMutation.isPending ? "Rejecting..." : "Reject"}
                  </button>
                  <button
                    type="button"
                    onClick={handleApprove}
                    disabled={approveMutation.isPending}
                    className="rounded-xl bg-emerald-700 px-6 py-2 font-semibold text-white hover:bg-emerald-800 disabled:opacity-60"
                  >
                    {approveMutation.isPending ? "Approving..." : "Approve"}
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => setOpen(null)}
                  className="rounded-xl bg-neutral-200 px-6 py-2 font-semibold text-neutral-900 hover:bg-neutral-300"
                >
                  Close
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
