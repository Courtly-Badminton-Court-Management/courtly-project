// // "use client";
// //
// // import React, { useMemo, useState } from "react";
// //
// // /** ─────────────────────────────────────────────────────────────────────────
// //  * Mock constants (ปรับง่ายตอนต่อ backend)
// //  * - 1 slot = 1 ชั่วโมง
// //  * - ราคา 100 coins / slot
// //  * - เวลา 10:00–19:00  (9 ช่อง)
// //  * - 10 courts
// //  * -------------------------------------------------------------------------*/
// // const HOURS = [
// //   "10:00 - 11:00",
// //   "11:00 - 12:00",
// //   "12:00 - 13:00",
// //   "13:00 - 14:00",
// //   "14:00 - 15:00",
// //   "15:00 - 16:00",
// //   "16:00 - 17:00",
// //   "17:00 - 18:00",
// //   "18:00 - 19:00",
// // ] as const;
// //
// // const SLOT_PRICE = 1;
// //
// // type SlotStatus = "available" | "booked" | "walkin" | "endgame" | "maintenance";
// // type GridCell = { status: SlotStatus };
// //
// // type SelectedSlot = { court: number; hourIdx: number };
// //
// // type GroupedSelection = {
// //   court: number;
// //   startIdx: number;
// //   endIdx: number; // inclusive
// //   hours: number; // duration
// //   price: number;
// //   timeLabel: string;
// // };
// //
// // function classNames(...xs: (string | false | null | undefined)[]) {
// //   return xs.filter(Boolean).join(" ");
// // }
// //
// // /** กลุ่มช่วงเวลาที่ติดกันใน court เดียวกัน (เพื่อใช้ในสรุปการจอง) */
// // function groupSelections(sel: SelectedSlot[]): GroupedSelection[] {
// //   const byCourt: Record<number, number[]> = {};
// //   sel.forEach((s) => {
// //     byCourt[s.court] ??= [];
// //     byCourt[s.court].push(s.hourIdx);
// //   });
// //
// //   const groups: GroupedSelection[] = [];
// //   Object.entries(byCourt).forEach(([courtStr, arr]) => {
// //     const court = Number(courtStr);
// //     const sorted = [...new Set(arr)].sort((a, b) => a - b);
// //     if (!sorted.length) return;
// //
// //     let start = sorted[0];
// //     let prev = sorted[0];
// //     for (let i = 1; i <= sorted.length; i++) {
// //       const cur = sorted[i];
// //       if (cur !== prev + 1) {
// //         const end = prev;
// //         const hours = end - start + 1;
// //         const startLabel = HOURS[start].split(" - ")[0];
// //         const endLabel = HOURS[end].split(" - ")[1];
// //         groups.push({
// //           court,
// //           startIdx: start,
// //           endIdx: end,
// //           hours,
// //           price: hours * SLOT_PRICE,
// //           timeLabel: `${startLabel} - ${endLabel}`,
// //         });
// //         start = cur!;
// //       }
// //       prev = cur!;
// //     }
// //   });
// //   return groups.sort(
// //     (a, b) => a.court - b.court || a.startIdx - b.startIdx
// //   );
// // }
// //
// // /** สุ่ม mock ตารางสถานะ เพื่อให้หน้าดูมีข้อมูลเหมือนในภาพ */
// // function makeMockGrid(courts = 10, slotsPerDay = HOURS.length): GridCell[][] {
// //   const rnd = (seed: number) => {
// //     // linear congruential pseudo-random (ให้ pattern คงที่ทุกครั้ง)
// //     let x = seed;
// //     return () => (x = (1664525 * x + 1013904223) % 2 ** 32) / 2 ** 32;
// //   };
// //   const random = rnd(42);
// //
// //   const grid: GridCell[][] = [];
// //   for (let c = 0; c < courts; c++) {
// //     const row: GridCell[] = [];
// //     for (let h = 0; h < slotsPerDay; h++) {
// //       const r = random();
// //       let status: SlotStatus = "available";
// //       if (r < 0.18) status = "booked";
// //       else if (r < 0.21) status = "walkin";
// //       else if (r < 0.24) status = "endgame";
// //       else if (r < 0.27) status = "maintenance";
// //       row.push({ status });
// //     }
// //     grid.push(row);
// //   }
// //   // เคลียร์บางช่วงให้ว่างเพื่อให้เลือกได้ง่าย
// //   grid[4][7] = { status: "available" };
// //   grid[4][8] = { status: "available" };
// //   grid[4][6] = { status: "available" };
// //   grid[4][5] = { status: "available" };
// //   return grid;
// // }
// //
// // export default function PlayerBookingPage() {
// //   /** เงินจำลองบน navbar */
// //   const [coins, setCoins] = useState<number>(150);
// //
// //   /** วันที่ (ยังไม่ทำ date-picker จริง เพียงโชว์ในหัวข้อ) */
// //   const [dateLabel] = useState<string>("5 Sep 2025");
// //
// //   /** ตารางสถานะของวันนั้น ๆ */
// //   const [grid, setGrid] = useState<GridCell[][]>(() => makeMockGrid(10, HOURS.length));
// //
// //   /** ช่องที่ผู้เล่นเลือก */
// //   const [selected, setSelected] = useState<SelectedSlot[]>([]);
// //
// //   /** สรุปกลุ่มเวลา (ต่อ court) */
// //   const groups = useMemo(() => groupSelections(selected), [selected]);
// //
// //   const totalPrice = groups.reduce((s, g) => s + g.price, 0);
// //
// //   /** Modal states */
// //   const [openSummary, setOpenSummary] = useState(false);
// //   const [openConfirm, setOpenConfirm] = useState(false);
// //
// //   /** Mock booking id หลังยืนยัน */
// //   const [bookingId, setBookingId] = useState<string | null>(null);
// //
// //   function toggleSelect(court: number, hourIdx: number) {
// //     const cell = grid[court - 1][hourIdx];
// //     if (cell.status !== "available") return;
// //
// //     const key = `${court}-${hourIdx}`;
// //     const exists = selected.some((s) => `${s.court}-${s.hourIdx}` === key);
// //     setSelected((prev) =>
// //       exists ? prev.filter((s) => `${s.court}-${s.hourIdx}` !== key) : [...prev, { court, hourIdx }]
// //     );
// //   }
// //
// //   function handleOpenSummary() {
// //     if (selected.length === 0) return;
// //     setOpenSummary(true);
// //   }
// //
// //   function handleConfirm() {
// //     // mock: สร้าง booking id + ตัดเหรียญ + ทำให้ช่องที่เลือกกลายเป็น booked
// //     const id = "BK" + Math.floor(10 ** 9 + Math.random() * 9 * 10 ** 9).toString();
// //     setBookingId(id);
// //     setCoins((c) => c - totalPrice);
// //
// //     setGrid((g) => {
// //       const next = g.map((row) => row.map((cell) => ({ ...cell })));
// //       selected.forEach(({ court, hourIdx }) => {
// //         next[court - 1][hourIdx].status = "booked";
// //       });
// //       return next;
// //     });
// //
// //     setOpenSummary(false);
// //     setOpenConfirm(true);
// //     setSelected([]);
// //   }
// //
// //   const notEnough = totalPrice > coins;
// //
// //   return (
// //     <div className="mx-auto max-w-[1100px] px-4 py-6">
// //       {/* Header */}
// //       <div className="mb-4 flex items-center justify-between">
// //         <h1 className="text-2xl font-extrabold tracking-tight">Booking Slots</h1>
// //         <div className="flex items-center gap-3">
// //           <div className="text-sm text-neutral-600">
// //             {selected.length} {selected.length === 1 ? "slot" : "slots"} selected
// //           </div>
// //           <button
// //             onClick={handleOpenSummary}
// //             className={classNames(
// //               "rounded-xl px-4 py-2 text-sm font-bold transition-colors",
// //               selected.length
// //                 ? "bg-teal-800 text-white hover:bg-teal-700"
// //                 : "bg-neutral-200 text-neutral-500 cursor-not-allowed"
// //             )}
// //             disabled={!selected.length}
// //           >
// //             Book the courts!
// //           </button>
// //         </div>
// //       </div>
// //
// //       {/* Date row */}
// //       <div className="mb-3 flex items-center gap-3 text-[15px] font-semibold text-neutral-800">
// //         <button className="grid h-8 w-8 place-items-center rounded-md border border-neutral-200 hover:bg-neutral-50">
// //           ‹
// //         </button>
// //         <div>{dateLabel}</div>
// //         <button className="grid h-8 w-8 place-items-center rounded-md border border-neutral-200 hover:bg-neutral-50">
// //           ›
// //         </button>
// //       </div>
// //
// //       {/* Grid Card */}
// //       <div className="relative rounded-2xl border border-neutral-200 bg-white p-3 shadow-sm">
// //         {/* header row */}
// //         <div className="grid"
// //              style={{ gridTemplateColumns: `120px repeat(${HOURS.length}, 1fr)` }}>
// //           <div className="px-3 py-2 text-sm font-bold text-neutral-700">Time</div>
// //           {HOURS.map((h) => (
// //             <div key={h} className="px-2 py-2 text-center text-[12px] font-semibold text-neutral-600">
// //               {h}
// //             </div>
// //           ))}
// //         </div>
// //
// //         {/* rows */}
// //         <div className="mt-1">
// //           {grid.map((row, rIdx) => (
// //             <div
// //               key={rIdx}
// //               className="grid border-t border-neutral-100"
// //               style={{ gridTemplateColumns: `120px repeat(${HOURS.length}, 1fr)` }}
// //             >
// //               {/* court label */}
// //               <div className="flex items-center gap-2 px-3 py-2">
// //                 <span className="inline-flex h-7 w-10 items-center justify-center rounded-md bg-neutral-100 text-sm font-bold">
// //                   {rIdx + 1}
// //                 </span>
// //                 <span className="text-sm text-neutral-700">Court</span>
// //               </div>
// //
// //               {/* slots */}
// //               {row.map((cell, cIdx) => {
// //                 const isSelected = selected.some(
// //                   (s) => s.court === rIdx + 1 && s.hourIdx === cIdx
// //                 );
// //
// //                 const base =
// //                   "h-10 m-[3px] rounded-[4px] grid place-items-center text-xs font-semibold transition-colors";
// //                 const styleByStatus: Record<SlotStatus, string> = {
// //                   available: "bg-white border border-neutral-200 hover:bg-neutral-50",
// //                   booked: "bg-rose-900/70 text-white",
// //                   walkin: "bg-amber-700/70 text-white",
// //                   endgame: "bg-orange-400/70 text-white",
// //                   maintenance: "bg-neutral-400/60 text-white",
// //                 };
// //
// //                 const selectedStyle =
// //                   "bg-teal-800 text-white ring-2 ring-teal-900/50 hover:bg-teal-700";
// //
// //                 return (
// //                   <button
// //                     key={cIdx}
// //                     className={classNames(
// //                       base,
// //                       isSelected ? selectedStyle : styleByStatus[cell.status]
// //                     )}
// //                     onClick={() => toggleSelect(rIdx + 1, cIdx)}
// //                     disabled={cell.status !== "available"}
// //                     aria-label={`Court ${rIdx + 1} ${HOURS[cIdx]}`}
// //                   >
// //                     {isSelected ? "✓" : ""}
// //                   </button>
// //                 );
// //               })}
// //             </div>
// //           ))}
// //         </div>
// //
// //         {/* Card fake drop shadow edge */}
// //         <div className="pointer-events-none absolute inset-x-3 -bottom-2 h-3 rounded-b-2xl bg-neutral-300/40 blur-[2px]" />
// //       </div>
// //
// //       {/* Legend */}
// //       <div className="mt-5 flex flex-wrap items-center gap-5 text-sm text-neutral-700">
// //         <LegendDot className="bg-white border border-neutral-300" label="Available Now" />
// //         <LegendDot className="bg-rose-900/70" label="Booked" />
// //         <LegendDot className="bg-amber-700/70" label="Walk-In Booking" />
// //         <LegendDot className="bg-orange-400/70" label="End Game" />
// //         <LegendDot className="bg-neutral-400/60" label="Maintenance" />
// //       </div>
// //
// //       {/* Summary Modal */}
// //       {openSummary && (
// //         <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
// //           <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
// //             <button
// //               onClick={() => setOpenSummary(false)}
// //               className="absolute right-4 top-4 text-xl text-neutral-500 hover:text-neutral-700"
// //               aria-label="Close"
// //             >
// //               ×
// //             </button>
// //             <h3 className="mb-4 text-2xl font-extrabold text-teal-900">Booking Summary</h3>
// //
// //             {groups.length === 0 && (
// //               <p className="text-sm text-neutral-600">No slots selected.</p>
// //             )}
// //
// //             <div className="space-y-3">
// //               {groups.map((g, i) => (
// //                 <div key={i} className="rounded-lg border border-neutral-200 p-3">
// //                   <div className="text-sm">
// //                     <div>
// //                       <span className="font-bold">Court:</span> Court {g.court}
// //                     </div>
// //                     <div>
// //                       <span className="font-bold">Time:</span> {g.timeLabel}
// //                     </div>
// //                     <div>
// //                       <span className="font-bold">Durations:</span> {g.hours}{" "}
// //                       {g.hours > 1 ? "hrs" : "hr"}
// //                     </div>
// //                   </div>
// //                 </div>
// //               ))}
// //             </div>
// //
// //             <div className="mt-5 flex items-center justify-between rounded-lg bg-neutral-50 p-3 text-sm font-semibold">
// //               <span className="flex items-center gap-2">
// //                 <Coin /> Total:
// //               </span>
// //               <span>{totalPrice} coins</span>
// //             </div>
// //
// //             {notEnough && (
// //               <p className="mt-2 text-center text-[13px] italic text-rose-600">
// //                 Not enough coins. Please top up!
// //               </p>
// //             )}
// //
// //             <div className="mt-5 flex items-center justify-end gap-3">
// //               <button
// //                 className="rounded-xl border border-neutral-300 px-4 py-2 text-sm font-bold text-neutral-700 hover:bg-neutral-50"
// //                 onClick={() => setOpenSummary(false)}
// //               >
// //                 Cancel
// //               </button>
// //               <button
// //                 onClick={handleConfirm}
// //                 disabled={notEnough || groups.length === 0}
// //                 className={classNames(
// //                   "rounded-xl px-4 py-2 text-sm font-bold text-white",
// //                   notEnough || groups.length === 0
// //                     ? "bg-neutral-300 cursor-not-allowed"
// //                     : "bg-teal-800 hover:bg-teal-700"
// //                 )}
// //               >
// //                 Confirm Booking
// //               </button>
// //             </div>
// //           </div>
// //         </div>
// //       )}
// //
// //       {/* Confirmed Modal */}
// //       {openConfirm && bookingId && (
// //         <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
// //           <div className="relative w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl">
// //             <button
// //               onClick={() => setOpenConfirm(false)}
// //               className="absolute right-4 top-4 text-xl text-neutral-500 hover:text-neutral-700"
// //               aria-label="Close"
// //             >
// //               ×
// //             </button>
// //
// //             <div className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-full bg-teal-800 text-white">
// //               ✓
// //             </div>
// //             <h3 className="mb-2 text-center text-3xl font-extrabold text-teal-900">
// //               BOOKING CONFIRMED!
// //             </h3>
// //             <p className="mb-5 text-center text-neutral-600">
// //               Your booking has been successfully recorded.
// //             </p>
// //
// //             <div className="rounded-2xl border border-neutral-200">
// //               <div className="grid grid-cols-2 gap-4 border-b border-neutral-200 px-5 py-4 text-sm">
// //                 <div className="text-neutral-500">Booking ID</div>
// //                 <div className="font-semibold">{bookingId}</div>
// //               </div>
// //
// //               {groupRowsForReceipt(groups).map((row, i) => (
// //                 <div key={i} className="grid grid-cols-2 gap-4 border-b border-neutral-100 px-5 py-4 text-sm">
// //                   <div className="space-y-1">
// //                     <div className="text-neutral-500">Court No.</div>
// //                     <div className="font-semibold">Court {row.court}</div>
// //                   </div>
// //                   <div className="space-y-1">
// //                     <div className="text-neutral-500">Time</div>
// //                     <div className="font-semibold">{row.timeLabel}</div>
// //                   </div>
// //                   <div className="col-span-2 mt-1 text-right text-rose-600">
// //                     -{row.price}
// //                   </div>
// //                 </div>
// //               ))}
// //
// //               <div className="flex items-center justify-between px-5 py-4 text-sm font-bold">
// //                 <div>Total Coins Deducted</div>
// //                 <div className="text-rose-700">-{groups.reduce((s, g) => s + g.price, 0)}</div>
// //               </div>
// //             </div>
// //
// //             <div className="mt-5 text-center">
// //               <button
// //                 onClick={() => setOpenConfirm(false)}
// //                 className="rounded-xl bg-teal-800 px-5 py-2 text-sm font-bold text-white hover:bg-teal-700"
// //               >
// //                 Close
// //               </button>
// //             </div>
// //           </div>
// //         </div>
// //       )}
// //
// //       {/* Coins display (mock navbar balance) */}
// //       <div className="mt-10 text-sm text-neutral-600">
// //         <span className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-3 py-1">
// //           <Coin /> Balance: <span className="font-bold text-neutral-900">{coins}</span> coins
// //         </span>
// //       </div>
// //     </div>
// //   );
// // }
// //
// // /** ───────────────────────────── helpers / tiny UI inside same file ─────── */
// //
// // function LegendDot({ className, label }: { className: string; label: string }) {
// //   return (
// //     <div className="flex items-center gap-2">
// //       <span className={classNames("inline-block h-3 w-5 rounded-sm", className)} />
// //       <span className="text-[13px] text-neutral-600">{label}</span>
// //     </div>
// //   );
// // }
// //
// // function Coin() {
// //   return (
// //     <svg width="16" height="16" viewBox="0 0 24 24" className="-mt-[1px] inline-block">
// //       <circle cx="12" cy="12" r="10" fill="#e7e5e4" />
// //       <circle cx="12" cy="12" r="7" fill="#d6d3d1" />
// //       <text x="12" y="15" textAnchor="middle" fontSize="10" fill="#374151" fontWeight="700">
// //         ¢
// //       </text>
// //     </svg>
// //   );
// // }
// //
// // /** ใช้กลุ่มเดิมแปลงเป็นแถวสำหรับใบเสร็จ (ตอนนี้คือ 1 กลุ่ม = 1 แถวอยู่แล้ว) */
// // function groupRowsForReceipt(groups: GroupedSelection[]) {
// //   return groups;
// // }
//
// "use client";
//
// import React, { useEffect, useMemo, useState } from "react";
//
// /* =========================================================================
//    CONFIG
//    ========================================================================= */
// const API =
//   process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";
//
// /** 1 slot บน UI = 1 ชั่วโมง (แม้ backend เป็น 30 นาที) */
// const HOURS = [
//   "10:00 - 11:00",
//   "11:00 - 12:00",
//   "12:00 - 13:00",
//   "13:00 - 14:00",
//   "14:00 - 15:00",
//   "15:00 - 16:00",
//   "16:00 - 17:00",
//   "17:00 - 18:00",
//   "18:00 - 19:00",
// ] as const;
//
// const COURTS = 10;
// const SLOT_PRICE = 1;
//
// /* =========================================================================
//    TYPES
//    ========================================================================= */
// type SlotStatus =
//   | "available"
//   | "booked"
//   | "walkin"
//   | "endgame"
//   | "maintenance";
//
// type GridCell = { status: SlotStatus };
//
// type SelectedSlot = { court: number; hourIdx: number };
//
// type GroupedSelection = {
//   court: number;
//   startIdx: number;
//   endIdx: number; // inclusive
//   hours: number;
//   price: number;
//   timeLabel: string;
// };
//
// /* =========================================================================
//    SMALL UTILS
//    ========================================================================= */
// function classNames(...xs: (string | false | null | undefined)[]) {
//   return xs.filter(Boolean).join(" ");
// }
//
// /** รวมช่องต่อเนื่องภายใน court เดียวกัน → ใช้ทำ summary + ส่งจอง */
// function groupSelections(sel: SelectedSlot[]): GroupedSelection[] {
//   const byCourt: Record<number, number[]> = {};
//   sel.forEach((s) => {
//     byCourt[s.court] ??= [];
//     byCourt[s.court].push(s.hourIdx);
//   });
//
//   const groups: GroupedSelection[] = [];
//   Object.entries(byCourt).forEach(([courtStr, arr]) => {
//     const court = Number(courtStr);
//     const sorted = [...new Set(arr)].sort((a, b) => a - b);
//     if (!sorted.length) return;
//
//     let start = sorted[0];
//     let prev = sorted[0];
//     for (let i = 1; i <= sorted.length; i++) {
//       const cur = sorted[i];
//       if (cur !== prev + 1) {
//         const end = prev;
//         const hours = end - start + 1;
//         const startLabel = HOURS[start].split(" - ")[0];
//         const endLabel = HOURS[end].split(" - ")[1];
//         groups.push({
//           court,
//           startIdx: start,
//           endIdx: end,
//           hours,
//           price: hours * SLOT_PRICE,
//           timeLabel: `${startLabel} - ${endLabel}`,
//         });
//         start = cur!;
//       }
//       prev = cur!;
//     }
//   });
//   return groups.sort((a, b) => a.court - b.court || a.startIdx - b.startIdx);
// }
//
// /* =========================================================================
//    BACKEND I/O
//    ========================================================================= */
//
// /** โหลดตารางทั้งวันจาก endpoint month-view แล้ว map เป็นกริดของหน้านี้ */
// async function fetchDayGrid(opts: {
//   clubId: number;
//   ymd: string; // "YYYY-MM-DD"
// }): Promise<{ hours: string[]; grid: GridCell[][] }> {
//   const month = opts.ymd.slice(0, 7); // "YYYY-MM"
//   const url = `${API}/api/slots/month-view/?club=${opts.clubId}&month=${month}`;
//   const res = await fetch(url, { cache: "no-store" });
//   if (!res.ok) throw new Error(`GET month-view ${res.status}`);
//
//   // โครงตามหน้าจอ DRF ของคุณ: { days: [{ date: "15-09-25", slotList: { "<id>": {...} }}] }
//   const data = (await res.json()) as {
//     month?: string;
//     days: Array<{
//       date: string;
//       slotList: Record<
//         string,
//         {
//           status: SlotStatus;
//           start_time: string; // "10:00"
//           end_time: string; // "10:30"
//           court: number;
//         }
//       >;
//     }>;
//   };
//
//   // hours กำหนดคงที่ฝั่ง UI (10–19)
//   const hours = [...HOURS];
//
//   // หาวันที่ตรงกับ ymd — backend ของคุณโชว์ date เป็น "DD-MM-YY" ตามภาพ
//   const dd = opts.ymd.slice(8); // "05"
//   // บางที backend อาจเป็น "01-09-25" หรือ "2025-09-01" ให้รองรับทั้งสอง
//   const day =
//     data.days.find((d) => d.date.slice(0, 2) === dd) ||
//     data.days.find((d) => d.date.endsWith(`-${dd}`));
//
//   // สร้างกริดเริ่มต้นเป็น available ทั้งหมด
//   const grid: GridCell[][] = Array.from({ length: COURTS }, () =>
//     Array.from({ length: hours.length }, () => ({ status: "available" }))
//   );
//
//   if (!day) return { hours, grid };
//
//   // แปลง "สถานะ 30 นาที" → "สถานะ 60 นาที"
//   // ถ้าชั่วโมงเดียวกันมีครึ่งใดครึ่งหนึ่งไม่ว่าง ให้ถือว่าไม่ว่างทั้งชั่วโมง (ให้ความสำคัญตามลำดับ)
//   const precedence: SlotStatus[] = [
//     "available",
//     "walkin",
//     "endgame",
//     "maintenance",
//     "booked",
//   ];
//   const weight = (s: SlotStatus) => precedence.indexOf(s);
//
//   const entries = Object.values(day.slotList);
//   for (const s of entries) {
//     const [h, m] = s.start_time.split(":").map(Number);
//     const hourIdx = h - 10; // 10:00 → 0, …, 18:00 → 8
//     if (hourIdx < 0 || hourIdx >= hours.length) continue;
//     if (s.court < 1 || s.court > COURTS) continue;
//
//     const ref = grid[s.court - 1][hourIdx];
//     // ยกระดับสถานะถ้าพบอัน "หนักกว่า"
//     if (weight(s.status) > weight(ref.status)) {
//       ref.status = s.status;
//     }
//     // เคส 30-min ขวา (start xx:30) ก็ยังจัดอยู่ในชั่วโมงเดียวกัน — หลักการเดิม
//   }
//
//   return { hours, grid };
// }
//
// /** ส่ง POST /api/bookings/ เพื่อจอง */
// async function createBookings(payload: {
//   clubId: number;
//   items: Array<{ court: number; date: string; start: string; end: string }>;
// }) {
//   const res = await fetch(`${API}/api/bookings/`, {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({ club: payload.clubId, items: payload.items }),
//   });
//   if (!res.ok) {
//     const text = await res.text().catch(() => "");
//     throw new Error(`POST /api/bookings/ ${res.status} ${text}`);
//   }
//   return res.json() as Promise<{
//     ok: boolean;
//     bookings: Array<{ booking_no: string }>;
//     total_slots: number;
//   }>;
// }
//
// /* =========================================================================
//    PAGE
//    ========================================================================= */
// export default function PlayerBookingPage() {
//   /** mock เหรียญบน navbar */
//   const [coins, setCoins] = useState<number>(150);
//
//   /** วันที่จริง (YYYY-MM-DD) และ label โชว์ */
//   const [ymd, setYmd] = useState<string>("2025-09-05");
//   const [dateLabel, setDateLabel] = useState<string>("5 Sep 2025");
//
//   /** ตารางสถานะของวันนั้น ๆ (โหลดจาก backend) */
//   const [grid, setGrid] = useState<GridCell[][]>(
//     Array.from({ length: COURTS }, () =>
//       Array.from({ length: HOURS.length }, () => ({ status: "available" }))
//     )
//   );
//
//   /** ช่องที่ผู้เล่นเลือก */
//   const [selected, setSelected] = useState<SelectedSlot[]>([]);
//
//   /** สรุปกลุ่มเวลา (ต่อ court) */
//   const groups = useMemo(() => groupSelections(selected), [selected]);
//   const totalPrice = groups.reduce((s, g) => s + g.price, 0);
//
//   /** Modal states */
//   const [openSummary, setOpenSummary] = useState(false);
//   const [openConfirm, setOpenConfirm] = useState(false);
//
//   /** booking no จาก backend หลังยืนยัน */
//   const [bookingNos, setBookingNos] = useState<string[]>([]);
//
//   /* -------- โหลดกริดจาก backend เมื่อ ymd เปลี่ยน -------- */
//   useEffect(() => {
//     (async () => {
//       try {
//         const { grid } = await fetchDayGrid({ clubId: 1, ymd });
//         setGrid(grid);
//         setSelected([]); // เคลียร์การเลือกเมื่อเปลี่ยนวัน
//       } catch (e) {
//         console.error(e);
//       }
//     })();
//   }, [ymd]);
//
//   /* -------- เลือก/ยกเลิกเลือก -------- */
//   function toggleSelect(court: number, hourIdx: number) {
//     const cell = grid[court - 1][hourIdx];
//     if (cell.status !== "available") return;
//
//     const key = `${court}-${hourIdx}`;
//     const exists = selected.some((s) => `${s.court}-${s.hourIdx}` === key);
//     setSelected((prev) =>
//       exists
//         ? prev.filter((s) => `${s.court}-${s.hourIdx}` !== key)
//         : [...prev, { court, hourIdx }]
//     );
//   }
//
//   function handleOpenSummary() {
//     if (!selected.length) return;
//     setOpenSummary(true);
//   }
//
//   /* -------- กดยืนยัน → POST เข้า backend -------- */
//   async function handleConfirm() {
//     try {
//       const items = groups.map((g) => {
//         const [start] = HOURS[g.startIdx].split(" - ");
//         const [, end] = HOURS[g.endIdx].split(" - ");
//         return { court: g.court, date: ymd, start, end };
//       });
//
//       const res = await createBookings({ clubId: 1, items });
//
//       // อัปเดตเหรียญ + mark ช่องใน UI เป็น booked
//       setCoins((c) => c - totalPrice);
//       setGrid((g) => {
//         const next = g.map((row) => row.map((cell) => ({ ...cell })));
//         selected.forEach(({ court, hourIdx }) => {
//           next[court - 1][hourIdx].status = "booked";
//         });
//         return next;
//       });
//
//       setBookingNos(res.bookings?.map((b) => b.booking_no) ?? []);
//       setOpenSummary(false);
//       setOpenConfirm(true);
//       setSelected([]);
//     } catch (err) {
//       console.error(err);
//       alert("Booking failed. Please try again.");
//     }
//   }
//
//   /* -------- เปลี่ยนวัน (ปุ่มลูกศร) -------- */
//   function shiftDay(delta: number) {
//     const d = new Date(ymd);
//     d.setDate(d.getDate() + delta);
//     const y = d.getFullYear();
//     const m = `${d.getMonth() + 1}`.padStart(2, "0");
//     const dd = `${d.getDate()}`.padStart(2, "0");
//     setYmd(`${y}-${m}-${dd}`);
//     setDateLabel(
//       d.toLocaleDateString("en-GB", {
//         day: "numeric",
//         month: "short",
//         year: "numeric",
//       })
//     );
//   }
//
//   const notEnough = totalPrice > coins;
//
//   return (
//     <div className="mx-auto max-w-[1100px] px-4 py-6">
//       {/* Header */}
//       <div className="mb-4 flex items-center justify-between">
//         <h1 className="text-2xl font-extrabold tracking-tight">Booking Slots</h1>
//         <div className="flex items-center gap-3">
//           <div className="text-sm text-neutral-600">
//             {selected.length} {selected.length === 1 ? "slot" : "slots"} selected
//           </div>
//           <button
//             onClick={handleOpenSummary}
//             className={classNames(
//               "rounded-xl px-4 py-2 text-sm font-bold transition-colors",
//               selected.length
//                 ? "bg-teal-800 text-white hover:bg-teal-700"
//                 : "bg-neutral-200 text-neutral-500 cursor-not-allowed"
//             )}
//             disabled={!selected.length}
//           >
//             Book the courts!
//           </button>
//         </div>
//       </div>
//
//       {/* Date row */}
//       <div className="mb-3 flex items-center gap-3 text-[15px] font-semibold text-neutral-800">
//         <button
//           className="grid h-8 w-8 place-items-center rounded-md border border-neutral-200 hover:bg-neutral-50"
//           onClick={() => shiftDay(-1)}
//         >
//           ‹
//         </button>
//         <div>{dateLabel}</div>
//         <button
//           className="grid h-8 w-8 place-items-center rounded-md border border-neutral-200 hover:bg-neutral-50"
//           onClick={() => shiftDay(1)}
//         >
//           ›
//         </button>
//       </div>
//
//       {/* Grid Card */}
//       <div className="relative rounded-2xl border border-neutral-200 bg-white p-3 shadow-sm">
//         {/* header row */}
//         <div className="grid" style={{ gridTemplateColumns: `120px repeat(${HOURS.length}, 1fr)` }}>
//           <div className="px-3 py-2 text-sm font-bold text-neutral-700">Time</div>
//           {HOURS.map((h) => (
//             <div key={h} className="px-2 py-2 text-center text-[12px] font-semibold text-neutral-600">
//               {h}
//             </div>
//           ))}
//         </div>
//
//         {/* rows */}
//         <div className="mt-1">
//           {grid.map((row, rIdx) => (
//             <div
//               key={rIdx}
//               className="grid border-t border-neutral-100"
//               style={{ gridTemplateColumns: `120px repeat(${HOURS.length}, 1fr)` }}
//             >
//               {/* court label */}
//               <div className="flex items-center gap-2 px-3 py-2">
//                 <span className="inline-flex h-7 w-10 items-center justify-center rounded-md bg-neutral-100 text-sm font-bold">
//                   {rIdx + 1}
//                 </span>
//                 <span className="text-sm text-neutral-700">Court</span>
//               </div>
//
//               {/* slots */}
//               {row.map((cell, cIdx) => {
//                 const isSelected = selected.some(
//                   (s) => s.court === rIdx + 1 && s.hourIdx === cIdx
//                 );
//
//                 const base =
//                   "h-10 m-[3px] rounded-[4px] grid place-items-center text-xs font-semibold transition-colors";
//                 const styleByStatus: Record<SlotStatus, string> = {
//                   available: "bg-white border border-neutral-200 hover:bg-neutral-50",
//                   booked: "bg-rose-900/70 text-white",
//                   walkin: "bg-amber-700/70 text-white",
//                   endgame: "bg-orange-400/70 text-white",
//                   maintenance: "bg-neutral-400/60 text-white",
//                 };
//
//                 const selectedStyle =
//                   "bg-teal-800 text-white ring-2 ring-teal-900/50 hover:bg-teal-700";
//
//                 return (
//                   <button
//                     key={cIdx}
//                     className={classNames(
//                       base,
//                       isSelected ? selectedStyle : styleByStatus[cell.status]
//                     )}
//                     onClick={() => toggleSelect(rIdx + 1, cIdx)}
//                     disabled={cell.status !== "available"}
//                     aria-label={`Court ${rIdx + 1} ${HOURS[cIdx]}`}
//                   >
//                     {isSelected ? "✓" : ""}
//                   </button>
//                 );
//               })}
//             </div>
//           ))}
//         </div>
//
//         {/* Card fake drop shadow edge */}
//         <div className="pointer-events-none absolute inset-x-3 -bottom-2 h-3 rounded-b-2xl bg-neutral-300/40 blur-[2px]" />
//       </div>
//
//       {/* Legend */}
//       <div className="mt-5 flex flex-wrap items-center gap-5 text-sm text-neutral-700">
//         <LegendDot className="bg-white border border-neutral-300" label="Available Now" />
//         <LegendDot className="bg-rose-900/70" label="Booked" />
//         <LegendDot className="bg-amber-700/70" label="Walk-In Booking" />
//         <LegendDot className="bg-orange-400/70" label="End Game" />
//         <LegendDot className="bg-neutral-400/60" label="Maintenance" />
//       </div>
//
//       {/* Summary Modal */}
//       {openSummary && (
//         <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
//           <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
//             <button
//               onClick={() => setOpenSummary(false)}
//               className="absolute right-4 top-4 text-xl text-neutral-500 hover:text-neutral-700"
//               aria-label="Close"
//             >
//               ×
//             </button>
//             <h3 className="mb-4 text-2xl font-extrabold text-teal-900">Booking Summary</h3>
//
//             {groups.length === 0 && (
//               <p className="text-sm text-neutral-600">No slots selected.</p>
//             )}
//
//             <div className="space-y-3">
//               {groups.map((g, i) => (
//                 <div key={i} className="rounded-lg border border-neutral-200 p-3">
//                   <div className="text-sm">
//                     <div>
//                       <span className="font-bold">Court:</span> Court {g.court}
//                     </div>
//                     <div>
//                       <span className="font-bold">Time:</span> {g.timeLabel}
//                     </div>
//                     <div>
//                       <span className="font-bold">Durations:</span> {g.hours}{" "}
//                       {g.hours > 1 ? "hrs" : "hr"}
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//
//             <div className="mt-5 flex items-center justify-between rounded-lg bg-neutral-50 p-3 text-sm font-semibold">
//               <span className="flex items-center gap-2">
//                 <Coin /> Total:
//               </span>
//               <span>{totalPrice} coins</span>
//             </div>
//
//             {notEnough && (
//               <p className="mt-2 text-center text-[13px] italic text-rose-600">
//                 Not enough coins. Please top up!
//               </p>
//             )}
//
//             <div className="mt-5 flex items-center justify-end gap-3">
//               <button
//                 className="rounded-xl border border-neutral-300 px-4 py-2 text-sm font-bold text-neutral-700 hover:bg-neutral-50"
//                 onClick={() => setOpenSummary(false)}
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={handleConfirm}
//                 disabled={notEnough || groups.length === 0}
//                 className={classNames(
//                   "rounded-xl px-4 py-2 text-sm font-bold text-white",
//                   notEnough || groups.length === 0
//                     ? "bg-neutral-300 cursor-not-allowed"
//                     : "bg-teal-800 hover:bg-teal-700"
//                 )}
//               >
//                 Confirm Booking
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//
//       {/* Confirmed Modal */}
//       {openConfirm && bookingNos.length > 0 && (
//         <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
//           <div className="relative w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl">
//             <button
//               onClick={() => setOpenConfirm(false)}
//               className="absolute right-4 top-4 text-xl text-neutral-500 hover:text-neutral-700"
//               aria-label="Close"
//             >
//               ×
//             </button>
//
//             <div className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-full bg-teal-800 text-white">
//               ✓
//             </div>
//             <h3 className="mb-2 text-center text-3xl font-extrabold text-teal-900">
//               BOOKING CONFIRMED!
//             </h3>
//             <p className="mb-5 text-center text-neutral-600">
//               Your booking has been successfully recorded.
//             </p>
//
//             <div className="rounded-2xl border border-neutral-200">
//               {bookingNos.map((no, i) => (
//                 <div key={i} className="grid grid-cols-2 gap-4 border-b border-neutral-200 px-5 py-4 text-sm">
//                   <div className="text-neutral-500">Booking ID</div>
//                   <div className="font-semibold">{no}</div>
//                 </div>
//               ))}
//
//               {groupRowsForReceipt(groups).map((row, i) => (
//                 <div key={i} className="grid grid-cols-2 gap-4 border-b border-neutral-100 px-5 py-4 text-sm">
//                   <div className="space-y-1">
//                     <div className="text-neutral-500">Court No.</div>
//                     <div className="font-semibold">Court {row.court}</div>
//                   </div>
//                   <div className="space-y-1">
//                     <div className="text-neutral-500">Time</div>
//                     <div className="font-semibold">{row.timeLabel}</div>
//                   </div>
//                   <div className="col-span-2 mt-1 text-right text-rose-600">-{row.price}</div>
//                 </div>
//               ))}
//
//               <div className="flex items-center justify-between px-5 py-4 text-sm font-bold">
//                 <div>Total Coins Deducted</div>
//                 <div className="text-rose-700">-{groups.reduce((s, g) => s + g.price, 0)}</div>
//               </div>
//             </div>
//
//             <div className="mt-5 text-center">
//               <button
//                 onClick={() => setOpenConfirm(false)}
//                 className="rounded-xl bg-teal-800 px-5 py-2 text-sm font-bold text-white hover:bg-teal-700"
//               >
//                 Close
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//
//       {/* Coins display (mock navbar balance) */}
//       <div className="mt-10 text-sm text-neutral-600">
//         <span className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-3 py-1">
//           <Coin /> Balance: <span className="font-bold text-neutral-900">{coins}</span> coins
//         </span>
//       </div>
//     </div>
//   );
// }
//
// /* =========================================================================
//    TINY UI
//    ========================================================================= */
// function LegendDot({ className, label }: { className: string; label: string }) {
//   return (
//     <div className="flex items-center gap-2">
//       <span className={classNames("inline-block h-3 w-5 rounded-sm", className)} />
//       <span className="text-[13px] text-neutral-600">{label}</span>
//     </div>
//   );
// }
//
// function Coin() {
//   return (
//     <svg width="16" height="16" viewBox="0 0 24 24" className="-mt-[1px] inline-block">
//       <circle cx="12" cy="12" r="10" fill="#e7e5e4" />
//       <circle cx="12" cy="12" r="7" fill="#d6d3d1" />
//       <text x="12" y="15" textAnchor="middle" fontSize="10" fill="#374151" fontWeight="700">
//         ¢
//       </text>
//     </svg>
//   );
// }
//
// /** ใช้กลุ่มเดิมแปลงเป็นแถวสำหรับใบเสร็จ (ตอนนี้คือ 1 กลุ่ม = 1 แถวอยู่แล้ว) */
// function groupRowsForReceipt(groups: GroupedSelection[]) {
//   return groups;
// }
"use client";

