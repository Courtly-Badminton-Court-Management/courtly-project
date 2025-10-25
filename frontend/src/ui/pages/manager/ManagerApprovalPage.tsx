"use client";

import { useState } from "react";
import TopupApproval, { TopupRow } from "@/ui/components/wallet/TopupApproval";
import Image from "next/image";

export default function ManagerApprovalPage() {
  const [rows, setRows] = useState<TopupRow[]>([
    { id: "REQ02419824379", user: "Mata Nakee",      amount: 200, dt: "5 Sep 2025, 12:54 PM", status: "Pending"  },
    { id: "REQ02419824368", user: "Peony Smith",     amount: 100, dt: "5 Sep 2025, 10:39 AM", status: "Pending"  },
    { id: "REQ02419824353", user: "Somkid Meetung",  amount: 300, dt: "5 Sep 2025, 09:03 AM", status: "Pending"  },
    { id: "REQ02419824349", user: "Tanont Meejai",   amount: 200, dt: "4 Sep 2025, 21:48 PM", status: "Approved" },
    { id: "REQ02419824344", user: "Jane Yeah",       amount: 100, dt: "4 Sep 2025, 21:26 PM", status: "Approved" },
    { id: "REQ02419824341", user: "Naphat Wainam",   amount: 150, dt: "4 Sep 2025, 20:07 PM", status: "Approved" },
    { id: "REQ02419824336", user: "Jetaime Sudlhor", amount: 500, dt: "4 Sep 2025, 19:52 PM", status: "Approved" },
    { id: "REQ02419822432", user: "Thapana Dekdee",  amount: 400, dt: "4 Sep 2025, 17:11 PM", status: "Approved" },
  ]);

  const [open, setOpen] = useState<TopupRow | null>(null);

  const updateStatus = (id: string, status: TopupRow["status"]) => {
    setRows(prev => prev.map(r => (r.id === id ? { ...r, status } : r)));
  };

  const handleApprove = () => {
    if (!open) return;
    updateStatus(open.id, "Approved");
    setOpen(null);
  };

  const handleReject = () => {
    if (!open) return;
    updateStatus(open.id, "Rejected");
    setOpen(null);
  };

  return (
    <main className="mx-auto max-w-6xl p-4 md:p-8">
      <TopupApproval rows={rows} onView={(row) => setOpen(row)} />

      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
          <div className="w-full max-w-3xl rounded-2xl bg-white p-6 shadow-xl">
            {/* Header */}
            <div className="mb-4 flex items-start justify-between">
              <h3 className="text-2xl font-extrabold">
                {open.status === "Pending" ? "Top-Up Approval" : "Top-Up Detail"}
              </h3>
              <button
                type="button"
                onClick={() => setOpen(null)}
                className="rounded-full p-2 text-2xl leading-none text-neutral-500 hover:bg-neutral-100"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            {/* Main content */}
            <div className="grid gap-6 md:grid-cols-[320px_1fr]">
              {/* Slip preview */}
              <div className="rounded-xl border p-3">
                <div className="aspect-[3/4] w-full overflow-hidden rounded-lg bg-neutral-100">
                  <Image
                    src="/brand/mock-slip.png" // put slip preview here
                    alt="Payment slip"
                    width={600}
                    height={800}
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>

              {/* Information section */}
              <div className="space-y-4">
                <p className="text-lg"><b>Request ID:</b> {open.id}</p>
                <p className="text-lg"><b>User:</b> {open.user}</p>
                <p className="text-lg"><b>Amount:</b> {open.amount} Coins</p>
                <p className="text-lg"><b>Datetime:</b> {open.dt}</p>
                <p className="text-lg">
                  <b>Status:</b>{" "}
                  <span
                    className={
                      open.status === "Approved"
                        ? "text-emerald-700 font-bold"
                        : open.status === "Pending"
                        ? "text-walkin font-bold"
                        : "text-cherry font-bold"
                    }
                  >
                    {open.status}
                  </span>
                </p>
              </div>
            </div>

            {/* Buttons BELOW popup content */}
            <div className="mt-8 flex justify-end gap-3">
              {open.status === "Pending" ? (
                <>
                  <button
                    type="button"
                    onClick={handleReject}
                    className="rounded-xl bg-cherry px-6 py-2 font-semibold text-white hover:opacity-90"
                  >
                    Reject
                  </button>
                  <button
                    type="button"
                    onClick={handleApprove}
                    className="rounded-xl bg-pine px-6 py-2 font-semibold text-white hover:bg-emerald-800"
                  >
                    Approve
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
