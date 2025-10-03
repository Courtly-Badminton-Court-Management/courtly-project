// "use client";
//
// import React, { useEffect, useMemo, useState } from "react";
//
// /* =========================================================================
//    CONFIG
//    ========================================================================= */
// const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";
// const CLUB_ID = Number(process.env.NEXT_PUBLIC_CLUB_ID ?? "1");
//
// function minToStr(mins: number) {
//   const h = Math.floor(mins / 60);
//   const m = mins % 60;
//   return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
// }
// const FALLBACK_COLS = Array.from({ length: 18 }, (_, i) => {
//   const m = 10 * 60 + i * 30;
//   const s = minToStr(m);
//   const e = minToStr(m + 30);
//   return { start: s, end: e, label: `${s} - ${e}` };
// });
//
// const PRICE_PER_CELL = 1;
//
// /* =========================================================================
//    TYPES
//    ========================================================================= */
// type SlotStatus = "available" | "booked" | "walkin" | "endgame" | "maintenance";
// type GridCell = { status: SlotStatus };
// type SelectedSlot = { courtRow: number; colIdx: number };
// type GroupedSelection = {
//   courtRow: number;
//   startIdx: number;
//   endIdx: number;
//   slots: number;
//   price: number;
//   timeLabel: string;
// };
// type Col = { start: string; end: string; label: string };
//
// /* =========================================================================
//    UTILS
//    ========================================================================= */
// function strToMin(hhmm: string) {
//   const [h, m] = hhmm.split(":").map(Number);
//   return (h || 0) * 60 + (m || 0);
// }
// function classNames(...xs: (string | false | null | undefined)[]) {
//   return xs.filter(Boolean).join(" ");
// }
// function makeHourBands(cols: Col[]) {
//   const bands: { label: string; span: number }[] = [];
//   let i = 0;
//   while (i < cols.length) {
//     const startMin = strToMin(cols[i].start);
//     const hour = Math.floor(startMin / 60);
//     let span = 0;
//     while (i + span < cols.length && Math.floor(strToMin(cols[i + span].start) / 60) === hour) {
//       span++;
//     }
//     const label = `${String(hour).padStart(2, "0")}:00 - ${String(hour + 1).padStart(2, "0")}:00`;
//     bands.push({ label, span });
//     i += span;
//   }
//   return bands;
// }
//
// /* =========================================================================
//    BACKEND I/O
//    ========================================================================= */
// async function fetchDayGrid(opts: {
//   clubId: number;
//   ymd: string;
// }): Promise<{ cols: Col[]; grid: GridCell[][]; courtIds: number[]; courtNames: string[] }> {
//   const month = opts.ymd.slice(0, 7);
//   const url = `${API}/api/slots/month-view/?club=${opts.clubId}&month=${month}`;
//   const res = await fetch(url, { cache: "no-store" });
//   if (!res.ok) throw new Error(`GET month-view ${res.status}`);
//   const data = await res.json();
//
//   const dd = opts.ymd.slice(8);
//   const day =
//     data.days.find((d: any) => d.date.slice(0, 2) === dd) ||
//     data.days.find((d: any) => d.date.endsWith(`-${dd}`));
//
//   if (!day || !day.slotList || !Object.keys(day.slotList).length) {
//     return {
//       cols: FALLBACK_COLS,
//       grid: Array.from({ length: 10 }, () =>
//         Array.from({ length: FALLBACK_COLS.length }, () => ({ status: "available" }))
//       ),
//       courtIds: Array.from({ length: 10 }, (_, i) => i + 1),
//       courtNames: Array.from({ length: 10 }, (_, i) => `Court ${i + 1}`),
//     };
//   }
//
//   const entries = Object.values(day.slotList);
//
//   const uniqStarts = Array.from(new Set(entries.map((e: any) => e.start_time))).sort(
//     (a, b) => strToMin(a) - strToMin(b)
//   );
//   const stepMin = Math.max(
//     1,
//     Math.min(...entries.map((e: any) => strToMin(e.end_time) - strToMin(e.start_time)))
//   );
//   const cols: Col[] = uniqStarts.map((s) => {
//     const eMin = strToMin(s) + stepMin;
//     const e = minToStr(eMin);
//     return { start: s, end: e, label: `${s} - ${e}` };
//   });
//   const colIndex = new Map(cols.map((c, i) => [c.start, i]));
//
//   const uniqCourts = Array.from(
//     new Map(entries.map((e: any) => [e.court, e.courtName || `Court ${e.court}`])).entries()
//   ).sort((a, b) => a[0] - b[0]);
//   const courtIds = uniqCourts.map(([id]) => id);
//   const courtNames = uniqCourts.map(([, name]) => name);
//   const rows = Math.max(courtIds.length, 10);
//   const courtIndex = new Map(courtIds.map((id, idx) => [id, idx]));
//
//   const grid: GridCell[][] = Array.from({ length: rows }, () =>
//     Array.from({ length: cols.length }, () => ({ status: "available" }))
//   );
//
//   const precedence: SlotStatus[] = ["available", "walkin", "endgame", "maintenance", "booked"];
//   const weight = (s: SlotStatus) => precedence.indexOf(s);
//
//   for (const s of entries as any[]) {
//     const r = courtIndex.get(s.court);
//     const c = colIndex.get(s.start_time);
//     if (r == null || c == null) continue;
//     if (weight(s.status) > weight(grid[r][c].status)) grid[r][c].status = s.status;
//   }
//
//   return { cols, grid, courtIds, courtNames };
// }
//
// async function createBookings(payload: {
//   clubId: number;
//   items: Array<{ court: number; date: string; start: string; end: string }>;
// }) {
//   const token = localStorage.getItem("accessToken");
//   const res = await fetch(`${API}/api/bookings/`, {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//       ...(token ? { Authorization: `Bearer ${token}` } : {}),
//     },
//     body: JSON.stringify({ club: payload.clubId, items: payload.items }),
//   });
//
//   const text = await res.text().catch(() => "");
//   let data: any = {};
//   try {
//     data = text ? JSON.parse(text) : {};
//   } catch {
//     data = { detail: text };
//   }
//
//   if (!res.ok) {
//     const msg =
//       data?.detail ||
//       data?.error ||
//       (data?.slot_ids ? `conflict slots: ${data.slot_ids.join(",")}` : "") ||
//       `HTTP ${res.status}`;
//     throw new Error(msg);
//   }
//   return data;
// }
//
// /* =========================================================================
//    PAGE
//    ========================================================================= */
// export default function PlayerBookingPage() {
//   const [coins, setCoins] = useState<number>(150);
//   const [ymd, setYmd] = useState<string>("2025-09-05");
//   const [dateLabel, setDateLabel] = useState<string>("5 Sep 2025");
//   const [cols, setCols] = useState<Col[]>(FALLBACK_COLS);
//   const [grid, setGrid] = useState<GridCell[][]>(
//     Array.from({ length: 10 }, () =>
//       Array.from({ length: FALLBACK_COLS.length }, () => ({ status: "available" }))
//     )
//   );
//   const [courtIds, setCourtIds] = useState<number[]>(Array.from({ length: 10 }, (_, i) => i + 1));
//   const [courtNames, setCourtNames] = useState<string[]>(
//     Array.from({ length: 10 }, (_, i) => `Court ${i + 1}`)
//   );
//   const [selected, setSelected] = useState<SelectedSlot[]>([]);
//   const groups = useMemo(() => groupSelections(selected, cols), [selected, cols]);
//   const totalPrice = groups.reduce((s, g) => s + g.price, 0);
//   const notEnough = totalPrice > coins;
//   const [openSummary, setOpenSummary] = useState(false);
//   const [openConfirm, setOpenConfirm] = useState(false);
//   const [bookingNos, setBookingNos] = useState<string[]>([]);
//   const hourBands = useMemo(() => makeHourBands(cols), [cols]);
//
//   useEffect(() => {
//     (async () => {
//       try {
//         const { cols, grid, courtIds, courtNames } = await fetchDayGrid({ clubId: CLUB_ID, ymd });
//         setCols(cols);
//         setGrid(grid);
//         setCourtIds(courtIds);
//         setCourtNames(courtNames);
//         setSelected([]);
//       } catch (e) {
//         console.error(e);
//       }
//     })();
//   }, [ymd]);
//
//   function toggleSelect(courtRow: number, colIdx: number) {
//     const r = courtRow - 1;
//     const cell = grid[r]?.[colIdx];
//     if (!cell || cell.status !== "available") return;
//     const key = `${courtRow}-${colIdx}`;
//     const exists = selected.some((s) => `${s.courtRow}-${s.colIdx}` === key);
//     setSelected((prev) =>
//       exists ? prev.filter((s) => `${s.courtRow}-${s.colIdx}` !== key) : [...prev, { courtRow, colIdx }]
//     );
//   }
//
//   async function handleConfirm() {
//     try {
//       const items = groups.map((g) => {
//         const start = cols[g.startIdx].start;
//         const end = cols[g.endIdx].end;
//         const courtId = courtIds[g.courtRow - 1] ?? g.courtRow;
//         return { court: courtId, date: ymd, start, end };
//       });
//       const res = await createBookings({ clubId: CLUB_ID, items });
//       setCoins((c) => c - totalPrice);
//       setGrid((g) => {
//         const next = g.map((row) => row.map((cell) => ({ ...cell })));
//         selected.forEach(({ courtRow, colIdx }) => {
//           if (next[courtRow - 1]?.[colIdx]) next[courtRow - 1][colIdx].status = "booked";
//         });
//         return next;
//       });
//       setBookingNos(res.bookings?.map((b: any) => b.booking_no) ?? []);
//       setOpenSummary(false);
//       setOpenConfirm(true);
//       setSelected([]);
//     } catch (err: any) {
//       alert(`Booking failed: ${err?.message}`);
//     }
//   }
//
//   function shiftDay(delta: number) {
//     const d = new Date(ymd);
//     d.setDate(d.getDate() + delta);
//     const y = d.getFullYear();
//     const m = `${d.getMonth() + 1}`.padStart(2, "0");
//     const dd = `${d.getDate()}`.padStart(2, "0");
//     setYmd(`${y}-${m}-${dd}`);
//     setDateLabel(d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }));
//   }
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
//             onClick={() => setOpenSummary(true)}
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
//       {/* Grid */}
//       <div className="relative rounded-2xl border border-neutral-200 bg-white p-3 shadow-sm">
//         <div className="grid" style={{ gridTemplateColumns: `120px repeat(${cols.length}, 1fr)` }}>
//           <div className="px-3 py-2 text-sm font-bold text-neutral-700">Time</div>
//           {hourBands.map((b, i) => (
//             <div key={i} className="px-1 py-1 flex items-center justify-center"
//               style={{ gridColumn: `span ${b.span} / span ${b.span}` }}>
//               <div className="whitespace-nowrap tabular-nums rounded-md border border-neutral-200 bg-neutral-100 px-2 py-[2px] text-[10px] font-semibold text-neutral-600">
//                 {b.label}
//               </div>
//             </div>
//           ))}
//         </div>
//         <div className="mt-1">
//           {grid.map((row, rIdx) => (
//             <div key={rIdx} className="grid border-t border-neutral-100"
//               style={{ gridTemplateColumns: `120px repeat(${cols.length}, 1fr)` }}>
//               <div className="flex items-center gap-2 px-3 py-2">
//                 <span className="inline-flex h-7 w-10 items-center justify-center rounded-md bg-neutral-100 text-sm font-bold">
//                   {rIdx + 1}
//                 </span>
//                 <span className="text-sm text-neutral-700">
//                   {courtNames[rIdx] ?? `Court ${rIdx + 1}`}
//                 </span>
//               </div>
//               {row.map((cell, cIdx) => {
//                 const isSelected = selected.some((s) => s.courtRow === rIdx + 1 && s.colIdx === cIdx);
//                 const styleByStatus: Record<SlotStatus, string> = {
//                   available: "bg-white border border-neutral-200 hover:bg-neutral-50",
//                   booked: "bg-rose-900/70 text-white",
//                   walkin: "bg-amber-700/70 text-white",
//                   endgame: "bg-orange-400/70 text-white",
//                   maintenance: "bg-neutral-400/60 text-white",
//                 };
//                 const selectedStyle = "bg-teal-800 text-white ring-2 ring-teal-900/50 hover:bg-teal-700";
//                 return (
//                   <button
//                     key={cIdx}
//                     className={classNames(
//                       "h-10 m-[3px] rounded-[4px] grid place-items-center text-xs font-semibold transition-colors",
//                       isSelected ? selectedStyle : styleByStatus[cell.status]
//                     )}
//                     onClick={() => toggleSelect(rIdx + 1, cIdx)}
//                     disabled={cell.status !== "available"}
//                   >
//                     {isSelected ? "✓" : ""}
//                   </button>
//                 );
//               })}
//             </div>
//           ))}
//         </div>
//       </div>
//
//       {/* Summary Modal */}
//       {openSummary && (
//         <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
//           <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-lg relative">
//             <button className="absolute top-2 right-3 text-lg" onClick={() => setOpenSummary(false)}>×</button>
//             <h2 className="font-bold text-xl mb-4">Booking Summary</h2>
//             {groups.map((g, i) => (
//               <div key={i} className="border p-2 mb-2 rounded-md text-sm">
//                 Court: {courtNames[g.courtRow - 1]} <br />
//                 Time: {g.timeLabel} <br />
//                 Duration: {(g.slots * 30) / 60} hr <br />
//                 Price: {g.price} coins
//               </div>
//             ))}
//             <div className="flex justify-between font-bold mt-4">
//               <span>Total</span>
//               <span>{totalPrice} coins</span>
//             </div>
//             <div className="flex justify-end gap-2 mt-4">
//               <button onClick={() => setOpenSummary(false)} className="px-3 py-1 border rounded-md">Cancel</button>
//               <button onClick={handleConfirm} disabled={notEnough}
//                 className={classNames("px-3 py-1 rounded-md text-white",
//                   notEnough ? "bg-gray-400 cursor-not-allowed" : "bg-teal-700 hover:bg-teal-600")}>
//                 Confirm
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//
//       {/* Confirmed Modal */}
//       {openConfirm && (
//         <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
//           <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-lg relative text-center">
//             <button className="absolute top-2 right-3 text-lg" onClick={() => setOpenConfirm(false)}>×</button>
//             <div className="text-3xl text-green-600 mb-2">✓</div>
//             <h2 className="font-bold text-2xl mb-2">Booking Confirmed!</h2>
//             {bookingNos.map((no, i) => (
//               <div key={i} className="text-sm text-gray-600">Booking ID: {no}</div>
//             ))}
//             <button onClick={() => setOpenConfirm(false)} className="mt-4 px-4 py-2 bg-teal-700 text-white rounded-md">Close</button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }
//
// /* =========================================================================
//    HELPERS
//    ========================================================================= */
// function groupSelections(sel: SelectedSlot[], cols: Col[]): GroupedSelection[] {
//   const byCourt: Record<number, number[]> = {};
//   sel.forEach((s) => {
//     byCourt[s.courtRow] ??= [];
//     byCourt[s.courtRow].push(s.colIdx);
//   });
//   const out: GroupedSelection[] = [];
//   Object.entries(byCourt).forEach(([courtStr, idxList]) => {
//     const courtRow = Number(courtStr);
//     const idxs = [...new Set(idxList)].sort((a, b) => a - b);
//     if (!idxs.length) return;
//     let start = idxs[0];
//     let prev = idxs[0];
//     for (let i = 1; i <= idxs.length; i++) {
//       const cur = idxs[i];
//       if (cur !== prev + 1) {
//         const end = prev;
//         const slots = end - start + 1;
//         const s = cols[start]?.start ?? "";
//         const e = cols[end]?.end ?? "";
//         out.push({ courtRow, startIdx: start, endIdx: end, slots, price: slots * PRICE_PER_CELL, timeLabel: `${s} - ${e}` });
//         start = cur!;
//       }
//       prev = cur!;
//     }
//   });
//   return out.sort((a, b) => a.courtRow - b.courtRow || a.startIdx - b.startIdx);
// }
"use client";

