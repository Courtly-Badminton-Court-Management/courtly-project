"use client";

import { useQuery } from "@tanstack/react-query";
import { customRequest } from "@/api-client/custom-client";
import dayjs from "dayjs";
import type { SlotItem, AvailableSlotsResponse } from "@/api-client/extras/types";

/* =========================================================================
   Types
   ========================================================================= */

/** Month-view (slots for each day) */
export type MonthViewResponse = {
  month: string;
  days: Array<{
    date: string;
    booking_slots: Record<string, SlotItem>;
  }>;
};


/* =========================================================================
   Query Keys
   ========================================================================= */
export const monthViewKey = (month: string) =>
  ["month-view", { month }] as const;

export const availableSlotsKey = (month: string) =>
  ["available-slots", { month }] as const;

const CLUB_ID = Number(process.env.NEXT_PUBLIC_CLUB_ID);

/* =========================================================================
   Hook: useMonthView
   ========================================================================= */
export function useMonthView(monthParam?: string) {
  
  const MONTH = monthParam || dayjs().format("YYYY-MM");
  return useQuery({
    queryKey: monthViewKey(MONTH),
    queryFn: ({ signal }) =>
      customRequest<MonthViewResponse>({
        url: "/api/month-view/",
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
   Hook: useAvailableSlots (NEW — cleaned + unified)
   ========================================================================= */
/**
 * ⭐ Unified clean version for available-slots
 * GET /api/available-slots/?club=1&month=YYYY-MM
 */
export function useAvailableSlots(monthParam?: string) {
  const MONTH = monthParam || dayjs().format("YYYY-MM");

  return useQuery({
    queryKey: availableSlotsKey(MONTH),
    queryFn: ({ signal }) =>
      customRequest<AvailableSlotsResponse>({
        url: "/api/available-slots/",
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
