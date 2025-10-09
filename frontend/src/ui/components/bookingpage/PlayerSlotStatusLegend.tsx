"use client";

import React from "react";

/**
 * Player-side Legend (horizontal bar style)
 * Shows color box + label inline.
 * Groups statuses into 4 categories:
 * - Available (white)
 * - Booked / Walk-in / Check-in (red)
 * - Maintenance (brown-grey)
 * - Ended (auto): Endgame / Expired / No-show (grey)
 */
const ITEMS = [
  {
    key: "available",
    label: "Available",
    color: "bg-[var(--color-available)] border border-[var(--color-walnut)]/40",
  },
  {
    key: "booked",
    label: "Booked",
    color: "bg-[var(--color-booked)]",
  },
  {
    key: "maintenance",
    label: "Maintenance",
    color: "bg-[var(--color-maintenance)]",
  },
  {
    key: "ended",
    label: "Ended",
    color: "bg-[var(--color-expired)]",
  },
];

export default function PlayerSlotStatusLegendBar({
  className = "",
}: {
  className?: string;
}) {
  return (
    <div
      className={`flex flex-wrap items-center gap-x-8 gap-y-3 text-[15px] text-[var(--color-walnut)] ${className}`}
    >
      {ITEMS.map((item) => (
        <div key={item.key} className="flex items-center gap-2">
          <span
            className={`h-5 w-5 rounded-sm shadow-sm ${item.color}`}
            aria-label={item.label}
          />
          <span className="font-medium">{item.label}</span>
        </div>
      ))}
    </div>
  );
}