import React, { useEffect, useMemo, useState } from "react";

/* =========================================================================
   CONFIG
   ========================================================================= */
const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";
const CLUB_ID = Number(process.env.NEXT_PUBLIC_CLUB_ID ?? "1");

function minToStr(mins: number) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}
const FALLBACK_COLS = Array.from({ length: 18 }, (_, i) => {
  const m = 10 * 60 + i * 30;
  const s = minToStr(m);
  const e = minToStr(m + 30);
  return { start: s, end: e, label: `${s} - ${e}` };
});

const PRICE_PER_CELL = 50; // ✅ หักเหรียญช่องละ 50

/* =========================================================================
   TYPES
   ========================================================================= */
type SlotStatus = "available" | "booked" | "walkin" | "endgame" | "maintenance";
type GridCell = { status: SlotStatus };
type SelectedSlot = { courtRow: number; colIdx: number };
type GroupedSelection = {
  courtRow: number;
  startIdx: number;
  endIdx: number;
  slots: number;
  price: number;
  timeLabel: string;
};
type Col = { start: string; end: string; label: string };

/* =========================================================================
   UTILS
   ========================================================================= */
function strToMin(hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
}
function classNames(...xs: (string | false | null | undefined)[]) {
  return xs.filter(Boolean).join(" ");
}
function makeHourBands(cols: Col[]) {
  const bands: { label: string; span: number }[] = [];
  let i = 0;
  while (i < cols.length) {
    const startMin = strToMin(cols[i].start);
    const hour = Math.floor(startMin / 60);
    let span = 0;
    while (i + span < cols.length && Math.floor(strToMin(cols[i + span].start) / 60) === hour) {
      span++;
    }
    const label = `${String(hour).padStart(2, "0")}:00 - ${String(hour + 1).padStart(2, "0")}:00`;
    bands.push({ label, span });
    i += span;
  }
  return bands;
}

