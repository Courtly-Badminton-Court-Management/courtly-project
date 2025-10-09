// src/ui/components/bookingpage/SlotGrid.tsx
"use client";

import React, { useMemo } from "react";
import CourtNumberHero from "@/ui/components/bookingpage/CourtNumberHero";
import type { Col, GridCell, SelectedSlot, SlotStatus } from "@/lib/booking/model";
import { getCellPriceCoins } from "@/lib/booking/pricing";

/* =========================================================================
   Utils
   ========================================================================= */
function strToMin(hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
}

function makeHourBands(cols: Col[]) {
  const bands: { label: string; span: number }[] = [];
  let i = 0;
  while (i < cols.length) {
    const startMin = strToMin(cols[i].start);
    const hour = Math.floor(startMin / 60);
    let span = 0;
    while (i + span < cols.length && Math.floor(strToMin(cols[i + span].start) / 60) === hour) {
      span++;
    }
    const label = `${String(hour).padStart(2, "0")}:00 - ${String(hour + 1).padStart(2, "0")}:00`;
    bands.push({ label, span });
    i += span;
  }
  return bands;
}

const cx = (...xs: (string | false | null | undefined)[]) => xs.filter(Boolean).join(" ");

/** กลุ่มสีสำหรับฝั่ง Player */
type PlayerGroup = "available" | "bookedLike" | "maintenance" | "ended";

/** map สถานะจริง → กลุ่มสีที่ผู้เล่นเห็น */
function normalizeForPlayer(status: SlotStatus): PlayerGroup {
  if (status === "available") return "available";
  if (status === "maintenance") return "maintenance";
  if (status === "booked" || status === "walkin" || status === "checkin") return "bookedLike";
  return "ended"; // endgame / expired / noshow
}

/* =========================================================================
   Props
   ========================================================================= */
type Props = {
  cols: Col[];
  grid: GridCell[][];
  courtNames: string[];
  selected: SelectedSlot[];
  onToggle: (courtRow: number, colIdx: number) => void;
};

/* =========================================================================
   Component
   ========================================================================= */
export default function SlotGrid({ cols, grid, courtNames, selected, onToggle }: Props) {
  const hourBands = useMemo(() => makeHourBands(cols), [cols]);

  // สีจาก globals.css (Tailwind CSS variables)
  const styleByGroup: Record<PlayerGroup, string> = {
    available:
      "bg-[var(--color-available)] text-[var(--color-walnut)] border border-[var(--color-walnut)]/30 hover:bg-[var(--color-available)]/80",
    bookedLike: "bg-[var(--color-booked)] text-white",
    maintenance: "bg-[var(--color-maintenance)] text-white",
    ended: "bg-[var(--color-expired)] text-[var(--color-walnut)]",
  };

  const selectedStyle =
    "bg-[var(--color-pine)] text-white ring-2 ring-[var(--color-sea)]/40 hover:opacity-95";

  const pricePerSlot = getCellPriceCoins();

  return (
    <div className="relative rounded-2xl border border-neutral-200 bg-white p-3 shadow-sm">
      {/* Header Row */}
      <div className="px-3 py-2 text-sm font-bold text-neutral-700">Time</div>

      {/* Top header: time bands */}
      <div className="grid" style={{ gridTemplateColumns: `160px repeat(${cols.length}, 1fr)` }}>
        <div /> {/* Empty corner cell */}
        {hourBands.map((b, i) => (
          <div
            key={i}
            className="px-1 py-1 flex items-center justify-center"
            style={{ gridColumn: `span ${b.span} / span ${b.span}` }}
          >
            <div className="whitespace-nowrap tabular-nums rounded-md border border-neutral-200 bg-neutral-100 px-2 py-[2px] text-[10px] font-semibold text-neutral-600">
              {b.label}
            </div>
          </div>
        ))}
      </div>

      {/* Grid rows */}
      <div className="mt-1">
        {grid.map((row, rIdx) => (
          <div
            key={rIdx}
            className="grid border-t border-neutral-100"
            style={{ gridTemplateColumns: `160px repeat(${cols.length}, 1fr)` }}
          >
            {/* Court label cell */}
            <div className="flex items-center gap-2 px-3 py-2">
              <CourtNumberHero
                court={rIdx + 1}
                size={72}
                active={selected.some((s) => s.courtRow === rIdx + 1)}
                labelWord={courtNames[rIdx] ?? "Court"}
                className="shrink-0"
              />
              <div className="text-sm font-semibold text-neutral-700">
                {courtNames[rIdx]}
              </div>
            </div>

            {/* Time cells */}
            {row.map((cell, cIdx) => {
              const group = normalizeForPlayer(cell.status);
              const isSelected =
                selected.some(
                  (s) => s.courtRow === rIdx + 1 && s.colIdx === cIdx
                ) && cell.status === "available";
              const disabled = cell.status !== "available";

              const title =
                group === "available"
                  ? `Available • ${pricePerSlot} coins (30 min)`
                  : group === "bookedLike"
                  ? "Booked"
                  : group === "maintenance"
                  ? "Maintenance"
                  : "Ended";

              return (
                <button
                  key={cIdx}
                  className={cx(
                    "h-10 m-[3px] rounded-[4px] grid place-items-center text-xs font-semibold transition-colors",
                    isSelected ? selectedStyle : styleByGroup[group],
                    disabled && "cursor-not-allowed"
                  )}
                  onClick={() => onToggle(rIdx + 1, cIdx)}
                  disabled={disabled}
                  aria-label={`${courtNames[rIdx]} ${cols[cIdx]?.label} ${title}`}
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
  );
}
