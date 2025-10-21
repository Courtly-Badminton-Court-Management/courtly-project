// src/api-client/extras/booking.ts
"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { customRequest } from "@/api-client/custom-client";
import { monthViewKey } from "./slots";

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
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: monthViewKey(club, month) });
      // ถ้าต้อง refresh wallet: qc.invalidateQueries({ queryKey: getWalletWalletBalanceRetrieveQueryKey() });
    },
  });
}
