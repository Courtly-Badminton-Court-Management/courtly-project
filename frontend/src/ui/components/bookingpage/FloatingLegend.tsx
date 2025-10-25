"use client";

import React, { useEffect, useState } from "react";
import PlayerSlotStatusLegend from "@/ui/components/bookingpage/PlayerSlotStatusLegend";

type FloatingLegendProps = {
  helperText?: string;
};

export default function FloatingLegend({
  helperText = "💡 You can select any court and time on the same day in one booking. Each slot = 30 minutes = 100 coins. Coins will be captured when you confirm.",
}: FloatingLegendProps) {
  const [open, setOpen] = useState(false);

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
      {!open && ( <button onClick={() => setOpen(true)} 
        className=" group flex items-center gap-2 rounded-full bg-white/90 shadow-lg ring-1 ring-black/10 backdrop-blur px-4 py-2 text-sm font-semibold text-gray-800 hover:bg-white active:scale-[0.99] " 
        aria-expanded="false" 
        aria-controls="legend-panel" > 
        <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" /> 
        <span className="text-gray-600">Need Help?</span> </button> )}
        
      {/* Expanded modal */}
      {open && (
        <div
          id="legend-panel"
          role="dialog"
          aria-modal="false"
          className="
            w-[min(92vw,400px)]
            rounded-2xl bg-white shadow-2xl ring-1 ring-black/10 backdrop-blur
            overflow-hidden animate-in fade-in zoom-in-95
          "
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
            <div className="text-base font-semibold text-teal-900 flex items-center gap-2">
              💡 Booking Tips
            </div>
            <button
              onClick={() => setOpen(false)}
              className="rounded-full p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition"
              aria-label="Close legend"
            >
              ✕
            </button>
          </div>

          {/* Body */}
          <div className="px-5 py-4 space-y-4 text-gray-700 text-sm leading-relaxed">
            {/* Section 1 */}
            <section>
              <h3 className="font-semibold text-teal-900 text-sm mb-2">
                🎯 Slot Status
              </h3>
              <div className="rounded-lg border border-gray-100 bg-gray-50 p-3">
                <PlayerSlotStatusLegend />
              </div>
            </section>

            {/* Divider */}
            <div className="border-t border-gray-100" />

            {/* Section 2 */}
            <section>
              <h3 className="font-semibold text-teal-900 text-sm mb-2">
                🕒 How booking works
              </h3>
              <ul className="list-disc pl-5 space-y-1 text-gray-600">
                <li>You can select any <span className="text-teal-800 font-medium">court</span> and <span className="text-teal-800 font-medium">time</span> on the same day in one booking.</li>
                <li>Each slot = <span className="text-teal-800 font-medium">30 minutes</span> = <span className="text-teal-800 font-medium">100 coins</span>.</li>
                <li>Coins are captured once you confirm the booking.</li>
              </ul>
            </section>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-100 px-5 py-3 flex justify-end">
            <button
              onClick={() => setOpen(false)}
              className="rounded-xl bg-teal-800 text-white text-sm font-semibold px-4 py-2 hover:bg-teal-700 transition"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
