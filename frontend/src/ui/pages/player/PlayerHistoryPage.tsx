"use client";

import { useMemo, useState } from "react";
import Button from "@/ui/components/basic/Button";

type Row = {
  id: string;
  court: string;
  schedule: string;
  username: string;
  coins: number; // positive for refund/topup, negative for capture
  status: "Booked" | "End Game" | "Cancelled";
};

export default function PlayerHistoryPage() {
  const rows = useMemo<Row[]>(
    () => [
      { id: "BK04300820252", court: "Court 5", schedule: "3 Sep 2025, 20:00 - 21:00", username: "Senior19", coins: -200, status: "Booked" },
      { id: "BK04300820251", court: "Court 5", schedule: "3 Sep 2025, 20:00 - 21:00", username: "Senior19", coins: +200, status: "End Game" },
      { id: "BK08230729425", court: "Court 3", schedule: "3 Sep 2025, 20:00 - 21:00", username: "Senior19", coins: -100, status: "End Game" },
      { id: "BK12703976054", court: "Court 1", schedule: "3 Sep 2025, 20:00 - 21:00", username: "Senior19", coins: -200, status: "End Game" },
      { id: "BK42910382149", court: "Court 4", schedule: "3 Sep 2025, 20:00 - 21:00", username: "Senior19", coins: -100, status: "Cancelled" },
    ],
    []
  );
  const [q, setQ] = useState("");

  const filtered = rows.filter((r) => r.id.toLowerCase().includes(q.toLowerCase()));

  return (
    <main className="mx-auto max-w-6xl p-4 md:p-8">
      <header className="mb-4 flex items-end justify-between">
        <h1 className="text-2xl font-bold">Booking History</h1>
        <div className="flex gap-2">
          <Button label="Download PDF" />
          <Button label="Export CSV" />
        </div>
      </header>

      <div className="mb-3">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by Booking ID..."
          className="w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-400"
        />
      </div>

      <div className="overflow-x-auto rounded-2xl border bg-white shadow-sm">
        <table className="w-full min-w-[800px] border-separate border-spacing-0 text-sm">
          <thead>
            <tr className="bg-neutral-50 text-left">
              <Th>Booking ID</Th><Th>Court</Th><Th>Schedule</Th><Th>Username</Th><Th>Coins</Th><Th>Status</Th><Th>Action</Th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.id} className="border-b last:border-0">
                <Td className="font-semibold">{r.id}</Td>
                <Td>{r.court}</Td>
                <Td>{r.schedule}</Td>
                <Td>{r.username}</Td>
                <Td className={r.coins < 0 ? "text-rose-600" : "text-emerald-700"}>
                  {r.coins < 0 ? r.coins : `+${r.coins}`}
                </Td>
                <Td>{r.status}</Td>
                <Td><Button label="Download PDF" /></Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}

const Th = ({ children }: any) => <th className="p-3 text-xs font-semibold">{children}</th>;
const Td = ({ children, className = "" }: any) => <td className={`p-3 ${className}`}>{children}</td>;
