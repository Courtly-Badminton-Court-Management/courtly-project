"use client";

import { useState } from "react";
import Link from "next/link";
import { SlotModal } from "@/ui/components/homepage/SlotModal";
import CalendarModal, { type CalendarDay } from "@/ui/components/homepage/CalendarModal";
import UpcomingModal, { type BookingItem } from "@/ui/components/homepage/UpcomingModal";
import ImageSlider from "@/ui/components/homepage/ImageSlider";

/** Mock slots for the right panel (free-only representation) */
const sampleSlots: { time: string; courts: string[] }[] = [
  { time: "10:00 - 11:00", courts: ["Court 5", "Court 7", "Court 8", "Court 10"] },
  { time: "11:00 - 12:00", courts: ["Court 1", "Court 2", "Court 6"] },
  { time: "15:00 - 16:00", courts: ["Court 5", "Court 8"] },
  { time: "18:00 - 19:00", courts: ["Court 2", "Court 3"] },
  { time: "19:00 - 20:00", courts: ["Court 1"] },
];

/** Build month data */
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
  const [ym, setYm] = useState({ year: 2025, month0: 8 });
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

  /** Upcoming booking mock: */
  const [upcoming] = useState<BookingItem[]>([
    {
      bookingId: "BK04300820251",
      dateISO: "2025-09-05",
      slots: [
        { id: "S1", status: "booked", start_time: "16:00", end_time: "17:00", court: 4, courtName: "4" },
        { id: "S2", status: "booked", start_time: "17:00", end_time: "18:00", court: 6, courtName: "6" },
        { id: "S3", status: "booked", start_time: "18:00", end_time: "19:00", court: 2, courtName: "2" },
      ],
    },
    {
      bookingId: "BK04300820252",
      dateISO: "2025-09-07",
      slots: [
        { id: "S1", status: "booked", start_time: "10:00", end_time: "11:00", court: 1, courtName: "1" },
        { id: "S2", status: "booked", start_time: "11:00", end_time: "12:00", court: 3, courtName: "3" },
      ],
    },
    {
      bookingId: "BK04300820251",
      dateISO: "2025-09-12",
      slots: [
        { id: "S4", status: "booked", start_time: "15:00", end_time: "16:00", court: 5, courtName: "5" },
      ],
    },
  ]);

  return (
    <main className="mx-auto max-w-6xl p-4 md:p-8">
      {/* Image Slider at the top */}
      <div className="w-full mb-12">
        <ImageSlider />
      </div>
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Link
          href="/booking"
          className="inline-flex items-center rounded-2xl px-4 py-2 text-m font-semibold shadow-sm hover:shadow-md transition border border-platinum bg-pine text-white hover:bg-sea"
        >
          Book the courts!
        </Link>
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

        {/* Upcoming bookings – slot-per-row */}
        <div className="md:col-span-3">
          <UpcomingModal
            bookings={upcoming}
            onCancel={(bk) => {
              console.log("Cancel booking:", bk.bookingId);
            }}
          />
        </div>
      </section>
    </main>
  );
}
