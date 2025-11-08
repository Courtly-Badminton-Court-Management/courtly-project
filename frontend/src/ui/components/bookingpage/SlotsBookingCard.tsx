// src/ui/components/bookingpage/SlotsBookingCard.tsx
"use client";

import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { MapPin, CalendarRange, Clock3, Coins } from "lucide-react";

import type { SlotItem } from "@/api-client/extras/types";
import type { GroupedSelection, Col } from "@/lib/slot/slotGridModel";
import { groupSlotItemsWithPrice } from "@/lib/slot/groupSelections";

type Props = {
  slotItems: SlotItem[];
  minutesPerCell: number;
};

function formatDuration(mins: number) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h && m) return `${h} hr ${m} min`;
  if (h) return `${h} hr`;
  return `${m} min`;
}

export default function SlotsBookingCard({ slotItems, minutesPerCell }: Props) {
  // 🧩 เตรียม columns (จำเป็นสำหรับ groupSelections)
  const cols: Col[] = useMemo(() => {
    return slotItems.map((s) => ({
      start: s.start_time,
      end: s.end_time,
      label: `${s.start_time} - ${s.end_time}`,
    }));
  }, [slotItems]);

  // 🧩 group slots ด้วย logic เดิม
  const grouped = useMemo(() => groupSlotItemsWithPrice(slotItems), [slotItems]);

  if (!grouped.length) return null;

  return (
    <div className="space-y-3 text-left p-2">
      {grouped.map((g, i) => {
        const slot = slotItems[g.courtRow - 1];
        const start = cols[g.startIdx]?.start;
        const end = cols[g.endIdx]?.end;
        const duration = formatDuration(g.slots * minutesPerCell);

        return (
          <motion.div
            key={i}
            layout
            whileHover={{ scale: 1.00 }}
            className="rounded-xl border border-gray-100 bg-white/90 p-4 shadow-sm ring-1 ring-platinum transition"
          >
            {/* Court + Price */}
            <div className="flex items-start justify-between">
              <span className="inline-flex items-center rounded-full bg-sea/10 px-2.5 py-1 text-xs font-semibold text-teal-800 ring-1 ring-sea/50">
                <MapPin className="mr-1 h-3.5 w-3.5" />
                {slot?.court_name || `Court ${slot?.court ?? g.courtRow}`}
              </span>
              <div className="flex items-center gap-1 text-sm font-semibold text-gray-900">
                <Coins className="h-4 w-4 opacity-80" />
                {g.price.toLocaleString()} coins
              </div>
            </div>

            {/* Time + Duration */}
            <div className="mt-3 grid sm:grid-cols-2 gap-2 text-[13px] text-gray-700">
              <div className="flex items-center gap-2">
                <CalendarRange className="h-4 w-4 text-gray-400" />
                <span className="font-medium">Time:</span>
                {start} - {end}
              </div>
              <div className="flex items-center gap-2">
                <Clock3 className="h-4 w-4 text-gray-400" />
                <span className="font-medium">Duration:</span>
                {duration}
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
