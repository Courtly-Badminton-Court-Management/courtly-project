// src/ui/pages/player/PlayerHistoryPage.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import { Calendar } from "lucide-react";
import {
  useBookingsRetrieve,
  useBookingsCancelCreate,
} from "@/api-client/endpoints/bookings/bookings";

import BookingReceiptModal from "@/ui/components/historypage/BookingReceiptModal";
import { generateBookingInvoicePDF } from "@/lib/booking/invoice";

/* ========================= Runtime types (ยึดตาม backend จริง) ========================= */
type SlotItem = {
  slot: number;
  slot_court: number;
  slot_service_date: string;
  slot_start_at: string;
  slot_end_at: string;
  price_coins?: number;
};

type BookingRow = {
  id: number;
  booking_no?: string;
  booking_id?: string; // กันกรณี backend ใช้ชื่อนี้
  user?: string;
  status: string; // "upcoming" | "endgame" | "no_show" | "cancelled" | ...
  created_at?: string;
  created_date?: string; // เผื่อ backend ส่งชื่อนี้
  booking_date?: string; // ถ้ามี
  total_cost?: number | string; // อาจมาเป็น number หรือ string พร้อมคำว่า coins
  able_to_cancel: boolean;
  slots: SlotItem[];
};

/* ========================= Utils ========================= */
const resolveBookingNo = (b: BookingRow) => b.booking_no ?? b.booking_id ?? "";
const statusLabel = (s?: string) => {
  const x = (s || "").toLowerCase();
  if (x === "endgame" || x === "end_game" || x === "completed") return "End Game";
  if (x === "no_show" || x === "no-show") return "No-show";
  if (x === "cancelled") return "Cancelled";
  return "Upcoming";
};
const statusPillClass = (s?: string) => {
  const x = (s || "").toLowerCase();
  if (x === "endgame" || x === "end_game" || x === "completed")
    return "bg-neutral-100 text-neutral-600 ring-1 ring-neutral-200";
  if (x === "no_show" || x === "no-show")
    return "bg-neutral-100 text-neutral-600 ring-1 ring-neutral-200";
  if (x === "cancelled") return "bg-rose-100 text-rose-700 ring-1 ring-rose-200";
  return "bg-[#f2e8e8] text-[#6b3b3b] ring-1 ring-[#d8c0c0]"; // Upcoming
};
/** ป้องกัน hydration: undefined → 0 (จะไม่ตีเป็นเวลาปัจจุบัน) */
const safeTs = (s?: string) => (s ? dayjs(s).valueOf() : 0);

/** กันซ้ำคำว่า coins หาก backend ส่ง string มาแล้วมีคำว่า coins อยู่แล้ว */
const fmtCoins = (v: unknown) => {
  if (v === null || v === undefined) return "-";
  if (typeof v === "number") return `${v} coins`;
  const s = String(v).trim();
  return /coins$/i.test(s) ? s : `${s} coins`;
};

