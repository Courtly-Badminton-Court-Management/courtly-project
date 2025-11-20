//frontend/src/lib/slot/groupAvailableSlots.ts
/**
 * Group available slots by start_time - end_time
 * Expected input: { booking_slots: {...} }
 */
export function groupAvailableSlotsByTime(booking_slots: Record<string, any>) {
  if (!booking_slots) return [];

  // filter only available slots
  const slots = Object.values(booking_slots).filter(
    (s: any) => s.status?.toLowerCase() === "available"
  );

  const groups: Record<string, any[]> = {};

  for (const s of slots) {
    // ✅ ใช้ string โดยตรง ไม่ต้อง dayjs (ป้องกัน invalid)
    const start = (s.start_time || "").trim();
    const end = (s.end_time || "").trim();

    if (!start || !end) continue;

    const label = `${start} - ${end}`;
    if (!groups[label]) groups[label] = [];
    groups[label].push(s);
  }

  // ✅ sort ตามเวลาเริ่มต้น
  return Object.keys(groups)
    .sort(
      (a, b) =>
        parseInt(a.split(":")[0]) * 60 + parseInt(a.split(":")[1]) -
        (parseInt(b.split(":")[0]) * 60 + parseInt(b.split(":")[1]))
    )
    .map((label) => ({
      label,
      courts: groups[label],
    }));
}
