// src/ui/components/bookingpage/TimeHeaderRow.tsx
"use client";

import React from "react";

type TimeHeaderRowProps = {
  hours: readonly string[] | string[];
  /** ความกว้างคอลัมน์แรก (label “Time”) เป็น px */
  firstColWidth?: number; // default 120
  /** ทำหัวตาราง sticky ไว้ด้านบนของ card */
  sticky?: boolean;
  className?: string;
};

export default function TimeHeaderRow({
  hours,
  firstColWidth = 120,
  sticky = false,
  className = "",
}: TimeHeaderRowProps) {
  return (
    <div
      className={[
        "grid",
        sticky ? "sticky top-0 z-10 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60" : "",
        className,
      ].join(" ")}
      style={{ gridTemplateColumns: `${firstColWidth}px repeat(${hours.length}, 1fr)` }}
    >
      <div className="px-3 py-2 text-sm font-bold text-onyx">Time</div>
      {hours.map((h) => (
        <div
          key={h}
          className="px-2 py-2 text-center text-[12px] font-semibold text-neutral-600"
        >
          {h}
        </div>
      ))}
    </div>
  );
}
