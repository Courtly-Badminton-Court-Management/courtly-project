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
          className="rounded-xl px-4 py-2 text-sm font-bold transition-colors bg-pine text-white hover:bg-emerald-800 hover:text-white   "
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
              <tr key={l.id} className="border-b border-neutral-300 last:border-0">
                <Td>{l.id}</Td>
                <Td>
                  <span
                    className={
                      l.amount < 0 ? "text-cherry font-bold" : "text-emerald-700 font-bold"
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
    </section>
  );
}

const Th = ({ children }: any) => (
  <th className="p-3 text-left text-xs font-semibold">{children}</th>
);
const Td = ({ children }: any) => <td className="p-3">{children}</td>;
