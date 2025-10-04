// // "use client";
// //
// // import { useMemo, useState } from "react";
// //
// // type Log = { when:string; who:string; action:string; meta:string };
// //
// // export default function ManagerLogPage() {
// //   const [q, setQ] = useState("");
// //   const logs = useMemo<Log[]>(
// //     () => [
// //       { when:"2025-09-05 12:54", who:"admin@courtly", action:"APPROVE_TOPUP", meta:"REQ02419824341 +500" },
// //       { when:"2025-09-05 10:39", who:"admin@courtly", action:"CHECKIN", meta:"BK04300820251 Court 1 11:00-12:00" },
// //       { when:"2025-09-04 21:48", who:"admin@courtly", action:"REJECT_TOPUP", meta:"REQ02419824349" },
// //       { when:"2025-09-04 09:12", who:"system", action:"AUTO_REFUND", meta:"BK42910382149 -100" },
// //     ],
// //     []
// //   );
// //   const filtered = logs.filter(l => [l.when,l.who,l.action,l.meta].join(" ").toLowerCase().includes(q.toLowerCase()));
// //
// //   return (
// //     <main className="mx-auto max-w-5xl p-4 md:p-8">
// //       <header className="mb-4">
// //         <h1 className="text-2xl font-bold">Audit Log</h1>
// //         <p className="text-sm text-neutral-600">Complete audit trail for booking, cancel, approvals, and adjustments.</p>
// //       </header>
// //
// //       <input
// //         value={q}
// //         onChange={(e)=>setQ(e.target.value)}
// //         placeholder="Search logs..."
// //         className="mb-3 w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-400"
// //       />
// //
// //       <div className="rounded-2xl border bg-white p-4 shadow-sm">
// //         <ul className="divide-y">
// //           {filtered.map((l,i)=>(
// //             <li key={i} className="grid grid-cols-12 gap-2 py-3 text-sm">
// //               <div className="col-span-3 font-medium">{l.when}</div>
// //               <div className="col-span-3">{l.who}</div>
// //               <div className="col-span-3">{l.action}</div>
// //               <div className="col-span-3 text-neutral-600">{l.meta}</div>
// //             </li>
// //           ))}
// //         </ul>
// //       </div>
// //     </main>
// //   );
// // }
// //
//
// "use client";
//
// import { useEffect, useState, useMemo } from "react";
//
// type Log = {
//   when: string;
//   who: string;
//   action: string;
//   meta: string;
// };
//
// export default function ManagerLogPage() {
//   const [q, setQ] = useState("");
//   const [logs, setLogs] = useState<Log[]>([]);
//
//   useEffect(() => {
//     const token = localStorage.getItem("accessToken");
//
//     fetch("http://localhost:8001/api/history/", {
//           headers: {
//             Authorization: token ? `Bearer ${token}` : "",
//           },
//         })
//       .then((res) => {
//         if (!res.ok) throw new Error(`HTTP ${res.status}`);
//         return res.json();
//       })
//       .then((data) => {
//         // สมมติ backend คืนมาเป็น list ของ booking history
//         // แปลงให้เข้ากับ type Log
//         const mapped: Log[] = (data || []).map((item: any) => ({
//           when: item.created_at || "",
//           who: item.user?.email || "system",
//           action: item.status || "UNKNOWN",
//           meta: (item.slots || [])
//             .map(
//               (s: any) =>
//                 `Court ${s.slot__court} ${s.slot__service_date} ${s.slot__start_at}-${s.slot__end_at}`
//             )
//             .join(", "),
//         }));
//         setLogs(mapped);
//       })
//       .catch((err) => {
//         console.error("fetch history error", err);
//       });
//   }, []);
//
//   const filtered = useMemo(
//     () =>
//       logs.filter((l) =>
//         [l.when, l.who, l.action, l.meta]
//           .join(" ")
//           .toLowerCase()
//           .includes(q.toLowerCase())
//       ),
//     [logs, q]
//   );
//
//   return (
//     <main className="mx-auto max-w-5xl p-4 md:p-8">
//       <header className="mb-4">
//         <h1 className="text-2xl font-bold">Audit Log</h1>
//         <p className="text-sm text-neutral-600">
//           Complete audit trail for booking, cancel, approvals, and adjustments.
//         </p>
//       </header>
//
//       <input
//         value={q}
//         onChange={(e) => setQ(e.target.value)}
//         placeholder="Search logs..."
//         className="mb-3 w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-400"
//       />
//
//       <div className="rounded-2xl border bg-white p-4 shadow-sm">
//         <ul className="divide-y">
//           {filtered.map((l, i) => (
//             <li key={i} className="grid grid-cols-12 gap-2 py-3 text-sm">
//               <div className="col-span-3 font-medium">{l.when}</div>
//               <div className="col-span-3">{l.who}</div>
//               <div className="col-span-3">{l.action}</div>
//               <div className="col-span-3 text-neutral-600">{l.meta}</div>
//             </li>
//           ))}
//         </ul>
//       </div>
//     </main>
//   );
// }

