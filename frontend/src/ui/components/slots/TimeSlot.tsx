"use client";

import React from "react";
import type { Slot, Court } from "./types";

export function TimeSlot({
  slot,
  withDivider = false,
  // for backward compat; not used in read-only view
  selectedCourtIds,
  onToggleCourt,
}: {
  slot: Slot;
  withDivider?: boolean;
  selectedCourtIds?: Set<string>;
  onToggleCourt?: (slotId: string, court: Court) => void;
}) {
  return (
    <div className={`px-4 py-3 ${withDivider ? "border-t border-platinum" : ""}`}>
      <div className="text-sm font-extrabold tracking-wide text-onyx mb-3">
        {slot.time.replace("-", "–").toUpperCase()}
      </div>
      <div className="flex flex-wrap gap-3">
        {slot.courts.map((c) => (
          <span
            key={c.id}
            className="text-sm px-4 py-2 rounded-xl border bg-pine border-pine text-white shadow-sm"
          >
            {c.label}
          </span>
        ))}
      </div>
    </div>
  );
}