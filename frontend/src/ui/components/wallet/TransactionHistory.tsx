"use client";

export type LedgerItem = {
  id: string;
  dt: string;
  type: "Topup" | "Booking Deduction" | "Refund";
  amount: number; // +/-
  status: "Pending" | "Approved" | "Rejected";
};

export default function TransactionHistory({
  items,
  onExport,
}: {
  items: LedgerItem[];
  onExport?: () => void;
}) {
  return (
    <section className="rounded-2xl border bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-xl font-semibold">Transaction History</h3>
        <button
          onClick={onExport}
          className="rounded-lg border border-platinum px-3 py-1.5 text-sm font-semibold hover:bg-neutral-50"
        >
          Export CSV
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-sm">
          <thead className="bg-neutral-50">
            <tr>
              <Th>Request ID</Th>
              <Th>Amount (coins)</Th>
              <Th>Datetime</Th>
              <Th>Type</Th>
              <Th>Status</Th>
            </tr>
          </thead>
          <tbody>
            {items.map((l) => (
              <tr key={l.id} className="border-b last:border-0">
                <Td>{l.id}</Td>
                <Td>
                  <span
                    className={
                      l.amount < 0 ? "text-rose-600 font-semibold" : "text-emerald-700 font-semibold"
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
                        ? "text-emerald-700"
                        : l.status === "Pending"
                        ? "text-amber-700"
                        : "text-rose-700"
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
    </section>
  );
}

const Th = ({ children }: any) => (
  <th className="p-3 text-left text-xs font-semibold">{children}</th>
);
const Td = ({ children }: any) => <td className="p-3">{children}</td>;
