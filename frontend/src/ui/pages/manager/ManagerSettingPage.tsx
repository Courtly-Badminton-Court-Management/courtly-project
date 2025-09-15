"use client";

import { useState } from "react";
import Button from "@/ui/components/basic/Button";

type Row = { day:string; open:string|null; close:string|null };

export default function ManagerSettingPage() {
  const [rows, setRows] = useState<Row[]>([
    { day:"Monday", open:"09:00", close:"21:00" },
    { day:"Tuesday", open:"09:00", close:"21:00" },
    { day:"Wednesday", open:"10:00", close:"22:00" },
    { day:"Thursday", open:"09:00", close:"21:00" },
    { day:"Friday", open:"09:00", close:"21:00" },
    { day:"Saturday", open:"09:00", close:"21:00" },
    { day:"Sunday", open:null, close:null },
  ]);
  const [edit, setEdit] = useState<Row | null>(null);
  const [closureDate, setClosureDate] = useState("");

  const markClosed = (d:string) => setRows(prev => prev.map(r => r.day===d ? ({...r, open:null, close:null}) : r));
  const markOpen = (d:string) => setRows(prev => prev.map(r => r.day===d ? ({...r, open:"09:00", close:"21:00"}) : r));

  return (
    <main className="mx-auto max-w-5xl p-4 md:p-8">
      <header className="mb-4">
        <h1 className="text-2xl font-bold">Manager Settings</h1>
        <div className="text-sm text-neutral-600">Current Status: Thursday 4 September 2025 • Open 09:00 – 21:00</div>
      </header>

      <section className="rounded-2xl border bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-lg font-semibold">Opening Hours</h2>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="bg-neutral-50">
              <tr><Th>Day</Th><Th>Open Time</Th><Th>Close Time</Th><Th>Actions</Th></tr>
            </thead>
            <tbody>
              {rows.map((r)=>(
                <tr key={r.day} className="border-b last:border-0">
                  <Td>{r.day}</Td>
                  <Td>{r.open ?? "-"}</Td>
                  <Td>{r.close ?? "-"}</Td>
                  <Td className="flex gap-2">
                    {r.open ? (
                      <Button label="Mark Closed" bgColor="bg-neutral-200" textColor="text-neutral-800" onClick={()=>markClosed(r.day)} />
                    ) : (
                      <Button label="Mark Open" onClick={()=>markOpen(r.day)} />
                    )}
                    <Button label="Edit" onClick={()=>setEdit(r)} />
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h3 className="mt-6 mb-2 text-lg font-semibold">Closures</h3>
        <div className="flex flex-wrap items-end gap-3">
          <label className="grid gap-1">
            <span className="text-sm font-medium">Date</span>
            <input type="date" value={closureDate} onChange={(e)=>setClosureDate(e.target.value)} className="rounded-xl border px-3 py-2" />
          </label>
          <label className="grid gap-1">
            <span className="text-sm font-medium">Type</span>
            <input placeholder="Holiday / Emergency Maintenance" className="rounded-xl border px-3 py-2" />
          </label>
          <label className="grid flex-1 gap-1">
            <span className="text-sm font-medium">Reason / Note (optional)</span>
            <input placeholder="e.g., emergency maintenance" className="rounded-xl border px-3 py-2" />
          </label>
          <Button label="Schedule Special Hours / Closure" />
        </div>
      </section>

      {edit && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="mb-4 text-xl font-bold">Edit {edit.day}</h3>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Open Time"><input defaultValue={edit.open ?? ""} type="time" className="w-full rounded-xl border px-3 py-2"/></Field>
              <Field label="Close Time"><input defaultValue={edit.close ?? ""} type="time" className="w-full rounded-xl border px-3 py-2"/></Field>
            </div>
            <div className="mt-4 flex gap-2">
              <Button label="Save" onClick={()=>setEdit(null)} />
              <Button label="Cancel" bgColor="bg-neutral-200" textColor="text-neutral-800" onClick={()=>setEdit(null)} />
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

const Th = ({ children }: any) => <th className="p-3 text-left text-xs font-semibold">{children}</th>;
const Td = ({ children, className="" }: any) => <td className={`p-3 ${className}`}>{children}</td>;
function Field({ label, children }: any) { return <label className="grid gap-1"><span className="text-sm font-medium">{label}</span>{children}</label>; }
