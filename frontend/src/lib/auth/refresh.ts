import axios from "axios";
import {
  getRefresh,
  setTokens,
  schedulePreemptiveRefresh,
} from "./tokenStore";

const API = process.env.NEXT_PUBLIC_API_BASE_URL;

// กันเรียกซ้ำในเวลาเดียวกัน
let inflight: Promise<string> | null = null;

/**
 * รีเฟรช access token ด้วย refresh token
 * ใช้ endpoint ของ Courtly: /api/auth/auth/token/refresh/
 * คืนค่า access token ใหม่ออกมา
 */
export async function refreshAccessToken(): Promise<string> {
  if (inflight) return inflight;

  inflight = (async () => {
    const refresh = getRefresh();
    if (!refresh) throw new Error("no refresh token");

    // ✅ ใช้ endpoint ที่ตรงกับ Orval
    const { data } = await axios.post(
      `${API}/api/auth/auth/token/refresh/`,
      { refresh },
      { withCredentials: true, headers: { "Content-Type": "application/json" } }
    );

    const newAccess: string | undefined = data?.access;
    if (!newAccess) throw new Error("no access in refresh");

    const exp: number | undefined = data?.exp;
    const remembered = !!localStorage.getItem("courtly.tokens.rem");

    // เซฟ token ใหม่ใน storage/memory
    setTokens({ access: newAccess, refresh, exp }, remembered);

    // ตั้งรอบ preemptive refresh ล่วงหน้า
    schedulePreemptiveRefresh(() => {
      refreshAccessToken().catch(() => {});
    });

    // ✅ คืนค่า access token ใหม่ออกไป
    return newAccess;
  })().finally(() => {
    inflight = null;
  });

  return inflight;
}

/**
 * ใช้ตอนบูตแอป (หลัง hydration)
 * เพื่อเริ่มตั้ง timer refresh ล่วงหน้า
 */
export function armRefreshTimerIfPossible() {
  const { getAccessExp } = require("./tokenStore");
  const exp = getAccessExp();
  if (exp) {
    schedulePreemptiveRefresh(() => {
      refreshAccessToken().catch(() => {});
    });
  }
}
