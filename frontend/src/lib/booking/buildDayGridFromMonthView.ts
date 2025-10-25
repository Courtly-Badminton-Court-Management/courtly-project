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

const hhmmToMin = (t: string) => { const [h,m]=t.split(":").map(Number); return (h||0)*60+(m||0); };
const toKey = (s: string, e: string) => `${s}-${e}`;

// ⬅️ API ใช้ "DD-MM-YY" ใน days[].date
const ymdToDdMmYy = (ymd: string) => {
  const [Y, M, D] = ymd.split("-");
  return `${D}-${M}-${String(Y).slice(-2)}`;
};

export function buildDayGridFromMonthView(
  mv: MonthViewResponse | undefined,
  ymd: string
) {
  // หา day ที่ตรงกับ ymd ของหน้า
  const targetKey = ymdToDdMmYy(ymd);         // "21-10-25"
  const day = mv?.days?.find(d => d.date === targetKey);

  const slotList = day?.booking_slots ?? {};

  // ถ้าไม่มีข้อมูลวันนั้น คืนโครงว่าง (ให้ UI แสดง empty-state)
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
  Object.values(slotList).forEach(s => {
    timeSet.add(toKey(s.start_time, s.end_time));
    courtMap.set(s.court, s.court_name);
  });

  const courtIds = Array.from(courtMap.keys()).sort((a,b)=>a-b);
  const courtNames = courtIds.map(id => courtMap.get(id) ?? `Court ${id}`);

  const times = Array.from(timeSet).sort((a,b)=>{
    const [as] = a.split("-"), [bs] = b.split("-");
    return hhmmToMin(as) - hhmmToMin(bs);
  });

  const cols: Col[] = times.map(k => {
    const [start, end] = k.split("-");
    return { start, end, label: `${start}–${end}` };
  });

  // index lookup
  const dict = new Map<string, any>();
  Object.values(slotList).forEach(s => {
    dict.set(`${s.court}|${toKey(s.start_time, s.end_time)}`, s);
  });

  const grid: GridCell[][] = [];
  const priceGrid: number[][] = [];
  for (let r=0; r<courtIds.length; r++) {
    const row: GridCell[] = [];
    const prow: number[] = [];
    for (let c=0; c<cols.length; c++) {
      const key = `${courtIds[r]}|${toKey(cols[c].start, cols[c].end)}`;
      const s = dict.get(key);
      row.push({ status: s?.status ?? "expired" } as GridCell);
      prow.push(typeof s?.price_coin === "number" ? s.price_coin : 0);
    }
    grid.push(row);
    priceGrid.push(prow);
  }

  const minutesPerCell = cols[0] ? hhmmToMin(cols[0].end) - hhmmToMin(cols[0].start) : 30;

  return { cols, grid, priceGrid, courtIds, courtNames, minutesPerCell };
}


export function buildPlaceholderGrid(
  start = "10:00", end = "22:00", minutesPerCell = 30, courtCount = 10
) {
  const toMin = (t:string)=>{const [h,m]=t.split(":").map(Number);return h*60+(m||0)};
  const fmt = (m:number)=>`${String(Math.floor(m/60)).padStart(2,"0")}:${String(m%60).padStart(2,"0")}`;

  const cols: Col[] = [];
  for (let t=toMin(start); t<toMin(end); t+=minutesPerCell) {
    const s = fmt(t), e = fmt(t+minutesPerCell);
    cols.push({ start: s, end: e, label: `${s}–${e}` });
  }

  const grid: GridCell[][] = Array.from({ length: courtCount }, () =>
    Array.from({ length: cols.length }, () => ({ status: "expired" } as GridCell))
  );
  const priceGrid: number[][] = Array.from({ length: courtCount }, () =>
    Array.from({ length: cols.length }, () => 0)
  );
  const courtIds = Array.from({ length: courtCount }, (_, i) => i + 1);
  const courtNames = courtIds.map((id) => `Court ${id}`);

  return { cols, grid, priceGrid, courtIds, courtNames, minutesPerCell };
}