// src/api-client/extras/booking.ts
"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { customRequest } from "@/api-client/custom-client";
import { monthViewKey } from "./slots";
import {getWalletMeRetrieveQueryKey} from "@/api-client/endpoints/wallet/wallet";
import {getBookingsRetrieveQueryKey} from "@/api-client/endpoints/bookings/bookings";
import {getMyBookingRetrieveQueryKey} from "@/api-client/endpoints/my-booking/my-booking";

export type CreateBookingPayload = {
  club: number;
  items: Array<{ court: number; date: string; start: string; end: string }>;
};

// (ถ้ามี response shape จริง จะใส่ type ให้ตรงได้เลย)
export type CreateBookingResponse = any;

export function useBookingCreateWithBody(club: number, month: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationKey: ["bookingCreateWithBody"],
    mutationFn: (payload: CreateBookingPayload) =>
      customRequest<CreateBookingResponse>({
        url: "/api/booking/",
        method: "POST",
        // 👇 Axios ใช้ 'data' แทน 'body'
        data: payload,
        // headers: { "Content-Type": "application/json" }, // โดยปกติ axios ใส่ให้อยู่แล้ว
      }),
    onSuccess: (response) => {
      qc.invalidateQueries({ queryKey: monthViewKey(club, month) });
      qc.invalidateQueries({ queryKey: getWalletMeRetrieveQueryKey() });        // refresh wallet
      qc.invalidateQueries({ queryKey: getMyBookingRetrieveQueryKey() });      // refresh my-bookings
      qc.invalidateQueries({ queryKey: getBookingsRetrieveQueryKey() });        // refresh manager bookings

      return response
    },
  });
}
