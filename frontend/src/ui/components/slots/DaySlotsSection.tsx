"use client";

import React from "react";
import { SlotModal, type SlotModalProps } from "./SlotModal";

type DaySlotsSectionProps = SlotModalProps & {
  ctaHref?: string;
  className?: string;
};

export default function DaySlotsSection({
  ctaHref = "/booking",
  className = "",
  ...modalProps
}: DaySlotsSectionProps) {
  return (
    <div className={`w-full ${className}`}>
      <div className="flex justify-end mb-3">
        <a
          href={ctaHref}
          className="inline-flex items-center rounded-2xl px-4 py-2 text-sm font-semibold shadow-sm hover:shadow-md transition border border-platinum bg-sea text-white hover:bg-pine"
        >
          Book the courts!
        </a>
      </div>

      <SlotModal {...modalProps} />
    </div>
  );
}