/* =========================================================================
   BACKEND I/O
   ========================================================================= */
async function fetchDayGrid(opts: {
  clubId: number;
  ymd: string;
}): Promise<{ cols: Col[]; grid: GridCell[][]; courtIds: number[]; courtNames: string[] }> {
  const month = opts.ymd.slice(0, 7);
  const url = `${API}/api/slots/month-view/?club=${opts.clubId}&month=${month}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`GET month-view ${res.status}`);
  const data = await res.json();

  const dd = opts.ymd.slice(8);
  const day =
    data.days.find((d: any) => d.date.slice(0, 2) === dd) ||
    data.days.find((d: any) => d.date.endsWith(`-${dd}`));

  if (!day || !day.slotList || !Object.keys(day.slotList).length) {
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

  const uniqStarts = Array.from(new Set(entries.map((e: any) => e.start_time))).sort(
    (a, b) => strToMin(a) - strToMin(b)
  );
  const stepMin = Math.max(
    1,
    Math.min(...entries.map((e: any) => strToMin(e.end_time) - strToMin(e.start_time)))
  );
  const cols: Col[] = uniqStarts.map((s) => {
    const eMin = strToMin(s) + stepMin;
    const e = minToStr(eMin);
    return { start: s, end: e, label: `${s} - ${e}` };
  });
  const colIndex = new Map(cols.map((c, i) => [c.start, i]));

  const uniqCourts = Array.from(
    new Map(entries.map((e: any) => [e.court, e.courtName || `Court ${e.court}`])).entries()
  ).sort((a, b) => a[0] - b[0]);
  const courtIds = uniqCourts.map(([id]) => id);
  const courtNames = uniqCourts.map(([, name]) => name);
  const rows = Math.max(courtIds.length, 10);
  const courtIndex = new Map(courtIds.map((id, idx) => [id, idx]));

  const grid: GridCell[][] = Array.from({ length: rows }, () =>
    Array.from({ length: cols.length }, () => ({ status: "available" }))
  );

  const precedence: SlotStatus[] = ["available", "walkin", "endgame", "maintenance", "booked"];
  const weight = (s: SlotStatus) => precedence.indexOf(s);

  for (const s of entries as any[]) {
    const r = courtIndex.get(s.court);
    const c = colIndex.get(s.start_time);
    if (r == null || c == null) continue;
    if (weight(s.status) > weight(grid[r][c].status)) grid[r][c].status = s.status;
  }

  return { cols, grid, courtIds, courtNames };
}

async function fetchWalletBalance(): Promise<number> {
  const token = localStorage.getItem("accessToken");
  const res = await fetch(`${API}/api/wallet/me/`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!res.ok) throw new Error("Failed to fetch balance");
  const data = await res.json();
  return data.balance ?? 0;
}

async function createBookings(payload: {
  clubId: number;
  items: Array<{ court: number; date: string; start: string; end: string }>;
}) {
  const token = localStorage.getItem("accessToken");
  const res = await fetch(`${API}/api/bookings/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
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
  return data;
}

