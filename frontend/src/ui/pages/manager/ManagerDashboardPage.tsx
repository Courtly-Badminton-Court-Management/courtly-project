// src/ui/pages/manager/ManagerDashboardPage.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";

import CalendarModal from "@/ui/components/homepage/CalendarModal";
import DailyBookingPanel from "@/ui/components/dashboardpage/DailyBookingsPanel";

import { useAvailableSlotsRetrieve } from "@/api-client/endpoints/available-slots/available-slots";
import { useBookingsRetrieve } from "@/api-client/endpoints/bookings/bookings";

import type { AvailableSlotsResponse } from "@/api-client/extras/types";
import { groupBookingDate } from "@/lib/booking/groupBookingDate";

export default function ManagerDashboardPage() {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const currentMonth = dayjs().format("YYYY-MM");

  /* --------------------------------------------------------------------------
   * 1️⃣ Calendar → ใช้ available-slots เหมือน PlayerHomePage
   * -------------------------------------------------------------------------- */
  const {
    data: availableData,
    isLoading: isAvailLoading,
    isError: isAvailError,
  } = useAvailableSlotsRetrieve<AvailableSlotsResponse>({
    query: {
      queryKey: ["available-slots", currentMonth],
      queryFn: async ({ signal }) => {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/available-slots/?club=${process.env.NEXT_PUBLIC_CLUB_ID}&month=${currentMonth}`,
          { signal, credentials: "include" }
        );
        if (!res.ok) throw new Error("Failed to fetch available slots");
        return res.json();
      },
    },
  });

  /* --------------------------------------------------------------------------
   * 2️⃣ Daily Booking Panel → ใช้ Orval (bookingsRetrieve)
   * -------------------------------------------------------------------------- */
  const {
    data: bookingsData,
    isLoading: isBookingsLoading,
    isError: isBookingsError,
  } = useBookingsRetrieve();

  // ✅ normalize schema
  const allBookings = useMemo(() => {
    const raw = bookingsData as any;
    const arr = raw?.data ?? raw?.results ?? raw;
    return Array.isArray(arr) ? arr : [];
  }, [bookingsData]);

  const groupedBookings = useMemo(
    () => groupBookingDate(allBookings),
    [allBookings]
  );

  /* --------------------------------------------------------------------------
   * 3️⃣ Set default selected date (วันนี้)
   * -------------------------------------------------------------------------- */
  useEffect(() => {
    setSelectedDate(dayjs().format("YYYY-MM-DD"));
  }, []);

  /* --------------------------------------------------------------------------
   * 4️⃣ Render
   * -------------------------------------------------------------------------- */
  return (
    <main className="w-full">
      <section className="grid items-stretch mb-8 gap-6 md:grid-cols-5">
        {/* 📆 Calendar (3/5) → แสดง % จาก available-slots */}
        <div className="md:col-span-3 w-full">
          <CalendarModal
            data={availableData}
            isLoading={isAvailLoading}
            isError={isAvailError}
            onSelectDate={(d) => setSelectedDate(d)}
          />
        </div>

        {/* 📋 Panel (2/5) → แสดง bookings รายวัน */}
        {selectedDate && (
          <div className="md:col-span-2 w-full">
            <DailyBookingPanel
              selectedDate={selectedDate}
              groupedBookings={groupedBookings}
              isLoading={isBookingsLoading}
              isError={isBookingsError}
            />
          </div>
        )}
      </section>
    </main>
  );
}
