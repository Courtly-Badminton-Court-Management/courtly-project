"use client";

import React from "react";

export type TopupRow = {
  id: string;
  user: string;
  amount: number; // coins (positive number)
  dt: string;     // e.g. "5 Sep 2025, 12:54 PM"
  status: "Pending" | "Approved" | "Rejected";
};

type Props = {
  rows: TopupRow[];
  onView?: (row: TopupRow) => void;
};

export default function TopupApproval({ rows, onView }: Props) {
  return (
    <section className="rounded-2xl border bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-2xl font-bold">Top-Up Requests</h2>
        {/* fake sort hint icon pair to match mock */}
        <div className="select-none text-xl leading-none text-neutral-400">⇅</div>
      </div>

      <p className="mb-5 text-sm italic text-cherry">
        ⚠ Approvals can only be made during business hours. Off-hours requests remain pending.
      </p>

      <div className="overflow-x-auto rounded-xl">
        <table className="w-full min-w-[880px] text-sm">
          <thead className="bg-neutral-50">
            <tr>
              <Th>Request ID</Th>
              <Th>User</Th>
              <Th>Amount (Coins)</Th>
              <Th>Datetime</Th>
              <Th>Status</Th>
              <Th>Actions</Th>
            </tr>
          </thead>

          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-b last:border-0">
                <Td>{r.id}</Td>
                <Td className="font-medium">{r.user}</Td>

                <Td>
                  <span className="font-bold text-emerald-700">
                    {`+${r.amount}`}
                  </span>
                </Td>

                <Td>{r.dt}</Td>

                <Td>
                  <StatusPill status={r.status} />
                </Td>

                <Td>
                  <button
                    onClick={() => onView?.(r)}
                    className="rounded-xl bg-pine px-4 py-2 text-sm font-bold text-white transition hover:bg-emerald-800"
                  >
                    View Detail
                  </button>
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function StatusPill({ status }: { status: TopupRow["status"] }) {
  const cls =
    status === "Approved"
      ? "text-emerald-700"
      : status === "Pending"
      ? "text-walkin"
      : "text-cherry";
  return <span className={`font-bold ${cls}`}>{status}</span>;
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="p-4 text-left text-xs font-semibold">{children}</th>;
}

function Td({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <td className={`p-4 ${className}`}>{children}</td>;
}
