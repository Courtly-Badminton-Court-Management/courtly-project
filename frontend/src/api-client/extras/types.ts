//frontend/src/api-client/extras/types.ts

/* ===================== Booking & Slot ===================== */
export type SlotItem = {
  status: string;
  start_time: string;
  end_time: string;
  court: number;
  court_name: string;
  price_coin: number;
};

export type BookingRow = {
  created_date: string;
  booking_id: string;
  user: string;
  total_cost: number | string;
  booking_date: string;
  booking_status: string;
  able_to_cancel: boolean;
  booking_slots: Record<string, SlotItem>;
};


/* =========================== User =========================== */

export type UserProfile = {
  id: number;
  username: string;
  email: string;
  firstname: string;
  lastname: string;
  avatarKey: string | null;
  role: "player" | "manager";
  balance: number;
  lastLogin: string;
};


/* ==================== Available Slots ==================== */
export type AvailableDay = {
  date: string; // e.g. "01-11-25"
  available_percent: number;
  available_slots: SlotItem[];
};

export type AvailableSlotsResponse = {
  month: string; // e.g. "11-25"
  days: AvailableDay[];
};



// 💥 Temporary types for month-view and booking POST

export type RawSlot = {
  status: string;
  start_time: string;
  end_time: string;
  court: number;
  court_name: string;
  price_coin: number;
};

export type MonthViewDay = {
  date: string;
  slot_list: Record<string, RawSlot>; // slot_id เป็น key
};

export type MonthViewResponse = {
  month: string;
  days: MonthViewDay[];
};
