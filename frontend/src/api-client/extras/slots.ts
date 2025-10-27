"use client";

import { useQuery } from "@tanstack/react-query";
import { customRequest } from "@/api-client/custom-client";

/* =========================================================================
   Types
   ========================================================================= */
export type SlotItem = {
  id?: string; // slot id (optional, may exist from backend)
  status: string;
  start_time: string;
  end_time: string;
  court: number;
  court_name: string;
  price_coin: number;
};

export type MonthViewResponse = {
  month: string; // "10-25"
  days: Array<{
    date: string; // "DD-MM-YY"
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
export function useMonthView(club: number, month: string) {
  return useQuery({
    queryKey: monthViewKey(club, month),
    queryFn: ({ signal }) =>
      customRequest<MonthViewResponse>({
        url: "/api/slots/month-view/",
        method: "GET",
        signal,
        params: { club, month },
      }),

    enabled: !!club && !!month,

    // cache considered fresh for 1 minute
    staleTime: 60_000,

    // 🔁 silent auto refresh every 1 minute
    refetchInterval: 60_000,

    // 💤 don’t refetch when user switches tabs
    refetchOnWindowFocus: false,

    // silent update
    notifyOnChangeProps: ["data", "error"],
  });
}
