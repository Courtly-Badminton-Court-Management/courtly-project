"use client";

import { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import CalendarModal from "@/ui/components/homepage/CalendarModal";
import DailyBookingPanel from "@/ui/components/dashboardpage/DailyBookingsPanel";
import { useBookingsRetrieve } from "@/api-client/endpoints/bookings/bookings";
import { groupBookingDate } from "@/lib/booking/groupBookingDate";

export default function ManagerDashboardPage() {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // ✅ ดึง bookings ทั้งเดือนเดียวพอ
  const currentMonth = dayjs().format("YYYY-MM");
  const { data, isLoading, isError } = useBookingsRetrieve({
    query: {
      queryKey: ["bookings-month", currentMonth],
      queryFn: async ({ signal }) => {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/bookings/?month=${currentMonth}`,
          { signal, credentials: "include" }
        );
        if (!res.ok) throw new Error("Failed to fetch bookings for month");
        return res.json();
      },
    },
  });

  const allBookings = useMemo(() => {
    const raw = data as any;
    const arr = raw?.data ?? raw?.results ?? raw;
    return Array.isArray(arr) ? arr : [];
  }, [data]);

  const groupedBookings = useMemo(
    () => groupBookingDate(allBookings),
    [allBookings]
  );

  useEffect(() => {
    setSelectedDate(dayjs().format("YYYY-MM-DD"));
  }, []);

  return (
    <main className="mx-auto my-auto w-full max-w-7xl p-6">
      <header className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-pine">Manager Dashboard</h1>
        <p className="text-neutral-600">
          View and manage bookings per day.
        </p>
      </header>

      <section className="grid items-stretch mb-8 gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <CalendarModal onSelectDate={(d) => setSelectedDate(d)} />
        </div>

        {selectedDate && (
          <DailyBookingPanel
            selectedDate={selectedDate}
            groupedBookings={groupedBookings}
            isLoading={isLoading}
            isError={isError}
          />
        )}
      </section>
    </main>
  );
}
