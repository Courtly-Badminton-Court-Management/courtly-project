// src/api-client/extras/cancel_booking.ts
"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useBookingsCancelCreate } from "@/api-client/endpoints/bookings/bookings";
import { getMyBookingRetrieveQueryKey } from "@/api-client/endpoints/my-booking/my-booking";
import { getWalletMeRetrieveQueryKey } from "@/api-client/endpoints/wallet/wallet";
import { monthViewKey } from "@/api-client/extras/slots";
import dayjs from "dayjs";

type CancelOptions = {
  onSuccess?: () => void;
  onError?: (err: unknown) => void;
};

export function useCancelBooking(opts?: CancelOptions) {
  const queryClient = useQueryClient();
  const CLUB_ID = Number(process.env.NEXT_PUBLIC_CLUB_ID);
  const CURRENT_MONTH = dayjs().format("YYYY-MM");
  const NEXT_MONTH = dayjs().add(1, 'month').format("YYYY-MM");


  const cancelMut = useBookingsCancelCreate({
    mutation: {
      onSuccess: async () => {
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: getWalletMeRetrieveQueryKey() }),
          queryClient.invalidateQueries({ queryKey: getMyBookingRetrieveQueryKey() }),
          queryClient.invalidateQueries({queryKey: monthViewKey(CLUB_ID, CURRENT_MONTH)}),
          queryClient.invalidateQueries({queryKey: monthViewKey(CLUB_ID, NEXT_MONTH)}), 
        ]);
        opts?.onSuccess?.();
      },
      onError: opts?.onError,
    },
  });

  const handleCancel = (bookingNo: string) => cancelMut.mutate({ bookingNo });

  return { cancelMut, handleCancel };
}
