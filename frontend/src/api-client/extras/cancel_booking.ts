// src/api-client/extras/cancel_booking.ts
"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useBookingCancelCreate } from "@/api-client/endpoints/booking/booking";
import { getMyBookingRetrieveQueryKey } from "@/api-client/endpoints/my-booking/my-booking";
import { getWalletBalanceRetrieveQueryKey } from "@/api-client/endpoints/wallet/wallet";
import { monthViewKey } from "@/api-client/extras/slots";
import dayjs from "dayjs";

type CancelOptions = {
  onSuccess?: () => void;
  onError?: (err: unknown) => void;
};

export function useCancelBooking(opts?: CancelOptions) {
  const queryClient = useQueryClient();
  const CURRENT_MONTH = dayjs().format("YYYY-MM");
  const NEXT_MONTH = dayjs().add(1, 'month').format("YYYY-MM");


  const cancelMut = useBookingCancelCreate({
    mutation: {
      onSuccess: async () => {
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: getWalletBalanceRetrieveQueryKey() }),
          queryClient.invalidateQueries({ queryKey: getMyBookingRetrieveQueryKey() }),
          queryClient.invalidateQueries({queryKey: monthViewKey(CURRENT_MONTH)}),
          queryClient.invalidateQueries({queryKey: monthViewKey(NEXT_MONTH)}), 
        ]);
        opts?.onSuccess?.();
      },
      onError: opts?.onError,
    },
  });

  const handleCancel = (bookingNo: string) => cancelMut.mutate({ bookingNo });

  return { cancelMut, handleCancel };
}
