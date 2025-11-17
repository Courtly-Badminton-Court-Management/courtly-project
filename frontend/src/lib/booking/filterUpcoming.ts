import dayjs from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import type { BookingRow } from "@/api-client/extras/types";

dayjs.extend(isSameOrAfter);

export function filterUpcomingBookings(raw: any): BookingRow[] {
  const arr: BookingRow[] = Array.isArray(raw?.data)
    ? raw.data
    : Array.isArray(raw?.results)
    ? raw.results
    : Array.isArray(raw)
    ? raw
    : [];

  const today = dayjs().format("YYYY-MM-DD");

  return arr
    .filter((b) => {
      const status = (b.booking_status || "").toLowerCase();
      const date = b.booking_date || "";

      return (
        status === "upcoming" &&         // ⭐ แก้ตรงนี้แดก
        dayjs(date).isSameOrAfter(today, "day")
      );
    })
    .sort((a, b) =>
      dayjs(a.booking_date).unix() - dayjs(b.booking_date).unix()
    );
}
