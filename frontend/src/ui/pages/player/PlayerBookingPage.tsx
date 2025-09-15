"use client";

import React, { useMemo, useState } from "react";
import CourtNumberHero from "@/ui/components/bookingpage/CourtNumberHero";


/** ─────────────────────────────────────────────────────────────────────────
 * Mock constants (ปรับง่ายตอนต่อ backend)
 * - 1 slot = 1 ชั่วโมง
 * - ราคา 100 coins / slot
 * - เวลา 10:00–19:00  (9 ช่อง)
 * - 10 courts
 * -------------------------------------------------------------------------*/
const HOURS = [
  "10:00 - 11:00",
  "11:00 - 12:00",
  "12:00 - 13:00",
  "13:00 - 14:00",
  "14:00 - 15:00",
  "15:00 - 16:00",
  "16:00 - 17:00",
  "17:00 - 18:00",
  "18:00 - 19:00",
] as const;

const SLOT_PRICE = 1;

type SlotStatus = "available" | "booked" | "walkin" | "endgame" | "maintenance";
type GridCell = { status: SlotStatus };

type SelectedSlot = { court: number; hourIdx: number };

type GroupedSelection = {
  court: number;
  startIdx: number;
  endIdx: number; // inclusive
  hours: number; // duration
  price: number;
  timeLabel: string;
};

function classNames(...xs: (string | false | null | undefined)[]) {
  return xs.filter(Boolean).join(" ");
}

/** กลุ่มช่วงเวลาที่ติดกันใน court เดียวกัน (เพื่อใช้ในสรุปการจอง) */
function groupSelections(sel: SelectedSlot[]): GroupedSelection[] {
  const byCourt: Record<number, number[]> = {};
  sel.forEach((s) => {
    byCourt[s.court] ??= [];
    byCourt[s.court].push(s.hourIdx);
  });

  const groups: GroupedSelection[] = [];
  Object.entries(byCourt).forEach(([courtStr, arr]) => {
    const court = Number(courtStr);
    const sorted = [...new Set(arr)].sort((a, b) => a - b);
    if (!sorted.length) return;

    let start = sorted[0];
    let prev = sorted[0];
    for (let i = 1; i <= sorted.length; i++) {
      const cur = sorted[i];
      if (cur !== prev + 1) {
        const end = prev;
        const hours = end - start + 1;
        const startLabel = HOURS[start].split(" - ")[0];
        const endLabel = HOURS[end].split(" - ")[1];
        groups.push({
          court,
          startIdx: start,
          endIdx: end,
          hours,
          price: hours * SLOT_PRICE,
          timeLabel: `${startLabel} - ${endLabel}`,
        });
        start = cur!;
      }
      prev = cur!;
    }
  });
  return groups.sort(
    (a, b) => a.court - b.court || a.startIdx - b.startIdx
  );
}

/** สุ่ม mock ตารางสถานะ เพื่อให้หน้าดูมีข้อมูลเหมือนในภาพ */
function makeMockGrid(courts = 10, slotsPerDay = HOURS.length): GridCell[][] {
  const rnd = (seed: number) => {
    // linear congruential pseudo-random (ให้ pattern คงที่ทุกครั้ง)
    let x = seed;
    return () => (x = (1664525 * x + 1013904223) % 2 ** 32) / 2 ** 32;
  };
  const random = rnd(42);

  const grid: GridCell[][] = [];
  for (let c = 0; c < courts; c++) {
    const row: GridCell[] = [];
    for (let h = 0; h < slotsPerDay; h++) {
      const r = random();
      let status: SlotStatus = "available";
      if (r < 0.18) status = "booked";
      else if (r < 0.21) status = "walkin";
      else if (r < 0.24) status = "endgame";
      else if (r < 0.27) status = "maintenance";
      row.push({ status });
    }
    grid.push(row);
  }
  // เคลียร์บางช่วงให้ว่างเพื่อให้เลือกได้ง่าย
  grid[4][7] = { status: "available" };
  grid[4][8] = { status: "available" };
  grid[4][6] = { status: "available" };
  grid[4][5] = { status: "available" };
  return grid;
}

