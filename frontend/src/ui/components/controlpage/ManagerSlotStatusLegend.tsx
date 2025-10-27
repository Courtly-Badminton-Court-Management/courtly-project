"use client";

import React from "react";

const STATUS_COLORS = [
  { label: "Available", color: "bg-available" },
  { label: "Booked", color: "bg-booked" },
  { label: "Walk-in", color: "bg-walkin" },
  { label: "Checked-in", color: "bg-checkin" },
  { label: "Maintenance", color: "bg-maintenance" },
  { label: "Expired", color: "bg-expired" },
  { label: "No-Show", color: "bg-noshow" },
  { label: "End Game", color: "bg-endgame" },
];

export default function ManagerSlotStatusLegend() {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
      {STATUS_COLORS.map((s) => (
        <div key={s.label} className="flex items-center gap-2 text-sm">
          <span
            className={`inline-block h-3 w-3 rounded-sm shadow-sm ring-1 ring-black/10 ${s.color}`}
          ></span>
          <span className="text-gray-700 font-medium">{s.label}</span>
        </div>
      ))}
    </div>
  );
}
