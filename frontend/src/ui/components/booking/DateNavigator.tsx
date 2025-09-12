"use client";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Props = {
  date: Date;
  onChange: (d: Date) => void;
};

export default function DateNavigator({ date, onChange }: Props) {
  const fmt = (d: Date) =>
    d.toLocaleDateString("en-GB", { weekday: "short", year: "numeric", month: "short", day: "numeric" });

  const shift = (days: number) => {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    onChange(d);
  };

  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border bg-white p-3 shadow-sm">
      <button
        className="rounded-lg border px-3 py-2 hover:bg-neutral-50 active:scale-[0.98]"
        onClick={() => shift(-1)}
      >
        <ChevronLeft className="h-5 w-5" />
      </button>

      <div className="flex items-center gap-3">
        <input
          type="date"
          className="rounded-md border px-3 py-2"
          value={date.toISOString().slice(0, 10)}
          onChange={(e) => onChange(new Date(e.target.value))}
        />
        <div className="text-sm text-neutral-600">({fmt(date)})</div>
      </div>

      <button
        className="rounded-lg border px-3 py-2 hover:bg-neutral-50 active:scale-[0.98]"
        onClick={() => shift(1)}
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  );
}
