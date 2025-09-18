// src/ui/components/basic/CourtNumberHero.tsx
"use client";

import React from "react";

type CourtNumberHeroProps = {
  court: number | string;
  size?: number;
  className?: string;
  active?: boolean;
  labelWord?: string;
  fitRowHeight?: boolean;
};

export default function CourtNumberHero({
  court,
  size = 72,
  className = "",
  active = false,
  labelWord = "Court",
  fitRowHeight = true,
}: CourtNumberHeroProps) {
  const ROW_H = 40;
  const h = fitRowHeight ? ROW_H : Math.round(size * 0.62);
  const RATIO = 154 / 92;
  const w = Math.round(h * RATIO);
  const badge = Math.max(20, Math.round(w * 0.28));

  // ใช้สีสนามให้สว่างขึ้นเมื่อ active
  const innerFill = active ? "var(--color-sea)" : "var(--color-pine)";

  return (
    <div
      className={[
        "relative inline-block select-none overflow-visible shrink-0",
        active ? "drop-shadow-[0_8px_30px_var(--tw-shadow-color)] shadow-[var(--box-shadow-soft)]" : "",
        className,
      ].join(" ")}
      role="img"
      aria-label={`${labelWord} ${court}`}
      style={{ width: w, height: h }}
    >
      <svg
        width={w}
        height={h}
        viewBox="0 0 154 92"
        preserveAspectRatio="xMidYMid meet"
        className="block"
        aria-hidden="true"
      >
        {/* แผ่นพื้นหลังโทนเข้ม/ขอบนอกโค้ง */}
        <rect x="0" y="0" width="154" height="92" rx="10" fill="var(--color-court-deep)" />

        {/* พื้นด้านใน + ขอบสีควัน (มุม 'เหลี่ยม' ตามที่ต้องการ) */}
        <rect
          x="6"
          y="6"
          width="142"
          height="80"
          rx="2" /* ← เปลี่ยนเป็นเหลี่ยม */
          fill={innerFill}
          stroke="var(--color-smoke)"
          strokeWidth="2"
          style={{ transition: "fill .2s ease" }}
        />

        {/* เส้นกลางสนาม */}
        <line x1="77" y1="6" x2="77" y2="86" stroke="var(--color-smoke)" strokeWidth="3" />

        {/* เส้น service (แนวนอน 2 เส้น) */}
        <line x1="6" y1="28" x2="148" y2="28" stroke="var(--color-smoke)" strokeWidth="2" />
        <line x1="6" y1="64" x2="148" y2="64" stroke="var(--color-smoke)" strokeWidth="2" />

        {/* เส้นตรงปลายสนามสองฝั่ง (แนวตั้งด้านในกรอบ) */}
        <line x1="20" y1="6" x2="20" y2="86" stroke="var(--color-smoke)" strokeWidth="2" />
        <line x1="134" y1="6" x2="134" y2="86" stroke="var(--color-smoke)" strokeWidth="2" />
      </svg>

      {/* เหรียญเลขกึ่งกลางสนาม */}
      <div
        className={[
          "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",
          "grid place-items-center rounded-full border font-bold shadow-sm",
          "pointer-events-none",
          active ? "bg-white text-pine border-cambridge" : "bg-smoke text-onyx border-dimgray",
        ].join(" ")}
        style={{
          width: badge,
          height: badge,
          fontSize: Math.max(12, Math.round(badge * 0.48)),
        }}
      >
        {court}
      </div>
    </div>
  );
}
