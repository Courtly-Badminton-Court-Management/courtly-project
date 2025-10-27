"use client";

import React, { useMemo, useState } from "react";
import dayjs from "dayjs";


import DateNavigator from "@/ui/components/bookingpage/DateNavigator";
import { useMonthView } from "@/api-client/extras/slots";
import { useUpdateSlotStatus } from "@/api-client/extras/update_slots";
import {
  buildDayGridFromMonthView,
  buildPlaceholderGrid,
} from "@/lib/slot/buildDayGridFromMonthView";
import type { Col } from "@/lib/slot/slotGridModel";
import type { ManagerSelectedSlot } from "@/lib/slot/slotGridModel";

import dynamic from "next/dynamic";

const SlotGridManager = dynamic(
  () => import("@/ui/components/controlpage/SlotGridManager"),
  { ssr: false } // ✅ ปิด SSR สำหรับ component นี้
);


export default function ManagerControlPage() {
  const today = useMemo(() => dayjs().startOf("day").toDate(), []);
  const [ymd, setYmd] = useState(dayjs(today).format("YYYY-MM-DD"));
  const CURRENT_MONTH = useMemo(() => ymd.slice(0, 7), [ymd]);
  const CLUB_ID = Number(process.env.NEXT_PUBLIC_CLUB_ID);


  // ======================= DATA ==========================
  const mv = useMonthView(CLUB_ID, CURRENT_MONTH);
  const updateStatusMut = useUpdateSlotStatus();

  const base = useMemo(() => buildDayGridFromMonthView(mv.data, ymd), [mv.data, ymd]);
  const { cols, grid, courtNames } = useMemo(
    () => (mv.isLoading || !base.cols.length ? buildPlaceholderGrid() : base),
    [mv.isLoading, base]
  );

  // ======================= SELECTION ==========================
  const [selected, setSelected] = useState<ManagerSelectedSlot[]>([]);

  const toggleSelect = (courtRow: number, colIdx: number, slotId?: string) => {
    const key = `${courtRow}-${colIdx}-${slotId}`;
    const exists = selected.some(
      (s) => `${s.courtRow}-${s.colIdx}-${s.slotId}` === key
    );
    setSelected((prev) =>
      exists
        ? prev.filter((s) => `${s.courtRow}-${s.colIdx}-${s.slotId}` !== key)
        : [...prev, { courtRow, colIdx, slotId: slotId ?? "" }]
    );
  };

  async function handleSetStatus(status: "maintenance" | "walkin") {
  if (!selected.length) {
    alert("Please select at least one slot.");
    return;
  }


  try {
    await Promise.all(
      selected.map(async (slot) => {
        if (!slot.slotId) {
          console.warn("⚠️ Slot missing id, skipping...");
          return;
        }

        await updateStatusMut.mutateAsync({
          slotId: slot.slotId,
          status,
          club: CLUB_ID,
          month: CURRENT_MONTH,
        });
      })
    );

  } catch (error) {
    console.error("❌ Update slot failed:", error);
    alert("❌ Some slots failed to update. Please check the console for details.");
  } finally {
    setSelected([]);
  }
}


  // ======================= UI ==========================
  return (
    <div className="mx-auto my-auto">
      {/* ===== Header ===== */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold tracking-tight text-pine">
          Manage Court Slots
        </h1>
        <p className="text-sm font-semibold tracking-tight text-dimgray">
          Select slots to mark as Maintenance or Walk-in.
        </p>
      </div>

      {/* ===== Controls ===== */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <DateNavigator
          value={dayjs(ymd).toDate()}
          onChange={(d) => setYmd(dayjs(d).format("YYYY-MM-DD"))}
          minDate={dayjs("2025-01-01").toDate()}
          maxDate={dayjs("2100-12-31").toDate()}
        />
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleSetStatus("maintenance")}
            className="rounded-xl bg-maintenance hover:bg-[var(--color-maintenance)]/50 text-white px-4 py-2 text-sm font-semibold transition-all disabled:opacity-40"
            disabled={!selected.length || updateStatusMut.isPending}
          >
            Set as Maintenance
          </button>
          <button
            onClick={() => handleSetStatus("walkin")}
            className="rounded-xl bg-walkin hover:bg-[var(--color-walkin)]/50 text-white px-4 py-2 text-sm font-semibold transition-all disabled:opacity-40"
            disabled={!selected.length || updateStatusMut.isPending}
          >
            Book Walk-in
          </button>
        </div>
      </div>

      {/* ===== Slot Grid ===== */}
      <SlotGridManager
        cols={cols as Col[]}
        grid={grid}
        courtNames={courtNames}
        currentDate={ymd}
        selected={selected}
        onToggle={toggleSelect}
      />

    </div>
  );
}
