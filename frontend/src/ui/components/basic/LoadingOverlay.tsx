"use client";

import React from "react";
import Image from "next/image";
import { classNames } from "@/lib/booking/datetime";

type CourtlyLoadingProps = {
  isLoading: boolean;
  text?: string;
  inline?: boolean;
  dimLevel?: "light" | "medium" | "dark";
  size?: number;
  className?: string;
  /** หมุนแบบ 3D (rotateY) หรือแบน */
  flipY?: boolean;
};

export default function CourtlyLoading({
  isLoading,
  text = "Getting your court ready...",
  inline = false,
  dimLevel = "light",
  size = 120,
  className = "",
  flipY = true,
}: CourtlyLoadingProps) {
  if (!isLoading) return null;

  const dimMap = {
    light: "bg-white/70 backdrop-blur-sm",
    medium: "bg-gray-200/80 backdrop-blur",
    dark: "bg-gray-800/60 backdrop-blur-sm",
  };

  const containerClass = inline
    ? "absolute inset-0 flex flex-col items-center justify-center"
    : "fixed inset-0 flex flex-col items-center justify-center z-50";

  return (
    <div
      className={classNames(
        containerClass,
        dimMap[dimLevel],
        "transition-all",
        className
      )}
    >
      <div className="relative mb-4" style={{ perspective: "800px" }}>
        {/* สนาม */}
        <Image
          src="/brand/court.png"
          alt="Court background"
          width={size}
          height={size}
          className="object-contain select-none"
          priority
        />

        {/* ลูกแบดหมุนแกน Y */}
        <div
        className={classNames(
            "absolute inset-0 flex items-center justify-center",
            flipY ? "animate-flip-y" : "animate-spin-slow"
        )}
        >
        <Image
            src="/brand/shuttlecock.png"
            alt="Courtly shuttlecock"
            width={size * 0.45}
            height={size * 0.45}
            className="object-contain select-none drop-shadow-md"
            priority
        />
        </div>

      </div>

      {text && <p className="text-pine font-semibold text-center">{text}</p>}
    </div>
  );
}
