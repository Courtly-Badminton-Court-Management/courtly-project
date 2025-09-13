// /ui/components/slots/CourtChip.tsx
"use client";

import React from "react";
import type { Court } from "./types";

export function CourtChip({
  court,
  selected,
  onToggle,
  disabled,
}: {
  court: Court;
  selected?: boolean;
  disabled?: boolean;
  onToggle?: (court: Court) => void;
}) {
  const base = "text-xs px-2 py-1 rounded-full border transition-colors whitespace-nowrap";
  const palette = disabled
    ? "border-slate-300 bg-slate-100 text-slate-400 cursor-not-allowed"
    : selected
    ? "border-emerald-600 bg-emerald-600 text-white"
    : "border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100";

  return (
    <button
      type="button"
      className={`${base} ${palette}`}
      onClick={() => !disabled && onToggle?.(court)}
      disabled={disabled}
      aria-pressed={!!selected}
      title={disabled ? "Unavailable" : court.label}
    >
      {court.label}
    </button>
  );
}