"use client";

import { useEffect, useState } from "react";

type BookingHistory = {
  booking_no: string;
  user: string; // ✅ เพิ่ม email ของ user
  status: string;
  created_at: string;
  slots: {
    slot: number;
    slot__court: number;
    slot__service_date: string;
    slot__start_at: string;
    slot__end_at: string;
  }[];
};

export default function ManagerLogPage() {
  const [logs, setLogs] = useState<BookingHistory[]>([]);
  const [q, setQ] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function fetchWithAuth(url: string) {
    let token =
      localStorage.getItem("accessToken") ||
      localStorage.getItem("access_token");

    const refresh =
      localStorage.getItem("refreshToken") ||
      localStorage.getItem("refresh_token");

    let res = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
      },
    });

    if (res.status === 401 || res.status === 403) {
      if (refresh) {
        const refreshRes = await fetch(
          "http://localhost:8001/api/auth/token/refresh/",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refresh }),
          }
        );

        if (refreshRes.ok) {
          const data = await refreshRes.json();
          token = data.access;

          localStorage.setItem("accessToken", token);
          localStorage.setItem("access_token", token);

          res = await fetch(url, {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          });
        }
      }
    }

    return res;
  }

  useEffect(() => {
    fetchWithAuth("http://localhost:8001/api/bookings/all/") // ✅ ใช้ endpoint all
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text();
          throw new Error(`HTTP ${res.status} - ${text}`);
        }
        return res.json();
      })
      .then((data) => {
        console.log("all bookings >>>", data);

        const records: BookingHistory[] = Array.isArray(data)
          ? data
          : data.results || [];

        setLogs(records);
      })
      .catch((err) => {
        console.error("fetch all bookings error", err);
        setError(err.message);
      });
  }, []);

  const filtered = logs.filter((l) =>
    [l.booking_no, l.user, l.status, l.created_at]
      .join(" ")
      .toLowerCase()
      .includes(q.toLowerCase())
  );

  return (
    <main className="mx-auto max-w-6xl p-4 md:p-8">
      <header className="mb-4">
        <h1 className="text-2xl font-bold">All Bookings</h1>
        <p className="text-sm text-neutral-600">
          Overview of all bookings across all users.
        </p>
      </header>

      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search bookings..."
        className="mb-3 w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-400"
      />

      <div className="rounded-2xl border bg-white p-4 shadow-sm">
        {error && (
          <div className="mb-3 rounded bg-red-100 p-2 text-red-600">{error}</div>
        )}

        {filtered.length === 0 && !error && (
          <div className="p-3 text-sm text-neutral-500">No bookings found.</div>
        )}

        <ul className="divide-y">
          {filtered.map((l, i) => (
            <li key={i} className="grid grid-cols-12 gap-2 py-3 text-sm">
              <div className="col-span-2 font-medium">{l.created_at}</div>
              <div className="col-span-2">{l.booking_no}</div>
              <div className="col-span-2">{l.user}</div> {/* ✅ แสดง user email */}
              <div className="col-span-2">{l.status}</div>
              <div className="col-span-4 text-neutral-600">
                {(l.slots || [])
                  .map(
                    (s) =>
                      `Court ${s.slot__court} ${s.slot__service_date} ${s.slot__start_at}-${s.slot__end_at}`
                  )
                  .join(", ")}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
