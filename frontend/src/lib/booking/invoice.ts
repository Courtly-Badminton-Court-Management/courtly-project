/* eslint-disable @typescript-eslint/no-explicit-any */
import dayjs from "dayjs";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

/* ========================= Schema จาก Modal ========================= */
type SlotItem = {
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
  user: string; // ✅ เพิ่มฟิล user
  total_cost: string | number;
  booking_date: string;
  booking_status: string;
  able_to_cancel: boolean;
  booking_slots: Record<string, SlotItem>;
};

/* ========================= Helper ========================= */
function formatDuration(mins: number) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h && m) return `${h} hr ${m} min`;
  if (h) return `${h} hr`;
  return `${m} min`;
}

/* =============================================================
   generateBookingInvoicePDF
   ดึงข้อมูล booking จาก hook เดียวกับ modal แล้วแปลงเป็น PDF
============================================================= */
export async function generateBookingInvoicePDF(booking: BookingRow) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();

  /* ========== HEADER ========== */
  try {
    const logo = await fetch("/brand/corutly-main-logo-tagline.png")
      .then((r) => r.blob())
      .then(
        (b) =>
          new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.readAsDataURL(b);
          })
      );
    doc.addImage(logo, "PNG", 40, 30, 60, 60);
  } catch {
    // skip ถ้าไม่มีโลโก้
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("COURTLY COMPANY LIMITED", 120, 50);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text("Badminton Court Management & Booking System", 120, 65);
  doc.text("Email: courtly.project@gmail.com | Tel: +66 81-234-5678", 120, 80);
  doc.text("Address: 99/9 Kasetsart University, Bangkok 10900, Thailand", 120, 95);

  doc.setDrawColor(42, 117, 106);
  doc.line(40, 110, pageWidth - 40, 110);

  /* ========== BASIC INFO ========== */
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("INVOICE / TAX RECEIPT", 40, 140);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text(`Booking ID: ${booking.booking_id}`, 40, 160);
  doc.text(`Issued Date: ${dayjs(booking.created_date).format("DD MMM YYYY HH:mm")}`, 40, 175);
  doc.text(`Booking Date: ${dayjs(booking.booking_date).format("DD MMM YYYY")}`, 40, 190);

  doc.text("Customer:", 300, 160);
  doc.text(booking.user || "-", 370, 160);

  /* ========== GROUP SLOT DATA ========== */
  const slots = Object.values(booking.booking_slots || {});
  const grouped: Record<string, SlotItem[]> = {};

  for (const s of slots) {
    grouped[s.court_name] ??= [];
    grouped[s.court_name].push(s);
  }

  const items: {
    court: string;
    timeLabel: string;
    durationMins: number;
    price: number;
  }[] = [];

  Object.entries(grouped).forEach(([court, arr]) => {
    const sorted = [...arr].sort((a, b) => a.start_time.localeCompare(b.start_time));

    let start = sorted[0];
    let prevEnd = sorted[0].end_time;
    let slotCount = 1;
    let priceSum = sorted[0].price_coin;

    for (let i = 1; i <= sorted.length; i++) {
      const cur = sorted[i];
      if (!cur || cur.start_time !== prevEnd) {
        items.push({
          court,
          timeLabel: `${start.start_time} – ${prevEnd}`,
          durationMins: slotCount * 30,
          price: priceSum,
        });

        if (cur) {
          start = cur;
          prevEnd = cur.end_time;
          slotCount = 1;
          priceSum = cur.price_coin;
        }
      } else {
        prevEnd = cur.end_time;
        slotCount++;
        priceSum += cur.price_coin;
      }
    }
  });

  /* ========== TABLE ========== */
  const body = items.map((it) => [
    it.court,
    it.timeLabel,
    formatDuration(it.durationMins),
    `${it.price.toLocaleString()} coins`,
  ]);

  autoTable(doc, {
    startY: 210,
    head: [["Court", "Time", "Duration", "Price"]],
    body,
    styles: {
      fontSize: 10,
      halign: "left",
      cellPadding: 6,
      lineColor: [220, 220, 220],
      lineWidth: 0.3,
    },
    headStyles: {
      fillColor: [42, 117, 106],
      textColor: 255,
      fontStyle: "bold",
      halign: "center",
    },
    columnStyles: {
      0: { cellWidth: 100 },
      1: { cellWidth: 200 },
      2: { cellWidth: 100 },
      3: { halign: "right", cellWidth: 100 },
    },
    theme: "grid",
  });

  const y = (doc as any).lastAutoTable.finalY ?? 210;

  /* ========== TOTAL ========== */
  const totalPrice =
    typeof booking.total_cost === "number"
      ? booking.total_cost
      : parseInt(String(booking.total_cost).replace(/[^\d]/g, "")) || 0;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("TOTAL", pageWidth - 200, y + 25);
  doc.text(`${totalPrice.toLocaleString()} coins`, pageWidth - 80, y + 25, { align: "right" });

  doc.setDrawColor(42, 117, 106);
  doc.line(pageWidth - 220, y + 30, pageWidth - 40, y + 30);

  /* ========== NOTES ========== */
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("Notes:", 40, y + 60);
  doc.text("- Cancellation is allowed up to 24 hours before booking time.", 50, y + 75);
  doc.text("- CL Coins are non-refundable after the cancellation window closes.", 50, y + 90);
  doc.text("- This document serves as an official tax receipt issued by Courtly Co., Ltd.", 50, y + 105);

  /* ========== FOOTER ========== */
  doc.setFont("helvetica", "italic");
  doc.setFontSize(9);
  doc.text(
    "Thank you for choosing Courtly 🏸 | System generated — No signature required",
    pageWidth / 2,
    780,
    { align: "center" }
  );

  doc.save(`Courtly_Invoice_${booking.booking_id}.pdf`);
}
