"use client";

import { useMemo, useState } from "react";

type Log = { when:string; who:string; action:string; meta:string };

export default function ManagerLogPage() {
  const [q, setQ] = useState("");
  const logs = useMemo<Log[]>(
    () => [
      { when:"2025-09-05 12:54", who:"admin@courtly", action:"APPROVE_TOPUP", meta:"REQ02419824341 +500" },
      { when:"2025-09-05 10:39", who:"admin@courtly", action:"CHECKIN", meta:"BK04300820251 Court 1 11:00-12:00" },
      { when:"2025-09-04 21:48", who:"admin@courtly", action:"REJECT_TOPUP", meta:"REQ02419824349" },
      { when:"2025-09-04 09:12", who:"system", action:"AUTO_REFUND", meta:"BK42910382149 -100" },
    ],
    []
  );
  const filtered = logs.filter(l => [l.when,l.who,l.action,l.meta].join(" ").toLowerCase().includes(q.toLowerCase()));

  return (
    <main className="mx-auto max-w-5xl p-4 md:p-8">
      <header className="mb-4">
        <h1 className="text-2xl font-bold">Audit Log</h1>
        <p className="text-sm text-neutral-600">Complete audit trail for booking, cancel, approvals, and adjustments.</p>
      </header>

      <input
        value={q}
        onChange={(e)=>setQ(e.target.value)}
        placeholder="Search logs..."
        className="mb-3 w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-400"
      />

      <div className="rounded-2xl border bg-white p-4 shadow-sm">
        <ul className="divide-y">
          {filtered.map((l,i)=>(
            <li key={i} className="grid grid-cols-12 gap-2 py-3 text-sm">
              <div className="col-span-3 font-medium">{l.when}</div>
              <div className="col-span-3">{l.who}</div>
              <div className="col-span-3">{l.action}</div>
              <div className="col-span-3 text-neutral-600">{l.meta}</div>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
