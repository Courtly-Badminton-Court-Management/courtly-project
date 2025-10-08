import type { Col, GroupedSelection, SelectedSlot } from "./model";
import { getCellPriceCoins } from "./pricing";

/**
 * รวมช่องที่เลือกให้เป็นกลุ่มต่อเนื่องในแต่ละ courtRow
 * และคำนวณราคาแบบ mock: 100 coins/ช่อง
 */
export function groupSelectionsWithPrice(
  sel: SelectedSlot[],
  cols: Col[]
): GroupedSelection[] {
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

        const pricePerSlot = getCellPriceCoins();
        const price = slots * pricePerSlot; // 💰 mock 100/ช่อง

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
