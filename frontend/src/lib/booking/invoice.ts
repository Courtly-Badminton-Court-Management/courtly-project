// src/ui/lib/booking/invoice.ts
type SlotItem = {
  slot: number;
  slot_court: number;
  slot_service_date: string;
  slot_start_at: string;
  slot_end_at: string;
  price_coins?: number;
};

type BookingAllItem = {
  id?: number;
  booking_no?: string;
  booking_id?: string;
  user?: string;
  status: string;
  created_at?: string;
  created_date?: string;
  booking_date?: string;
  total_cost?: number;
  able_to_cancel: boolean;
  slots: SlotItem[];
};

function resolveBookingNo(b: BookingAllItem) {
  return b.booking_no ?? b.booking_id ?? "";
}

export function generateBookingInvoicePDF(booking: BookingAllItem) {
  const bookingNo = resolveBookingNo(booking) || "BOOKING";
  const date = booking.slots?.[0]?.slot_service_date ?? booking.booking_date ?? "";
  const rows = (booking.slots ?? [])
    .map(
      (s, i) => `
      <tr>
        <td style="padding:8px;border-bottom:1px solid #eee;text-align:center;">${i + 1}</td>
        <td style="padding:8px;border-bottom:1px solid #eee;">Court #${s.slot_court}</td>
        <td style="padding:8px;border-bottom:1px solid #eee;text-align:center;">${s.slot_start_at}</td>
        <td style="padding:8px;border-bottom:1px solid #eee;text-align:center;">${s.slot_end_at}</td>
      </tr>`,
    )
    .join("");

  const total = booking.total_cost ?? 0;

  const html = `
<!doctype html>
<html>
<head>
  <meta charset="utf-8"/>
  <title>Invoice ${bookingNo}</title>
  <style>
    @page { margin: 18mm; }
    body { font-family: ui-sans-serif, -apple-system, Segoe UI, Roboto, Helvetica, Arial; color:#111827; }
    .brand { color:#2a756a; font-weight:700; letter-spacing:.3px; }
    h1 { margin:0 0 6px; }
    .muted { color:#6b7280; }
    .hr { height:1px;background:#e5e7eb;margin:14px 0; }
    .row { display:flex;justify-content:space-between;gap:12px;align-items:flex-start; }
    .pill { display:inline-block; padding:2px 8px; border:1px solid #d1fae5; background:#ecfdf5; color:#065f46; border-radius:9999px; font-size:11px; }
    .table { width:100%; border-collapse:collapse; font-size:12px; }
    th, td { border-bottom:1px solid #e5e7eb; padding:8px; }
    th { text-align:left; }
    .right { text-align:right; }
    .total { font-size:14px;font-weight:700; }
    .card { border:1px solid #e5e7eb; border-radius:12px; padding:12px; }
  </style>
</head>
<body onload="window.print(); setTimeout(()=>window.close(), 80);">

  <div class="row">
    <div>
      <div class="brand">COURTLY</div>
      <h1>Booking Invoice</h1>
      <div class="muted">Invoice for booking confirmation</div>
    </div>
    <div class="right">
      <div><b>Booking ID:</b> ${bookingNo}</div>
      <div><b>Date:</b> ${date || "-"}</div>
      <div><b>Status:</b> ${booking.status || "-"}</div>
    </div>
  </div>

  <div class="hr"></div>

  <div class="row">
    <div class="card" style="width:48%">
      <div style="font-weight:600;margin-bottom:6px;">Player</div>
      <div class="muted">Username / Email</div>
      <div>${booking.user ?? "-"}</div>
    </div>
    <div class="card" style="width:48%">
      <div style="font-weight:600;margin-bottom:6px;">Summary</div>
      <div><span class="pill">Coins Deducted</span></div>
      <div class="total right">-${Math.abs(total)} coins</div>
    </div>
  </div>

  <div style="font-weight:600;margin:14px 0 8px;">Time Slots</div>
  <table class="table">
    <thead>
      <tr>
        <th style="width:48px;text-align:center;">#</th>
        <th>Court</th>
        <th style="width:140px;text-align:center;">Start</th>
        <th style="width:140px;text-align:center;">End</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>

  <div class="hr"></div>
  <div class="muted" style="font-size:11px;">
    * Cancellation is allowed only more than 24 hours before start time. Refunds follow policy.
  </div>
</body>
</html>`;

  const win = window.open("", "_blank", "noopener,noreferrer,width=900,height=720");
  if (!win) return;
  win.document.open();
  win.document.write(html);
  win.document.close();
}
