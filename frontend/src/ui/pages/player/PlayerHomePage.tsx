"use client";

import { useMemo, useState, useCallback } from "react";
import Link from "next/link";
import ImageSlider from "@/ui/components/homepage/ImageSlider";
import UpcomingModal, {type BookingRow } from "@/ui/components/homepage/UpcomingModal";
import CalendarModal, { type CalendarDay } from "@/ui/components/homepage/CalendarModal";
import { SlotModal } from "@/ui/components/homepage/SlotModal";

// ✅ ใช้เส้นเดียวกับ History
import {
  useMyBookingRetrieve,
  getMyBookingRetrieveQueryKey,
} from "@/api-client/endpoints/my-booking/my-booking";
import { useBookingsCancelCreate } from "@/api-client/endpoints/bookings/bookings";
import { monthViewKey } from "@/api-client/extras/slots";
import { getWalletMeRetrieveQueryKey } from "@/api-client/endpoints/wallet/wallet";
import { useQueryClient } from "@tanstack/react-query";

/* ========================= Runtime types ========================= */
type SlotItem = {
  status: string;
  start_time: string;
  end_time: string;
  court: number;
  court_name: string;
  price_coin: number;
};

type BookingItem = {
  created_date: string;
  booking_id: string;
  user: string;
  total_cost: string | number;
  booking_date: string;
  booking_status: string;
  able_to_cancel: boolean;
  booking_slots: Record<string, SlotItem>;
};

/* ---------- Calendar mock ---------- */
function buildMonthDays(year: number, month0: number): CalendarDay[] {
  const daysInMonth = new Date(year, month0 + 1, 0).getDate();
  const pattern = [20, 35, 45, 62, 77, 88, 15];
  const days: CalendarDay[] = [];
  for (let d = 1; d <= daysInMonth; d++) {
    if (d === 13 || d === 26) days.push({ day: d, dayOff: true });
    else if (d === 28) days.push({ day: d, percent: 100 });
    else days.push({ day: d, percent: pattern[(d - 1) % pattern.length] });
  }
  return days;
}

/* ---------- Component ---------- */
export default function PlayerHomePage() {
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
  
  const now = new Date();
  const CLUB_ID = Number(process.env.NEXT_PUBLIC_CLUB_ID);
  const CURRENT_MONTH = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  const queryClient = useQueryClient();
  const { data, isLoading, isError } = useMyBookingRetrieve();
  const cancelMut = useBookingsCancelCreate({
    mutation: {
      onSuccess: async () => {
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: getMyBookingRetrieveQueryKey() }),
          queryClient.invalidateQueries({ queryKey: getWalletMeRetrieveQueryKey() }),
          queryClient.invalidateQueries({ queryKey: monthViewKey(CLUB_ID, CURRENT_MONTH) }),
        ]);
      },
    },
  });

  // 🧮 Normalize + filter เฉพาะ confirmed + sort ตาม booking_date
const confirmedList: BookingRow[] = useMemo(() => {
  const raw = data as any;
  const arr: BookingRow[] = Array.isArray(raw?.data)
    ? raw.data
    : Array.isArray(raw?.results)
    ? raw.results
    : Array.isArray(raw)
    ? raw
    : [];

  return arr
    .filter((b) => b.booking_status?.toLowerCase() === "confirmed")
    .sort(
      (a, b) =>
        new Date(a.booking_date).getTime() - new Date(b.booking_date).getTime()
    );
}, [data]);

  const handleCancel = useCallback(
    (bk: BookingItem) => {
      cancelMut.mutate({ bookingNo: bk.booking_id });
    },
    [cancelMut]
  );

  return (
    <main className="mx-auto my-auto">
      <div className="mb-12 w-full">
        <ImageSlider />
      </div>

      {/* ✅ Upcoming Booking */}
      <div className="mb-12 md:col-span-3">
        <UpcomingModal
          bookings={isLoading || isError ? [] : confirmedList}
          onCancel={handleCancel}
        />
      </div>

      {/* Dashboard header */}
      <header className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Link
          href="/booking"
          className="inline-flex items-center rounded-2xl px-4 py-2 text-m font-semibold shadow-sm transition border border-platinum bg-pine text-white hover:bg-sea hover:shadow-md"
        >
          Book the courts!
        </Link>
      </header>

      {/* Calendar + Slots */}
      <section className="grid items-stretch gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <CalendarModal
            title={title}
            days={monthDays}
            onPrevMonth={prevMonth}
            onNextMonth={nextMonth}
          />
        </div>
        <div className="flex h-full flex-col rounded-2xl border bg-white p-4 shadow-sm md:col-span-1">
          <SlotModal
            dayData={{
              date: "12-09-25",
              slotList: {
                s1: {
                  id: "s1",
                  time: "10:00 - 11:00",
                  status: "open",
                  courts: [{ id: "c1", label: "Court 5", available: true }],
                },
              },
            }}
            onPrevDay={() => console.log("prev day clicked")}
            onNextDay={() => console.log("next day clicked")}
          />
        </div>
      </section>
    </main>
  );
}
