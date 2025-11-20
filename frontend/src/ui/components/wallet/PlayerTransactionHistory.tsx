"use client";

import { FileDown } from "lucide-react";

export type LedgerItem = {
  id: string;
  dt: string;
  type: "Topup" | "Booking Deduction" | "Refund";
  amount: number;
  status: "Pending" | "Approved" | "Rejected";
};

export default function PlayerTransactionHistory({
  items,
  onExport,
  loading = false,
}: {
  items: LedgerItem[];
  onExport?: () => void;
  loading?: boolean;
}) {
  return (
    <section
      className="
        h-full flex flex-col
        rounded-2xl border border-platinum bg-white
        p-6 shadow-sm transition hover:shadow-md
      "
    >
      {/* Header */}
      <div className="mb-4 border-b-4 border-pine/80 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-pine/10 p-2 text-pine">
            <FileDown size={18} strokeWidth={2.2} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-pine">Transaction History</h3>
            <p className="text-sm font-medium text-neutral-500">
              Top-ups, booking deductions, and refunds
            </p>
          </div>
        </div>

        <button
          onClick={onExport}
          disabled={loading}
          className="
            rounded-xl px-4 py-2 text-sm font-semibold
            transition-colors bg-pine text-white
            hover:bg-emerald-800 disabled:opacity-60
          "
        >
          {loading ? "Exporting..." : "Export CSV"}
        </button>
      </div>

      {/* Loading Skeleton */}
      {loading ? (
        <div className="mt-2 animate-pulse space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-6 bg-neutral-100 rounded" />
          ))}
        </div>
      ) : (
        <div className="mt-2 overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm border-collapse">
            {/* Table Head */}
            <thead>
              <tr
                className="
                  bg-neutral-100 text-neutral-700
                  rounded-t-xl
                "
              >
                <Th first>Request ID</Th>
                <Th>Amount (coins)</Th>
                <Th>Datetime</Th>
                <Th>Type</Th>
                <Th last>Status</Th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody>
              {items.map((l) => (
                <tr
                  key={l.id}
                  className="
                    border-b border-neutral-200
                    hover:bg-neutral-50 transition
                  "
                >
                  <Td>{l.id}</Td>
                  <Td>
                    <span
                      className={
                        l.amount < 0
                          ? "text-cherry font-bold"
                          : "text-emerald-700 font-bold"
                      }
                    >
                      {l.amount > 0 ? `+${l.amount}` : l.amount}
                    </span>
                  </Td>
                  <Td>{l.dt}</Td>
                  <Td>{l.type}</Td>
                  <Td>
                    <span
                      className={
                        l.status === "Approved"
                          ? "text-emerald-700 font-bold"
                          : l.status === "Pending"
                          ? "text-walkin font-bold"
                          : "text-cherry font-bold"
                      }
                    >
                      {l.status}
                    </span>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

const Th = ({ children, first, last }: any) => (
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

const Td = ({ children }: any) => (
  <td className="p-3 align-middle text-neutral-800">{children}</td>
);
