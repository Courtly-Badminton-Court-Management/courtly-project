// frontend\src\lib\auth\logout.ts
"use client";

import { QueryClient } from "@tanstack/react-query";
import { clearTokens } from "@/lib/auth/tokenStore";
import { clearSessionCookie } from "@/lib/auth/session";

/** ล็อกเอาต์ฝั่ง client: ล้าง token/cookie/cache ให้หมด */
export async function clientLogout(qc?: QueryClient) {
  try {
    // (ถ้ามี endpoint /api/auth/logout/ ในอนาคต ค่อยเรียกที่นี่แบบ best-effort)
    // await customRequest({ url: "/api/auth/logout/", method: "POST" });
  } finally {
    clearTokens();        // memory + sessionStorage + broadcast ข้ามแท็บ
    clearSessionCookie(); // ให้ middleware กัน route ทันที
    qc?.clear();          // ล้าง react-query cache กัน data ค้าง
  }
}
