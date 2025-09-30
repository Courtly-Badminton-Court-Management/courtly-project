"use client";

import { useState } from "react";
import Button from "@/ui/components/basic/Button";
import { SlotModal } from "@/ui/components/homepage/SlotModal";
import CalendarModal, { type CalendarDay } from "@/ui/components/homepage/CalendarModal";

/* ── Types ─────────────────────────────────────────────────────────── */
type SlotStatus = "available" | "booked" | "cancelled";

type SlotItem = {
  id: string;
  status: SlotStatus;
  start_time: string;
  end_time: string;
  court: number;
  courtName: string;
};

type BookingItem = {
  bookingId: string;
  dateISO: string;
  slots: SlotItem[];
};

/** Mock slots for the right panel (free-only representation) */
const sampleSlots: { time: string; courts: string[] }[] = [
  { time: "10:00 - 11:00", courts: ["Court 5", "Court 7", "Court 8", "Court 10"] },
  { time: "11:00 - 12:00", courts: ["Court 1", "Court 2", "Court 6"] },
  { time: "15:00 - 16:00", courts: ["Court 5", "Court 8"] },
  { time: "18:00 - 19:00", courts: ["Court 2", "Court 3"] },
  { time: "19:00 - 20:00", courts: ["Court 1"] },
];

/** Build month data for a given year + zero-based month */
function buildMonthDays(year: number, month0: number): CalendarDay[] {
  const daysInMonth = new Date(year, month0 + 1, 0).getDate();
  const pattern = [20, 35, 45, 62, 77, 88, 15];

  const days: CalendarDay[] = [];
  for (let d = 1; d <= daysInMonth; d++) {
    if (d === 13 || d === 26) { days.push({ day: d, dayOff: true }); continue; }
    if (d === 28) { days.push({ day: d, percent: 100 }); continue; }
    days.push({ day: d, percent: pattern[(d - 1) % pattern.length] });
  }
  return days;
}

export default function PlayerHomePage() {
  /** Visible month (start at September 2025) */
  const [ym, setYm] = useState({ year: 2025, month0: 8 }); // 0-based month: 8 = September
  const title = new Date(ym.year, ym.month0, 1).toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });
  const monthDays = buildMonthDays(ym.year, ym.month0);

  const prevMonth = () =>
    setYm(({ year, month0 }) =>
      month0 === 0 ? { year: year - 1, month0: 11 } : { year, month0: month0 - 1 }
    );
  const nextMonth = () =>
    setYm(({ year, month0 }) =>
      month0 === 11 ? { year: year + 1, month0: 0 } : { year, month0: month0 + 1 }
    );

  // ✅ Booking data now matches BookingItem
  const [upcoming] = useState<BookingItem[]>([
    {
      bookingId: "BK04300820251",
      dateISO: "2025-09-05",
      slots: [{ id: "1", status: "booked", start_time: "16:00", end_time: "17:00", court: 4, courtName: "4" }],
    },
    {
      bookingId: "BK04300820252",
      dateISO: "2025-09-05",
      slots: [{ id: "1", status: "booked", start_time: "16:00", end_time: "17:00", court: 6, courtName: "6" }],
    },
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

      <section className="grid gap-4 md:grid-cols-3 items-stretch">
        <div className="md:col-span-2">
          <CalendarModal
            title={title}
            days={monthDays}
            onPrevMonth={prevMonth}
            onNextMonth={nextMonth}
          />
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

        {/* Upcoming bookings – full width */}
        <aside className="md:col-span-3 rounded-2xl border bg-white p-4 shadow-sm">
          <h3 className="mb-3 text-lg font-semibold">Upcoming Booking</h3>
          <ul className="space-y-4">
            {upcoming.map((bk) => (
              <li key={bk.bookingId} className="rounded-xl border p-4">
                <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-[220px_1fr_auto]">
                  <div className="text-sm text-neutral-600">
                    <div className="text-neutral-500">Booking ID:</div>
                    <div className="font-mono text-base">{bk.bookingId}</div>
                  </div>
                  <div className="space-y-4">
                    {bk.slots.map((s) => (
                      <div key={`${bk.bookingId}-${s.id}`} className="flex items-baseline justify-between gap-3 border-b border-neutral-200 pb-3 last:border-0 last:pb-0">
                        <div className="min-w-0">
                          <div className="text-xl font-semibold">Court {s.courtName}</div>
                          <div className="text-sm text-neutral-600">
                            {fmtDateShort(bk.dateISO)}, {timeRange(s.start_time, s.end_time)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-row items-center gap-2 md:justify-end">
                    <Button label="Cancel" bgColor="bg-neutral-200" textColor="text-neutral-800" />
                    <Button label="View Detail" />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </aside>
      </section>
    </main>
  );
}

function fmtDateShort(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}
function timeRange(a: string, b: string) {
  return `${a} – ${b}`;
}
