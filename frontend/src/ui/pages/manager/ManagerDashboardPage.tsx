"use client";

import Button from "@/ui/components/basic/Button";

export default function ManagerDashboardPage() {
  return (
    <main className="mx-auto max-w-6xl p-4 md:p-8">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Manager Dashboard</h1>
        <Button label="View Day Detail" />
      </header>

      <section className="rounded-2xl border bg-white p-4 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">September 2025</h2>
          <div className="text-sm text-neutral-500">Month overview with % and Day off</div>
        </div>
        <MonthGrid />
      </section>
    </main>
  );
}

function MonthGrid() {
  const days = Array.from({ length: 30 }, (_, i) => i + 1);
  return (
    <div className="grid grid-cols-7 gap-2">
      {["SUN","MON","TUE","WED","THU","FRI","SAT"].map((d) => (
        <div key={d} className="pb-1 text-center text-xs font-semibold text-neutral-500">{d}</div>
      ))}
      {days.map((d) => (
        <button key={d} className="rounded-lg border bg-white p-2 text-center transition hover:border-emerald-300">
          <div className="mb-1 text-sm font-medium">{d}</div>
          <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
            {([15,20,35,45,62,77,88][d % 7])}%
          </span>
          {d % 13 === 0 && <div className="mt-2 rounded-md bg-neutral-100 px-2 py-0.5 text-xs">Day off</div>}
        </button>
      ))}
    </div>
  );
}
