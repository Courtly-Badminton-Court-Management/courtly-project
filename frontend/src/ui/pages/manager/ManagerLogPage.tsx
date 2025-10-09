"use client";

import { useEffect, useMemo, useState } from "react";

/* ========================
   Types
======================== */
type BookingSlot = {
  slot: number;
  slot__court: number;
  slot__service_date: string;
  slot__start_at: string;
  slot__end_at: string;
};

type BookingHistory = {
  booking_no: string;
  user?: string;               // email/identifier (may come as user or user_email)
  user_email?: string;         // be resilient to backend naming
  status: string;
  created_at: string;
  slots: BookingSlot[];
};

type Paginated<T> = {
  count?: number;
  next?: string | null;
  previous?: string | null;
  results?: T[];
};

/* ========================
   Config
======================== */
const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/+$/, "") ??
  "http://localhost:8001";

const BOOKING_ALL_URL = `${API_BASE}/api/bookings/all/`;
const TOKEN_REFRESH_URL = `${API_BASE}/api/auth/token/refresh/`;

/* ========================
   Utils
======================== */
function formatDateTime(iso: string) {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  // Example: 2025-10-07 11:24
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(
    d.getMinutes()
  ).padStart(2, "0")}`;
}

function safeGetTokens() {
  // guard for SSR (shouldn't run, but safe)
  if (typeof window === "undefined") return { access: null as string | null, refresh: null as string | null };
  const access =
    localStorage.getItem("accessToken") || localStorage.getItem("access_token");
  const refresh =
    localStorage.getItem("refreshToken") || localStorage.getItem("refresh_token");
  return { access, refresh };
}

async function fetchWithAuth(url: string) {
  let { access, refresh } = safeGetTokens();

  let res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...(access ? { Authorization: `Bearer ${access}` } : {}),
    },
    cache: "no-store",
  });

  if (res.status !== 401 && res.status !== 403) {
    return res;
  }

  // Try refresh only if refresh token exists
  if (!refresh) return res;

  const refreshRes = await fetch(TOKEN_REFRESH_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh }),
  });

  if (!refreshRes.ok) {
    // refresh failed; bubble original 401/403
    return res;
  }

  const data = (await refreshRes.json()) as { access?: string };
  if (!data?.access) return res;

  access = data.access;
  // persist for both naming styles used around the app
  localStorage.setItem("accessToken", access);
  localStorage.setItem("access_token", access);

  // retry original
  return fetch(url, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${access}`,
    },
    cache: "no-store",
  });
}

/* ========================
   Component
======================== */
export default function ManagerLogPage() {
  const [logs, setLogs] = useState<BookingHistory[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load all bookings (supports direct array or paginated response)
  useEffect(() => {
    let canceled = false;

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetchWithAuth(BOOKING_ALL_URL);
        if (!res.ok) {
          const text = await res.text();
          throw new Error(`HTTP ${res.status} - ${text}`);
        }
        const data = (await res.json()) as BookingHistory[] | Paginated<BookingHistory>;

        const records = Array.isArray(data) ? data : data?.results ?? [];
        if (!canceled) setLogs(records);
      } catch (err: any) {
        if (!canceled) setError(err?.message ?? "Failed to load bookings.");
      } finally {
        if (!canceled) setLoading(false);
      }
    })();

    return () => {
      canceled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return logs;

    return logs.filter((l) => {
      const email = l.user ?? l.user_email ?? "";
      return [l.booking_no, email, l.status, l.created_at]
        .join(" ")
        .toLowerCase()
        .includes(needle);
    });
  }, [logs, q]);

  return (
    <main className="mx-auto max-w-6xl p-4 md:p-8">
      <header className="mb-4">
        <h1 className="text-2xl font-bold">All Bookings</h1>
        <p className="text-sm text-neutral-600">Overview of all bookings across all users.</p>
      </header>

      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search bookings… (booking no, email, status)"
        className="mb-3 w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-400"
      />

      <div className="rounded-2xl border bg-white p-4 shadow-sm">
        {loading && <div className="p-3 text-sm text-neutral-500">Loading bookings…</div>}

        {error && (
          <div className="mb-3 rounded bg-red-100 p-2 text-red-700">
            {error}
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="p-3 text-sm text-neutral-500">No bookings found.</div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <ul className="divide-y">
            {filtered.map((l) => {
              const email = l.user ?? l.user_email ?? "-";
              return (
                <li
                  key={l.booking_no} // booking_no should be unique
                  className="grid grid-cols-12 gap-2 py-3 text-sm"
                >
                  <div className="col-span-2 font-medium">{formatDateTime(l.created_at)}</div>
                  <div className="col-span-2">{l.booking_no}</div>
                  <div className="col-span-2">{email}</div>
                  <div className="col-span-2">
                    <span
                      className="inline-flex items-center rounded-full border px-2 py-0.5"
                      title={l.status}
                    >
                      {l.status}
                    </span>
                  </div>
                  <div className="col-span-4 text-neutral-700">
                    {(l.slots ?? [])
                      .map(
                        (s) =>
                          `Court ${s.slot__court} ${s.slot__service_date} ${s.slot__start_at}-${s.slot__end_at}`
                      )
                      .join(", ")}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </main>
  );
}
