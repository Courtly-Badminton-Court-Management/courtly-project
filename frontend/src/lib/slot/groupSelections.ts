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
export function groupSlotItemsWithPrice(slotItems: SlotItem[]) {
  if (!slotItems.length) return [];

  // group by court
  const byCourt: Record<number, SlotItem[]> = {};
  slotItems.forEach((s) => {
    (byCourt[s.court] ??= []).push(s);
  });

  const out: {
    court: number;
    court_name: string;
    start_time: string;
    end_time: string;
    slots: number;
    price: number;
  }[] = [];

  Object.values(byCourt).forEach((slots) => {
    // sort by time
    const sorted = [...slots].sort((a, b) =>
      a.start_time.localeCompare(b.start_time)
    );

    let groupStart = sorted[0];
    let prev = sorted[0];

    let slotsCount = 1;
    let totalPrice = prev.price_coin;

    for (let i = 1; i <= sorted.length; i++) {
      const cur = sorted[i];

      const isContinuous =
        cur && cur.start_time === prev.end_time;

      if (cur && isContinuous) {
        // same group
        slotsCount++;
        totalPrice += cur.price_coin;
        prev = cur;
      } else {
        // push finished group
        out.push({
          court: groupStart.court,
          court_name: groupStart.court_name,
          start_time: groupStart.start_time,
          end_time: prev.end_time,
          slots: slotsCount,
          price: totalPrice,
        });

        // start new group
        if (cur) {
          groupStart = cur;
          prev = cur;
          slotsCount = 1;
          totalPrice = cur.price_coin;
        }
      }
    }
  });

  // sort by court then start_time
  return out.sort(
    (a, b) =>
      a.court - b.court ||
      a.start_time.localeCompare(b.start_time)
  );
}

