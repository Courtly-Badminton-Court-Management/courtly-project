"use client";

import React from "react";

export type TopupRow = {
  id: string;
  username: string;
  amount: number;
  dt: string; // e.g. "5 Sep 2025, 12:54 PM"
  status: "Pending" | "Approved" | "Rejected";
};

type Props = {
  rows: TopupRow[];
  onView?: (row: TopupRow) => void;
};

export default function TopupApproval({ rows, onView }: Props) {
  const isEmpty = rows.length === 0;

  return (
    <div className="overflow-x-auto">
      {isEmpty ? (
        <div className="flex h-32 items-center justify-center text-sm text-neutral-500">
          No top-up requests at the moment.
        </div>
      ) : (
        <div className="max-h-[520px] overflow-y-auto">
          <table className="w-full min-w-[880px] text-sm border-collapse">
            <thead className="sticky top-0 z-[1]">
              <tr className="bg-neutral-100 text-neutral-700">
                <Th first>Request ID</Th>
                <Th>Username</Th>
                <Th>Amount (Coins)</Th>
                <Th>Datetime</Th>
                <Th>Status</Th>
                <Th last>Actions</Th>
              </tr>
            </thead>

            <tbody>
              {rows.map((r) => (
                <tr
                  key={r.id}
                  className="
                    border-b border-neutral-200 last:border-0
                    hover:bg-neutral-50 transition
                  "
                >
                  <Td>{r.id}</Td>
                  <Td className="font-medium">{r.username}</Td>
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
                      type="button"
                      onClick={() => onView?.(r)}
                      className="
                        rounded-xl bg-pine px-4 py-2 text-xs sm:text-sm 
                        font-semibold text-white
                        hover:bg-emerald-800 transition-colors
                      "
                    >
                      View Detail
                    </button>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function StatusPill({ status }: { status: TopupRow["status"] }) {
  const base =
    "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold";
  const cls =
    status === "Approved"
      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
      : status === "Pending"
      ? "bg-amber-50 text-amber-700 border border-amber-200"
      : "bg-rose-50 text-cherry border border-rose-200";

  return <span className={`${base} ${cls}`}>{status}</span>;
}

function Th({
  children,
  first,
  last,
}: {
  children: React.ReactNode;
  first?: boolean;
  last?: boolean;
}) {
  return (
    <th
      className={`
        p-3 text-left text-xs font-semibold
        ${first ? "rounded-tl-xl" : ""}
        ${last ? "rounded-tr-xl" : ""}
      `}
    >
      {children}
    </th>
  );
}

function Td({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <td className={`p-3 align-middle text-neutral-800 ${className}`}>
      {children}
    </td>
  );
}
