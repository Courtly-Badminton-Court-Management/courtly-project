"use client";

import { useState } from "react";
import TopupApproval, { TopupRow } from "@/ui/components/wallet/TopupApproval";

export default function ManagerApprovalPage() {
  const [rows, setRows] = useState<TopupRow[]>([
    {
      id: "REQ02419824379",
      user: "Mata Nakee",
      amount: 200,
      dt: "5 Sep 2025, 12:54 PM",
      status: "Pending",
    },
    {
      id: "REQ02419824368",
      user: "Peony Smith",
      amount: 100,
      dt: "5 Sep 2025, 10:39 AM",
      status: "Pending",
    },
    {
      id: "REQ02419824353",
      user: "Somkid Meetung",
      amount: 300,
      dt: "5 Sep 2025, 09:03 AM",
      status: "Pending",
    },
  ]);

  const [open, setOpen] = useState<TopupRow | null>(null);

  return (
    <main className="mx-auto max-w-6xl p-4 md:p-8">
      <TopupApproval
        rows={rows}
        onView={(row) => setOpen(row)}
      />

      {/* Detail / approval modal */}
      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="mb-3 text-xl font-bold">Top-Up Detail</h3>
            <div className="space-y-1 text-sm">
              <p><b>Request ID:</b> {open.id}</p>
              <p><b>User:</b> {open.user}</p>
              <p>
                <b>Amount:</b>{" "}
                <span className="font-bold text-emerald-700">+{open.amount} Coins</span>
              </p>
              <p><b>Datetime:</b> {open.dt}</p>
              <p><b>Status:</b> {open.status}</p>
            </div>

            <div className="mt-5 flex gap-2">
              <button
                onClick={() => {
                  setRows((prev) =>
                    prev.map((r) =>
                      r.id === open.id ? { ...r, status: "Approved" } : r
                    )
                  );
                  setOpen(null);
                }}
                className="rounded-xl bg-pine px-4 py-2 font-semibold text-white hover:bg-emerald-800"
              >
                Approve
              </button>

              <button
                onClick={() => setOpen(null)}
                className="rounded-xl bg-neutral-200 px-4 py-2 font-semibold text-neutral-800 hover:bg-neutral-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
