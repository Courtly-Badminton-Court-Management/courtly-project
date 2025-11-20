// frontend/src/api-client/extras/update_slots.ts
"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { customRequest } from "@/api-client/custom-client";
import { monthViewKey } from "./slots";
import {
  getBookingsRetrieveQueryKey,
} from "@/api-client/endpoints/bookings/bookings";
import dayjs from "dayjs";

/* =========================================================================
   Types
   ========================================================================= */

export type BulkUpdateSlotStatusInput = {
  slotIds: string[];                           // ✅ อนุญาตหลาย slot
  status: "available" | "maintenance";         // เปลี่ยนเป็นอะไร
  month?: string;                              // ไว้ invalid month-view
};

// payload ที่ส่งจริงเข้า API ใหม่
type UpdateSlotStatusApiPayload = {
  slots: string[];                             // list ของ slot id
  changed_to: "available" | "maintenance";     // key ตาม API doc
};

/* =========================================================================
   Hook: useUpdateSlotStatus → POST /api/slots/status
   ========================================================================= */

export function useUpdateSlotStatus() {
  const qc = useQueryClient();
  const CURRENT_MONTH = dayjs().format("YYYY-MM");
  const NEXT_MONTH = dayjs().add(1, 'month').format("YYYY-MM");

  return useMutation({
    mutationKey: ["updateSlotStatus"],

    mutationFn: async (input: BulkUpdateSlotStatusInput) => {
      const payload: UpdateSlotStatusApiPayload = {
        slots: input.slotIds,
        changed_to: input.status,
      };

      const res = await customRequest({
        url: "/api/slots/status/",
        method: "POST",
        data: payload,
      });

      return (res as any)?.data ?? res;
    },

    onSuccess: (_data) => {
      qc.invalidateQueries({queryKey: monthViewKey(CURRENT_MONTH)}),
      qc.invalidateQueries({queryKey: monthViewKey(NEXT_MONTH)}), 
      qc.invalidateQueries({ queryKey: getBookingsRetrieveQueryKey() });
    },
  });
}
