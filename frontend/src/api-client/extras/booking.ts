// frontend/src/api-client/extras/booking.ts
"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { customRequest } from "@/api-client/custom-client";
import { monthViewKey } from "./slots";
import {
  getWalletBalanceRetrieveQueryKey,
} from "@/api-client/endpoints/wallet/wallet";
import {
  getBookingsRetrieveQueryKey,
} from "@/api-client/endpoints/bookings/bookings";
import {
  getMyBookingRetrieveQueryKey,
} from "@/api-client/endpoints/my-booking/my-booking";

/* =========================================================================
   Types
   ========================================================================= */
export type CreateBookingPayload = {
  club: number;
  booking_method: string;
  owner_username: string;
  owner_contact: string;
  payment_method: string;
  slots: string[];
};

export type CreateBookingResponse = {
  booking_id: string;
  message: string;
  total_cost: number;
  status: string;
};

/* =========================================================================
   Hook: useBookingCreateWithBody
   ========================================================================= */
export function useBookingCreateWithBody(month: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationKey: ["bookingCreateWithBody"],

    // ✅ ensure return response.data
    mutationFn: async (payload: CreateBookingPayload) => {
      const res = await customRequest<CreateBookingResponse>({
        url: "/api/booking/",
        method: "POST",
        data: payload,
      });

      // 👇 ถ้า customRequest คืน AxiosResponse จะเข้าถึง res.data.booking_id ได้
      return (res as any)?.data ?? res;
    },

    onSuccess: () => {
      qc.invalidateQueries({ queryKey: monthViewKey(month) });
      qc.invalidateQueries({ queryKey: getWalletBalanceRetrieveQueryKey() });
      qc.invalidateQueries({ queryKey: getMyBookingRetrieveQueryKey() });
      qc.invalidateQueries({ queryKey: getBookingsRetrieveQueryKey() });
    },
  });
}
