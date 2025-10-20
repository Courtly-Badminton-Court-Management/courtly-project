/* eslint-disable @typescript-eslint/no-explicit-any */
import dayjs from "dayjs";
import { historyBookingToGroups } from "@/lib/booking/historyToGroups";

type BookingLike = {
  booking_no?: string;
  booking_id?: string;
  status?: string;
  created_at?: string; created_date?: string;
  booking_date?: string;
  slots?: any[];
  total_cost?: number | string;
};

const MINUTES_PER_CELL = 30;
const resolveBookingNo = (b: BookingLike) => b.booking_no ?? b.booking_id ?? "";
const fmtCoins = (v: unknown) =>
  typeof v === "number" ? `${v} coins` : /coins$/i.test(String(v)) ? String(v) : `${v ?? 0} coins`;

export async function generateBookingInvoicePDF(booking: BookingLike): Promise<void> {
  // dynamic import เพื่อใช้เฉพาะฝั่ง client
  const { jsPDF } = await import("jspdf");
  // ESM: ต้องดึง function มาเอง (ไม่ได้ผูก doc.autoTable)
  const autoTableMod: any = await import("jspdf-autotable");
  const autoTable = (autoTableMod.default ?? autoTableMod.autoTable) as (doc: any, opts: any) => void;

  const doc = new jsPDF();

  const bookingNo = resolveBookingNo(booking) || "-";
  const createdAt = booking.created_at ?? booking.created_date;
  const bookingDate =
    booking.booking_date ??
    booking.slots?.[0]?.slot_service_date ??
    booking.slots?.[0]?.service_date;

  // Header
  doc.setFontSize(18);
  doc.text("Booking Receipt", 14, 18);

  doc.setFontSize(11);
  doc.text(`Booking ID: ${bookingNo}`, 14, 28);
  doc.text(`Created At: ${createdAt ? dayjs(createdAt).format("D MMM YYYY HH:mm") : "-"}`, 14, 34);
  doc.text(`Booking Date: ${bookingDate ? dayjs(bookingDate).format("D MMM YYYY") : "-"}`, 14, 40);

  // ใช้ groups เดียวกับ modal
  const groups = historyBookingToGroups(booking as any, MINUTES_PER_CELL, 0);
  const body = groups.map((g) => [
    `Court ${g.courtRow}`,
    g.timeLabel,
    `${g.slots * MINUTES_PER_CELL} min`,
    `${g.price} coins`,
  ]);

  autoTable(doc, {
    startY: 48,
    head: [["Court", "Time", "Duration", "Price"]],
    body,
    styles: { fontSize: 11, cellPadding: 3 },
    headStyles: { fillColor: [42, 117, 106] },
    theme: "grid",
    columnStyles: {
      0: { halign: "left", cellWidth: 35 },
      1: { halign: "left", cellWidth: 70 },
      2: { halign: "left", cellWidth: 35 },
      3: { halign: "right", cellWidth: 35 },
    },
  });

  const total =
    booking.total_cost !== undefined
      ? fmtCoins(booking.total_cost)
      : fmtCoins(groups.reduce((sum, g) => sum + (g.price || 0), 0));

  const y = (doc as any).lastAutoTable?.finalY ?? 48;
  doc.setFontSize(12);
  doc.text("Total", 150, y + 12, { align: "right" });
  doc.text(String(total), 200 - 14, y + 12, { align: "right" });

  doc.setFontSize(9);
  doc.text("Courtly • Easy Court, Easy Life", 14, 285);

  doc.save(`Booking_${bookingNo || "receipt"}.pdf`);
}
