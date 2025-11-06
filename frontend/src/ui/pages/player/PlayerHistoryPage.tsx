"use client";

import { useMemo, useState } from "react";
import { Calendar, Loader2, ArrowUpDown } from "lucide-react";
import { useMyBookingRetrieve } from "@/api-client/endpoints/my-booking/my-booking";
import BookingReceiptModal from "@/ui/components/historypage/BookingReceiptModal";
import { generateBookingInvoicePDF } from "@/lib/booking/invoice";
import { useCancelBooking } from "@/api-client/extras/cancel_booking";
import CancelConfirmModal from "@/ui/components/historypage/CancelConfirmModal";
import type { SlotItem, BookingRow } from "@/api-client/extras/types";

/* ========================= Utils ========================= */
const statusLabel = (s?: string) => {
  const x = (s || "").toLowerCase();
  if (x === "end_game" || x === "endgame") return "End Game";
  if (x === "cancelled") return "Cancelled";
  if (x === "no_show" || x === "no-show") return "No-show";
  if (x === "confirmed") return "Upcoming";
  return "Upcoming";
};

const statusPillClass = (s?: string) => {
  const x = (s || "").toLowerCase();
  if (["confirmed", "endgame", "end_game"].includes(x))
    return "bg-neutral-100 text-neutral-600 ring-1 ring-neutral-200";
  if (x === "cancelled")
    return "bg-rose-100 text-rose-700 ring-1 ring-rose-200";
  return "bg-[#f2e8e8] text-[#6b3b3b] ring-1 ring-[#d8c0c0]";
};

const fmtCoins = (v: string | number) => {
  if (typeof v === "number") return `${v} coins`;
  const s = String(v).trim();
  return s.toLowerCase().includes("coin") ? s : `${s} coins`;
};

function formatDate(dateStr: string, opts?: Intl.DateTimeFormatOptions) {
  try {
    const d = new Date(dateStr);
    return new Intl.DateTimeFormat("en-US", {
      weekday: opts?.weekday ?? undefined,
      month: opts?.month ?? "short",
      day: opts?.day ?? "2-digit",
      year: opts?.year ?? "numeric",
      timeZone: "Asia/Bangkok",
    }).format(d);
  } catch {
    return dateStr;
  }
}

