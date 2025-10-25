// src/ui/components/bookingpage/SlotGrid.tsx
"use client";

import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import CourtNumberHero from "@/ui/components/bookingpage/CourtNumberHero";
import type { Col, GridCell, SelectedSlot } from "@/lib/booking/slotGridModel";

/* =========================================================================
   Utils
   ========================================================================= */
function strToMin(hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
}

const cx = (...xs: (string | false | null | undefined)[]) =>
  xs.filter(Boolean).join(" ");

function readStatus(cell: GridCell): string {
  return String((cell as any)?.status ?? "").trim().toLowerCase();
}

type PlayerGroup = "available" | "bookedLike" | "maintenance" | "ended";

function normalizeForPlayer(statusRaw: string): PlayerGroup {
  const status = (statusRaw || "").toLowerCase();
  if (status === "available") return "available";
  if (status === "maintenance") return "maintenance";
  if (["expired", "endgame", "no_show"].includes(status)) return "ended";
  if (["booked", "walkin", "checkin"].includes(status)) return "bookedLike";
  return "ended";
}

/* =========================================================================
   Component
   ========================================================================= */
type Props = {
  cols: Col[];
  grid: GridCell[][];
  courtNames: string[];
  selected: SelectedSlot[];
  onToggle: (courtRow: number, colIdx: number) => void;
  currentDate: string; // YYYY-MM-DD
};

export default function SlotGrid({
  cols,
  grid,
  courtNames,
  selected,
  onToggle,
  currentDate,
}: Props) {
  const [, setNowTick] = useState(Date.now());
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

  const selectedColIdxSet = new Set(selected.map((s) => s.colIdx));

  const styleByGroup: Record<PlayerGroup | "pastAvailable", string> = {
    available:
      "bg-[var(--color-available)] text-[var(--color-walnut)] border border-[var(--color-walnut)]/30 hover:bg-[var(--color-sea)]/30 hover:border-[var(--color-sea)]/30 hover:scale-[1.02] cursor-pointer transition-all duration-150 ease-out",
    bookedLike:
      "bg-[var(--color-booked)] text-white border border-[var(--color-walnut)]/30 cursor-not-allowed",
    maintenance:
      "bg-[var(--color-maintenance)] text-white cursor-not-allowed",
    ended:
      "bg-[var(--color-expired)] text-[var(--color-walnut)] cursor-not-allowed",
    pastAvailable:
      "bg-[var(--color-walnut)]/15 text-[var(--color-walnut)] border border-[var(--color-walnut)]/30 cursor-not-allowed opacity-80 transition-colors duration-300",
  };

  const selectedStyle =
    "bg-[var(--color-sea)] text-white ring-2 ring-[var(--color-sea)]/40 hover:ring-[var(--color-sea)] cursor-pointer transition-all duration-150 ease-out";

  const gridTemplate = {
    gridTemplateColumns: `clamp(90px, 18vw, 160px) repeat(${cols.length}, 1fr)`,
  };

  const todayStr = dayjs().format("YYYY-MM-DD");
  const isToday = todayStr === currentDate;

  return (
    <div className="relative rounded-2xl border border-neutral-200 bg-white p-3 shadow-sm">
      <div className="overflow-x-auto">
        <div className="min-w-max">
          {/* Header */}
          <div
            className="grid border-b border-neutral-100 pb-1"
            style={gridTemplate}
          >
            <div className="sticky left-0 z-20 bg-white px-3 py-2 text-sm font-bold text-neutral-700">
              Court / Time
            </div>
            {cols.map((col, i) => (
              <div
                key={i}
                className={cx(
                  "mx-1 my-1 flex flex-col items-center justify-center rounded-md border px-2 py-1 text-[11px] font-medium tabular-nums text-center transition-colors",
                  selectedColIdxSet.has(i)
                    ? "bg-[var(--color-sea)] text-white border-[var(--color-pine)]"
                    : "bg-neutral-100 text-neutral-600 border-transparent"
                )}
                title={`${col.start} - ${col.end}`}
              >
                <span>{col.start}</span>
                <span className="text-[10px] opacity-70">→ {col.end}</span>
              </div>
            ))}
          </div>

          {/* Rows */}
          <div className="mt-1">
            {grid.map((row, rIdx) => (
              <div key={rIdx} className="grid" style={gridTemplate}>
                {/* Court label */}
                <div className="sticky left-0 z-5 bg-white flex items-center gap-2 px-2 sm:px-3 py-2">
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
                </div>

                {/* Cells */}
                {row.map((cell, cIdx) => {
                  const rawStatus = readStatus(cell);
                  const group = normalizeForPlayer(rawStatus);
                  const isSelected =
                    group === "available" &&
                    selected.some(
                      (s) => s.courtRow === rIdx + 1 && s.colIdx === cIdx
                    );
                  const disabled = group !== "available";

                  let isPast = false;
                  if (isToday && group === "available") {
                    const slotStart = dayjs(
                      `${currentDate} ${cols[cIdx].start}`,
                      "YYYY-MM-DD HH:mm"
                    );
                    isPast = dayjs().isAfter(slotStart);
                  }

                  const title =
                    isPast
                      ? "Time passed"
                      : group === "available"
                      ? `${cols[cIdx].start}–${cols[cIdx].end} | Click to select`
                      : group === "bookedLike"
                      ? "Already booked"
                      : group === "maintenance"
                      ? "Under maintenance"
                      : "Ended";

                  return (
                    <button
                      key={cIdx}
                      className={cx(
                        "m-[3px] grid h-10 place-items-center rounded-[4px] text-xs font-semibold transition-transform duration-150 ease-out",
                        isSelected
                          ? selectedStyle
                          : isPast
                          ? styleByGroup["pastAvailable"]
                          : styleByGroup[group]
                      )}
                      onClick={() => {
                        if (disabled || isPast) return;
                        onToggle(rIdx + 1, cIdx);
                      }}
                      disabled={disabled || isPast}
                      aria-disabled={disabled || isPast}
                      title={title}
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
    </div>
  );
}
