// แปลง slot จาก /api/bookings/all/ ให้เป็น GroupedSelection (เหมือนตอนสรุปก่อนกดจอง)
import dayjs from "dayjs";

export type GroupedSelection = {
  courtRow: number;   // 1-based court no.
  startIdx: number;   // index เริ่ม (นับทีละ cell)
  endIdx: number;     // index จบ
  slots: number;      // จำนวนช่อง
  price: number;      // ราคาในกลุ่ม
  timeLabel: string;  // "13:00 - 14:30"
};

export type SlotFromHistory = {
  slot_court?: number; court?: number;
  slot_service_date?: string; service_date?: string;
  slot_start_at?: string; start_at?: string; start_time?: string; start?: string;
  slot_end_at?: string;   end_at?: string;   end_time?: string;   end?: string;
  price_coins?: number | string; price?: number | string;
};

export type HistoryBookingLike = {
  slots?: SlotFromHistory[];
};

const toHHmm = (v?: string | null) => {
  if (!v) return null;
  const m = v.match(/\d{1,2}:\d{2}/);
  return m ? m[0] : dayjs(v).isValid() ? dayjs(v).format("HH:mm") : null;
};
const toMin = (hhmm?: string | null) => {
  if (!hhmm) return null;
  const [h, m] = hhmm.split(":").map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return null;
  return h * 60 + m;
};
const cleanCoins = (x: unknown) =>
  typeof x === "number" ? x : Number(String(x ?? "0").replace(/[^\d.-]/g, "")) || 0;

/**
 * รวมช่วงเวลาต่อเนื่องของ court เดียวกันเป็นก้อนๆ เหมือนสรุปก่อนยืนยัน
 */
export function historyBookingToGroups(
  booking: HistoryBookingLike,
  minutesPerCell: number,
  fallbackPricePerCell = 0,
): GroupedSelection[] {
  const slots = (booking.slots ?? []).map((s) => {
    const court = s.slot_court ?? s.court ?? 0;
    const start = toHHmm(s.slot_start_at ?? s.start_at ?? s.start_time ?? s.start ?? null);
    const end   = toHHmm(s.slot_end_at   ?? s.end_at   ?? s.end_time   ?? s.end   ?? null);
    const startMin = toMin(start);
    const endMin   = toMin(end);
    return {
      courtRow: Number(court) || 0,
      startMin, endMin,
      price: cleanCoins(s.price_coins ?? s.price ?? fallbackPricePerCell),
    };
  })
  .filter(s => s.courtRow > 0 && s.startMin !== null && s.endMin !== null) as Array<
    { courtRow: number; startMin: number; endMin: number; price: number }
  >;

  // เรียงตาม court -> เวลา
  slots.sort((a,b) => a.courtRow - b.courtRow || a.startMin - b.startMin);

  const groups: GroupedSelection[] = [];
  let cur: { courtRow: number; startMin: number; endMin: number; price: number } | null = null;

  slots.forEach((s, idx) => {
    if (!cur) { cur = { courtRow: s.courtRow, startMin: s.startMin, endMin: s.endMin, price: s.price }; return; }
    const contiguous = s.courtRow === cur.courtRow && s.startMin === cur.endMin;
    if (contiguous) {
      cur.endMin = s.endMin;
      cur.price += s.price || fallbackPricePerCell;
    } else {
      pushGroup(groups, cur, minutesPerCell);
      cur = { courtRow: s.courtRow, startMin: s.startMin, endMin: s.endMin, price: s.price };
    }
    if (idx === slots.length - 1 && cur) {
      pushGroup(groups, cur, minutesPerCell);
      cur = null;
    }
  });

  return groups;
}

function pushGroup(arr: GroupedSelection[], g: { courtRow: number; startMin: number; endMin: number; price: number }, minutesPerCell: number) {
  const slotsCount = Math.max(1, Math.round((g.endMin - g.startMin) / minutesPerCell));
  arr.push({
    courtRow: g.courtRow,
    startIdx: Math.floor(g.startMin / minutesPerCell),
    endIdx: Math.floor((g.endMin - 1) / minutesPerCell),
    slots: slotsCount,
    price: g.price,
    timeLabel: `${minToHHmm(g.startMin)} - ${minToHHmm(g.endMin)}`,
  });
}

function minToHHmm(min: number) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}`;
}