import React, { useEffect, useMemo, useState } from "react";

/* =========================================================================
   CONFIG
   ========================================================================= */
const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";
const CLUB_ID = Number(process.env.NEXT_PUBLIC_CLUB_ID ?? "1");

// ถ้าวันนั้นยังไม่มี slot ใน DB เลย — โชว์ 10:00–19:00 ทุก 30 นาทีเป็น fallback
const FALLBACK_COLS = Array.from({ length: 18 }, (_, i) => {
  const m = 10 * 60 + i * 30; // 10:00 + i*30m
  const s = minToStr(m);
  const e = minToStr(m + 30);
  return { start: s, end: e, label: `${s} - ${e}` };
});

// ราคาแบบง่าย: 1 coin ต่อ 30 นาที (อยากดึงจาก backend ต่อ cell ก็ปรับเพิ่มได้)
const PRICE_PER_CELL = 1;

/* =========================================================================
   TYPES
   ========================================================================= */
type SlotStatus = "available" | "booked" | "walkin" | "endgame" | "maintenance";
type GridCell = { status: SlotStatus };
type SelectedSlot = { courtRow: number; colIdx: number };
type GroupedSelection = {
  courtRow: number;
  startIdx: number; // รวม
  endIdx: number;   // รวม
  slots: number;
  price: number;
  timeLabel: string; // "HH:MM - HH:MM"
};
type Col = { start: string; end: string; label: string };

