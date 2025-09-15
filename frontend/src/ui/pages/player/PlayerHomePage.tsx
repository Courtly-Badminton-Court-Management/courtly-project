"use client";

import { useState } from "react";
import Button from "@/ui/components/basic/Button";
import { SlotModal } from "@/ui/components/slots/SlotModal";

/** Mock slots for the right panel (free-only representation) */
const sampleSlots: { time: string; courts: string[] }[] = [
  { time: "10:00 - 11:00", courts: ["Court 5", "Court 7", "Court 8", "Court 10"] },
  { time: "11:00 - 12:00", courts: ["Court 1", "Court 2", "Court 6"] },
  { time: "15:00 - 16:00", courts: ["Court 5", "Court 8"] },
  { time: "18:00 - 19:00", courts: ["Court 2", "Court 3"] },
  { time: "19:00 - 20:00", courts: ["Court 1"] },
];


export default function PlayerHomePage() {
  const [upcoming] = useState([
    { id: "BK04300820251", date: "5 Sep 2025", time: "16:00 - 17:00", court: "Court 4" },
    { id: "BK04300820252", date: "5 Sep 2025", time: "16:00 - 17:00", court: "Court 6" },
  ]);

  return (
    <main className="mx-auto max-w-6xl p-4 md:p-8">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="flex items-center gap-2">
          <span className="rounded-md bg-emerald-50 px-3 py-1 text-emerald-800">Senior19</span>
          <span className="rounded-md bg-amber-50 px-3 py-1 font-semibold text-amber-700">150 Coins</span>
        </div>
      </header>

      {/* Month overview (read-only mock) */}
      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border bg-white p-4 shadow-sm md:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">September 2025</h2>
            <div className="text-sm text-neutral-500">Day off + % availability</div>
          </div>
          <MonthGrid />
        </div>

        {/* Day slots card */}
        <div className="md:col-span-1 h-full flex flex-col rounded-2xl border bg-white p-4 shadow-sm">
          <SlotModal
            dayData={{
              date: "12-09-25",
              slotList: Object.fromEntries(
                sampleSlots.map((s, i) => [
                  `S${i + 1}`,
                  {
                    id: `S${i + 1}`,
                    time: s.time,
                    status: "open",
                    courts: s.courts.map((name, j) => ({
                      id: `S${i + 1}-C${j + 1}`,
                      label: name,
                      available: true,
                    })),
                  },
                ])
              ),
            }}
            onPrevDay={() => console.log("prev day clicked")}
            onNextDay={() => console.log("next day clicked")}
          />
        </div>

        {/* Upcoming bookings */}
        <aside className="rounded-2xl border bg-white p-4 shadow-sm">
          <h3 className="mb-3 text-lg font-semibold">Upcoming Booking</h3>
          <ul className="space-y-3">
            {upcoming.map((b) => (
              <li key={b.id} className="rounded-xl border p-3">
                <div className="text-sm text-neutral-500">{b.date}</div>
                <div className="font-medium">
                  {b.time} • {b.court}
                </div>
                <div className="mt-2 flex gap-2">
                  <Button label="View Detail" />
                  <Button label="Cancel" bgColor="bg-neutral-200" textColor="text-neutral-800" />
                </div>
                <div className="mt-1 text-xs text-neutral-400">Booking ID: {b.id}</div>
              </li>
            ))}
          </ul>
        </aside>
      </section>
    </main>
  );
}

/** ----- small helpers ----- */
function MonthGrid() {
  const days = Array.from({ length: 30 }, (_, i) => i + 1);
  return (
    <div className="grid grid-cols-7 gap-2">
      {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map((d) => (
        <div key={d} className="pb-1 text-center text-xs font-semibold text-neutral-500">
          {d}
        </div>
      ))}
      {days.map((d) => (
        <div key={d} className="rounded-lg border bg-white p-2 text-center hover:border-emerald-300">
          <div className="mb-2 text-sm font-medium">{d}</div>
          <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
            {([15, 20, 35, 45, 62, 77, 88][d % 7])}%
          </span>
          {d % 13 === 0 && (
            <div className="mt-2 rounded-md bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-600">
              Day off
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
