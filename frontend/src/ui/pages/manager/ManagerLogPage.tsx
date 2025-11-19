"use client";

import { useMemo, useState } from "react";
import { Calendar, Loader2, ArrowUpDown, CheckCircle } from "lucide-react";
import { useBookingsRetrieve } from "@/api-client/endpoints/bookings/bookings";
import { useAuthMeRetrieve } from "@/api-client/endpoints/auth/auth";
import { useBookingRetrieve } from "@/api-client/endpoints/booking/booking";

import BookingReceiptModal from "@/ui/components/historypage/BookingReceiptModal";
import { generateBookingInvoicePDF } from "@/lib/booking/invoice";
import { useCancelBooking } from "@/api-client/extras/cancel_booking";
import CancelConfirmModal from "@/ui/components/historypage/CancelConfirmModal";
import CheckInModal from "@/ui/components/dashboardpage/CheckInModal";

import type { BookingRow, UserProfile } from "@/api-client/extras/types";

/* ========================= Utils ========================= */
const statusLabel = (s?: string) => {
  const x = (s || "").toLowerCase();
  if (x === "end_game" || x === "endgame") return "End Game";
  if (x === "cancelled") return "Cancelled";
  if (x === "no_show" || x === "no-show") return "No-show";
  if (x === "upcoming" || x === "booked" || x === "confirmed") return "Upcoming";
  if (x === "checkin" || x === "checked_in") return "✓ Checked-In";
  return "Unknown";
};

