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