"use client";

import React, { useMemo, useState } from "react";

export type TopupRow = {
  id: string;
  user: string;
  amount: number;
  dt: string; // e.g. "5 Sep 2025, 12:54 PM"
  status: "Pending" | "Approved" | "Rejected";
};

type Props = {
  rows: TopupRow[];
  onView?: (row: TopupRow) => void;
};

// Convert date string → timestamp for sorting
function parseDt(dt: string) {
  const t = Date.parse(dt);
  return Number.isNaN(t) ? 0 : t;
}

export default function TopupApproval({ rows, onView }: Props) {
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  // Sort rows by datetime
  const sorted = useMemo(() => {
    const copy = [...rows];
    copy.sort((a, b) => {
      const da = parseDt(a.dt);
      const db = parseDt(b.dt);
      return sortDir === "asc" ? da - db : db - da;
    });
    return copy;
  }, [rows, sortDir]);

  return (
    <>
      {/* Title + Warning */}
    <div className="mb-3 flex items-center gap-3">
        <h2 className="text-2xl font-bold">Top-Up Requests</h2>
        <button
            type="button"
            onClick={() => setSortDir((d) => (d === "asc" ? "desc" : "asc"))}
            className="inline-flex h-6 w-6 items-center justify-center rounded-md text-lg leading-none text-neutral-600 hover:text-neutral-600"
            title={`Sort by Datetime (${sortDir === "asc" ? "ascending" : "descending"})`}
            aria-label={`Sort by Datetime ${sortDir === "asc" ? "ascending" : "descending"}`}
        >
            ⇅
        </button>
    </div>
      <p className="mb-5 text-sm italic text-cherry">
        ⚠ Approvals can only be made during business hours. Off-hours requests remain pending.
      </p>

      {/* Card: Table only */}
      <section className="rounded-2xl border bg-white p-5 shadow-sm">
        <div className="overflow-x-auto">
          {/* Scrollable inner area */}
          <div className="max-h-[520px] overflow-y-auto">
            <table className="w-full min-w-[880px] text-sm">
              <thead className="sticky top-0 bg-neutral-50">
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
                {sorted.map((r) => (
                  <tr key={r.id} className="border-b last:border-0">
                    <Td>{r.id}</Td>
                    <Td className="font-medium">{r.user}</Td>
                    <Td>
                      <span className="font-bold text-emerald-700">
                        +{r.amount}
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
        </div>
      </section>
    </>
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
