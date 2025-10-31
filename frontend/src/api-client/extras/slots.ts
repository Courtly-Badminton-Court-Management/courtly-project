"use client";

import { useQuery } from "@tanstack/react-query";
import { customRequest } from "@/api-client/custom-client";
import dayjs from "dayjs";

/* =========================================================================
   Types
   ========================================================================= */
export type SlotItem = {
  id?: string;
  status: string;
  start_time: string;
  end_time: string;
  court: number;
  court_name: string;
  price_coin: number;
};

export type MonthViewResponse = {
  month: string;
  days: Array<{
    date: string;
    booking_slots: Record<string, SlotItem>;
  }>;
};

/* =========================================================================
   Query key
   ========================================================================= */
export const monthViewKey = (month: string) =>
  ["slots/month-view", { month }] as const;

/* =========================================================================
   Hook: useMonthView
   ========================================================================= */
export function useMonthView(monthParam?: string) {
  // 🧠 Default values
  const CLUB_ID = Number(process.env.NEXT_PUBLIC_CLUB_ID);
  const MONTH = monthParam || dayjs().format("YYYY-MM");

  return useQuery({
    queryKey: monthViewKey(MONTH),

    queryFn: ({ signal }) =>
      customRequest<MonthViewResponse>({
        url: "/api/slots/month-view/",
        method: "GET",
        signal,
        params: { club: CLUB_ID, month: MONTH },
      }),

    enabled: !!MONTH,
    staleTime: 60_000,
    refetchInterval: 60_000,
    refetchOnWindowFocus: false,
    notifyOnChangeProps: ["data", "error"],
  });
}
