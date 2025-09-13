// src/ui/components/basic/AvatarBlock.tsx
"use client";

import Image from "next/image";
import React from "react";

type AvatarBlockProps = {
  name?: string | null;
  avatarUrl?: string | null;
  loading?: boolean;
  /** px size of avatar circle (default 32px) */
  size?: number;
  /** quick theme for fallback chip */
  variant?: "neutral" | "emerald";
  /** show name text */
  showName?: boolean;
  /**
   * collapse name on small screens by adding "hidden sm:inline".
   * Default: false (always show)
   */
  collapseOnSmall?: boolean;
  /** override ring classes if needed (e.g., 'ring-emerald-100') */
  ringClassName?: string;
  /** extra wrapper class */
  className?: string;
};

export default function AvatarBlock({
  name = "—",
  avatarUrl = null,
  loading = false,
  size = 32,
  variant = "neutral",
  showName = true,
  collapseOnSmall = false, // ← เปลี่ยนดีฟอลต์ให้ “ไม่ซ่อน”
  ringClassName = "ring-cambridge",
  className = "",
}: AvatarBlockProps) {
  // ป้องกันค่าว่าง/ช่องว่างล้วน
  const displayName = loading
    ? "Loading..."
    : (() => {
        const s = (name ?? "").trim();
        return s.length > 0 ? s : "—";
      })();

  const nameClass = [
    "text-sm font-semibold text-neutral-800",
    collapseOnSmall ? "hidden sm:inline" : "", // ซ่อนเฉพาะถ้าเปิด option นี้
  ]
    .filter(Boolean)
    .join(" ");

  const fallbackBg =
    variant === "emerald" ? "bg-emerald-100 text-emerald-800" : "bg-neutral-200 text-neutral-600";

  return (
    <div className={`flex items-center gap-3 ${className}`} title={displayName} aria-label={displayName}>
      {/* Avatar ก่อนชื่อ จะเข้ากับ nav ได้สากลกว่า */}
      {avatarUrl ? (
        <Image
          src={avatarUrl}
          alt={`${displayName} avatar`}
          width={size}
          height={size}
          className={`rounded-full object-cover ring-1 ${ringClassName}`}
          style={{ width: size, height: size }}
        />
      ) : (
        <div
          className={`grid place-items-center rounded-full ${fallbackBg} ring-1 ${ringClassName}`}
          style={{ width: size, height: size }}
          aria-hidden
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5">
            <path
              d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Zm0 2c-4 0-8 2-8 5v1h16v-1c0-3-4-5-8-5Z"
              fill="currentColor"
            />
          </svg>
        </div>
      )}

      {/* ชื่อ (เลือกซ่อนบนจอเล็กได้) */}
      {showName ? <span className={nameClass}>{displayName}</span> : <span className="sr-only">{displayName}</span>}
    </div>
  );
}
