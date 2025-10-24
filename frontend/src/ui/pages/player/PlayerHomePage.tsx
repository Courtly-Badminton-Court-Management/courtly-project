"use client";

import { useMemo, useState, useCallback, useEffect } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import dayjs from "dayjs";
import ImageSlider from "@/ui/components/homepage/ImageSlider";
import UpcomingModal, { type BookingRow } from "@/ui/components/homepage/UpcomingModal";
import CalendarModal, { type CalendarDay } from "@/ui/components/homepage/CalendarModal";
import { useMyBookingRetrieve } from "@/api-client/endpoints/my-booking/my-booking";
import { useCancelBooking } from "@/api-client/extras/cancel_booking";
import CancelConfirmModal from "@/ui/components/historypage/CancelConfirmModal";

const AvailableSlotPanel = dynamic(
  () => import("@/ui/components/homepage/AvailableSlotPanel"),
  { ssr: false }
);

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

export default function PlayerHomePage() {
  const [ym, setYm] = useState({ year: 2025, month0: 8 });
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [confirmModal, setConfirmModal] = useState<BookingRow | null>(null);

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

  const { data, isLoading, isError } = useMyBookingRetrieve();
  const { cancelMut, handleCancel } = useCancelBooking({
    onSuccess: () => setConfirmModal(null),
  });

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

  const onCancelConfirm = useCallback((b: BookingRow) => {
    setConfirmModal(b);
  }, []);

  useEffect(() => {
    setSelectedDate(dayjs().format("YYYY-MM-DD"));
  }, []);

  const CLUB_ID = Number(process.env.NEXT_PUBLIC_CLUB_ID);

  return (
    <main className="mx-auto my-auto">
      <div className="mb-12 w-full">
        <ImageSlider />
      </div>

      <div className="mb-12 md:col-span-3">
        <UpcomingModal
          bookings={isLoading || isError ? [] : confirmedList}
          onCancel={onCancelConfirm}
        />
      </div>

      <header className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Link
          href="/booking"
          className="inline-flex items-center rounded-2xl px-4 py-2 text-m font-semibold shadow-sm transition border border-platinum bg-pine text-white hover:bg-sea hover:shadow-md"
        >
          Book the courts!
        </Link>
      </header>

      <section className="grid items-stretch gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <CalendarModal
            title={title}
            days={monthDays}
            onPrevMonth={prevMonth}
            onNextMonth={nextMonth}
          />
        </div>

        {selectedDate && (
          <AvailableSlotPanel clubId={CLUB_ID} selectedDate={selectedDate} />
        )}
      </section>

      <CancelConfirmModal
        open={!!confirmModal}
        bookingId={confirmModal?.booking_id || ""}
        isPending={cancelMut.isPending}
        onConfirm={() =>
          confirmModal && handleCancel(confirmModal.booking_id)
        }
        onClose={() => setConfirmModal(null)}
      />
    </main>
  );
}
