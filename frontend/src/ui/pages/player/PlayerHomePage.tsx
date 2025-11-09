"use client";

import { useMemo, useState, useCallback, useEffect } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import dayjs from "dayjs";

import ImageSlider from "@/ui/components/homepage/ImageSlider";
import UpcomingModal from "@/ui/components/homepage/UpcomingModal";
import CalendarModal from "@/ui/components/homepage/CalendarModal";
import { useMyBookingRetrieve } from "@/api-client/endpoints/my-booking/my-booking";
import { useCancelBooking } from "@/api-client/extras/cancel_booking";
import CancelConfirmModal from "@/ui/components/historypage/CancelConfirmModal";
import { BookingRow} from "@/ui/components/bookingpage/BookingCard";

const AvailableSlotPanel = dynamic(
  () => import("@/ui/components/homepage/AvailableSlotPanel"),
  { ssr: false }
);

export default function PlayerHomePage() {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [confirmModal, setConfirmModal] = useState<BookingRow | null>(null);

  /* ------------------------------ Booking Data ------------------------------ */
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

  /* --------------------------- Default selected date ------------------------ */
  useEffect(() => {
    setSelectedDate(dayjs().format("YYYY-MM-DD"));
  }, []);

  /* ------------------------------ Render layout ----------------------------- */
  return (
    <main className="mx-auto my-auto">
      {/* 🖼 Hero slider */}
      <div className="mb-12 w-full">
        <ImageSlider />
      </div>


      {/* Header */}
      <header className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Link
          href="/booking"
          className="inline-flex items-center rounded-2xl px-4 py-2 text-m font-semibold shadow-sm transition border border-platinum bg-pine text-white hover:bg-sea hover:shadow-md"
        >
          Book the courts!
        </Link>
      </header>

      {/* 🧩 Calendar + Slot Panel */}
      <section className="grid items-stretch mb-8 gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <CalendarModal onSelectDate={(d) => setSelectedDate(d)} />
        </div>

        {selectedDate && (
          <AvailableSlotPanel selectedDate={selectedDate} />
        )}
      </section>

            {/* 📅 Upcoming bookings */}
      <div className="mb-12 md:col-span-3">
        <UpcomingModal
          bookings={isLoading || isError ? [] : confirmedList}
          onCancel={onCancelConfirm}
        />
      </div>

      {/* ❌ Cancel booking confirm */}
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
