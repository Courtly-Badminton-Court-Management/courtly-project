// src/ui/components/basic/CourtNumberHero.tsx
"use client";

import React from "react";

type CourtNumberHeroProps = {
  /** หมายเลขคอร์ทที่จะแสดง */
  court: number | string;
  /** ความกว้าง/สูงไอคอน (px) — ด้านสั้นจะสเกลตาม */
  size?: number;
  /** ใส่คลาสเสริมได้ (เช่น mr-2) */
  className?: string;
  /** โหมดไฮไลต์ (เช่น เมื่อเลือกอยู่) */
  active?: boolean;
  /** แทนคำว่าคอร์ทใน aria-label (เช่น "สนาม" หรือ "Court") */
  labelWord?: string;
};

export default function CourtNumberHero({
  court,
  size = 72,
  className = "",
  active = false,
  labelWord = "Court",
}: CourtNumberHeroProps) {
  const w = size;
  const h = Math.round(size * 0.62); // อัตราส่วนคล้ายการ์ดคอร์ท
  const badge = Math.max(22, Math.round(size * 0.28)); // ขนาดเหรียญเลข

  return (
    <div
      className={[
        "relative inline-block select-none",
        active ? "drop-shadow-[0_4px_14px_rgba(16,95,70,0.35)]" : "",
        className,
      ].join(" ")}
      role="img"
      aria-label={`${labelWord} ${court}`}
      style={{ width: w, height: h }}
    >
      {/* แผ่นคอร์ท */}
      <svg
        width={w}
        height={h}
        viewBox="0 0 160 100"
        className="block"
        aria-hidden
      >
        {/* เงาบาง ๆ ให้ดูเป็นวัตถุ */}
        <rect x="3" y="6" width="154" height="92" rx="10" fill="rgba(0,0,0,0.06)" />
        {/* พื้นคอร์ท */}
        <rect x="0" y="0" width="154" height="92" rx="10" fill="#2a6e63" />
        {/* เส้นขอบคอร์ท */}
        <rect x="6" y="6" width="142" height="80" rx="8" fill="#2f7d70" stroke="#e7f5f0" strokeWidth="3" />
        {/* เส้นแบ่งครึ่ง */}
        <line x1="77" y1="6" x2="77" y2="86" stroke="#e7f5f0" strokeWidth="3" />
        {/* เส้น service box ง่าย ๆ */}
        <line x1="6" y1="28" x2="148" y2="28" stroke="#e7f5f0" strokeWidth="2" opacity="0.9" />
        <line x1="6" y1="64" x2="148" y2="64" stroke="#e7f5f0" strokeWidth="2" opacity="0.9" />
      </svg>

      {/* เหรียญเลข (ลอยด้านซ้าย) */}
      <div
        className={[
          "absolute -left-2 top-1/2 -translate-y-1/2 grid place-items-center",
          "rounded-full border font-bold",
          active
            ? "bg-white text-emerald-900 border-emerald-200"
            : "bg-neutral-50 text-neutral-900 border-neutral-300",
        ].join(" ")}
        style={{ width: badge, height: badge, fontSize: Math.max(12, Math.round(badge * 0.5)) }}
      >
        {court}
      </div>
    </div>
  );
}
