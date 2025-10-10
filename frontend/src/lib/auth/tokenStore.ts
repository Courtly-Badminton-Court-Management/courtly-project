// src/lib/auth/tokenStore.ts
export type Tokens = { access: string | null; refresh: string | null; exp?: number | null };

let mem: Tokens = { access: null, refresh: null, exp: null };
const KEY = "courtly.tokens";               // ใช้ sessionStorage หรือ localStorage (ตาม remember)
const KEY_REMEMBER = "courtly.tokens.rem";  // เก็บสถานะ remember = localStorage?

const chan =
  typeof window !== "undefined" && "BroadcastChannel" in window
    ? new BroadcastChannel("courtly-auth")
    : null;

let refreshTimer: ReturnType<typeof setTimeout> | null = null;

// ---------- helpers ----------
function decodeExp(jwt?: string | null): number | null {
  if (!jwt) return null;
  try {
    const payload = jwt.split(".")[1];
    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(json)?.exp ?? null;
  } catch {
    return null;
  }
}

function readRemember(): boolean {
  try { return localStorage.getItem(KEY_REMEMBER) === "1"; } catch { return false; }
}
function writeRemember(val: boolean) {
  try { if (val) localStorage.setItem(KEY_REMEMBER, "1"); else localStorage.removeItem(KEY_REMEMBER); } catch {}
}

function readFromStorage(): Tokens {
  try {
    const remember = readRemember();
    const raw =
      (remember ? localStorage.getItem(KEY) : null) ??
      sessionStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Tokens) : { access: null, refresh: null, exp: null };
  } catch {
    return { access: null, refresh: null, exp: null };
  }
}
function writeToStorage(t: Tokens | null, remember: boolean) {
  try {
    if (!t || (!t.access && !t.refresh)) {
      localStorage.removeItem(KEY);
      sessionStorage.removeItem(KEY);
      return;
    }
    const payload = JSON.stringify(t);
    if (remember) {
      localStorage.setItem(KEY, payload);
      sessionStorage.removeItem(KEY);
    } else {
      sessionStorage.setItem(KEY, payload);
      localStorage.removeItem(KEY);
    }
  } catch {}
}

// ---------- public API ----------
export function initTokensFromSession() {
  if (typeof window !== "undefined") mem = readFromStorage();
}

export function getAccess() { return mem.access; }
export function getRefresh() { return mem.refresh; }
export function getAccessExp() { return mem.exp ?? null; }

export function willExpireSoon(skewSec = 90): boolean {
  if (!mem.exp) return false;
  return Date.now() / 1000 > (mem.exp - skewSec);
}

export function setTokens(next: { access: string; refresh?: string | null; exp?: number | null }, remember: boolean) {
  const exp = next.exp ?? decodeExp(next.access) ?? null;
  mem = { access: next.access ?? null, refresh: next.refresh ?? null, exp };
  writeRemember(remember);
  writeToStorage(mem, remember);
  chan?.postMessage({ type: "SET", payload: mem });
}

export function clearTokens() {
  mem = { access: null, refresh: null, exp: null };
  writeToStorage(null, false);
  writeRemember(false);
  if (refreshTimer) clearTimeout(refreshTimer);
  refreshTimer = null;
  chan?.postMessage({ type: "CLEAR" });
}

// ตั้งเวลา preemptive refresh ล่วงหน้า (เรียกหลัง login/refresh/hydration)
export function schedulePreemptiveRefresh(cb: () => void, skewSec = 90) {
  if (!mem.exp) return;
  const ms = Math.max(5, (mem.exp - skewSec) * 1000 - Date.now());
  if (refreshTimer) clearTimeout(refreshTimer);
  refreshTimer = setTimeout(() => cb(), ms);
}

// sync token state ข้ามแท็บ/หน้าต่าง
chan?.addEventListener("message", (e: any) => {
  if (e?.data?.type === "SET") mem = e.data.payload as Tokens;
  if (e?.data?.type === "CLEAR") mem = { access: null, refresh: null, exp: null };
});
