import type { Col, GroupedSelection, SelectedSlot } from "./slotGridModel";
import type { SlotItem } from "@/api-client/extras/types";

/**
 * รวมช่องที่เลือกให้เป็นกลุ่มต่อเนื่องในแต่ละ courtRow
 * และคำนวณราคา "จริง" จาก priceGrid[r][c] (coins ต่อช่อง)
 */
export function groupSelectionsWithPrice(
  sel: SelectedSlot[],
  cols: Col[],
  priceGrid: number[][],
): GroupedSelection[] {
  const byCourt: Record<number, number[]> = {};
  sel.forEach((s) => {
    (byCourt[s.courtRow] ??= []).push(s.colIdx);
  });

  const out: GroupedSelection[] = [];

  Object.entries(byCourt).forEach(([courtStr, idxList]) => {
    const courtRow = Number(courtStr); // 1-based
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

        // ✅ คำนวณราคา
        let price = 0;
        for (let c = start; c <= end; c++) {
          price += priceGrid[courtRow - 1]?.[c] ?? 0;
        }

        out.push({
          courtRow,
          startIdx: start,
          endIdx: end,
          slots,
          price,
          timeLabel: `${s} - ${e}`,
        });

        start = cur!;
      }
      prev = cur!;
    }
  });

  return out.sort((a, b) => a.courtRow - b.courtRow || a.startIdx - b.startIdx);
}

/* -------------------------------------------------------------------------- */
/* 🆕 เพิ่มฟังก์ชันใหม่: group จาก SlotItem[] โดยตรง                        */
/* -------------------------------------------------------------------------- */
export function groupSlotItemsWithPrice(slotItems: SlotItem[]): GroupedSelection[] {
  if (!slotItems.length) return [];

  // group ตาม court
  const byCourt: Record<string, SlotItem[]> = {};
  slotItems.forEach((s) => {
    (byCourt[s.court_name] ??= []).push(s);
  });

  const out: GroupedSelection[] = [];

  Object.entries(byCourt).forEach(([courtName, slots]) => {
    // sort ตามเวลาเริ่ม
    const sorted = [...slots].sort((a, b) =>
      a.start_time.localeCompare(b.start_time)
    );

    let groupStart = sorted[0];
    let prevEnd = sorted[0].end_time;
    let priceSum = sorted[0].price_coin;
    let count = 1;

    for (let i = 1; i <= sorted.length; i++) {
      const cur = sorted[i];
      // ถ้าเวลาต่อกัน (end == start) ให้รวมกลุ่ม
      if (cur && cur.start_time === prevEnd) {
        priceSum += cur.price_coin;
        prevEnd = cur.end_time;
        count++;
      } else {
        // push group ปัจจุบัน
        out.push({
          courtRow: sorted[0].court, // หรือ i+1 ก็ได้
          startIdx: 0,
          endIdx: 0,
          slots: count,
          price: priceSum,
          timeLabel: `${groupStart.start_time} - ${prevEnd}`,
        });

        // เริ่ม group ใหม่
        if (cur) {
          groupStart = cur;
          prevEnd = cur.end_time;
          priceSum = cur.price_coin;
          count = 1;
        }
      }
    }
  });

  return out;
}
