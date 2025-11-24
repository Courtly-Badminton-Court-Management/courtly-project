"use client";

import { useMemo, useState, useCallback, useEffect } from "react";
import Link from "next/link";
import dayjs from "dayjs";

import ImageSlider from "@/ui/components/homepage/ImageSlider";
import CalendarModal from "@/ui/components/homepage/CalendarModal";
import AvailableSlotPanel from "@/ui/components/homepage/AvailableSlotPanel";
import UpcomingModal from "@/ui/components/homepage/UpcomingModal";
import CancelConfirmModal from "@/ui/components/historypage/CancelConfirmModal";
import GlobalErrorModal from "@/ui/components/basic/GlobalErrorModal";

import type { BookingRow } from "@/api-client/extras/types";

import { useMyBookingRetrieve } from "@/api-client/endpoints/my-booking/my-booking";
import { useAvailableSlots } from "@/api-client/extras/slots";
import { useCancelBooking } from "@/api-client/extras/cancel_booking";
import { bookingRetrieve } from "@/api-client/endpoints/booking/booking";

import { filterUpcomingBookings } from "@/lib/booking/filterUpcoming";
import { set } from "zod";

/* ========================================================================== */
/*                              Player Home Page                              */
/* ========================================================================== */

export default function PlayerHomePage() {
  /* -------------------------------------------------------------------------- */
  /* 1. Manage selected date                                                    */
  /* -------------------------------------------------------------------------- */
  const [selectedDate, setSelectedDate] = useState<string>("");

  useEffect(() => {
    setSelectedDate(dayjs().format("YYYY-MM-DD"));
  }, []);

  /* -------------------------------------------------------------------------- */
  /* 2. Manage month change (Calendar)                                          */
  /* -------------------------------------------------------------------------- */

  // ใช้ชื่อที่ถูกต้อง: [state, setter]
  const [currentMonth, setCurrentMonth] = useState<string>(
    dayjs().format("YYYY-MM")
  );

  const {
    data: availableData,
    isLoading: isAvailLoading,
    isError: isAvailError,
  } = useAvailableSlots(currentMonth);

  /* -------------------------------------------------------------------------- */
  /* 3. Fetch ALL my bookings → keep only upcoming                              */
  /* -------------------------------------------------------------------------- */
  const {
    data: bookingData,
    isLoading: isBookingLoading,
    isError: isBookingError,
    refetch: refetchBookings,
  } = useMyBookingRetrieve();

  const upcomingList: BookingRow[] = useMemo(() => {
    return filterUpcomingBookings(bookingData);
  }, [bookingData]);

  /* -------------------------------------------------------------------------- */
  /* 4. Load FULL DETAILS for each upcoming booking                              */
  /* -------------------------------------------------------------------------- */
  const [fullUpcoming, setFullUpcoming] = useState<BookingRow[]>([]);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [error, setError] = useState("");
  const [openError, setOpenError] = useState(false);  

  useEffect(() => {
    if (!upcomingList.length) {
      setFullUpcoming([]);
      return;
    }

    const loadDetails = async () => {
      setIsDetailLoading(true);

      try {
        const results = await Promise.all(
          upcomingList.map(async (b) => {
            try {
              const detail = await bookingRetrieve(b.booking_id);
              return detail;
            } catch (err) {
              setError(err instanceof Error ? err.message : "Failed to load detail for: " + b.booking_id);
              setOpenError(true);
              return b; // fallback
            }
          })
        );

        setFullUpcoming(results as any);
      } catch (err) {
            setError(err instanceof Error ? err.message : "An unexpected error occurred while loading booking details.");
            setOpenError(true);
        setFullUpcoming(upcomingList);
      }

      setIsDetailLoading(false);
    };

    loadDetails();
  }, [upcomingList]);

  const finalUpcoming =
    isBookingError || isDetailLoading ? [] : fullUpcoming;

  /* -------------------------------------------------------------------------- */
  /* 5. Cancel booking logic                                                    */
  /* -------------------------------------------------------------------------- */
  const [confirmModal, setConfirmModal] = useState<BookingRow | null>(null);

  const { cancelMut, handleCancel } = useCancelBooking({
    onSuccess: async () => {
      await refetchBookings();
      setConfirmModal(null);
    },
  });

  const onCancelConfirm = useCallback((b: BookingRow) => {
    setConfirmModal(b);
  }, []);

  /* -------------------------------------------------------------------------- */
  /* 6. Render Layout                                                           */
  /* -------------------------------------------------------------------------- */
  return (
    <main className="mx-auto my-auto">
      {/* 🖼 Hero slider */}
      <div className="mb-12 w-full">
        <ImageSlider />
      </div>

      {/* Header */}
      <header className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Courtly Overview!</h1>

        <Link
          href="/booking"
          className="inline-flex items-center rounded-2xl px-4 py-2 text-m font-semibold shadow-sm transition border border-platinum bg-pine text-white hover:bg-sea hover:shadow-md scale-100 hover:scale-[1.05]"
        >
          Book the courts NOW!
        </Link>
      </header>

      {/* 🧩 Calendar + Slot Panel */}
      <section className="grid items-stretch mb-8 gap-6 md:grid-cols-3">
        {/* Calendar */}
        <div className="md:col-span-2">
          <CalendarModal
            data={availableData}
            isLoading={isAvailLoading}
            isError={isAvailError}
            onSelectDate={(d) => setSelectedDate(d)}
            onMonthChange={(m) => {
                setCurrentMonth(m);
                setSelectedDate(`${m}-01`);
              }}
          />
        </div>

        {/* Slot Panel */}
        {selectedDate && (
          <div className="md:col-span-1">
            <AvailableSlotPanel
              selectedDate={selectedDate}
              data={availableData}
              isLoading={isAvailLoading}
              isError={isAvailError}
            />
          </div>
        )}
      </section>

      {/* 📅 Upcoming bookings */}
      <div className="mb-12 w-full">
        <UpcomingModal
          bookings={finalUpcoming}
          onCancel={onCancelConfirm}
          isLoading={isBookingLoading || isDetailLoading}
        />
      </div>

      {/* ❌ Cancel booking confirm */}
      <CancelConfirmModal
        open={!!confirmModal}
        bookingId={confirmModal?.booking_id || ""}
        isPending={cancelMut.isPending}
        onConfirm={() => {
          if (!confirmModal) return;
          handleCancel(confirmModal.booking_id);
        }}
        onClose={() => setConfirmModal(null)}
      />

      {/* Error Modal */}
      <GlobalErrorModal
        open={openError}
        message={error}
        onClose={() => setOpenError(false)}
      />


    </main>
  );
}
