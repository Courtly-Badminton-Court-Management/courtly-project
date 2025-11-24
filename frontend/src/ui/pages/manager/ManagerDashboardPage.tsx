"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import dayjs from "dayjs";

/* Components */
import CalendarModal from "@/ui/components/homepage/CalendarModal";
import DailyBookingPanel from "@/ui/components/dashboardpage/DailyBookingsPanel";
import CheckInModal from "@/ui/components/dashboardpage/CheckInModal";
import SuccessCheckinToast from "@/ui/components/dashboardpage/SuccessCheckinToast";
import GlobalErrorModal from "@/ui/components/basic/GlobalErrorModal";

/* APIs */
import { useBookingsRetrieve } from "@/api-client/endpoints/bookings/bookings";
import { useAvailableSlots } from "@/api-client/extras/slots";
import { useBookingRetrieve } from "@/api-client/endpoints/booking/booking";
import { useCheckInBooking } from "@/api-client/extras/checkin_booking";

/* Utils */
import { groupBookingDate } from "@/lib/booking/groupBookingDate";
import { filterUpcomingBookings } from "@/lib/booking/filterUpcoming";
import type { BookingRow } from "@/api-client/extras/types";


/* ========================================================================== */
/*                          Manager Dashboard Page                            */
/* ========================================================================== */

export default function ManagerDashboardPage() {
  /* -------------------------------------------------------------------------- */
  /* 1. Selected date                                                            */
  /* -------------------------------------------------------------------------- */
  const [selectedDate, setSelectedDate] = useState("");

  useEffect(() => {
    setSelectedDate(dayjs().format("YYYY-MM-DD"));
  }, []);

  /* -------------------------------------------------------------------------- */
  /* 2. Calendar month state                                                     */
  /* -------------------------------------------------------------------------- */
  const [currentMonth, setCurrentMonth] = useState(dayjs().format("YYYY-MM"));

  const {
    data: availableData,
    isLoading: isAvailLoading,
    isError: isAvailError,
  } = useAvailableSlots(currentMonth);

  /* -------------------------------------------------------------------------- */
  /* 3. Retrieve ALL bookings                                                    */
  /* -------------------------------------------------------------------------- */
  const {
    data: bookingData,
    isLoading: isBookingListLoading,
    isError: isBookingListError,
    refetch: refetchBookings,
  } = useBookingsRetrieve();

  /* ✔ FILTER upcoming */
  const upcomingList: BookingRow[] = useMemo(() => {
    return filterUpcomingBookings(bookingData);
  }, [bookingData]);

  /* ✔ group by date */
  const groupedBookings = useMemo(() => {
    return groupBookingDate(upcomingList || []);
  }, [upcomingList]);

  /* Group ALL bookings (ไม่กรอง status) */
const totalBookingsToday = useMemo(() => {
  const raw = bookingData as any;
  const arr = raw?.data ?? raw?.results ?? raw ?? [];
  return arr.filter((b: any) => b.booking_date === selectedDate).length;
}, [bookingData, selectedDate]);

  /* -------------------------------------------------------------------------- */
  /* 4. Check-in Modal — store booking_id only                                  */
  /* -------------------------------------------------------------------------- */
  const [checkInBookingId, setCheckInBookingId] = useState<string | null>(null);

  const {
  data: checkInBookingDetail,
  isLoading: isBookingDetailLoading,
} = useBookingRetrieve<BookingRow>(checkInBookingId || "", {
  query: {
    enabled: !!checkInBookingId,
  },
});

  /* -------------------------------------------------------------------------- */
  /* 5. Success Toast State                                                      */
  /* -------------------------------------------------------------------------- */
  const [showSuccessToast, setShowSuccessToast] = useState({
    username: "",
    open: false,
  });
  const username = checkInBookingDetail?.owner_username || "";


  const [error, setError] = useState("");
  const [openError, setOpenError] = useState(false);

  /* -------------------------------------------------------------------------- */
  /* 6. Check-in Mutation                                                        */
  /* -------------------------------------------------------------------------- */
  const { checkinMut, handleCheckin } = useCheckInBooking({
    onSuccess: async () => {
      await refetchBookings();

      // Close modal
      setCheckInBookingId(null);

      // Show success toast 🎉
      
      setShowSuccessToast({ username, open: true });

      // Auto-close toast
      setTimeout(() => {
        setShowSuccessToast((t) => ({ ...t, open: false }));
      }, 5000);
    },

    onError: (err) => {
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
      setOpenError(true);
    },
  });

  /* -------------------------------------------------------------------------- */
  /* 7. Handlers                                                                 */
  /* -------------------------------------------------------------------------- */
  const openCheckInModal = useCallback((row: BookingRow) => {
    setCheckInBookingId(row.booking_id);
  }, []);

  const closeCheckInModal = useCallback(() => {
    setCheckInBookingId(null);
  }, []);

  const confirmCheckIn = useCallback(() => {
    if (!checkInBookingId) return;
    handleCheckin(checkInBookingId);
  }, [checkInBookingId, handleCheckin]);

  /* -------------------------------------------------------------------------- */
  /* 8. Render                                                                   */
  /* -------------------------------------------------------------------------- */
  return (
    <main className="mx-auto my-auto">
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-2xl font-bold">Manager Dashboard</h1>
      </header>

      {/* Layout */}
      <section className="grid items-stretch mb-8 gap-6 md:grid-cols-20">
        {/* Calendar */}
        <div className="md:col-span-11">
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

        {/* Daily Booking Panel (UPCOMING ONLY) */}
        <div className="md:col-span-9">
          <DailyBookingPanel
            selectedDate={selectedDate}
            groupedBookings={groupedBookings}
            totalBookingsToday={totalBookingsToday}
            isLoading={isBookingListLoading}
            isError={isBookingListError}
            onCheckIn={openCheckInModal}
          />
        </div>
      </section>

      {/* Check-In Modal */}
      <CheckInModal
        open={!!checkInBookingId}
        booking={checkInBookingDetail || null}
        isPending={checkinMut.isPending || isBookingDetailLoading}
        onConfirm={confirmCheckIn}
        onClose={closeCheckInModal}
      />

      {/* Success Toast 🎉 */}
      <SuccessCheckinToast
        username={showSuccessToast.username}
        open={showSuccessToast.open}
      />


      <GlobalErrorModal
        open={openError}
        message={error}
        onClose={() => setOpenError(false)}
      />
    </main>
  );
}