/* ========================= Main Page ========================= */
export default function PlayerHistoryPage() {
  const { data, isLoading, isError } = useMyBookingRetrieve();
  const [open, setOpen] = useState(false);
  const [confirmModal, setConfirmModal] = useState<BookingRow | null>(null);
  const [active, setActive] = useState<BookingRow | null>(null);

  // 🧭 Filters + Sort
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"created" | "booking">("created");
  const [sortDesc, setSortDesc] = useState(true);

  const { cancelMut, handleCancel } = useCancelBooking({
    onSuccess: () => {
      setConfirmModal(null);
      setActive(null);
    },
  });

  const rows: BookingRow[] = useMemo(() => {
    const raw = data as any;
    const arr = raw?.data ?? raw?.results ?? raw;
    return Array.isArray(arr)
      ? arr.map((b: any) => ({
          ...b,
          booking_status: b.booking_status ?? b.status ?? "upcoming",
        }))
      : [];
  }, [data]);

  // 🧩 Filter + Sort logic
  const filtered = useMemo(() => {
    let list = [...rows];
    if (filterStatus !== "all") {
      list = list.filter(
        (b) => b.booking_status.toLowerCase() === filterStatus.toLowerCase()
      );
    }
    return list.sort((a, b) => {
      const keyA =
        sortBy === "booking"
          ? new Date(a.booking_date).getTime()
          : new Date(a.created_date).getTime();
      const keyB =
        sortBy === "booking"
          ? new Date(b.booking_date).getTime()
          : new Date(b.created_date).getTime();
      return sortDesc ? keyB - keyA : keyA - keyB;
    });
  }, [rows, filterStatus, sortBy, sortDesc]);

  const onView = (b: BookingRow) => {
    setActive(b);
    setOpen(true);
  };

  const onDownload = (b: BookingRow) => generateBookingInvoicePDF(b);
  const onCancelConfirm = (b: BookingRow) => setConfirmModal(b);

  const today = formatDate(new Date().toISOString(), {
    weekday: "short",
    month: "short",
    day: "2-digit",
    year: "numeric",
  });

  return (
    <div className="mx-auto my-auto">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-pine">
            My Booking History
          </h1>
          <p className="text-s font-semibold tracking-tight text-dimgray">
            Track, download, or manage all your bookings here.
          </p>
        </div>
      </div>

      {/* Top Control Bar */}
      <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Left: Today */}
        <div className="flex items-center text-dimgray text-sm">
          <Calendar size={18} className="mr-2 text-dimgray" />
          <span className="font-medium text-dimgray">
            {today} <span className="text-sea font-xs">(Today)</span>
          </span>
        </div>

        {/* Right: Filter + Sort Controls */}
        <div className="flex flex-wrap items-center gap-3 sm:gap-3">
          {/* Filter */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-semibold text-pine">Filter:</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="rounded-xl border border-neutral-300 bg-white px-3 py-2 mr-2 text-sm font-medium text-pine shadow-sm hover:border-sea/50 focus:ring-2 focus:ring-sea/30 transition"
            >
              <option value="all">All</option>
              <option value="confirmed">Upcoming</option>
              <option value="cancelled">Cancelled</option>
              <option value="end_game">End Game</option>
              <option value="no_show">No-show</option>
            </select>
          </div>

          {/* Sort */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-semibold text-pine">Sort by:</label>
            <select
              value={sortBy}
              onChange={(e) =>
                setSortBy(e.target.value as "created" | "booking")
              }
              className="rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm font-medium text-pine shadow-sm hover:border-sea/50 focus:ring-2 focus:ring-sea/30 transition"
            >
              <option value="created">Created Date</option>
              <option value="booking">Booking Date</option>
            </select>
            <button
              onClick={() => setSortDesc((v) => !v)}
              className="ml-1 rounded-xl border border-neutral-300 bg-white p-2 text-neutral-600 shadow-sm hover:bg-neutral-50 transition"
              title="Toggle sort order"
            >
              <ArrowUpDown
                size={16}
                className={`transition-transform duration-200 ${
                  sortDesc ? "rotate-180" : ""
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Error */}
      {isError && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
          Failed to load booking history.
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto rounded-2xl border border-neutral-200 bg-white shadow-sm">
        <table className="min-w-[1000px] w-full border-collapse text-[15px] text-neutral-800">
          <thead className="bg-smoke text-pine font-semibold">
            <tr>
              <th className="px-6 py-4 text-left">Created</th>
              <th className="px-6 py-4 text-left">Booking No.</th>
              <th className="px-6 py-4 text-center">Total</th>
              <th className="px-6 py-4 text-center">Booking Date</th>
              <th className="px-6 py-4 text-center">Status</th>
              <th className="px-6 py-4 text-center">Actions</th>
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
              filtered.map((b) => {
                const canCancel =
                  b.able_to_cancel &&
                  !["cancelled", "end_game"].includes(b.booking_status);
                const isCancelling =
                  cancelMut.isPending &&
                  active &&
                  active.booking_id === b.booking_id;

                return (
                  <tr
                    key={b.booking_id}
                    className="border-t border-smoke hover:bg-neutral-50/70"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-neutral-600">
                      {formatDate(b.created_date)}
                    </td>
                    <td className="px-6 py-4 font-semibold text-walnut">
                      {b.booking_id}
                    </td>
                    <td className="px-6 py-4 text-center whitespace-nowrap">
                      {fmtCoins(b.total_cost)}
                    </td>
                    <td className="px-6 py-4 text-center whitespace-nowrap">
                      {formatDate(b.booking_date)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-flex items-center gap-2 rounded-md px-2.5 py-1 text-sm ${statusPillClass(
                          b.booking_status
                        )}`}
                      >
                        {statusLabel(b.booking_status)}
                      </span>
                    </td>
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
                          disabled={
                            !(
                              b.booking_status.toLowerCase() === "confirmed" &&
                              b.able_to_cancel === false
                            )
                          }
                          className={`rounded-lg border px-4 py-2 ${
                            b.booking_status.toLowerCase() === "confirmed" &&
                            b.able_to_cancel === false
                              ? "border-[#2a756a] text-[#2a756a] hover:bg-[#e5f2ef]"
                              : "cursor-not-allowed border-neutral-300 bg-neutral-100 text-neutral-400"
                          }`}
                        >
                          Download
                        </button>

                        <button
                          onClick={() => {
                            setActive(b);
                            onCancelConfirm(b);
                          }}
                          disabled={!canCancel || cancelMut.isPending}
                          className={`rounded-lg border px-4 py-2 flex items-center justify-center gap-2 ${
                            !canCancel
                              ? "cursor-not-allowed border-neutral-300 bg-neutral-100 text-neutral-400"
                              : "border-[#8d3e3e] bg-[#8d3e3e] text-white hover:brightness-95"
                          }`}
                        >
                          {isCancelling ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" /> Cancelling…
                            </>
                          ) : (
                            "Cancel"
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>

      {/* Confirm Cancel Modal */}
      <CancelConfirmModal
        open={!!confirmModal}
        bookingId={confirmModal?.booking_id || ""}
        isPending={cancelMut.isPending}
        onConfirm={() =>
          confirmModal && handleCancel(confirmModal.booking_id)
        }
        onClose={() => setConfirmModal(null)}
      />

      {/* Receipt Modal */}
      <BookingReceiptModal
        open={open}
        onClose={() => setOpen(false)}
        booking={active as any}
      />
    </div>
  );
}
