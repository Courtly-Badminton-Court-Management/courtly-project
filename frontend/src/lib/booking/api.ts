// src/lib/booking/api.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { customRequest } from "@/api-client/custom-client";
import { hhmmToMin, minToHhmm } from "@/lib/booking/datetime";
import type { Col, GridCell, PriceGrid, SlotStatus } from "../slot/slotGridModel";
import {
  getWalletMeRetrieveQueryKey,
  useWalletMeRetrieve,
} from "@/api-client/endpoints/wallet/wallet";

/** top row fallback ถ้าไม่มีข้อมูล */
const FALLBACK_COLS: Col[] = Array.from({ length: 18 }, (_, i) => {
  const m = 10 * 60 + i * 30;
  const s = minToHhmm(m);
  const e = minToHhmm(m + 30);
  return { start: s, end: e, label: `${s} - ${e}` };
});

/**
 * จัดลำดับความแรงของสถานะ (น้อย -> มาก)
 * วาง maintenance ท้ายสุดให้ชนะทุกอย่าง
 */
const STATUS_ORDER = [
  "available",
  "booked",
  "walkin",
  "checkin",
  "endgame",
  "expired",
  "no_show",
  "maintenance",
] as const;

/** ถ้าเจอสถานะนอกลิสต์ → ให้หนักสุด (กันพลาด) */
function weight(s: string) {
  const i = STATUS_ORDER.indexOf(s as (typeof STATUS_ORDER)[number]);
  return i === -1 ? STATUS_ORDER.length - 1 : i;
}

export function useDayGrid(params: { clubId: number; ymd: string }) {
  const month = params.ymd.slice(0, 7); // YYYY-MM

  const q = useQuery({
    queryKey: ["slots-month-view", params.clubId, month],
    queryFn: ({ signal }) =>
      customRequest<any>({
        url: `/api/slots/month-view/?club=${params.clubId}&month=${month}`,
        method: "GET",
        signal,
      }),
  });

  const raw = (q.data as any)?.data ?? q.data;
  const dd = params.ymd.slice(8);

  // ไม่มีข้อมูลเลย → สร้างตารางว่าง
  if (!raw || !Array.isArray(raw.days)) {
    const priceGrid: PriceGrid = Array.from({ length: 10 }, () =>
      Array.from({ length: FALLBACK_COLS.length }, () => 0),
    );
    return {
      cols: FALLBACK_COLS,
      grid: Array.from({ length: 10 }, () =>
        Array.from({ length: FALLBACK_COLS.length }, () => ({
          status: "available" as SlotStatus,
          priceCoins: 0,
        })),
      ) as GridCell[][],
      priceGrid,
      courtIds: Array.from({ length: 10 }, (_, i) => i + 1),
      courtNames: Array.from({ length: 10 }, (_, i) => `Court ${i + 1}`),
      minutesPerCell: 30,
      isLoading: q.isLoading,
    };
  }

  const day =
    raw.days.find((d: any) => d.date?.slice(0, 2) === dd) ||
    raw.days.find((d: any) => d.date?.endsWith?.(`-${dd}`));

  if (!day || !day.slotList || !Object.keys(day.slotList).length) {
    const priceGrid: PriceGrid = Array.from({ length: 10 }, () =>
      Array.from({ length: FALLBACK_COLS.length }, () => 0),
    );
    return {
      cols: FALLBACK_COLS,
      grid: Array.from({ length: 10 }, () =>
        Array.from({ length: FALLBACK_COLS.length }, () => ({
          status: "available" as SlotStatus,
          priceCoins: 0,
        })),
      ) as GridCell[][],
      priceGrid,
      courtIds: Array.from({ length: 10 }, (_, i) => i + 1),
      courtNames: Array.from({ length: 10 }, (_, i) => `Court ${i + 1}`),
      minutesPerCell: 30,
      isLoading: q.isLoading,
    };
  }

  const entries: any[] = Object.values(day.slotList);

  // ทำ columns และดึง step นาทีจริง
  const uniqStarts = Array.from(new Set(entries.map((e) => e.start_time))).sort(
    (a, b) => hhmmToMin(a) - hhmmToMin(b),
  );
  const stepMin = Math.max(
    1,
    Math.min(...entries.map((e) => hhmmToMin(e.end_time) - hhmmToMin(e.start_time))),
  );

  const cols: Col[] = uniqStarts.map((s) => {
    const e = minToHhmm(hhmmToMin(s) + stepMin);
    return { start: s, end: e, label: `${s} - ${e}` };
  });
  const colIndex = new Map(cols.map((c, i) => [c.start, i]));

  // courts
  const uniqCourts = Array.from(
    new Map(entries.map((e) => [e.court, e.courtName || `Court ${e.court}`])).entries(),
  ).sort((a, b) => (a[0] as number) - (b[0] as number));
  const courtIds = uniqCourts.map(([id]) => id as number);
  const courtNames = uniqCourts.map(([, name]) => name as string);
  const rows = Math.max(courtIds.length, 10);
  const courtIndex = new Map(courtIds.map((id, idx) => [id, idx]));

  // เตรียม grid และราคา
  const grid: GridCell[][] = Array.from({ length: rows }, () =>
    Array.from({ length: cols.length }, () => ({
      status: "available" as SlotStatus,
      priceCoins: 0,
    })),
  );
  const priceGrid: PriceGrid = Array.from({ length: rows }, () =>
    Array.from({ length: cols.length }, () => 0),
  );

  // map status + price ลงช่อง
  for (const s of entries) {
    const r = courtIndex.get(s.court);
    const c = colIndex.get(s.start_time);
    if (r == null || c == null) continue;

    const incomingStatus = String(s.status ?? "").trim().toLowerCase();

    const cur = grid[r][c].status;
    if (weight(incomingStatus) > weight(cur)) {
      grid[r][c].status = incomingStatus as SlotStatus;
    }

    const price = Number(s.price_coins ?? s.priceCoins ?? s.price ?? 0) || 0;
    grid[r][c].priceCoins = price;
    priceGrid[r][c] = price;
  }

  return {
    cols,
    grid,
    priceGrid,
    courtIds,
    courtNames,
    minutesPerCell: stepMin,
    isLoading: q.isLoading,
  };
}

export function useWalletBalance() {
  const q = useWalletMeRetrieve();
  const raw = (q.data as any) ?? {};
  return { balance: raw.balance ?? raw?.data?.balance ?? 0, isLoading: q.isLoading };
}

type CreateItem = { court: number; date: string; start: string; end: string };

export function useCreateBookings() {
  const qc = useQueryClient();

  const { mutateAsync, isPending } = useMutation({
    mutationFn: (body: { club: number; items: CreateItem[] }) =>
      customRequest<any>({
        url: `/api/bookings/`,
        method: "POST",
        headers: { "Content-Type": "application/json" },
        data: body,
      }).then((r) => r?.data ?? r),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["slots-month-view"] }).catch(() => {});
      qc.invalidateQueries({ queryKey: getWalletMeRetrieveQueryKey() }).catch(() => {});
    },
  });

  return {
    create: (club: number, items: CreateItem[]) => mutateAsync({ club, items }),
    isCreating: isPending,
  };
}
