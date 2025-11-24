//frontend/src/ui/components/navbar/AvatarBlock.tsx
"use client";

import Image from "next/image";
import React from "react";

type AvatarBlockProps = {
  name?: string | null;
  avatarKey?: string | null;
  loading?: boolean;
  size?: number;
  variant?: "neutral" | "emerald";
  showName?: boolean;
  collapseOnSmall?: boolean;
  ringClassName?: string;
  className?: string;
  /** 👉 เพิ่ม onClick ให้ NavBar ใช้เปิด AvatarPickerModal */
  onClick?: () => void;
};

export default function AvatarBlock({
  name = "—",
  avatarKey = null,
  loading = false,
  size = 32,
  variant = "neutral",
  showName = true,
  collapseOnSmall = false,
  ringClassName = "ring-dimgray",
  className = "",
  onClick, // ← รับมาที่นี่
}: AvatarBlockProps) {
  const displayName = loading
    ? "Loading..."
    : (() => {
        const s = (name ?? "").trim();
        return s.length > 0 ? s : "—";
      })();

  const nameClass = [
    "text-sm font-semibold text-neutral-800",
    collapseOnSmall ? "hidden sm:inline" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const fallbackBg =
    variant === "emerald"
      ? "bg-emerald-100 text-emerald-800"
      : "bg-neutral-200 text-neutral-600";

  return (
    <div
      className={`
        flex items-center gap-3
        ${onClick ? "cursor-pointer hover:opacity-80 transition" : ""}
        ${className}
      `}
      title={displayName}
      aria-label={displayName}
      onClick={onClick}       // ← ทำให้คลิกได้
      role={onClick ? "button" : undefined}
    >
      {/* Avatar */}
      {avatarKey ? (
        <img
          src={`/avatars/${avatarKey}`}
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

      {/* ชื่อ */}
      {showName ? (
        <span className={nameClass}>{displayName}</span>
      ) : (
        <span className="sr-only">{displayName}</span>
      )}
    </div>
  );
}
