const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

export async function fetchDayGrid(opts: {
  clubId: number;
  ymd: string; // "2025-09-05"
}): Promise<{
  hours: string[];
  grid: Array<Array<"available"|"booked"|"maintenance"|"walkin"|"endgame">>;
}> {
  const month = opts.ymd.slice(0,7);
  const res = await fetch(`${API}/api/slots/month-view/?club=${opts.clubId}&month=${month}`);
  if (!res.ok) throw new Error(`month-view ${res.status}`);
  const data = await res.json() as {
    days: Array<{date: string; slotList: Record<string, {
      status: "available"|"booked"|"maintenance"|"walkin"|"endgame";
      start_time: string; end_time: string; court: number;
    }>}>
  };

  const HOURS = [
    "10:00 - 11:00","11:00 - 12:00","12:00 - 13:00",
    "13:00 - 14:00","14:00 - 15:00","15:00 - 16:00",
    "16:00 - 17:00","17:00 - 18:00","18:00 - 19:00",
  ];

  const day = data.days.find(d => d.date.includes(opts.ymd.slice(8))); // ปรับตามรูปแบบวันที่จริง
  const courts = 10;
  const grid = Array.from({length: courts}, () => Array(HOURS.length).fill("available") as any);

  if (day) {
    for (const s of Object.values(day.slotList)) {
      const idx = HOURS.findIndex(h => h.startsWith(s.start_time));
      if (idx >= 0 && s.court >= 1 && s.court <= courts) grid[s.court-1][idx] = s.status;
    }
  }
  return { hours: HOURS, grid };
}

export async function createBookings(payload: {
  clubId: number;
  items: Array<{ court: number; date: string; start: string; end: string }>;
}) {
  const res = await fetch(`${API}/api/bookings/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ club: payload.clubId, items: payload.items }),
  });
  if (!res.ok) throw new Error(`bookings POST ${res.status}`);
  return res.json();
}
