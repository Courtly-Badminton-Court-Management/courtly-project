"use client";

import React, { useEffect, useState } from "react";
import PlayerSlotStatusLegend from "@/ui/components/bookingpage/PlayerSlotStatusLegend";

type FloatingLegendProps = {
  /** e.g. "1 slot = 30 minutes = 100 coins" */
  helperText?: string;
};

export default function FloatingLegend({
  helperText = "💡 1 slot = 30 minutes = 100 coins · Coins are captured when you confirm",
}: FloatingLegendProps) {
  const [open, setOpen] = useState(false);

  // close on ESC
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div
      className="
        fixed bottom-5 right-5 z-40
        md:bottom-6 md:right-6
        [@supports(padding:max(0px))]:mb-[max(1rem,env(safe-area-inset-bottom))]
        [@supports(padding:max(0px))]:mr-[max(1rem,env(safe-area-inset-right))]
      "
      aria-live="polite"
    >
      {/* Collapsed pill (shows when closed) */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="
            group flex items-center gap-2 rounded-full
            bg-white/90 shadow-lg ring-1 ring-black/10 backdrop-blur
            px-4 py-2 text-sm font-semibold text-gray-800
            hover:bg-white active:scale-[0.99]
          "
          aria-expanded="false"
          aria-controls="legend-panel"
        >
          <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
          Slot Legend
          <span className="text-gray-500 group-hover:text-gray-700">•</span>
          <span className="text-gray-600">Pricing & tips</span>
        </button>
      )}

      {/* Expanded card */}
      {open && (
        <div
          id="legend-panel"
          role="dialog"
          aria-modal="false"
          className="
            w-[min(92vw,380px)]
            rounded-2xl bg-white shadow-xl ring-1 ring-black/10 backdrop-blur
            overflow-hidden
            animate-in fade-in zoom-in-95
          "
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <div className="text-sm font-bold text-teal-900">Slot Legend & Tips</div>
            <button
              onClick={() => setOpen(false)}
              className="rounded-full p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
              aria-label="Close legend"
            >
              ✕
            </button>
          </div>

          <div className="px-4 py-3">
            <div className="mb-3">
              <PlayerSlotStatusLegend />
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">{helperText}</p>
          </div>

          <div className="px-4 pb-3">
            <button
              onClick={() => setOpen(false)}
              className="w-full rounded-xl bg-teal-800 text-white text-sm font-bold py-2 hover:bg-teal-700"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
