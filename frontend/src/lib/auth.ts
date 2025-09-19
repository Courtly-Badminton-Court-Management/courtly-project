// src/lib/auth.ts
export type Tokens = { access: string; refresh: string };
export type Me = { id: number; email: string; role: "player" | "manager" };

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8000";
if (!process.env.NEXT_PUBLIC_API_BASE) {
  // ช่วยเตือนช่วง dev ถ้าไม่ได้ตั้ง .env.local
  // (จะยังทำงานด้วย default http://localhost:8000)
  console.warn("NEXT_PUBLIC_API_BASE is not set; using", API_BASE);
}

const COOKIE_NAME = process.env.JWT_COOKIE || "auth_tokens";

/** Helper: parse error อย่างสุภาพ */
async function parseError(res: Response) {
  try {
    const data = await res.json();
    // Django/DRF มักมี .detail หรือ field errors
    if (typeof data?.detail === "string") return data.detail;
    if (typeof data?.message === "string") return data.message;
    // รวมข้อความสั้น ๆ จาก field errors
    if (data && typeof data === "object") {
      const msgs = Object.entries(data)
        .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : String(v)}`)
        .join(" | ");
      if (msgs) return msgs;
    }
  } catch {
    // ไม่ใช่ JSON → อาจเป็น HTML 404
    const txt = await res.text().catch(() => "");
    console.error("Non-JSON error response:", txt); // log ไว้ ไม่โยนขึ้น UI ทั้งก้อน
  }
  return `Request failed (${res.status})`;
}

/** Login via backend */
export async function loginWithEmail(email: string, password: string): Promise<Tokens> {
  const res = await fetch(`${API_BASE}/api/auth/login/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(await parseError(res));
  }
  return res.json();
}

/** Fetch user profile */
export async function fetchMe(accessToken: string): Promise<Me> {
  const res = await fetch(`${API_BASE}/api/auth/me/`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

/** Store tokens to cookie (client-side) */
export function saveTokens(tokens: Tokens) {
  document.cookie =
    `${COOKIE_NAME}=${encodeURIComponent(JSON.stringify(tokens))};` +
    ` path=/; samesite=lax`;
  // dev ใช้แบบนี้พอ; prod ค่อยเพิ่ม Secure/HttpOnly ผ่านเซิร์ฟเวอร์
}

export function readTokens(): Tokens | null {
  const m = document.cookie.match(new RegExp(`${COOKIE_NAME}=([^;]+)`));
  if (!m) return null;
  try { return JSON.parse(decodeURIComponent(m[1])); } catch { return null; }
}

export function clearTokens() {
  document.cookie = `${COOKIE_NAME}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
}

/** Role-based redirect helper */
export function roleDestination(role: Me["role"]): string {
  return role === "manager" ? "/dashboard" : "/home";
}
