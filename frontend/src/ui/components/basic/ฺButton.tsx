// src/ui/components/Button.tsx
"use client";

import React from "react";

type ButtonProps = {
  label?: string; // ← เพิ่ม label
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  full?: boolean;
  disabled?: boolean;
  className?: string;
  bgColor?: string;
  textColor?: string;
  hoverBgColor?: string;
  hoverTextColor?: string;
};

export default function Button({
  label = "default label", // ← ถ้าไม่ได้ส่ง label จะใช้ default
  onClick,
  type = "button",
  full = false,
  disabled = false,
  className = "",
  bgColor = "bg-pine",
  textColor = "text-white",
  hoverBgColor = "hover:bg-emerald-800",
  hoverTextColor = "hover:text-white",
}: ButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={[
        "rounded-xl px-4 py-2 text-sm font-bold transition-colors",
        bgColor,
        textColor,
        hoverBgColor,
        hoverTextColor,
        full ? "w-full" : "",
        disabled ? "opacity-60 cursor-not-allowed" : "",
        className,
      ].join(" ")}
    >
      {label}
    </button>
  );
}