export default function PlayerHistoryPage() {
  // ⬇️ เปลี่ยนมาใช้ hook ใหม่
  const { data, isLoading, isError, refetch } = useBookingsRetrieve();

  // orval ของพี่ type เป็น void แต่ runtime ส่ง array จริง → รองรับทั้ง data และ data.data
  const rows: BookingRow[] = useMemo(() => {
    const raw: any = data as any;
    const arr = (raw?.data ?? raw?.results ?? raw) as unknown;
    return Array.isArray(arr) ? (arr as BookingRow[]) : [];
  }, [data]);

  /** เรียงตาม mock: Created Date ใหม่ → เก่า (fallback ไป booking_date/slot_service_date ถ้าไม่มี) */
  const ordered = useMemo(() => {
    const fallbackTs = (b: BookingRow) => {
      const svc = b.booking_date ?? b.slots?.[0]?.slot_service_date;
      const t = safeTs(svc);
      return t || (typeof b.id === "number" ? b.id : 0);
    };
    return [...rows].sort((a, b) => {
      const tb = safeTs(b.created_at ?? b.created_date) || fallbackTs(b);
      const ta = safeTs(a.created_at ?? a.created_date) || fallbackTs(a);
      return tb - ta; // ใหม่ → เก่า
    });
  }, [rows]);

  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<BookingRow | null>(null);

  const cancelMutation = useBookingsCancelCreate({
    mutation: {
      onSuccess: () => {
        setOpen(false);
        setActive(null);
        refetch();
      },
    },
  });

  // แสดง Today หลัง mount เพื่อกัน hydration mismatch
  const [todayStr, setTodayStr] = useState<string>("");
  useEffect(() => {
    setTodayStr(dayjs().format("ddd, MMM DD, YYYY"));
  }, []);

  const onView = (b: BookingRow) => {
    setActive(b);
    setOpen(true);
  };
  const onDownload = (b: BookingRow) => generateBookingInvoicePDF(b as any);
  const onCancel = (b: BookingRow) => {
    const bookingNo = resolveBookingNo(b);
    if (!bookingNo) return;
    setActive(b);
    cancelMutation.mutate({ bookingNo });
  };

  return (
    <div className="mx-auto my-auto">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="mb-4">
          <h1 className="text-2xl font-bold tracking-tight text-pine">
            My Booking History
          </h1>
          <p className="text-s font-semibold tracking-tight text-dimgray">
            Track, download, or manage all bookings here.
          </p>
        </div>
      </div>

      {isError && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
          Can't Download Booking History
        </div>
      )}

      {/* Booking History Table */}
      <div className="overflow-x-auto rounded-2xl border border-neutral-200 bg-white shadow-sm">
        <table className="min-w-[1000px] w-full border-collapse text-[15px] text-neutral-800">
          <thead className="bg-smoke text-pine font-semibold">
            <tr>
              <th className="whitespace-nowrap px-6 py-4 text-left">Created</th>
              <th className="whitespace-nowrap px-6 py-4 text-left">Booking No.</th>
              <th className="whitespace-nowrap px-6 py-4 text-center">Total</th>
              <th className="whitespace-nowrap px-6 py-4 text-center">Booking Date</th>
              <th className="whitespace-nowrap px-6 py-4 text-center">Status</th>
              <th className="whitespace-nowrap px-6 py-4 text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {isLoading &&
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={i}>
                  <td colSpan={6} className="px-6 py-3">
                    <div className="h-10 animate-pulse rounded-md bg-neutral-100" />
                  </td>
                </tr>
              ))}

            {!isLoading &&
              ordered.map((b) => {
                const created = b.created_at ?? b.created_date;
                const serviceDate = b.booking_date ?? b.slots?.[0]?.slot_service_date;
                const bookingNo = resolveBookingNo(b);
                const status = (b.status ?? "upcoming").toLowerCase();
                const canCancel = b.able_to_cancel && status !== "cancelled";

                return (
                  <tr
                    key={bookingNo || b.id}
                    className="border-t border-smoke hover:bg-neutral-50/70"
                    onClick={() => onView(b)}
                  >
                    {/* Created */}
                    <td className="px-6 py-4 text-neutral-600 whitespace-nowrap">
                      {created ? dayjs(created).format("D MMM YYYY") : "-"}
                    </td>

                    {/* Booking ID */}
                    <td className="px-6 py-4 font-semibold text-walnut">
                      {bookingNo || "-"}
                    </td>

                    {/* Total */}
                    <td className="px-6 py-4 text-center whitespace-nowrap">
                      {fmtCoins(b.total_cost)}
                    </td>

                    {/* Booking Date */}
                    <td className="px-6 py-4 text-center whitespace-nowrap">
                      {serviceDate ? dayjs(serviceDate).format("D MMM YYYY") : "-"}
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-flex items-center gap-2 rounded-md px-2.5 py-1 text-sm ${statusPillClass(
                          status
                        )}`}
                      >
                        <span className="h-3 w-3 rounded-sm bg-current/60" />
                        {statusLabel(status)}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-center">
                      <div className="inline-flex flex-wrap justify-center gap-2">
                        <button
                          onClick={() => onView(b)}
                          className="rounded-lg border border-[#2a756a] bg-[#2a756a] px-4 py-2 text-white hover:brightness-95"
                        >
                          View Details
                        </button>

                        <button
                          onClick={() => onDownload(b)}
                          disabled={status === "upcoming"}
                          className={`rounded-lg border px-4 py-2 ${
                            status === "upcoming"
                              ? "cursor-not-allowed border-neutral-300 bg-neutral-100 text-neutral-400"
                              : "border-[#2a756a] text-[#2a756a] hover:bg-[#e5f2ef]"
                          }`}
                        >
                          Download
                        </button>

                        <button
                          onClick={() => onCancel(b)}
                          disabled={!canCancel || cancelMutation.isPending}
                          className={`rounded-lg border px-4 py-2 ${
                            !canCancel || cancelMutation.isPending
                              ? "cursor-not-allowed border-neutral-300 bg-neutral-100 text-neutral-400"
                              : "border-[#8d3e3e] bg-[#8d3e3e] text-white hover:brightness-95"
                          }`}
                        >
                          {cancelMutation.isPending &&
                          active &&
                          resolveBookingNo(active) === bookingNo
                            ? "Cancelling…"
                            : "Cancel"}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      <BookingReceiptModal
        open={open}
        onClose={() => setOpen(false)}
        booking={active as any}
      />
    </div>
  );
}
