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

/* 🟢 For month-view endpoint */
export type MonthViewResponse = {
  month: string;
  days: Array<{
    date: string;
    booking_slots: Record<string, SlotItem>;
  }>;
};

/* 🟢 For available-view endpoint */
export type AvailableViewResponse = {
  month: string; // YYYY-MM
  days: Array<{
    date: string; // YYYY-MM-DD
    percent: number; // available %
    slots: SlotItem[];
  }>;
};

/* =========================================================================
   Query Keys
   ========================================================================= */
export const monthViewKey = (month: string) =>
  ["slots/month-view", { month }] as const;

export const availableViewKey = (club: number, month: string) =>
  ["slots/available-slots", { club, month }] as const;

/* =========================================================================
   Hook: useMonthView
   ========================================================================= */
export function useMonthView(monthParam?: string) {
  const CLUB_ID = Number(process.env.NEXT_PUBLIC_CLUB_ID) || 1;
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

/* =========================================================================
   Hook: useAvailableView
   ========================================================================= */
/**
 * ✅ Simplified calendar view
 * GET /api/slots/available-view?club=1&month=YYYY-MM
 */
export function useAvailableView(monthParam?: string, clubParam?: number) {
  const CLUB_ID = clubParam || Number(process.env.NEXT_PUBLIC_CLUB_ID) || 1;
  const MONTH = monthParam || dayjs().format("YYYY-MM");

  return useQuery({
    queryKey: availableViewKey(CLUB_ID, MONTH),
    queryFn: ({ signal }) =>
      customRequest<AvailableViewResponse>({
        url: "/api/slots/available-slots/",
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