/* =========================================================================
   UTILS
   ========================================================================= */
function strToMin(hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
}
function minToStr(mins: number) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}
function classNames(...xs: (string | false | null | undefined)[]) {
  return xs.filter(Boolean).join(" ");
}

/** ทำ header “กล่องชั่วโมง” ครอบหลายคอลัมน์ (เช่น 10:00–11:00 ครอบ 10:00–10:30, 10:30–11:00) */
function makeHourBands(cols: Col[]) {
  const bands: { label: string; span: number }[] = [];
  let i = 0;
  while (i < cols.length) {
    const startMin = strToMin(cols[i].start);
    const hour = Math.floor(startMin / 60);
    let span = 0;
    while (
      i + span < cols.length &&
      Math.floor(strToMin(cols[i + span].start) / 60) === hour
    ) {
      span++;
    }
    const label = `${String(hour).padStart(2, "0")}:00 - ${String(hour + 1).padStart(
      2,
      "0"
    )}:00`;
    bands.push({ label, span });
    i += span;
  }
  return bands;
}

/* =========================================================================
   BACKEND I/O
   ========================================================================= */

/** โหลดข้อมูลทั้งวันจาก month-view → สร้างคอลัมน์ 30 นาทีจริง + กริดสถานะ + mapping court */
async function fetchDayGrid(opts: {
  clubId: number;
  ymd: string; // "YYYY-MM-DD"
}): Promise<{
  cols: Col[];
  grid: GridCell[][];
  courtIds: number[];
  courtNames: string[];
}> {
  const month = opts.ymd.slice(0, 7); // "YYYY-MM"
  const url = `${API}/api/slots/month-view/?club=${opts.clubId}&month=${month}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`GET month-view ${res.status}`);

  const data = (await res.json()) as {
    days: Array<{
      date: string; // "DD-MM-YY" หรือรูปแบบใกล้เคียง
      slotList: Record<
        string,
        {
          status: SlotStatus;
          start_time: string; // "HH:MM"
          end_time: string;   // "HH:MM"
          court: number;      // court id จริง
          courtName?: string;
        }
      >;
    }>;
  };

  // หา entry ของวันที่ต้องการ (ยอมรับ "DD-MM-YY" หรือ "...-DD")
  const dd = opts.ymd.slice(8); // "05"
  const day =
    data.days.find((d) => d.date.slice(0, 2) === dd) ||
    data.days.find((d) => d.date.endsWith(`-${dd}`));

  if (!day || !day.slotList || !Object.keys(day.slotList).length) {
    // ไม่มีข้อมูล — คืนตาราง fallback ว่าง ๆ
    return {
      cols: FALLBACK_COLS,
      grid: Array.from({ length: 10 }, () =>
        Array.from({ length: FALLBACK_COLS.length }, () => ({ status: "available" }))
      ),
      courtIds: Array.from({ length: 10 }, (_, i) => i + 1),
      courtNames: Array.from({ length: 10 }, (_, i) => `Court ${i + 1}`),
    };
  }

  const entries = Object.values(day.slotList);

  // 1) ทำคอลัมน์ 30 นาทีจริงจาก backend
  const uniqStarts = Array.from(new Set(entries.map((e) => e.start_time)));
  uniqStarts.sort((a, b) => strToMin(a) - strToMin(b));

  // กำหนดความกว้างช่วง (ส่วนใหญ่=30) จาก min(end-start)
  const steps = entries.map((e) => strToMin(e.end_time) - strToMin(e.start_time));
  const stepMin = Math.max(1, Math.min(...steps));
  const cols: Col[] = uniqStarts.map((s) => {
    const eMin = strToMin(s) + stepMin;
    const e = minToStr(eMin);
    return { start: s, end: e, label: `${s} - ${e}` };
  });
  const colIndex = new Map(cols.map((c, i) => [c.start, i]));

  // 2) mapping court id → row index + label แสดงผล
  const uniqCourts = Array.from(
    new Map(entries.map((e) => [e.court, e.courtName || `Court ${e.court}`])).entries()
  ).sort((a, b) => a[0] - b[0]);
  const courtIds = uniqCourts.map(([id]) => id);
  const courtNames = uniqCourts.map(([, name]) => name);
  const rows = Math.max(courtIds.length, 10);
  const courtIndex = new Map(courtIds.map((id, idx) => [id, idx]));

  // 3) กริดเริ่มต้น = available
  const grid: GridCell[][] = Array.from({ length: rows }, () =>
    Array.from({ length: cols.length }, () => ({ status: "available" }))
  );

  // 4) อัดสถานะลงกริด (priority: available < walkin < endgame < maintenance < booked)
  const precedence: SlotStatus[] = ["available", "walkin", "endgame", "maintenance", "booked"];
  const weight = (s: SlotStatus) => precedence.indexOf(s);

  for (const s of entries) {
    const r = courtIndex.get(s.court);
    const c = colIndex.get(s.start_time);
    if (r == null || c == null) continue;

    const ref = grid[r][c];
    if (weight(s.status) > weight(ref.status)) ref.status = s.status;
  }

  return { cols, grid, courtIds, courtNames };
}

/** POST จอง; ถ้ามี error จะโยนข้อความอ่านง่ายออกมา */
async function createBookings(payload: {
  clubId: number;
  items: Array<{ court: number; date: string; start: string; end: string }>;
}) {
  const res = await fetch(`${API}/api/bookings/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ club: payload.clubId, items: payload.items }),
  });

  const text = await res.text().catch(() => "");
  let data: any = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { detail: text };
  }

  if (!res.ok) {
    const msg =
      data?.detail ||
      data?.error ||
      (data?.slot_ids ? `conflict slots: ${data.slot_ids.join(",")}` : "") ||
      `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return data as {
    ok: boolean;
    bookings: Array<{ booking_no: string }>;
    total_slots: number;
  };
}

/* =========================================================================
   PAGE
   ========================================================================= */
export default function PlayerBookingPage() {
  /** ยอดเหรียญ (mock) */
  const [coins, setCoins] = useState<number>(150);

  /** วันที่ (YYYY-MM-DD) + label */
  const [ymd, setYmd] = useState<string>("2025-09-05");
  const [dateLabel, setDateLabel] = useState<string>("5 Sep 2025");

  /** คอลัมน์ 30 นาที (อิง backend) */
  const [cols, setCols] = useState<Col[]>(FALLBACK_COLS);

  /** ตารางสถานะของวันนั้น ๆ */
  const [grid, setGrid] = useState<GridCell[][]>(
    Array.from({ length: 10 }, () =>
      Array.from({ length: FALLBACK_COLS.length }, () => ({ status: "available" }))
    )
  );

  /** mapping แถว → court id/ชื่อจริง */
  const [courtIds, setCourtIds] = useState<number[]>(Array.from({ length: 10 }, (_, i) => i + 1));
  const [courtNames, setCourtNames] = useState<string[]>(
    Array.from({ length: 10 }, (_, i) => `Court ${i + 1}`)
  );

  /** ช่องที่เลือก (แถว,คอลัมน์) */
  const [selected, setSelected] = useState<SelectedSlot[]>([]);

  /** รวม selection ที่ติดกันต่อ courtRow → ใช้ทำ summary/POST */
  const groups = useMemo(() => groupSelections(selected, cols), [selected, cols]);

  /** ราคา total (1 coin ต่อ 30 นาที) */
  const totalPrice = groups.reduce((s, g) => s + g.price, 0);
  const notEnough = totalPrice > coins;

  /** โมดัล & ผลการจอง */
  const [openSummary, setOpenSummary] = useState(false);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [bookingNos, setBookingNos] = useState<string[]>([]);

  /** hour-bands สำหรับหัวตาราง */
  const hourBands = useMemo(() => makeHourBands(cols), [cols]);

  /* -------- โหลดข้อมูลวัน -------- */
  useEffect(() => {
    (async () => {
      try {
        const { cols, grid, courtIds, courtNames } = await fetchDayGrid({ clubId: CLUB_ID, ymd });
        setCols(cols);
        setGrid(grid);
        setCourtIds(courtIds);
        setCourtNames(courtNames);
        setSelected([]); // clear selection เมื่อเปลี่ยนวัน
      } catch (e) {
        console.error(e);
      }
    })();
  }, [ymd]);

  /* -------- เลือก/ยกเลิกเลือก -------- */
  function toggleSelect(courtRow: number, colIdx: number) {
    const r = courtRow - 1;
    const cell = grid[r]?.[colIdx];
    if (!cell || cell.status !== "available") return;

    const key = `${courtRow}-${colIdx}`;
    const exists = selected.some((s) => `${s.courtRow}-${s.colIdx}` === key);
    setSelected((prev) =>
      exists ? prev.filter((s) => `${s.courtRow}-${s.colIdx}` !== key) : [...prev, { courtRow, colIdx }]
    );
  }

  function handleOpenSummary() {
    if (!selected.length) return;
    setOpenSummary(true);
  }

  /* -------- ยืนยันการจอง -------- */
  async function handleConfirm() {
    try {
      const items = groups.map((g) => {
        const start = cols[g.startIdx].start;
        const end = cols[g.endIdx].end;
        const courtId = courtIds[g.courtRow - 1] ?? g.courtRow; // map แถว → court id จริง
        return { court: courtId, date: ymd, start, end };
      });

      const res = await createBookings({ clubId: CLUB_ID, items });

      // ตัดเหรียญ + mark ช่องใน UI เป็น booked
      setCoins((c) => c - totalPrice);
      setGrid((g) => {
        const next = g.map((row) => row.map((cell) => ({ ...cell })));
        selected.forEach(({ courtRow, colIdx }) => {
          if (next[courtRow - 1]?.[colIdx]) next[courtRow - 1][colIdx].status = "booked";
        });
        return next;
      });

      setBookingNos(res.bookings?.map((b) => b.booking_no) ?? []);
      setOpenSummary(false);
      setOpenConfirm(true);
      setSelected([]);
    } catch (err: any) {
      console.error(err);
      alert(`Booking failed: ${err?.message ?? err}`);
    }
  }

  /* -------- เปลี่ยนวัน -------- */
  function shiftDay(delta: number) {
    const d = new Date(ymd);
    d.setDate(d.getDate() + delta);
    const y = d.getFullYear();
    const m = `${d.getMonth() + 1}`.padStart(2, "0");
    const dd = `${d.getDate()}`.padStart(2, "0");
    setYmd(`${y}-${m}-${dd}`);
    setDateLabel(
      d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
    );
  }

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
        <button
          className="grid h-8 w-8 place-items-center rounded-md border border-neutral-200 hover:bg-neutral-50"
          onClick={() => shiftDay(-1)}
        >
          ‹
        </button>
        <div>{dateLabel}</div>
        <button
          className="grid h-8 w-8 place-items-center rounded-md border border-neutral-200 hover:bg-neutral-50"
          onClick={() => shiftDay(1)}
        >
          ›
        </button>
      </div>

      {/* Grid Card */}
      <div className="relative rounded-2xl border border-neutral-200 bg-white p-3 shadow-sm">
        {/* header row (hour bands) */}
        <div
          className="grid"
          style={{ gridTemplateColumns: `120px repeat(${cols.length}, 1fr)` }}
        >
          <div className="px-3 py-2 text-sm font-bold text-neutral-700">Time</div>

          {hourBands.map((b, i) => (
            <div
              key={i}
              className="px-1 py-1 flex items-center justify-center"
              style={{ gridColumn: `span ${b.span} / span ${b.span}` }}
            >
              <div className="whitespace-nowrap tabular-nums rounded-md border border-neutral-200 bg-neutral-100 px-2 py-[2px] text-[10px] font-semibold text-neutral-600">
                {b.label}
              </div>
            </div>
          ))}
        </div>

        {/* rows */}
        <div className="mt-1">
          {grid.map((row, rIdx) => (
            <div
              key={rIdx}
              className="grid border-t border-neutral-100"
              style={{ gridTemplateColumns: `120px repeat(${cols.length}, 1fr)` }}
            >
              {/* court label */}
              <div className="flex items-center gap-2 px-3 py-2">
                <span className="inline-flex h-7 w-10 items-center justify-center rounded-md bg-neutral-100 text-sm font-bold">
                  {rIdx + 1}
                </span>
                <span className="text-sm text-neutral-700">
                  {courtNames[rIdx] ?? `Court ${rIdx + 1}`}
                </span>
              </div>

              {/* 30-min cells */}
              {row.map((cell, cIdx) => {
                const isSelected = selected.some(
                  (s) => s.courtRow === rIdx + 1 && s.colIdx === cIdx
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
                    aria-label={`Court ${rIdx + 1} ${cols[cIdx].label}`}
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

            {groups.length === 0 && <p className="text-sm text-neutral-600">No slots selected.</p>}

            <div className="space-y-3">
              {groups.map((g, i) => (
                <div key={i} className="rounded-lg border border-neutral-200 p-3">
                  <div className="text-sm">
                    <div>
                      <span className="font-bold">Court:</span>{" "}
                      {courtNames[g.courtRow - 1] ?? `Court ${g.courtRow}`}
                    </div>
                    <div>
                      <span className="font-bold">Time:</span> {g.timeLabel}
                    </div>
                    <div>
                      <span className="font-bold">Durations:</span>{" "}
                      {((g.slots * 30) / 60).toFixed(1).replace(".0", "")}{" "}
                      {g.slots >= 2 ? "hrs" : "hr"}
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

            <div className="mt-5 flex items-center justify-end gap-3">
              <button
                className="rounded-xl border border-neutral-300 px-4 py-2 text-sm font-bold text-neutral-700 hover:bg-neutral-50"
                onClick={() => setOpenSummary(false)}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                disabled={groups.length === 0 || notEnough}
                className={classNames(
                  "rounded-xl px-4 py-2 text-sm font-bold text-white",
                  groups.length === 0 || notEnough
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
      {openConfirm && bookingNos.length > 0 && (
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
              {bookingNos.map((no, i) => (
                <div key={i} className="grid grid-cols-2 gap-4 border-b border-neutral-200 px-5 py-4 text-sm">
                  <div className="text-neutral-500">Booking ID</div>
                  <div className="font-semibold">{no}</div>
                </div>
              ))}

              {groups.map((row, i) => (
                <div key={i} className="grid grid-cols-2 gap-4 border-b border-neutral-100 px-5 py-4 text-sm">
                  <div className="space-y-1">
                    <div className="text-neutral-500">Court</div>
                    <div className="font-semibold">
                      {courtNames[row.courtRow - 1] ?? `Court ${row.courtRow}`}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-neutral-500">Time</div>
                    <div className="font-semibold">{row.timeLabel}</div>
                  </div>
                  <div className="col-span-2 mt-1 text-right text-rose-600">-{row.price}</div>
                </div>
              ))}

              <div className="flex items-center justify-between px-5 py-4 text-sm font-bold">
                <div>Total Coins Deducted</div>
                <div className="text-rose-700">-{totalPrice}</div>
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

      {/* Coins display (mock) */}
      <div className="mt-10 text-sm text-neutral-600">
        <span className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-3 py-1">
          <Coin /> Balance: <span className="font-bold text-neutral-900">{coins}</span> coins
        </span>
      </div>
    </div>
  );
}

/* =========================================================================
   HELPERS: group selections 30 นาที → ช่วงเวลา
   ========================================================================= */
function groupSelections(sel: SelectedSlot[], cols: Col[]): GroupedSelection[] {
  const byCourt: Record<number, number[]> = {};
  sel.forEach((s) => {
    byCourt[s.courtRow] ??= [];
    byCourt[s.courtRow].push(s.colIdx);
  });

  const out: GroupedSelection[] = [];
  Object.entries(byCourt).forEach(([courtStr, idxList]) => {
    const courtRow = Number(courtStr);
    const idxs = [...new Set(idxList)].sort((a, b) => a - b);
    if (!idxs.length) return;

    let start = idxs[0];
    let prev = idxs[0];
    for (let i = 1; i <= idxs.length; i++) {
      const cur = idxs[i];
      if (cur !== prev + 1) {
        const end = prev;
        const slots = end - start + 1;
        const s = cols[start]?.start ?? "";
        const e = cols[end]?.end ?? "";
        out.push({
          courtRow,
          startIdx: start,
          endIdx: end,
          slots,
          price: slots * PRICE_PER_CELL,
          timeLabel: `${s} - ${e}`,
        });
        start = cur!;
      }
      prev = cur!;
    }
  });

  return out.sort((a, b) => a.courtRow - b.courtRow || a.startIdx - b.startIdx);
}

/* =========================================================================
   Tiny UI
   ========================================================================= */
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
