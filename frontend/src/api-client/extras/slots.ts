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
export const monthViewKey = (club: number, month: string) =>
  ["slots/month-view", { club, month }] as const;

/* =========================================================================
   Hook: useMonthView
   ========================================================================= */
export function useMonthView(
  clubParam?: number,
  monthParam?: string
) {
  // 🧠 Default fallback values
  const CLUB_ID = clubParam || Number(process.env.NEXT_PUBLIC_CLUB_ID) || 1;
  const MONTH = monthParam || dayjs().format("YYYY-MM");

  console.log("[useMonthView] using:", { CLUB_ID, MONTH });

  return useQuery({
    queryKey: monthViewKey(CLUB_ID, MONTH),
    queryFn: ({ signal }) =>
      customRequest<MonthViewResponse>({
        url: "/api/slots/month-view/",
        method: "GET",
        signal,
        params: { club: CLUB_ID, month: MONTH },
      }),

    enabled: !!CLUB_ID && !!MONTH,
    staleTime: 60_000,
    refetchInterval: 60_000,
    refetchOnWindowFocus: false,
    notifyOnChangeProps: ["data", "error"],
  });
}
