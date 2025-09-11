import React from "react";

/**
 * Player Homepage (skeleton only)
 * - Month calendar (left)
 * - Day slots (right)
 * - Upcoming bookings (full width)
 *
 * Notes:
 * - Pure UI skeleton with Tailwind classes; no real data wiring yet.
 * - Replace placeholders with real components / queries later.
 */
export default function HomeagePlayer() {
  const daysShort = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"]; 
  // Skeleton 5 weeks x 7 days
  const weeks = Array.from({ length: 5 }, () => Array.from({ length: 7 }));
  const sampleSlots = [
    { time: "10:00 — 11:00", courts: ["Court 5", "Court 7", "Court 8", "Court 10"] },
    { time: "11:00 — 12:00", courts: ["Court 1", "Court 2", "Court 6"] },
    { time: "15:00 — 16:00", courts: ["Court 5", "Court 8"] },
    { time: "18:00 — 19:00", courts: ["Court 2", "Court 3"] },
    { time: "19:00 — 20:00", courts: ["Court 1"] },
  ];
  const upcoming = [
    {
      id: "BK04300820251",
      court: "Court 4",
      date: "5 Sep 2025",
      time: "16:00 PM – 17:00 PM",
    },
    {
      id: "BK04300820299",
      court: "Court 6",
      date: "5 Sep 2025",
      time: "16:00 PM – 17:00 PM",
    },
  ];

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
      {/* Top bar */}
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Dashboard</h1>
        <button className="inline-flex items-center rounded-2xl px-4 py-2 text-sm font-semibold shadow-sm hover:shadow-md transition border border-slate-300 bg-emerald-600 text-white hover:bg-emerald-700">
          Book the courts!
        </button>
      </div>

      {/* Main content grid */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Calendar card */}
        <section className="lg:col-span-7 bg-white/70 dark:bg-slate-900/50 rounded-2xl shadow p-4 sm:p-6 border border-slate-200 dark:border-slate-800">
          <header className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <button aria-label="Prev month" className="h-8 w-8 rounded-full grid place-items-center border border-slate-300 hover:bg-slate-50">‹</button>
              <h2 className="text-lg sm:text-xl font-semibold">September 2025</h2>
              <button aria-label="Next month" className="h-8 w-8 rounded-full grid place-items-center border border-slate-300 hover:bg-slate-50">›</button>
            </div>
          </header>

          {/* Weekday header */}
          <div className="grid grid-cols-7 text-xs sm:text-sm font-semibold text-slate-500 mb-1">
            {daysShort.map((d) => (
              <div key={d} className="px-2 py-1 text-center">{d}</div>
            ))}
          </div>

          {/* Calendar grid (skeleton) */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {weeks.map((row, rIdx) => (
              <React.Fragment key={rIdx}>
                {row.map((_, cIdx) => (
                  <div
                    key={`${rIdx}-${cIdx}`}
                    className="aspect-[1.15] rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-1 sm:p-2 flex flex-col"
                  >
                    <div className="text-[10px] sm:text-xs text-slate-500">{rIdx * 7 + cIdx + 1}</div>
                    {/* mini chip placeholder */}
                    <div className="mt-auto">
                      <div className="h-2 rounded-full bg-emerald-200" />
                    </div>
                  </div>
                ))}
              </React.Fragment>
            ))}
          </div>
        </section>

        {/* Day slots card */}
        <aside className="lg:col-span-5 bg-white/70 dark:bg-slate-900/50 rounded-2xl shadow p-4 sm:p-6 border border-slate-200 dark:border-slate-800">
          <header className="flex items-center justify-between mb-4">
            <h2 className="text-lg sm:text-xl font-semibold">5 Sep 2025</h2>
            <div className="flex items-center gap-2">
              <button className="h-8 w-8 rounded-full grid place-items-center border border-slate-300 hover:bg-slate-50">‹</button>
              <button className="h-8 w-8 rounded-full grid place-items-center border border-slate-300 hover:bg-slate-50">›</button>
            </div>
          </header>

          <div className="space-y-3 max-h-[28rem] overflow-auto pr-1">
            {sampleSlots.map((slot) => (
              <div key={slot.time} className="rounded-xl border border-slate-200 dark:border-slate-800 p-3">
                <div className="text-xs font-semibold text-slate-600 mb-2">{slot.time}</div>
                <div className="flex flex-wrap gap-2">
                  {slot.courts.map((c) => (
                    <span
                      key={c}
                      className="text-xs px-2 py-1 rounded-full border border-emerald-300 bg-emerald-50 text-emerald-700"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* Upcoming bookings */}
        <section className="lg:col-span-12 bg-white/70 dark:bg-slate-900/50 rounded-2xl shadow p-4 sm:p-6 border border-slate-200 dark:border-slate-800">
          <h2 className="text-lg sm:text-xl font-semibold mb-4">Upcoming Booking</h2>

          <div className="divide-y divide-slate-200 dark:divide-slate-800">
            {upcoming.map((b) => (
              <div key={b.id} className="py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex-1">
                  <div className="text-xs text-slate-500">Booking ID: <span className="font-mono">{b.id}</span></div>
                  <div className="mt-1 text-xl font-semibold">{b.court}</div>
                  <div className="text-sm text-slate-600">{b.date}, {b.time}</div>
                </div>
                <div className="flex gap-2">
                  <button className="px-3 py-2 text-sm rounded-xl border border-slate-300 hover:bg-slate-50">Cancel</button>
                  <button className="px-3 py-2 text-sm rounded-xl bg-slate-800 text-white hover:bg-slate-700">View Detail</button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
