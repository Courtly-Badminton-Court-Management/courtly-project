//frontend/src/lib/slot/groupSelections.ts
import type { Col, GroupedSelection, SelectedSlot } from "./slotGridModel";


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
    const courtRow = Number(courtStr);            // 1-based
    const idxs = [...new Set(idxList)].sort((a, b) => a - b);
    if (!idxs.length) return;

    let start = idxs[0];
    let prev = idxs[0];

    for (let i = 1; i <= idxs.length; i++) {
      const cur = idxs[i];                        // undefined เมื่อจบลูป = ตัดกลุ่มสุดท้าย
      if (cur !== prev + 1) {
        const end = prev;
        const slots = end - start + 1;

        // เวลาสวย ๆ สำหรับแสดงผล
        const s = cols[start]?.start ?? "";
        const e = cols[end]?.end ?? "";

        // ✅ ราคา "จริง" = ผลรวม coins ของทุกคอลัมน์ในกลุ่ม
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

        start = cur!; // เริ่มกลุ่มใหม่
      }
      prev = cur!;
    }
  });

  return out.sort(
    (a, b) => a.courtRow - b.courtRow || a.startIdx - b.startIdx,
  );
}
