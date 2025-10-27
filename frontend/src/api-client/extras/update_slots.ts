"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { customRequest } from "@/api-client/custom-client";
import type { MonthViewResponse } from "@/api-client/extras/slots";

/**
 * POST /api/slots/<slot_id>/set-status/<new_status>/
 * → ใช้สำหรับอัปเดตสถานะของ slot (ไม่มี body)
 * พร้อม Optimistic update ให้ month-view เปลี่ยนทันที
 */

export type UpdateSlotStatusPayload = {
  slotId: string;
  status: string; // เช่น "maintenance" | "walkin" | "checkin"
  club: number;
  month: string; // YYYY-MM
};

export function useUpdateSlotStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    /* =========================== actual API call =========================== */
    mutationFn: async ({ slotId, status }: UpdateSlotStatusPayload) => {
      return customRequest({
        url: `/api/slots/${slotId}/set-status/${status}/`,
        method: "POST",
      });
    },

    /* =========================== optimistic update ======================== */
    onMutate: async (payload) => {
      const key = ["slots/month-view", { club: payload.club, month: payload.month }];
      await queryClient.cancelQueries({ queryKey: key });

      const previous = queryClient.getQueryData<MonthViewResponse>(key);

      if (previous) {
        const updated: MonthViewResponse = {
          ...previous,
          days: previous.days.map((day) => ({
            ...day,
            booking_slots: Object.fromEntries(
              Object.entries(day.booking_slots).map(([id, slot]) => [
                id,
                id === String(payload.slotId)
                  ? { ...slot, status: payload.status }
                  : slot,
              ])
            ),
          })),
        };
        queryClient.setQueryData(key, updated);
      }

      return { previous, key };
    },

    /* =========================== error rollback =========================== */
    onError: (_error, _payload, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(ctx.key, ctx.previous);
    },

    /* =========================== refetch after done ======================= */
    onSettled: (_data, _err, _payload, ctx) => {
      if (ctx?.key) queryClient.invalidateQueries({ queryKey: ctx.key });
    },
  });
}
