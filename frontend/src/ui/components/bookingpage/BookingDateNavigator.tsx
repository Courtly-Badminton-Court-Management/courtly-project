"use client";

import React from "react";

type Props = {
  dateLabel: string;
  onPrev: () => void;
  onNext: () => void;
  className?: string;
};

/**
 * Horizontal date navigation bar used in booking pages.
 * Shows previous/next buttons and a centered date label.
 */
export default function BookingDateNavigator({
  dateLabel,
  onPrev,
  onNext,
  className = "",
}: Props) {
  return (
    <div
      className={`flex items-center gap-3 text-[15px] font-semibold text-neutral-800 ${className}`}
    >
      <button
        onClick={onPrev}
        className="grid h-8 w-8 place-items-center rounded-md border border-neutral-200 hover:bg-neutral-50"
        aria-label="Previous day"
      >
        ‹
      </button>

      <div>{dateLabel}</div>

      <button
        onClick={onNext}
        className="grid h-8 w-8 place-items-center rounded-md border border-neutral-200 hover:bg-neutral-50"
        aria-label="Next day"
      >
        ›
      </button>
    </div>
  );
}
