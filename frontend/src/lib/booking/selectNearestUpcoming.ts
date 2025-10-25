import dayjs from "dayjs";

/* ===== API runtime types (ตาม /api/bookings/) ===== */
type ApiSlot = {
  slot: number;
  slot_court: number;
  slot_service_date: string; // "YYYY-MM-DD"
  slot_start_at: string;     // "HH:mm"
  slot_end_at: string;       // "HH:mm"
  // บางแบ็กเอนด์อาจมีชื่อคอร์ทมาเป็น field อื่น ถ้ามีให้เติมด้านล่างนี้
  // slot_court_name?: string;
};

export type ApiBooking = {
  id: number;
  booking_no: string;
  status: string; // "upcoming" | "endgame" | "no_show" | "cancelled" | ...
  created_at?: string;
  able_to_cancel?: boolean;
  slots: ApiSlot[];
};

/* ===== UI types (ของ UpcomingModal ที่พี่ให้มา) ===== */
export type SlotItem = {
  id: string;
  status: "available" | "booked" | "cancelled";
  start_time: string;
  end_time: string;
  court: number;
  courtName: string;
};

export type BookingItem = {
  bookingId: string;
  dateISO: string;
  slots: SlotItem[];
};

/* ===== helpers ===== */
function firstSlotStart(b: ApiBooking) {
  if (!b.slots?.length) return Number.POSITIVE_INFINITY;
  const s0 = b.slots[0];
  return dayjs(`${s0.slot_service_date} ${s0.slot_start_at}`, "YYYY-MM-DD HH:mm").valueOf();
}

/** เลือก upcoming ที่เริ่มเร็วที่สุด (อิงเวลาช่องแรกของแต่ละ booking) */
export function pickNearestUpcoming(all: ApiBooking[]): ApiBooking | null {
  const upcoming = all.filter((b) => b.status === "upcoming" && b.slots?.length);
  if (!upcoming.length) return null;
  return [...upcoming].sort((a, b) => firstSlotStart(a) - firstSlotStart(b))[0] ?? null;
}

/** map จาก ApiBooking → BookingItem (ตรงสเป็ก UpcomingModal) */
export function mapToUpcomingItem(b: ApiBooking): BookingItem {
  const first = b.slots[0];
  const dateISO = `${first.slot_service_date}T${first.slot_start_at}:00`;
  return {
    bookingId: b.booking_no,
    dateISO,
    slots: b.slots.map((s) => ({
      id: String(s.slot),
      status: "booked", // ในสคีมา slot ไม่ได้ส่งสถานะย่อยมา → ถือเป็น booked
      start_time: s.slot_start_at,
      end_time: s.slot_end_at,
      court: s.slot_court,
      // ถ้ามี field ชื่อคอร์ทจริง ๆ เช่น s.slot_court_name ให้ใช้แทน
      courtName: `#${s.slot_court}`,
    })),
  };
}
