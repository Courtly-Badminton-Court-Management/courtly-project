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
    <main className="w-full">
      {/* 🧩 Calendar + Panel */}
      <section className="grid items-stretch mb-8 gap-6 md:grid-cols-5">
        {/* Calendar (3/5) */}
        <div className="md:col-span-3 w-full">
          <CalendarModal onSelectDate={(d) => setSelectedDate(d)} />
        </div>

        {/* Panel (2/5) */}
        {selectedDate && (
          <div className="md:col-span-2 w-full">
            <DailyBookingPanel
              selectedDate={selectedDate}
              groupedBookings={groupedBookings}
              isLoading={isLoading}
              isError={isError}
            />
          </div>
        )}
      </section>
    </main>
  );
}
