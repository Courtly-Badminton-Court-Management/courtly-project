// src/ui/pages/manager/ManagerControlPage.tsx
"use client";

import { useMemo, useState } from "react";
import Button from "@/ui/components/basic/Button";

type Status = "available" | "booked" | "walkin" | "end" | "maint" | "checkedin";
type Cell = { court: number; idx: number; status: Status; bookingId?: string; user?: string };

export default function ManagerControlPage() {
  /** ── Config ───────────────────────────────────────────────────────────── */
  const times = ["10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00","18:00","19:00"];
  // ช่องเวลา = คู่ของช่วง (เช่น 10:00-11:00, 11:00-12:00, ... )
  const timeSlots = useMemo(() => times.slice(0, -1), [times]);
  const courts = useMemo(() => Array.from({ length: 10 }, (_, i) => i + 1), []);

  /** ── State ────────────────────────────────────────────────────────────── */
  const [cells, setCells] = useState<Cell[]>(() => seed(courts, times));
  const [panel, setPanel] = useState<Cell | null>(null);

  const setStatus = (c: Cell, status: Status) => {
    setCells((prev) => prev.map((x) => (x.court === c.court && x.idx === c.idx ? { ...x, status } : x)));
    setPanel(null);
  };

  /** ── Render ───────────────────────────────────────────────────────────── */
  return (
    <main className="mx-auto max-w-6xl p-4 md:p-8">
      <header className="mb-4 flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold">Booking Control</h1>
          <p className="text-sm text-neutral-500">Manage slot statuses: maintenance, walk-in, check-in, cancel.</p>
        </div>
        <div className="text-sm text-neutral-500">5 Sep 2025</div>
      </header>

      {/* Legend */}
      <div className="mb-3 flex flex-wrap items-center gap-2 text-xs text-neutral-600">
        <Legend color="bg-emerald-500" text="Available Now" />
        <Legend color="bg-neutral-300" text="Booked" />
        <Legend color="bg-sky-400" text="Walk-In Booking" />
        <Legend color="bg-violet-400" text="End Game" />
        <Legend color="bg-zinc-500" text="Set Maintenance" />
        <Legend color="bg-amber-500" text="Checked In" />
      </div>

      {/* Board */}
      <div className="overflow-x-auto rounded-2xl border bg-white shadow-sm">
        <table className="w-full min-w-[900px] border-separate border-spacing-0">
          <thead>
            <tr>
              <th className="sticky left-0 z-10 bg-white p-3 text-left text-sm font-semibold">Court / Time</th>
              {timeSlots.map((_, i) => (
                <th key={i} className="whitespace-nowrap p-3 text-left text-sm font-semibold">
                  {times[i]} - {times[i + 1]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {courts.map((c) => (
              <tr key={c} className="even:bg-neutral-50">
                <td className="sticky left-0 z-10 bg-inherit p-3 font-semibold">Court {c}</td>
                {timeSlots.map((_, idx) => {
                  // กันพลาด: ถ้าหาไม่เจอ ให้ fallback เป็น maint
                  const cell =
                    cells.find((x) => x.court === c && x.idx === idx) ??
                    ({ court: c, idx, status: "maint" } as Cell);

                  const base =
                    cell.status === "available"
                      ? "bg-emerald-500"
                      : cell.status === "booked"
                      ? "bg-neutral-300"
                      : cell.status === "walkin"
                      ? "bg-sky-400"
                      : cell.status === "end"
                      ? "bg-violet-400"
                      : cell.status === "checkedin"
                      ? "bg-amber-500"
                      : "bg-zinc-500";

                  return (
                    <td key={idx} className="p-1">
                      <button
                        onClick={() => setPanel(cell)}
                        className={[
                          "block w-full rounded-md py-4 text-center text-xs font-bold text-white transition",
                          base,
                          "hover:brightness-95",
                        ].join(" ")}
                        aria-label={`Court ${c} • ${times[idx]} - ${times[idx + 1]}`}
                      >
                        {times[idx]}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Slot panel */}
      {panel && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="mb-2 text-xl font-bold">Slot Control</h3>
            <p className="mb-4 text-sm text-neutral-700">
              Court {panel.court} • {times[panel.idx]} - {times[panel.idx + 1]} <br />
              Durations: 1 hr
            </p>
            <div className="grid gap-2">
              <Button label="Set Maintenance" onClick={() => setStatus(panel, "maint")} />
              <Button label="Walk-In Booking" onClick={() => setStatus(panel, "walkin")} />
              <Button label="Confirm Check-In" onClick={() => setStatus(panel, "checkedin")} />
              <Button
                label="Cancel Booking"
                bgColor="bg-neutral-200"
                textColor="text-neutral-800"
                onClick={() => setStatus(panel, "available")}
              />
              <Button
                label="Close"
                bgColor="bg-neutral-100"
                textColor="text-neutral-700"
                onClick={() => setPanel(null)}
              />
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

/** ── Helpers ────────────────────────────────────────────────────────────── */
function seed(courts: number[], times: string[]): Cell[] {
  const st: Status[] = ["available", "booked", "walkin", "end", "maint", "checkedin"];
  const out: Cell[] = [];
  for (const c of courts) {
    for (let i = 0; i < times.length - 1; i++) {
      out.push({ court: c, idx: i, status: st[(c + i) % st.length] });
    }
  }
  return out;
}

function Legend({ color, text }: { color: string; text: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border bg-white px-2 py-1">
      <span className={`h-3 w-3 rounded ${color}`} />
      {text}
    </span>
  );
}
