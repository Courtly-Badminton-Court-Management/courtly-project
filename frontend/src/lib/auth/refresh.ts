// src/lib/auth/refresh.ts
import axios from "axios";
import {
  getRefresh,
  setTokens,
  clearTokens,
  schedulePreemptiveRefresh,
  getAccessExp,
} from "./tokenStore";

const API = process.env.NEXT_PUBLIC_API_BASE_URL;
let inflight: Promise<void> | null = null;

export async function refreshAccessToken() {
  if (inflight) return inflight;

  inflight = (async () => {
    const refresh = getRefresh();
    if (!refresh) throw new Error("no refresh token");

    const { data } = await axios.post(
      `${API}/api/auth/token/refresh/`,
      { refresh },
      { withCredentials: true, headers: { "Content-Type": "application/json" } }
    );

    const newAccess: string | undefined = data?.access;
    if (!newAccess) throw new Error("no access in refresh");
    const exp: number | undefined = data?.exp; // ถ้าไม่มี เดี๋ยว setTokens จะ decode เอง

    // รักษาโหมด remember เดิมจากที่เคยเซฟไว้: ถ้าเคยเก็บใน localStorage แปลว่า remember = true
    const remembered = !!localStorage.getItem("courtly.tokens.rem");
    setTokens({ access: newAccess, refresh, exp }, remembered);

    // ตั้งรอบถัดไปล่วงหน้า
    schedulePreemptiveRefresh(() => { refreshAccessToken().catch(() => {}); });
  })().finally(() => { inflight = null; });

  return inflight;
}

// ใช้ตอนแอปบูต/หลัง hydration
export function armRefreshTimerIfPossible() {
  if (getAccessExp()) {
    schedulePreemptiveRefresh(() => { refreshAccessToken().catch(() => {}); });
  }
}
