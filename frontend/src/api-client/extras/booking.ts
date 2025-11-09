// src/api-client/extras/booking.ts
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
  getMyBookingsRetrieveQueryKey,
} from "@/api-client/endpoints/my-bookings/my-bookings";

/* =========================================================================
   Types
   ========================================================================= */
export type CreateBookingPayload = {
  items: Array<{ court: number; date: string; start: string; end: string }>;
};

export type CreateBookingResponse = any;

/* =========================================================================
   Hook: useBookingCreateWithBody
   ========================================================================= */
export function useBookingCreateWithBody(month: string) {
  const qc = useQueryClient();
  const CLUB_ID = Number(process.env.NEXT_PUBLIC_CLUB_ID) || 1;

  return useMutation({
    mutationKey: ["bookingCreateWithBody"],

    mutationFn: (payload: CreateBookingPayload) =>
      customRequest<CreateBookingResponse>({
        url: "/api/booking/",
        method: "POST",
        data: {
          club: CLUB_ID, // 👈 ฝังจาก env ให้เลย
          items: payload.items,
        },
      }),

    onSuccess: (response) => {
      // ✅ invalidate ทุก cache ที่เกี่ยวข้อง
      qc.invalidateQueries({ queryKey: monthViewKey(month) });
      qc.invalidateQueries({ queryKey: getWalletBalanceRetrieveQueryKey() });
      qc.invalidateQueries({ queryKey: getMyBookingsRetrieveQueryKey() });
      qc.invalidateQueries({ queryKey: getBookingsRetrieveQueryKey() });
      return response;
    },
  });
}
