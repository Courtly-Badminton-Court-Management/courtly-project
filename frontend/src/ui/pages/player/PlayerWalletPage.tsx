"use client";

import { useState } from "react";
import Button from "@/ui/components/basic/Button";

export default function PlayerWalletPage() {
  const [amount, setAmount] = useState<number | "">("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [slip, setSlip] = useState<File | null>(null);

  const pending = [
    { id: "REQ0824198243", dt: "5 Sep 2025, 12:54 PM", amount: 200, status: "Pending" },
  ];
  const ledger = [
    { id: "REQ02419824379", dt: "5 Sep 2025, 12:54 PM", type: "Topup", amount: +200, status: "Pending" },
    { id: "REQ02419824368", dt: "1 Sep 2025, 10:39 AM", type: "Booking Deduction", amount: -150, status: "Approved" },
    { id: "REQ02419824353", dt: "30 Aug 2025, 09:12 AM", type: "Booking Deduction", amount: -300, status: "Approved" },
  ];

  const canSubmit = !!amount && Number(amount) >= 100 && !!date && !!time && !!slip;

  return (
    <main className="mx-auto max-w-6xl p-4 md:p-8">
      <header className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Wallet</h1>
        <div className="rounded-md bg-amber-50 px-3 py-1 font-semibold text-amber-700">150 Coins • 1 Coin = 1 THB</div>
      </header>

      <div className="grid gap-6 md:grid-cols-3">
        <section className="rounded-2xl border bg-white p-4 shadow-sm md:col-span-2">
          <h2 className="mb-3 text-lg font-semibold">Top-Up Wallet</h2>
          <p className="mb-4 text-sm text-neutral-600">
            Minimum top-up: <b>100 THB</b>. Upload a clear transfer slip image (JPG/PNG). Coins are credited after admin verification.
          </p>

          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Payment amount (THB)*">
              <input
                type="number"
                min={100}
                placeholder="Minimum 100"
                value={amount}
                onChange={(e) => setAmount(e.target.value === "" ? "" : Number(e.target.value))}
                className="w-full rounded-xl border px-3 py-2"
              />
            </Field>
            <Field label="Date of payment*">
              <input type="date" value={date} onChange={(e)=>setDate(e.target.value)} className="w-full rounded-xl border px-3 py-2" />
            </Field>
            <Field label="Time of payment*">
              <input type="time" value={time} onChange={(e)=>setTime(e.target.value)} className="w-full rounded-xl border px-3 py-2" />
            </Field>
            <Field label="Upload your payment slip*">
              <input type="file" onChange={(e)=>setSlip(e.target.files?.[0] ?? null)} className="w-full rounded-xl border px-3 py-2" />
            </Field>
          </div>

          <div className="mt-4 flex gap-2">
            <Button label="Submit Request" disabled={!canSubmit} onClick={()=>alert("Mock: submitted")}/>
            <Button label="Reset" bgColor="bg-neutral-200" textColor="text-neutral-800" onClick={()=>{
              setAmount(""); setDate(""); setTime(""); setSlip(null);
            }}/>
          </div>

          <h3 className="mt-8 mb-3 text-lg font-semibold">Pending Requests</h3>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] text-sm">
              <thead className="bg-neutral-50">
                <tr><Th>Request ID</Th><Th>Datetime</Th><Th>Amount</Th><Th>Status</Th></tr>
              </thead>
              <tbody>
                {pending.map((p)=>(
                  <tr key={p.id} className="border-b last:border-0">
                    <Td>{p.id}</Td><Td>{p.dt}</Td><Td>{p.amount} Coins</Td>
                    <Td><span className="rounded-md bg-yellow-50 px-2 py-1 text-xs font-semibold text-yellow-700">{p.status}</span></Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <aside className="rounded-2xl border bg-white p-4 shadow-sm">
          <h3 className="mb-3 text-lg font-semibold">PromptPayQR</h3>
          <div className="rounded-xl border p-3 text-sm">
            <div>Kbank</div>
            <div>Acc No: 123-456-789</div>
            <div>Name: Court’s Owner</div>
          </div>

          <h3 className="mt-6 mb-3 text-lg font-semibold">Transaction History</h3>
          <div className="space-y-3">
            {ledger.map((l)=>(
              <div key={l.id} className="rounded-xl border p-3 text-sm">
                <div className="text-neutral-500">{l.dt}</div>
                <div className="flex items-center justify-between">
                  <div>{l.type} <span className="text-xs text-neutral-400">({l.status})</span></div>
                  <div className={l.amount<0?"text-rose-600":"text-emerald-700"}>{l.amount>0?`+${l.amount}`:l.amount}</div>
                </div>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-1">
      <span className="text-sm font-medium">{label}</span>
      {children}
    </label>
  );
}
const Th = ({ children }: any) => <th className="p-3 text-left text-xs font-semibold">{children}</th>;
const Td = ({ children }: any) => <td className="p-3">{children}</td>;