const statusPillClass = (s?: string) => {
  const x = (s || "").toLowerCase();
  if (["endgame", "end_game"].includes(x))
    return "bg-neutral-100 text-neutral-600 ring-1 ring-neutral-200";
  if (x === "cancelled")
    return "bg-rose-100 text-rose-700 ring-1 ring-rose-200";
  if (["upcoming", "booked", "confirmed"].includes(x))
    return "bg-sea/10 text-sea ring-1 ring-inset ring-sea/30";
  if (x === "checkin" || x === "checked_in")
    return "bg-cambridge/10 text-cambridge ring-1 ring-inset ring-cambridge/40";
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
export default function ManagerLogPage() {
  const { data, isLoading, isError } = useBookingsRetrieve();
  const { data: me, isLoading: isMeLoading } = useAuthMeRetrieve();

  // 🔹 View details modal
  const [openView, setOpenView] = useState(false);
  const [viewId, setViewId] = useState<string | null>(null);

  // 🔹 Check-in modal
  const [checkinId, setCheckinId] = useState<string | null>(null);
  const [isCheckinPending, setIsCheckinPending] = useState(false); // TODO: hook กับ check-in API จริง

  // 🔹 Cancel
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

  // ✅ ดึง booking detail เมื่อมี viewId หรือ checkinId
  const {
    data: bookingDetail,
    isLoading: isDetailLoading,
  } = useBookingRetrieve(viewId || checkinId || "", {
    query: { enabled: !!viewId || !!checkinId },
  });

  const rows: BookingRow[] = useMemo(() => {
    const raw = data as any;
    const arr = raw?.data ?? raw?.results ?? raw;
    return Array.isArray(arr)
      ? arr.map((b: any) => ({
          ...b,
          user: b.owner_username ?? "-",
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

  /* ========================= Handlers ========================= */
  const onView = (b: BookingRow) => {
    // เปิด receipt modal → trigger GET /api/booking/{id}
    setCheckinId(null); // กันไม่ให้ชนกัน
    setViewId(b.booking_id);
    setOpenView(true);
  };

  const onDownload = (b: BookingRow) => {
    // ตอนนี้ยังใช้ row เดิมไปออก pdf ได้อยู่
    if (!me) return;
    generateBookingInvoicePDF(b, me as UserProfile);
  };

  const onCancelConfirm = (b: BookingRow) => setConfirmModal(b);

  const onCheckInClick = (b: BookingRow) => {
    // เปิด CheckInModal → trigger GET /api/booking/{id}
    setViewId(null); // ensure มีแค่ modal เดียว
    setCheckinId(b.booking_id);
  };

  const handleConfirmCheckIn = async () => {
    if (!bookingDetail) return;
    try {
      setIsCheckinPending(true);
      // TODO: ผูกกับ check-in mutation จริง เช่น useCheckInBooking(bookingDetail.booking_id)
      alert(`✅ Checked in booking successfully!`);
      setCheckinId(null);
    } finally {
      setIsCheckinPending(false);
    }
  };

  const today = formatDate(new Date().toISOString(), {
    weekday: "short",
    month: "short",
    day: "2-digit",
    year: "numeric",
  });

  // modal state จาก detail
    const checkinBooking =
      checkinId && !isDetailLoading && bookingDetail != null
        ? (bookingDetail as BookingRow)
        : null;
    const viewBooking =
      viewId && !isDetailLoading && bookingDetail != null
        ? (bookingDetail as BookingRow)
        : null;

  const isCheckinOpen = !!checkinId && !!checkinBooking;
  const isViewLoading = isDetailLoading && !!viewId;

  return (
    <div className="mx-auto my-auto">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-pine">
            Booking Logs
          </h1>
          <p className="text-s font-semibold tracking-tight text-dimgray">
            View all player bookings, download receipts, check in, or manage
            status.
          </p>
        </div>
      </div>

      {/* Top Control Bar */}
      <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center text-dimgray text-sm">
          <Calendar size={18} className="mr-2 text-dimgray" />
          <span className="font-medium text-dimgray">
            {today} <span className="text-sea font-xs">(Today)</span>
          </span>
        </div>

        {/* Right: Filter + Sort Controls */}
        <div className="flex flex-wrap items-center gap-3 sm:gap-3">
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
          Failed to load booking logs.
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto rounded-2xl border border-neutral-200 bg-white shadow-sm">
        <table className="min-w-[1150px] w-full border-collapse text-[15px] text-neutral-800">
          <thead className="bg-smoke text-pine font-semibold">
            <tr>
              <th className="px-6 py-4 text-left">Created</th>
              <th className="px-6 py-4 text-left">Booking No.</th>
              <th className="px-6 py-4 text-left">Username</th>
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
                  <td colSpan={7} className="px-6 py-3">
                    <div className="h-10 animate-pulse rounded-md bg-neutral-100" />
                  </td>
                </tr>
              ))}

            {!isLoading &&
              filtered.map((b) => {
                const bookingStatus = (b.booking_status || "").toLowerCase();
                const canCancel =
                  b.able_to_cancel &&
                  !["cancelled", "end_game"].includes(bookingStatus);
                const isCancelling =
                  cancelMut.isPending &&
                  active &&
                  active.booking_id === b.booking_id;

                const isUpcoming =
                  bookingStatus === "confirmed" ||
                  bookingStatus === "upcoming" ||
                  bookingStatus === "booked";

                const isPrimaryAsCheckIn = isUpcoming;

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
                    <td className="px-6 py-4 text-neutral-700">{b.user}</td>
                    <td className="px-6 py-4 text-center whitespace-nowrap">
                      {fmtCoins(b.total_cost)}
                    </td>
                    <td className="px-6 py-4 text-center whitespace-nowrap">
                      {formatDate(b.booking_date)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-sm ${statusPillClass(
                          b.booking_status
                        )}`}
                      >
                        {statusLabel(b.booking_status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="inline-flex flex-wrap justify-center gap-2">
                        {/* 🔹 Primary: Upcoming => Check in (→ fetch detail & open CheckInModal)
                            อื่น ๆ => View details (→ fetch detail & open ReceiptModal) */}
                        <button
                          onClick={() =>
                            isPrimaryAsCheckIn
                              ? onCheckInClick(b)
                              : onView(b)
                          }
                          className={`rounded-lg border px-4 py-2 flex items-center justify-center gap-2 ${
                            isPrimaryAsCheckIn
                              ? "border-[#31734d] bg-[#31734d] text-white hover:brightness-95"
                              : "border-[#2a756a] bg-[#2a756a] text-white hover:brightness-95"
                          }`}
                        >
                          {isPrimaryAsCheckIn ? (
                            <>
                              <CheckCircle className="w-4 h-4" />
                              Check In
                            </>
                          ) : (
                            "View details"
                          )}
                        </button>

                        <button
                          onClick={() => onDownload(b)}
                          disabled={isMeLoading || !me}
                          className={`rounded-lg border px-4 py-2 ${
                            !me || isMeLoading
                              ? "cursor-not-allowed border-neutral-300 bg-neutral-100 text-neutral-400"
                              : "border-[#2a756a] text-[#2a756a] hover:bg-[#e5f2ef]"
                          }`}
                        >
                          {isMeLoading ? "Loading..." : "Download"}
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
                              <Loader2 className="h-4 w-4 animate-spin" />{" "}
                              Cancelling…
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

      {/* Booking Detail Modal — ใช้ detail จาก GET /api/booking/{id} */}
      <BookingReceiptModal
        open={openView}
        onClose={() => {
          setOpenView(false);
          setViewId(null);
        }}
        booking={viewBooking || null}
        isLoading={isViewLoading}
      />

      {/* Check-in Modal — ใช้ detail จาก GET /api/booking/{id} */}
      <CheckInModal
        open={isCheckinOpen}
        booking={checkinBooking}
        isPending={isCheckinPending}
        onConfirm={handleConfirmCheckIn}
        onClose={() => setCheckinId(null)}
      />
    </div>
  );
}
