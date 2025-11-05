// frontend/src/lib/booking/groupBookingDate.ts
import dayjs from "dayjs";

/**
 * Group booking list (array) into map by date: YYYY-MM-DD
 */
export function groupBookingDate(bookings: any[]) {
  const grouped: Record<string, any[]> = {};

  bookings.forEach((b) => {
    const dateKey = dayjs(b.booking_date).format("YYYY-MM-DD");
    if (!grouped[dateKey]) grouped[dateKey] = [];
    grouped[dateKey].push(b);
  });

  // sort inside each day by start_time (if exists)
  Object.keys(grouped).forEach((key) => {
    grouped[key].sort((a, b) => {
      const t1 = a.booking_slots?.[0]?.start_time ?? "";
      const t2 = b.booking_slots?.[0]?.start_time ?? "";
      return t1.localeCompare(t2);
    });
  });

  return grouped;
}
