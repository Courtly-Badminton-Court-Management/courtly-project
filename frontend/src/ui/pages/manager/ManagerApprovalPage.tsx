"use client";

import { useState } from "react";
import Button from "@/ui/components/basic/Button";

type Row = { id:string; dt:string; amount:number; user:string; status:"Pending"|"Approved" };

export default function ManagerApprovalPage() {
  const [rows, setRows] = useState<Row[]>([
    { id:"REQ02419824379", dt:"5 Sep 2025, 12:54 PM", amount:200, user:"Mata Nakee", status:"Pending" },
    { id:"REQ02419824368", dt:"5 Sep 2025, 10:39 AM", amount:100, user:"Peony Smith", status:"Pending" },
    { id:"REQ02419824353", dt:"5 Sep 2025, 09:03 AM", amount:300, user:"Somkid Meetung", status:"Pending" },
  ]);
  const [open, setOpen] = useState<Row | null>(null);

  return (
    <main className="mx-auto max-w-6xl p-4 md:p-8">
      <header className="mb-4">
        <h1 className="text-2xl font-bold">Top-Up Requests</h1>
        <p className="text-sm text-amber-700">⚠ Approvals can only be made during business hours. Off-hours requests remain pending.</p>
      </header>

      <div className="overflow-x-auto rounded-2xl border bg-white shadow-sm">
        <table className="w-full min-w-[800px] text-sm">
          <thead className="bg-neutral-50">
            <tr><Th>Request ID</Th><Th>Datetime</Th><Th>Amount</Th><Th>User</Th><Th>Status</Th><Th>Actions</Th></tr>
          </thead>
          <tbody>
            {rows.map((r)=>(
              <tr key={r.id} className="border-b last:border-0">
                <Td>{r.id}</Td><Td>{r.dt}</Td><Td>+{r.amount} Coins</Td><Td>{r.user}</Td>
                <Td><span className="rounded-md bg-yellow-50 px-2 py-1 text-xs font-semibold text-yellow-700">{r.status}</span></Td>
                <Td><Button label="Open" onClick={()=>setOpen(r)} /></Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="mb-2 text-xl font-bold">Top-Up Approval</h3>
            <p className="mb-4 text-sm text-neutral-700">
              Amount: {open.amount} Coins<br/>Datetime: {open.dt}<br/>Request ID: {open.id}<br/>User: {open.user}
            </p>
            <div className="flex gap-2">
              <Button label="Approve" onClick={()=>{
                setRows(prev=>prev.map(x=>x.id===open.id?{...x,status:"Approved"}:x)); setOpen(null);
              }} />
              <Button label="Reject" bgColor="bg-neutral-200" textColor="text-neutral-800" onClick={()=>setOpen(null)} />
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

const Th = ({ children }: any) => <th className="p-3 text-left text-xs font-semibold">{children}</th>;
const Td = ({ children }: any) => <td className="p-3">{children}</td>;
