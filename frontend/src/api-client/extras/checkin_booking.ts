//frontend/src/api-client/extras/checkin_booking.ts
"use client";

import { useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";

import { useBookingCheckinCreate } from "@/api-client/endpoints/booking/booking";

// invalidation keys
import { getBookingsRetrieveQueryKey } from "@/api-client/endpoints/bookings/bookings";
import { getBookingsUpcomingRetrieveQueryKey } from "@/api-client/endpoints/bookings/bookings";
import { monthViewKey } from "@/api-client/extras/slots";

type CheckInOptions = {
  onSuccess?: () => void;
  onError?: (err: unknown) => void;
};

export function useCheckInBooking(opts?: CheckInOptions) {
  const queryClient = useQueryClient();

  const CURRENT_MONTH = dayjs().format("YYYY-MM");
  const NEXT_MONTH = dayjs().add(1, "month").format("YYYY-MM");

  const checkinMut = useBookingCheckinCreate({
    mutation: {
      onSuccess: async () => {
        await Promise.all([
          /* 🔄 รีเฟรช booking list ฝั่ง manager */
          queryClient.invalidateQueries({
            queryKey: getBookingsRetrieveQueryKey(),
          }),

          /* 🔄 รีเฟรช upcoming bookings ของ manager */
          queryClient.invalidateQueries({
            queryKey: getBookingsUpcomingRetrieveQueryKey(),
          }),

          /* 🔄 รีเฟรช calendar month-view */
          queryClient.invalidateQueries({
            queryKey: monthViewKey(CURRENT_MONTH),
          }),
          queryClient.invalidateQueries({
            queryKey: monthViewKey(NEXT_MONTH),
          }),
        ]);

        opts?.onSuccess?.();
      },
      onError: opts?.onError,
    },
  });

  /** Call this with bookingID */
  const handleCheckin = (bookingNo: string) => {
    checkinMut.mutate({ bookingNo });
  };

  return { checkinMut, handleCheckin };
}
