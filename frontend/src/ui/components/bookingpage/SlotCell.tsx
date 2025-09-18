// src/ui/components/bookingpage/SlotCell.tsx
"use client";

import React from "react";

type Status = "available" | "booked" | "walkin" | "endgame" | "maintenance";

function cx(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(" ");
}

type SlotCellProps = {
  status: Status;
  selected?: boolean;
  onClick?: () => void;
  /** ใช้สำหรับ aria-label เช่น "Court 3 14:00 - 15:00" */
  label?: string;
};

export default function SlotCell({
  status,
  selected = false,
  onClick,
  label,
}: SlotCellProps) {
  const base =
    "h-10 m-[3px] rounded-[4px] grid place-items-center text-xs font-semibold transition-colors";

  // mapping เดิม (คงโทนสีให้เหมือนเดิม)
  const styleByStatus: Record<Status, string> = {
    available: "bg-white border border-neutral-200 hover:bg-neutral-50",
    booked: "bg-rose-900/70 text-white",
    walkin: "bg-amber-700/70 text-white",
    endgame: "bg-orange-400/70 text-white",
    maintenance: "bg-neutral-400/60 text-white",
  };

  // ใช้ธีมตอน selected
  const selectedStyle =
    "bg-pine hover:bg-sea text-white ring-2 ring-pine/40";

  const isDisabled = status !== "available" && !selected;

  return (
    <button
      type="button"
      className={cx(base, selected ? selectedStyle : styleByStatus[status])}
      onClick={onClick}
      disabled={isDisabled}
      aria-label={label}
      aria-pressed={selected}
    >
      {selected ? "✓" : ""}
    </button>
  );
}
