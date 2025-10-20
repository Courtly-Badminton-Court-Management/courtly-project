// src/ui/pages/player/PlayerHomePage.tsx
"use client";

import { useMemo, useState, useCallback } from "react";
import Link from "next/link";
import { SlotModal } from "@/ui/components/homepage/SlotModal";
import CalendarModal, { type CalendarDay } from "@/ui/components/homepage/CalendarModal";
import UpcomingModal from "@/ui/components/homepage/UpcomingModal";
import ImageSlider from "@/ui/components/homepage/ImageSlider";

// Orval hooks (GET /api/bookings/, CANCEL ถ้ามี)
import {
  useBookingsRetrieve,
  useBookingsCancelCreate,
} from "@/api-client/endpoints/bookings/bookings";

// เลือก & map “upcoming ที่ใกล้ที่สุด”
import {
  pickNearestUpcoming,
  mapToUpcomingItem,
  type ApiBooking,
  type BookingItem, // <- โครงเดียวกับของ UpcomingModal ใช้แทนกันได้
} from "@/lib/booking/selectNearestUpcoming";

/** Build month data (mock สำหรับปฏิทิน) */
function buildMonthDays(year: number, month0: number): CalendarDay[] {
  const daysInMonth = new Date(year, month0 + 1, 0).getDate();
  const pattern = [20, 35, 45, 62, 77, 88, 15];

  const days: CalendarDay[] = [];
  for (let d = 1; d <= daysInMonth; d++) {
    if (d === 13 || d === 26) {
      days.push({ day: d, dayOff: true });
      continue;
    }
    if (d === 28) {
      days.push({ day: d, percent: 100 });
      continue;
    }
    days.push({ day: d, percent: pattern[(d - 1) % pattern.length] });
  }
  return days;
}

/** Mock slots for the right panel (free-only representation) */
const sampleSlots: { time: string; courts: string[] }[] = [
  { time: "10:00 - 11:00", courts: ["Court 5", "Court 7", "Court 8", "Court 10"] },
  { time: "11:00 - 12:00", courts: ["Court 1", "Court 2", "Court 6"] },
  { time: "15:00 - 16:00", courts: ["Court 5", "Court 8"] },
  { time: "18:00 - 19:00", courts: ["Court 2", "Court 3"] },
  { time: "19:00 - 20:00", courts: ["Court 1"] },
];

export default function PlayerHomePage() {
  /** Visible month (start at September 2025) */
  const [ym, setYm] = useState({ year: 2025, month0: 8 });
  const title = new Date(ym.year, ym.month0, 1).toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });
  const monthDays = useMemo(() => buildMonthDays(ym.year, ym.month0), [ym]);

  const prevMonth = () =>
    setYm(({ year, month0 }) =>
      month0 === 0 ? { year: year - 1, month0: 11 } : { year, month0: month0 - 1 }
    );
  const nextMonth = () =>
    setYm(({ year, month0 }) =>
      month0 === 11 ? { year: year + 1, month0: 0 } : { year, month0: month0 + 1 }
    );

  // ดึงรายการ bookings ทั้งหมด
  const { data, isLoading, isError } = useBookingsRetrieve();
  const cancelMut = useBookingsCancelCreate?.();

  // เลือกเฉพาะ upcoming ที่ใกล้ที่สุด แล้ว map → BookingItem[]
  const nearestUpcomingList: BookingItem[] = useMemo(() => {
    // ✅ runtime narrowing: กันกรณี orval สร้างเป็น customRequest<void>
    const raw = data as unknown;
    const all: ApiBooking[] = Array.isArray(raw) ? (raw as ApiBooking[]) : [];
    const nearest = pickNearestUpcoming(all);
    return nearest ? [mapToUpcomingItem(nearest)] : [];
  }, [data]);

  // ยกเลิกการจอง (ถ้ามี endpoint)
  const handleCancel = useCallback(
    (bk: BookingItem) => {
      if (!cancelMut) return;
      // ปรับ payload ให้ตรงกับ orval ของพี่
      cancelMut.mutate(
        { data: { booking_no: bk.bookingId } } as any,
        { onSuccess: () => {/* TODO: refetch if needed */} }
      );
    },
    [cancelMut]
  );

  return (
    <main className="mx-auto my-auto">
      {/* Image Slider at the top */}
      <div className="mb-12 w-full">
        <ImageSlider />
      </div>

      {/* Upcoming booking – แสดงเฉพาะ “นัดที่ใกล้ที่สุด” */}
      <div className="mb-12 md:col-span-3">
        <UpcomingModal
          bookings={isLoading || isError ? [] : nearestUpcomingList}
          onCancel={handleCancel}
        />
      </div>

      {/* Dashboard Header */}
      <header className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Link
          href="/booking"
          className="inline-flex items-center rounded-2xl px-4 py-2 text-m font-semibold shadow-sm transition border border-platinum bg-pine text-white hover:bg-sea hover:shadow-md"
        >
          Book the courts!
        </Link>
      </header>

      {/* Dashboard Content */}
      <section className="grid items-stretch gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <CalendarModal
            title={title}
            days={monthDays}
            onPrevMonth={prevMonth}
            onNextMonth={nextMonth}
          />
        </div>

        {/* Day slots card */}
        <div className="flex h-full flex-col rounded-2xl border bg-white p-4 shadow-sm md:col-span-1">
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
      </section>
    </main>
  );
}
