"use client";

export type PendingItem = {
  id: string;
  dt: string;
  amount: number;
  status: "Pending" | "Approved" | "Rejected";
};

export default function PendingRequests({
  items,
}: {
  items: PendingItem[];
}) {
  return (
    <section className="rounded-2xl border bg-white p-5 shadow-sm">
      <h3 className="mb-3 text-xl font-semibold">Pending Requests</h3>

      {items.length === 0 ? (
        <div className="rounded-xl border border-dashed p-6 text-sm text-neutral-500">
          No pending requests.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] text-sm">
            <thead className="bg-neutral-50">
              <tr>
                <Th>Request ID</Th>
                <Th>Datetime</Th>
                <Th>Amount (coins)</Th>
                <Th>Status</Th>
              </tr>
            </thead>
            <tbody>
              {items.map((p) => (
                <tr key={p.id} className="border-b last:border-0">
                  <Td>{p.id}</Td>
                  <Td>{p.dt}</Td>
                  <Td>
                    <span
                      className={
                        p.amount < 0
                          ? "text-cherry font-bold"
                          : "text-emerald-700 font-bold"
                      }
                    >
                      {p.amount > 0 ? `+${p.amount}` : p.amount}
                    </span>
                  </Td>
                  <Td>
                    <span
                      className={
                        p.status === "Approved"
                          ? "text-emerald-700 font-bold"
                          : p.status === "Pending"
                          ? "text-walkin font-bold"
                          : "text-cherry font-bold"
                      }
                    >
                      {p.status}
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

const Th = ({ children }: any) => (
  <th className="p-3 text-left text-xs font-semibold">{children}</th>
);
const Td = ({ children }: any) => <td className="p-3">{children}</td>;
