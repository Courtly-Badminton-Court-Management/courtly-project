// src/ui/components/bookingpage/SlotsBookingCard.tsx
"use client";

import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { MapPin, CalendarRange, Clock3, Coins } from "lucide-react";

import type { SlotItem } from "@/api-client/extras/types";
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
  // 🧩 group slots ด้วย logic ใหม่ (ไม่ใช้ cols/index)
  const grouped = useMemo(() => groupSlotItemsWithPrice(slotItems), [slotItems]);

  if (!grouped.length) return null;

  return (
    <div className="space-y-3 text-left p-2">
      {grouped.map((g, i) => {
        const duration = formatDuration(g.slots * minutesPerCell);

        return (
          <motion.div
            key={i}
            layout
            whileHover={{ scale: 1.00 }}
            className="rounded-xl bg-white/90 p-4 shadow-sm ring-1 ring-platinum transition"
          >
            {/* Court + Price */}
            <div className="flex items-start justify-between">
              <span className="inline-flex items-center rounded-full bg-sea/10 px-2.5 py-1 text-xs font-semibold text-teal-800 ring-1 ring-sea/50">
                <MapPin className="mr-1 h-3.5 w-3.5" />
                {g.court_name}
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
                {g.start_time} - {g.end_time}
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
