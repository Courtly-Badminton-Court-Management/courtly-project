"use client";

import { useState } from "react";
import Image from "next/image";
import TopupApproval, { TopupRow } from "@/ui/components/wallet/TopupApproval";
import {
  useWalletTopupsList,
  useWalletTopupsApproveCreate,
  useWalletTopupsRejectCreate,
} from "@/api-client/endpoints/wallet/wallet";

/* ────────────────────────────── */
export default function ManagerApprovalPage() {
  const { data: topups, isLoading, refetch } = useWalletTopupsList();
  const [open, setOpen] = useState<TopupRow | null>(null);

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

  /* ────────────── Helpers ────────────── */
  const getSlipUrl = (path?: string | null) => {
    if (!path) return "/brand/mock-slip.png";
    if (path.startsWith("http")) return path;

    const base =
      process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ||
      "http://localhost:8001";

    // ป้องกันกรณี backend คืน path เช่น `/media/...`
    if (!path.startsWith("/")) path = "/" + path;
    return `${base}${path}`;
  };

  /* ────────────── Data Mapping ────────────── */
  const rows: TopupRow[] =
    topups?.map((t) => ({
      id: String(t.id),
      user:
        t.user_display_name?.trim() ||
        t.user_email?.trim() ||
        (t.user ? `User #${t.user}` : "Unknown User"),
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
      slip_path: t.slip_path ?? null,
    })) ?? [];

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
      <TopupApproval rows={rows} onView={(row) => setOpen(row)} />

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

            {/* Main content */}
            <div className="grid gap-6 md:grid-cols-[320px_1fr]">
              {/* Slip Preview */}
              <div className="rounded-xl border p-3">
                <div className="aspect-[3/4] w-full overflow-hidden rounded-lg bg-neutral-100 flex items-center justify-center">
                  {open.slip_path ? (
                    <Image
                      src={getSlipUrl(open.slip_path)}
                      alt="Payment slip"
                      width={600}
                      height={800}
                      className="h-full w-full object-cover"
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
                        ? "text-emerald-700 font-bold"
                        : open.status === "Pending"
                        ? "text-amber-600 font-bold"
                        : "text-rose-700 font-bold"
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
                    className="rounded-xl bg-cherry px-6 py-2 font-semibold text-white hover:opacity-90 disabled:opacity-60"
                  >
                    {rejectMutation.isPending ? "Rejecting..." : "Reject"}
                  </button>
                  <button
                    type="button"
                    onClick={handleApprove}
                    disabled={approveMutation.isPending}
                    className="rounded-xl bg-pine px-6 py-2 font-semibold text-white hover:bg-emerald-800 disabled:opacity-60"
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