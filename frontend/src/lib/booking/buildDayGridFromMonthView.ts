import type { Col, GridCell } from "@/lib/booking/slotGridModel";
import type { MonthViewResponse } from "@/api-client/extras/slots";

export type DayGridResult = {
  cols: Col[];
  grid: GridCell[][];
  priceGrid: number[][];
  courtIds: number[];
  courtNames: string[];
  minutesPerCell: number;
};

const hhmmToMin = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
};
const toKey = (s: string, e: string) => `${s}-${e}`;

// API returns date in "DD-MM-YY" format inside days[].date
const ymdToDdMmYy = (ymd: string) => {
  const [Y, M, D] = ymd.split("-");
  return `${D}-${M}-${String(Y).slice(-2)}`;
};

export function buildDayGridFromMonthView(
  mv: MonthViewResponse | undefined,
  ymd: string
) {
  // Ensure mv can handle both direct and nested response structures
  const safeData: any = mv && "data" in mv ? mv.data : mv;
  const days = Array.isArray(safeData) ? safeData : safeData?.days || [];

  // Find the day object that matches the target date
  const targetKey = ymdToDdMmYy(ymd); // e.g. "21-10-25"
  const day = days.find((d: any) => d.date === targetKey);

  const slotList = day?.booking_slots ?? {};

  // If no data exists for that day, return an empty structure (UI will render an empty state)
  if (!Object.keys(slotList).length) {
    return {
      cols: [],
      grid: [],
      priceGrid: [],
      courtIds: [],
      courtNames: [],
      minutesPerCell: 30,
    };
  }

  const timeSet = new Set<string>();
  const courtMap = new Map<number, string>();

  // Collect unique time intervals and court mappings
  Object.values(slotList).forEach((s: any) => {
    timeSet.add(toKey(s.start_time, s.end_time));
    courtMap.set(s.court, s.court_name);
  });

  const courtIds = Array.from(courtMap.keys()).sort((a, b) => a - b);
  const courtNames = courtIds.map((id) => courtMap.get(id) ?? `Court ${id}`);

  // Sort time intervals chronologically
  const times = Array.from(timeSet).sort((a, b) => {
    const [as] = a.split("-"),
      [bs] = b.split("-");
    return hhmmToMin(as) - hhmmToMin(bs);
  });

  // Create columns for each time slot
  const cols: Col[] = times.map((k) => {
    const [start, end] = k.split("-");
    return { start, end, label: `${start}–${end}` };
  });

  // Create a lookup dictionary for fast slot access
  const dict = new Map<string, any>();
  Object.values(slotList).forEach((s: any) => {
    dict.set(`${s.court}|${toKey(s.start_time, s.end_time)}`, s);
  });

  const grid: GridCell[][] = [];
  const priceGrid: number[][] = [];

  // Build grid and price data for each court and time slot
  for (let r = 0; r < courtIds.length; r++) {
    const row: GridCell[] = [];
    const prow: number[] = [];
    for (let c = 0; c < cols.length; c++) {
      const key = `${courtIds[r]}|${toKey(cols[c].start, cols[c].end)}`;
      const s = dict.get(key);
      row.push({ status: s?.status ?? "expired" } as GridCell);
      prow.push(typeof s?.price_coin === "number" ? s.price_coin : 0);
    }
    grid.push(row);
    priceGrid.push(prow);
  }

  // Determine the duration of a single time slot
  const minutesPerCell = cols[0]
    ? hhmmToMin(cols[0].end) - hhmmToMin(cols[0].start)
    : 30;

  return { cols, grid, priceGrid, courtIds, courtNames, minutesPerCell };
}

/**
 * Builds a placeholder grid (used when no real data is available).
 * Useful for loading states or empty views.
 */
export function buildPlaceholderGrid(
  start = "10:00",
  end = "22:00",
  minutesPerCell = 30,
  courtCount = 10
) {
  const toMin = (t: string) => {
    const [h, m] = t.split(":").map(Number);
    return h * 60 + (m || 0);
  };
  const fmt = (m: number) =>
    `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(
      2,
      "0"
    )}`;

  // Create time columns
  const cols: Col[] = [];
  for (let t = toMin(start); t < toMin(end); t += minutesPerCell) {
    const s = fmt(t),
      e = fmt(t + minutesPerCell);
    cols.push({ start: s, end: e, label: `${s}–${e}` });
  }

  // Create default grid and price structure
  const grid: GridCell[][] = Array.from({ length: courtCount }, () =>
    Array.from({ length: cols.length }, () => ({
      status: "expired",
    }) as GridCell)
  );
  const priceGrid: number[][] = Array.from({ length: courtCount }, () =>
    Array.from({ length: cols.length }, () => 0)
  );
  const courtIds = Array.from({ length: courtCount }, (_, i) => i + 1);
  const courtNames = courtIds.map((id) => `Court ${id}`);

  return { cols, grid, priceGrid, courtIds, courtNames, minutesPerCell };
}

