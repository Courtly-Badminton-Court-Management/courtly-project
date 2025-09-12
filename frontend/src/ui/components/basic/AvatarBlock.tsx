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
  /** show name text (hidden below nameBreakpoint) */
  showName?: boolean;
  /** breakpoint to start showing the name text */
  nameBreakpoint?: "sm" | "md" | "lg";
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
  nameBreakpoint = "sm",
  ringClassName = "ring-cambridge",
  className = "",
}: AvatarBlockProps) {
  const showNameCls = showName
    ? `text-sm font-semibold text-neutral-800 ${nameBreakpoint ? `hidden ${nameBreakpoint}:inline` : ""}`
    : "sr-only";

  const fallbackBg =
    variant === "emerald" ? "bg-emerald-100 text-emerald-800" : "bg-neutral-200 text-neutral-600";

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <span className={showNameCls}>{loading ? "Loading..." : name ?? "—"}</span>

      {avatarUrl ? (
        <Image
          src={avatarUrl}
          alt={`${name ?? "user"} avatar`}
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
          <svg viewBox="0 0 24 24" className="w-5 h-5">
            <path
              d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Zm0 2c-4 0-8 2-8 5v1h16v-1c0-3-4-5-8-5Z"
              fill="currentColor"
            />
          </svg>
        </div>
      )}
    </div>
  );
}