/* =========================================================================
   PAGE
   ========================================================================= */
export default function PlayerBookingPage() {
  const [coins, setCoins] = useState<number | null>(null);
  const [ymd, setYmd] = useState<string>("2025-09-05");
  const [dateLabel, setDateLabel] = useState<string>("5 Sep 2025");
  const [cols, setCols] = useState<Col[]>(FALLBACK_COLS);
  const [grid, setGrid] = useState<GridCell[][]>(
    Array.from({ length: 10 }, () =>
      Array.from({ length: FALLBACK_COLS.length }, () => ({ status: "available" }))
    )
  );
  const [courtIds, setCourtIds] = useState<number[]>(Array.from({ length: 10 }, (_, i) => i + 1));
  const [courtNames, setCourtNames] = useState<string[]>(
    Array.from({ length: 10 }, (_, i) => `Court ${i + 1}`)
  );
  const [selected, setSelected] = useState<SelectedSlot[]>([]);
  const groups = useMemo(() => groupSelections(selected, cols), [selected, cols]);
  const totalPrice = groups.reduce((s, g) => s + g.price, 0);
  const notEnough = coins !== null && totalPrice > coins;
  const [openSummary, setOpenSummary] = useState(false);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [bookingNos, setBookingNos] = useState<string[]>([]);
  const hourBands = useMemo(() => makeHourBands(cols), [cols]);

  useEffect(() => {
    (async () => {
      try {
        const { cols, grid, courtIds, courtNames } = await fetchDayGrid({ clubId: CLUB_ID, ymd });
        setCols(cols);
        setGrid(grid);
        setCourtIds(courtIds);
        setCourtNames(courtNames);
        setSelected([]);

        const bal = await fetchWalletBalance();
        setCoins(bal);
      } catch (e) {
        console.error(e);
      }
    })();
  }, [ymd]);

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

  async function handleConfirm() {
    try {
      const items = groups.map((g) => {
        const start = cols[g.startIdx].start;
        const end = cols[g.endIdx].end;
        const courtId = courtIds[g.courtRow - 1] ?? g.courtRow;
        return { court: courtId, date: ymd, start, end };
      });
      const res = await createBookings({ clubId: CLUB_ID, items });

      setCoins(res.new_balance ?? coins);

      setGrid((g) => {
        const next = g.map((row) => row.map((cell) => ({ ...cell })));
        selected.forEach(({ courtRow, colIdx }) => {
          if (next[courtRow - 1]?.[colIdx]) next[courtRow - 1][colIdx].status = "booked";
        });
        return next;
      });

      setBookingNos(res.bookings?.map((b: any) => b.booking_no) ?? []);
      setOpenSummary(false);
      setOpenConfirm(true);
      setSelected([]);
    } catch (err: any) {
      alert(`Booking failed: ${err?.message}`);
    }
  }

  function shiftDay(delta: number) {
    const d = new Date(ymd);
    d.setDate(d.getDate() + delta);
    const y = d.getFullYear();
    const m = `${d.getMonth() + 1}`.padStart(2, "0");
    const dd = `${d.getDate()}`.padStart(2, "0");
    setYmd(`${y}-${m}-${dd}`);
    setDateLabel(d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }));
  }

  return (
    <div className="mx-auto max-w-[1100px] px-4 py-6">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-extrabold tracking-tight">Booking Slots</h1>
        <div className="flex items-center gap-4">
          <div className="text-sm font-semibold text-gray-700">
            Coins: {coins !== null ? coins : "..."}
          </div>
          <button
            onClick={() => setOpenSummary(true)}
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

      {/* Grid */}
      <div className="relative rounded-2xl border border-neutral-200 bg-white p-3 shadow-sm">
        <div className="grid" style={{ gridTemplateColumns: `120px repeat(${cols.length}, 1fr)` }}>
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
        <div className="mt-1">
          {grid.map((row, rIdx) => (
            <div
              key={rIdx}
              className="grid border-t border-neutral-100"
              style={{ gridTemplateColumns: `120px repeat(${cols.length}, 1fr)` }}
            >
              <div className="flex items-center gap-2 px-3 py-2">
                <span className="inline-flex h-7 w-10 items-center justify-center rounded-md bg-neutral-100 text-sm font-bold">
                  {rIdx + 1}
                </span>
                <span className="text-sm text-neutral-700">
                  {courtNames[rIdx] ?? `Court ${rIdx + 1}`}
                </span>
              </div>
              {row.map((cell, cIdx) => {
                const isSelected = selected.some((s) => s.courtRow === rIdx + 1 && s.colIdx === cIdx);
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
                      "h-10 m-[3px] rounded-[4px] grid place-items-center text-xs font-semibold transition-colors",
                      isSelected ? selectedStyle : styleByStatus[cell.status]
                    )}
                    onClick={() => toggleSelect(rIdx + 1, cIdx)}
                    disabled={cell.status !== "available"}
                  >
                    {isSelected ? "✓" : ""}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Summary Modal */}
      {openSummary && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-lg relative">
            <button className="absolute top-2 right-3 text-lg" onClick={() => setOpenSummary(false)}>
              ×
            </button>
            <h2 className="font-bold text-xl mb-4">Booking Summary</h2>
            {groups.map((g, i) => (
              <div key={i} className="border p-2 mb-2 rounded-md text-sm">
                Court: {courtNames[g.courtRow - 1]} <br />
                Time: {g.timeLabel} <br />
                Duration: {(g.slots * 30) / 60} hr <br />
                Price: {g.price} coins
              </div>
            ))}
            <div className="flex justify-between font-bold mt-4">
              <span>Total</span>
              <span>{totalPrice} coins</span>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setOpenSummary(false)}
                className="px-3 py-1 border rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                disabled={notEnough}
                className={classNames(
                  "px-3 py-1 rounded-md text-white",
                  notEnough
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-teal-700 hover:bg-teal-600"
                )}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmed Modal */}
      {openConfirm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-lg relative text-center">
            <button className="absolute top-2 right-3 text-lg" onClick={() => setOpenConfirm(false)}>
              ×
            </button>
            <div className="text-3xl text-green-600 mb-2">✓</div>
            <h2 className="font-bold text-2xl mb-2">Booking Confirmed!</h2>
            {bookingNos.map((no, i) => (
              <div key={i} className="text-sm text-gray-600">
                Booking ID: {no}
              </div>
            ))}
            <button
              onClick={() => setOpenConfirm(false)}
              className="mt-4 px-4 py-2 bg-teal-700 text-white rounded-md"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* =========================================================================
   HELPERS
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
