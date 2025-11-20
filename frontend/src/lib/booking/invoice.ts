/* eslint-disable @typescript-eslint/no-explicit-any */
import dayjs from "dayjs";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import type { SlotItem, UserProfile } from "@/api-client/extras/types";

/* ========================= Helper ========================= */
function formatDuration(mins: number) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h && m) return `${h} hr ${m} min`;
  if (h) return `${h} hr`;
  return `${m} min`;
}


/* =============================================================
   Courtly Enhanced Invoice PDF — Refined UI Edition (Final)
============================================================= */
export async function generateBookingInvoicePDF(
  booking: any,
  user_profile: UserProfile
) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();

  /* ===================================================================
      HEADER — logo + company info + address 2-line
  =================================================================== */

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
    doc.addImage(logo, "PNG", 40, 40, 70, 70);
  } catch {}

  const companyX = 170;
  let y = 50;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text("COURTLY COMPANY LIMITED", companyX, y);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  y += 18;
  doc.text("Badminton Court Management & Booking System", companyX, y);

  y += 16;
  doc.text("Email: courtly.project@gmail.com | Tel: +66 81-234-5678", companyX, y);

  /* ******** ADDRESS (PERFECT 2-LINE FORMAT) ******** */
  y += 16;
  doc.text(
    "Address: 72/1 Sana Nikhom 1 Soi 2, Chan Kasem, ",
    companyX,
    y
  );

  y += 14;
  doc.text("Chatuchak District, Bangkok 10900, Thailand", companyX + 48, y);

  // Divider
  y += 20;
  doc.setDrawColor(42, 117, 106);
  doc.line(40, y, pageWidth - 40, y);

  /* ===================================================================
      INVOICE TITLE
  =================================================================== */
  y += 40;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("INVOICE / TAX RECEIPT", 40, y);

  /* ===================================================================
      BOOKING INFO (left column)
  =================================================================== */
  y += 30;
  const leftY = y;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);

  doc.text(`Booking ID: ${booking.booking_id}`, 40, leftY);
  doc.text(
    `Issued Date: ${dayjs(booking.created_date).format("DD MMMM YYYY HH:mm")}`,
    40,
    leftY + 15
  );
  doc.text(
    `Booking Date: ${dayjs(booking.booking_date).format("DD MMMM YYYY")}`,
    40,
    leftY + 30
  );
  doc.text(`Booking Method: ${booking.booking_method || "-"}`, 40, leftY + 45);
  doc.text(`Payment Method: ${booking.payment_method || "-"}`, 40, leftY + 60);

  /* ===================================================================
      CUSTOMER INFO (right column)
  =================================================================== */
  doc.setFont("helvetica", "bold");
  doc.text("Customer Information", 300, leftY);

  const fullName =
    `${user_profile.firstname || ""} ${user_profile.lastname || ""}`.trim() ||
    "-";

  doc.setFont("helvetica", "normal");
  doc.text(`Full name: ${fullName}`, 300, leftY + 15);
  doc.text(`Username: ${booking.owner_username || "-"}`, 300, leftY + 30);
  doc.text(`Contact: ${booking.owner_contact || "-"}`, 300, leftY + 45);

  /* ===================================================================
      SLOT GROUPING
  =================================================================== */
  const slotValues: SlotItem[] = Object.values(booking.booking_slots || {});
  const courtGroups: Record<string, SlotItem[]> = {};

  slotValues.forEach((s) => {
    courtGroups[s.court_name] ??= [];
    courtGroups[s.court_name].push(s);
  });

  const invoiceRows: {
    court: string;
    timeLabel: string;
    durationMins: number;
    price: number;
  }[] = [];

  Object.entries(courtGroups).forEach(([court, arr]) => {
    const sorted = [...arr].sort((a, b) => a.start_time.localeCompare(b.start_time));
    let start = sorted[0];
    let prevEnd = sorted[0].end_time;
    let slotCount = 1;
    let priceSum = sorted[0].price_coin;

    for (let i = 1; i <= sorted.length; i++) {
      const cur = sorted[i];
      const continuous = cur && cur.start_time === prevEnd;

      if (!continuous) {
        invoiceRows.push({
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

  /* ===================================================================
      TABLE
  =================================================================== */
  autoTable(doc, {
    startY: leftY + 110,
    head: [["Court", "Time", "Duration", "Price"]],
    body: invoiceRows.map((it) => [
      it.court,
      it.timeLabel,
      formatDuration(it.durationMins),
      `${it.price.toLocaleString()} coins`,
    ]),
    headStyles: {
      fillColor: [42, 117, 106],
      textColor: 255,
      fontStyle: "bold",
      halign: "center",
    },
    styles: {
      fontSize: 10,
      cellPadding: 6,
      lineWidth: 0.2,
      lineColor: [220, 220, 220],
    },
    columnStyles: {
      0: { cellWidth: 90 },
      1: { cellWidth: 200 },
      2: { cellWidth: 100 },
      3: { halign: "right", cellWidth: 100 },
    },
    theme: "grid",
  });

  const lastY =
    (doc as any).lastAutoTable?.finalY ??
    (doc as any).lastAutoTable?.cursor?.y ??
    leftY + 110;

  /* ===================================================================
      TOTAL
  =================================================================== */
  const total = Number(booking.total_cost) || 0;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("TOTAL", pageWidth - 230, lastY + 30);
  doc.text(`${total.toLocaleString()} coins`, pageWidth - 60, lastY + 30, {
    align: "right",
  });

  doc.setDrawColor(42, 117, 106);
  doc.line(pageWidth - 250, lastY + 35, pageWidth - 40, lastY + 35);

  /* ===================================================================
      ADDITIONAL INFO
  =================================================================== */
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);

  doc.text("Additional Information:", 40, lastY + 70);
  doc.text(`• Number of slots: ${slotValues.length}`, 50, lastY + 85);
  doc.text(
    `• Courts used: ${Object.keys(courtGroups).join(", ")}`,
    50,
    lastY + 100
  );

  /* ===================================================================
      NOTES
  =================================================================== */
  doc.text("Notes:", 40, lastY + 130);
  doc.text(
    "- Cancellation allowed up to 24 hours before booking time.",
    50,
    lastY + 145
  );
  doc.text(
    "- CL Coins are non-refundable after the cancellation window closes.",
    50,
    lastY + 160
  );
  doc.text(
    "- This document serves as an official tax receipt issued by Courtly Co., Ltd.",
    50,
    lastY + 175
  );

  /* ===================================================================
      FOOTER
  =================================================================== */
  doc.setFont("helvetica", "italic");
  doc.setFontSize(10);
  doc.text(
    "Thank you for choosing Courtly! | System generated — No signature required",
    pageWidth / 2,
    820,
    { align: "center" }
  );

  /* ===================================================================
      SAVE
  =================================================================== */
  doc.save(`Courtly_Invoice_${booking.booking_id}.pdf`);
}
