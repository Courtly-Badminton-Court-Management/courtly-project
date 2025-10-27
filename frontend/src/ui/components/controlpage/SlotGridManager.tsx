"use client";

import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import { motion, AnimatePresence } from "framer-motion";
import CourtNumberHero from "@/ui/components/bookingpage/CourtNumberHero";
import type { Col, GridCell, SelectedSlot } from "@/lib/slot/slotGridModel";

/* ====================== Utilities ====================== */
const cx = (...xs: (string | false | null | undefined)[]) =>
  xs.filter(Boolean).join(" ");

function readStatus(cell: GridCell): string {
  return String((cell as any)?.status ?? "").trim().toLowerCase();
}

type ManagerGroup =
  | "available"
  | "booked"
  | "walkin"
  | "checkin"
  | "maintenance"
  | "ended";

function normalizeForManager(statusRaw: string): ManagerGroup {
  const status = (statusRaw || "").toLowerCase();
  if (status === "available") return "available";
  if (status === "booked") return "booked";
  if (status === "walkin") return "walkin";
  if (status === "checkin") return "checkin";
  if (status === "maintenance") return "maintenance";
  if (["expired", "endgame", "no_show"].includes(status)) return "ended";
  return "ended";
}

/* ====================== Props ====================== */
type Props = {
  cols: Col[];
  grid: GridCell[][];
  courtNames: string[];
  currentDate: string;
  selected: SelectedSlot[];
  selectionMode: "available" | "maintenance" | null;
  setSelectionMode: (v: "available" | "maintenance" | null) => void;
  onToggle: (courtRow: number, colIdx: number, slotId?: string) => void;
  clearSelection: () => void;
};

