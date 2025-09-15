// src/ui/components/basic/CourtNumberHero.tsx
"use client";

import React from "react";

type CourtNumberHeroProps = {
  /** หมายเลขคอร์ทที่จะแสดง */
  court: number | string;
  /** ใช้กำหนดขนาดเอง (กว้าง) ถ้า fitRowHeight=false */
  size?: number;
  /** คลาสเสริม */
  className?: string;
  /** ไฮไลต์เมื่อ active */
  active?: boolean;
  /** คำใน aria-label เช่น "Court" / "สนาม" */
  labelWord?: string;
  /** ให้ฟิตสูงเท่ากับความสูงแถว (40px) อัตโนมัติ */
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
  // ความสูงแถวของช่องเวลาในกริด (Tailwind h-10 = 40px)
  const ROW_H = 40;

  // ถ้า fitRowHeight = true จะฟิตสูง 40px อัตโนมัติ
  const h = fitRowHeight ? ROW_H : Math.round(size * 0.62);

  // อัตราส่วนของแผ่นคอร์ทจากงานวาด (154x92)
  const RATIO = 154 / 92;
  const w = Math.round(h * RATIO);

  // ขนาดเหรียญตัวเลข อ้างอิงจากความกว้าง
  const badge = Math.max(20, Math.round(w * 0.28));

  return (
    <div
      className={[
        "relative inline-block select-none overflow-visible shrink-0",
        active ? "drop-shadow-[0_4px_12px_rgba(16,95,70,0.28)]" : "",
        className,
      ].join(" ")}
      role="img"
      aria-label={`${labelWord} ${court}`}
      style={{ width: w, height: h }}
    >
      {/* แผ่นคอร์ท (พอดี viewBox; ไม่มีเงาทิ้งด้านหลังเพื่อไม่ให้เกินแถว) */}
      <svg
        width={w}
        height={h}
        viewBox="0 0 154 92"
        preserveAspectRatio="xMidYMid meet"
        className="block"
        aria-hidden="true"
      >
        {/* พื้นคอร์ท */}
        <rect x="0" y="0" width="154" height="92" rx="10" fill="#2a6e63" />
        {/* ขอบคอร์ท */}
        <rect
          x="6"
          y="6"
          width="142"
          height="80"
          rx="8"
          fill="#2f7d70"
          stroke="#e7f5f0"
          strokeWidth="3"
        />
        {/* เส้นแบ่งครึ่ง */}
        <line x1="77" y1="6" x2="77" y2="86" stroke="#e7f5f0" strokeWidth="3" />
        {/* เส้น service box */}
        <line x1="6" y1="28" x2="148" y2="28" stroke="#e7f5f0" strokeWidth="2" />
        <line x1="6" y1="64" x2="148" y2="64" stroke="#e7f5f0" strokeWidth="2" />
      </svg>

      {/* เหรียญเลข (กึ่งกลางคอร์ท) */}
      <div
        className={[
          "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",
          "grid place-items-center rounded-full border font-bold shadow-sm",
          "pointer-events-none",
          active
            ? "bg-white text-emerald-900 border-emerald-200"
            : "bg-neutral-50 text-neutral-900 border-neutral-300",
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