export default function PlayerBookingPage() {
  /** เงินจำลองบน navbar */
  const [coins, setCoins] = useState<number>(150);

  /** วันที่ (ยังไม่ทำ date-picker จริง เพียงโชว์ในหัวข้อ) */
  const [dateLabel] = useState<string>("5 Sep 2025");

  /** ตารางสถานะของวันนั้น ๆ */
  const [grid, setGrid] = useState<GridCell[][]>(() => makeMockGrid(10, HOURS.length));

  /** ช่องที่ผู้เล่นเลือก */
  const [selected, setSelected] = useState<SelectedSlot[]>([]);

  /** สรุปกลุ่มเวลา (ต่อ court) */
  const groups = useMemo(() => groupSelections(selected), [selected]);

  const totalPrice = groups.reduce((s, g) => s + g.price, 0);

  /** Modal states */
  const [openSummary, setOpenSummary] = useState(false);
  const [openConfirm, setOpenConfirm] = useState(false);

  /** Mock booking id หลังยืนยัน */
  const [bookingId, setBookingId] = useState<string | null>(null);

  function toggleSelect(court: number, hourIdx: number) {
    const cell = grid[court - 1][hourIdx];
    if (cell.status !== "available") return;

    const key = `${court}-${hourIdx}`;
    const exists = selected.some((s) => `${s.court}-${s.hourIdx}` === key);
    setSelected((prev) =>
      exists ? prev.filter((s) => `${s.court}-${s.hourIdx}` !== key) : [...prev, { court, hourIdx }]
    );
  }

  function handleOpenSummary() {
    if (selected.length === 0) return;
    setOpenSummary(true);
  }

  function handleConfirm() {
    // mock: สร้าง booking id + ตัดเหรียญ + ทำให้ช่องที่เลือกกลายเป็น booked
    const id = "BK" + Math.floor(10 ** 9 + Math.random() * 9 * 10 ** 9).toString();
    setBookingId(id);
    setCoins((c) => c - totalPrice);

    setGrid((g) => {
      const next = g.map((row) => row.map((cell) => ({ ...cell })));
      selected.forEach(({ court, hourIdx }) => {
        next[court - 1][hourIdx].status = "booked";
      });
      return next;
    });

    setOpenSummary(false);
    setOpenConfirm(true);
    setSelected([]);
  }

  const notEnough = totalPrice > coins;

  return (
    <div className="mx-auto max-w-[1100px] px-4 py-6">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-extrabold tracking-tight">Booking Slots</h1>
        <div className="flex items-center gap-3">
          <div className="text-sm text-neutral-600">
            {selected.length} {selected.length === 1 ? "slot" : "slots"} selected
          </div>
          <button
            onClick={handleOpenSummary}
            className={classNames(
              "rounded-xl px-4 py-2 text-sm font-bold transition-colors",
              selected.length
                ? "bg-teal-800 text-white hover:bg-teal-700"
                : "bg-neutral-200 text-neutral-500 cursor-not-allowed"
            )}
            disabled={!selected.length}
          >
            Book the courts!
          </button>
        </div>
      </div>

      {/* Date row */}
      <div className="mb-3 flex items-center gap-3 text-[15px] font-semibold text-neutral-800">
        <button className="grid h-8 w-8 place-items-center rounded-md border border-neutral-200 hover:bg-neutral-50">
          ‹
        </button>
        <div>{dateLabel}</div>
        <button className="grid h-8 w-8 place-items-center rounded-md border border-neutral-200 hover:bg-neutral-50">
          ›
        </button>
      </div>

      {/* Grid Card */}
      <div className="relative rounded-2xl border border-neutral-200 bg-white p-3 shadow-sm">
        {/* header row */}
        <div className="grid"
             style={{ gridTemplateColumns: `120px repeat(${HOURS.length}, 1fr)` }}>
          <div className="px-3 py-2 text-sm font-bold text-neutral-700">Time</div>
          {HOURS.map((h) => (
            <div key={h} className="px-2 py-2 text-center text-[12px] font-semibold text-neutral-600">
              {h}
            </div>
          ))}
        </div>

        {/* rows */}
        <div className="mt-1">
          {grid.map((row, rIdx) => (
            <div
              key={rIdx}
              className="grid border-t border-neutral-100"
              style={{ gridTemplateColumns: `120px repeat(${HOURS.length}, 1fr)` }}
            >
              {/* court label */}
              <div className="flex items-center gap-2 px-3 py-2">
              <CourtNumberHero
                  court={rIdx + 1}
                  size={72}                            // พอดีกับคอลัมน์กว้าง 120px
                  active={selected.some(s => s.court === rIdx + 1)} // ไฮไลต์ถ้ามีเลือกคอร์ทนี้
                  labelWord="Court"
              />
              </div>

              {/* slots */}
              {row.map((cell, cIdx) => {
                const isSelected = selected.some(
                  (s) => s.court === rIdx + 1 && s.hourIdx === cIdx
                );

                const base =
                  "h-10 m-[3px] rounded-[4px] grid place-items-center text-xs font-semibold transition-colors";
                const styleByStatus: Record<SlotStatus, string> = {
                  available: "bg-white border border-neutral-200 hover:bg-neutral-50",
                  booked: "bg-rose-900/70 text-white",
                  walkin: "bg-amber-700/70 text-white",
                  endgame: "bg-orange-400/70 text-white",
                  maintenance: "bg-neutral-400/60 text-white",
                };

                const selectedStyle =
                  "bg-teal-800 text-white ring-2 ring-teal-900/50 hover:bg-teal-700";

                return (
                  <button
                    key={cIdx}
                    className={classNames(
                      base,
                      isSelected ? selectedStyle : styleByStatus[cell.status]
                    )}
                    onClick={() => toggleSelect(rIdx + 1, cIdx)}
                    disabled={cell.status !== "available"}
                    aria-label={`Court ${rIdx + 1} ${HOURS[cIdx]}`}
                  >
                    {isSelected ? "✓" : ""}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Card fake drop shadow edge */}
        <div className="pointer-events-none absolute inset-x-3 -bottom-2 h-3 rounded-b-2xl bg-neutral-300/40 blur-[2px]" />
      </div>

      {/* Legend */}
      <div className="mt-5 flex flex-wrap items-center gap-5 text-sm text-neutral-700">
        <LegendDot className="bg-white border border-neutral-300" label="Available Now" />
        <LegendDot className="bg-rose-900/70" label="Booked" />
        <LegendDot className="bg-amber-700/70" label="Walk-In Booking" />
        <LegendDot className="bg-orange-400/70" label="End Game" />
        <LegendDot className="bg-neutral-400/60" label="Maintenance" />
      </div>

      {/* Summary Modal */}
      {openSummary && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <button
              onClick={() => setOpenSummary(false)}
              className="absolute right-4 top-4 text-xl text-neutral-500 hover:text-neutral-700"
              aria-label="Close"
            >
              ×
            </button>
            <h3 className="mb-4 text-2xl font-extrabold text-teal-900">Booking Summary</h3>

            {groups.length === 0 && (
              <p className="text-sm text-neutral-600">No slots selected.</p>
            )}

            <div className="space-y-3">
              {groups.map((g, i) => (
                <div key={i} className="rounded-lg border border-neutral-200 p-3">
                  <div className="text-sm">
                    <div>
                      <span className="font-bold">Court:</span> Court {g.court}
                    </div>
                    <div>
                      <span className="font-bold">Time:</span> {g.timeLabel}
                    </div>
                    <div>
                      <span className="font-bold">Durations:</span> {g.hours}{" "}
                      {g.hours > 1 ? "hrs" : "hr"}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 flex items-center justify-between rounded-lg bg-neutral-50 p-3 text-sm font-semibold">
              <span className="flex items-center gap-2">
                <Coin /> Total:
              </span>
              <span>{totalPrice} coins</span>
            </div>

            {notEnough && (
              <p className="mt-2 text-center text-[13px] italic text-rose-600">
                Not enough coins. Please top up!
              </p>
            )}

            <div className="mt-5 flex items-center justify-end gap-3">
              <button
                className="rounded-xl border border-neutral-300 px-4 py-2 text-sm font-bold text-neutral-700 hover:bg-neutral-50"
                onClick={() => setOpenSummary(false)}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                disabled={notEnough || groups.length === 0}
                className={classNames(
                  "rounded-xl px-4 py-2 text-sm font-bold text-white",
                  notEnough || groups.length === 0
                    ? "bg-neutral-300 cursor-not-allowed"
                    : "bg-teal-800 hover:bg-teal-700"
                )}
              >
                Confirm Booking
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmed Modal */}
      {openConfirm && bookingId && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
          <div className="relative w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl">
            <button
              onClick={() => setOpenConfirm(false)}
              className="absolute right-4 top-4 text-xl text-neutral-500 hover:text-neutral-700"
              aria-label="Close"
            >
              ×
            </button>

            <div className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-full bg-teal-800 text-white">
              ✓
            </div>
            <h3 className="mb-2 text-center text-3xl font-extrabold text-teal-900">
              BOOKING CONFIRMED!
            </h3>
            <p className="mb-5 text-center text-neutral-600">
              Your booking has been successfully recorded.
            </p>

            <div className="rounded-2xl border border-neutral-200">
              <div className="grid grid-cols-2 gap-4 border-b border-neutral-200 px-5 py-4 text-sm">
                <div className="text-neutral-500">Booking ID</div>
                <div className="font-semibold">{bookingId}</div>
              </div>

              {groupRowsForReceipt(groups).map((row, i) => (
                <div key={i} className="grid grid-cols-2 gap-4 border-b border-neutral-100 px-5 py-4 text-sm">
                  <div className="space-y-1">
                    <div className="text-neutral-500">Court No.</div>
                    <div className="font-semibold">Court {row.court}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-neutral-500">Time</div>
                    <div className="font-semibold">{row.timeLabel}</div>
                  </div>
                  <div className="col-span-2 mt-1 text-right text-rose-600">
                    -{row.price}
                  </div>
                </div>
              ))}

              <div className="flex items-center justify-between px-5 py-4 text-sm font-bold">
                <div>Total Coins Deducted</div>
                <div className="text-rose-700">-{groups.reduce((s, g) => s + g.price, 0)}</div>
              </div>
            </div>

            <div className="mt-5 text-center">
              <button
                onClick={() => setOpenConfirm(false)}
                className="rounded-xl bg-teal-800 px-5 py-2 text-sm font-bold text-white hover:bg-teal-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Coins display (mock navbar balance) */}
      <div className="mt-10 text-sm text-neutral-600">
        <span className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-3 py-1">
          <Coin /> Balance: <span className="font-bold text-neutral-900">{coins}</span> coins
        </span>
      </div>
    </div>
  );
}

/** ───────────────────────────── helpers / tiny UI inside same file ─────── */

function LegendDot({ className, label }: { className: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className={classNames("inline-block h-3 w-5 rounded-sm", className)} />
      <span className="text-[13px] text-neutral-600">{label}</span>
    </div>
  );
}

function Coin() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" className="-mt-[1px] inline-block">
      <circle cx="12" cy="12" r="10" fill="#e7e5e4" />
      <circle cx="12" cy="12" r="7" fill="#d6d3d1" />
      <text x="12" y="15" textAnchor="middle" fontSize="10" fill="#374151" fontWeight="700">
        ¢
      </text>
    </svg>
  );
}

/** ใช้กลุ่มเดิมแปลงเป็นแถวสำหรับใบเสร็จ (ตอนนี้คือ 1 กลุ่ม = 1 แถวอยู่แล้ว) */
function groupRowsForReceipt(groups: GroupedSelection[]) {
  return groups;
}
