"use client";

import React from "react";
import * as LucideIcons from "lucide-react";

type ButtonProps = {
  label?: string;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  full?: boolean;
  disabled?: boolean;
  className?: string;
  bgColor?: string;
  textColor?: string;
  hoverBgColor?: string;
  hoverTextColor?: string;
  frontIcon?: string; // ✅ icon ที่อยู่หน้าข้อความ
  backIcon?: string;  // ✅ icon ที่อยู่หลังข้อความ
};

export default function Button({
  label = "default label",
  onClick,
  type = "button",
  full = false,
  disabled = false,
  className = "",
  bgColor = "bg-pine",
  textColor = "text-white",
  hoverBgColor = "hover:bg-emerald-800",
  hoverTextColor = "hover:text-white",
  frontIcon,
  backIcon,
}: ButtonProps) {
  // ✅ โหลด icon จากชื่อ (ถ้ามี)
  const FrontIcon = frontIcon ? (LucideIcons as any)[frontIcon] : null;
  const BackIcon = backIcon ? (LucideIcons as any)[backIcon] : null;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={[
        "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition-all duration-150",
        bgColor,
        textColor,
        hoverBgColor,
        hoverTextColor,
        full ? "w-full" : "",
        disabled ? "opacity-60 cursor-not-allowed" : "",
        className,
      ].join(" ")}
    >
      {/* ✅ Icon หน้า */}
      {FrontIcon && <FrontIcon size={16} className="shrink-0" />}
      {/* Label */}
      <span>{label}</span>
      {/* ✅ Icon หลัง */}
      {BackIcon && <BackIcon size={16} className="shrink-0" />}
    </button>
  );
}
