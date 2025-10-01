"use client";

import { useState } from "react";
import AuthCalendarModal, { type CalendarDay } 
  from "@/ui/components/authpage/AuthCalendarModal";

/** Build month data: % bands + day off examples */
function buildMonthDays(year: number, month0: number): CalendarDay[] {
  const daysInMonth = new Date(year, month0 + 1, 0).getDate();
  const pattern = [20, 35, 45, 62, 77, 88, 15];

  const days: CalendarDay[] = [];
  for (let d = 1; d <= daysInMonth; d++) {
    if (d === 1 || d === 2) { days.push({ day: d, dayOff: true }); continue; } // sample days off
    if (d === 21 || d === 28) { days.push({ day: d, percent: 100 }); continue; } // sample "Full"
    days.push({ day: d, percent: pattern[(d - 1) % pattern.length] });
  }
  return days;
}

export default function ManagerDashboardPage() {
  // Start manager view at current month
  const now = new Date();
  const [ym, setYm] = useState({ year: now.getFullYear(), month0: now.getMonth() });

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

  const onDayClick = (day: number) => {
    console.log("Manager clicked day:", `${ym.year}-${ym.month0 + 1}-${day}`);
    // Navigate or open a drawer/modal with day details here.
  };

  return (
    <main className="mx-auto max-w-6xl p-4 md:p-8">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Manager Dashboard</h1>
      </header>

      <section className="rounded-2xl border bg-white p-4 shadow-sm">
        <AuthCalendarModal
          title={title}
          days={monthDays}
          onPrevMonth={prevMonth}
          onNextMonth={nextMonth}
          onDayClick={onDayClick}
        />
      </section>
    </main>
  );
}