/* ====================== Component ====================== */
export default function SlotGridManager({
  cols,
  grid,
  courtNames,
  currentDate,
  selected,
  selectionMode,
  setSelectionMode,
  onToggle,
  clearSelection,
}: Props) {
  const [, setNowTick] = useState(Date.now());
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setNowTick(Date.now()), 60000);
    return () => clearInterval(timer);
  }, []);

  if (!cols?.length || !grid?.length) {
    return (
      <div className="rounded-2xl border border-neutral-200 bg-white p-6 text-sm text-neutral-600">
        No slots for this day (or failed to load). Try a different date.
      </div>
    );
  }

  /* ====================== Styles ====================== */
  const styleByManager: Record<ManagerGroup | "pastAvailable", string> = {
    available:
      "bg-[var(--color-available)] text-[var(--color-walnut)] border border-[var(--color-walnut)]/30 hover:bg-[var(--color-sea)]/30 hover:scale-[1.02] cursor-pointer transition-all duration-150 ease-out",
    booked: "bg-[var(--color-booked)] text-white cursor-not-allowed",
    walkin: "bg-[var(--color-walkin)] text-white cursor-not-allowed",
    checkin: "bg-[var(--color-checkin)] text-white cursor-not-allowed",
    maintenance:
      "bg-[var(--color-maintenance)] text-white hover:scale-[1.02] cursor-pointer transition-all",
    ended:
      "bg-[var(--color-expired)] text-[var(--color-walnut)] cursor-not-allowed",
    pastAvailable:
      "bg-[var(--color-walnut)]/15 text-[var(--color-walnut)] border border-[var(--color-walnut)]/10 cursor-not-allowed opacity-80",
  };

  const selectedStyle =
    "bg-[var(--color-sea)] text-white ring-2 ring-[var(--color-sea)]/40 hover:ring-[var(--color-sea)] cursor-pointer transition-all duration-150 ease-out";

  const gridTemplate = {
    gridTemplateColumns: `clamp(90px, 18vw, 160px) repeat(${cols.length}, 1fr)`,
  };

  const todayStr = dayjs().format("YYYY-MM-DD");
  const isToday = todayStr === currentDate;

  /* ====================== Helpers ====================== */
  const isColumnSelected = (colIdx: number) =>
    selected.some((s) => s.colIdx === colIdx);

  /* ====================== Core Click Logic ====================== */
  function handleCellClick(rIdx: number, cIdx: number, slotId?: string) {
    const cell = grid[rIdx][cIdx];
    const group = normalizeForManager(readStatus(cell));

    if (group !== "available" && group !== "maintenance") return;

    // ถ้าคลิกข้าม status → ล้าง selection แล้วตั้งโหมดใหม่
    if (selectionMode && selectionMode !== group && selected.length > 0) {
      clearSelection();
      setSelectionMode(group);
      onToggle(rIdx + 1, cIdx, slotId);
      return;
    }

    // ถ้ายังไม่มีโหมด → เซ็ตใหม่
    if (!selectionMode) setSelectionMode(group);

    onToggle(rIdx + 1, cIdx, slotId);
  }

  /* ====================== Bulk Select: Row / Column / All ====================== */
  function selectRow(rIdx: number) {
    const row = grid[rIdx];
    const target = selectionMode || "available";

    // ตรวจว่ามี status ตรงข้ามอยู่มั้ย
    if (selected.length > 0 && selectionMode && selectionMode !== target) {
      clearSelection();
      setSelectionMode(target);
    }

    row.forEach((cell, cIdx) => {
      const group = normalizeForManager(readStatus(cell));
      if (group === target) {
        const slotId = (cell as any)?.id;
        onToggle(rIdx + 1, cIdx, slotId);
      }
    });
  }

  function selectColumn(cIdx: number) {
    const target = selectionMode || "available";

    if (selected.length > 0 && selectionMode && selectionMode !== target) {
      clearSelection();
      setSelectionMode(target);
    }

    grid.forEach((row, rIdx) => {
      const group = normalizeForManager(readStatus(row[cIdx]));
      if (group === target) {
        const slotId = (row[cIdx] as any)?.id;
        onToggle(rIdx + 1, cIdx, slotId);
      }
    });
  }

  function selectAll() {
    const target = selectionMode || "available";

    if (selected.length > 0 && selectionMode && selectionMode !== target) {
      clearSelection();
      setSelectionMode(target);
    }

    grid.forEach((row, rIdx) =>
      row.forEach((cell, cIdx) => {
        const group = normalizeForManager(readStatus(cell));
        if (group === target) {
          const slotId = (cell as any)?.id;
          onToggle(rIdx + 1, cIdx, slotId);
        }
      })
    );
  }

  /* ====================== Render ====================== */
  return (
    <div className="relative rounded-2xl border border-neutral-200 bg-white p-3 shadow-sm">
      <div className="overflow-x-auto">
        <div className="min-w-max">
          {/* ===== Header ===== */}
          <div
            className="grid border-b border-neutral-100 pb-1"
            style={gridTemplate}
          >
            <button
              onClick={selectAll}
              className="sticky left-0 z-20 bg-white px-3 py-2 text-sm font-bold text-neutral-700 hover:bg-[#EDF2EF] transition rounded-lg"
              title="Select all slots"
            >
              Court / Time
            </button>

            {cols.map((col, i) => {
              const active = isColumnSelected(i);
              return (
                <button
                  key={i}
                  onClick={() => selectColumn(i)}
                  className={cx(
                    "mx-1 my-1 flex flex-col items-center justify-center rounded-md px-2 py-1 text-[11px] font-medium tabular-nums text-center transition-colors",
                    active
                      ? "bg-[var(--color-sea)] text-white border-[var(--color-sea)]"
                      : "bg-neutral-100 text-neutral-700 hover:bg-[var(--color-sea)]/10"
                  )}
                  title={`Select all courts at ${col.start}-${col.end}`}
                >
                  <span>{col.start}</span>
                  <span className="text-[10px] opacity-70">→ {col.end}</span>
                </button>
              );
            })}
          </div>

          {/* ===== Rows ===== */}
          <div className="mt-1">
            {grid.map((row, rIdx) => (
              <div key={rIdx} className="grid" style={gridTemplate}>
                {/* Court Label */}
                <button
                  onClick={() => selectRow(rIdx)}
                  className="sticky left-0 z-5 bg-white flex items-center gap-2 px-2 sm:px-3 py-2 hover:bg-[#EDF2EF] transition rounded-lg"
                  title={`Select all slots in ${courtNames[rIdx]}`}
                >
                  <CourtNumberHero
                    court={rIdx + 1}
                    size={64}
                    active={selected.some((s) => s.courtRow === rIdx + 1)}
                    labelWord={courtNames[rIdx] ?? "Court"}
                    className="shrink-0"
                  />
                  <div className="hidden sm:block text-sm font-semibold text-neutral-700">
                    {courtNames[rIdx]}
                  </div>
                </button>

                {/* Cells */}
                {row.map((cell, cIdx) => {
                  const rawStatus = readStatus(cell);
                  const group = normalizeForManager(rawStatus);
                  const slotId = (cell as any)?.id;

                  const isSelected = selected.some(
                    (s) => s.courtRow === rIdx + 1 && s.colIdx === cIdx
                  );

                  const slotStart = dayjs(
                    `${currentDate} ${cols[cIdx].start}`,
                    "YYYY-MM-DD HH:mm"
                  );
                  const isPast = isToday && dayjs().isAfter(slotStart);
                  const isPastAvailable = isPast && group === "available";

                  return (
                    <button
                      key={cIdx}
                      className={cx(
                        "m-[3px] grid h-10 place-items-center rounded-[4px] text-xs font-semibold transition-transform duration-150 ease-out",
                        isSelected
                          ? selectedStyle
                          : isPastAvailable
                          ? styleByManager["pastAvailable"]
                          : styleByManager[group]
                      )}
                      onClick={() => handleCellClick(rIdx, cIdx, slotId)}
                      disabled={isPastAvailable}
                      title={group}
                    >
                      {isSelected ? "✓" : ""}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ===== Error Modal ===== */}
      <AnimatePresence>
        {errorMsg && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white rounded-2xl shadow-lg p-6 max-w-sm text-center"
            >
              <h2 className="text-lg font-semibold text-red-600 mb-2">
                Selection not allowed
              </h2>
              <p className="text-sm text-neutral-700 mb-4">{errorMsg}</p>
              <button
                onClick={() => setErrorMsg(null)}
                className="px-4 py-1.5 bg-pine text-white rounded-lg text-sm font-semibold hover:bg-pine/80"
              >
                OK
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
