// src/lib/auth.ts
// Single source of truth – älä tuo näitä kahdesti missään.
export type Tokens = { access: string; refresh: string };
export type Me = { id: number; email: string; role: "player" | "manager" };

const API_BASE = process.env.NEXT_PUBLIC_API_BASE!;
const COOKIE_NAME = process.env.JWT_COOKIE || "auth_tokens";

/** Login via backend */
export async function loginWithEmail(email: string, password: string): Promise<Tokens> {
  const res = await fetch(`${API_BASE}/api/auth/login/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const msg = await res.text().catch(() => "");
    throw new Error(msg || `Login failed (${res.status})`);
  }
  return res.json();
}

/** Fetch user profile */
export async function fetchMe(accessToken: string): Promise<Me> {
  const res = await fetch(`${API_BASE}/api/auth/me/`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to load profile");
  return res.json();
}

/** Store tokens to cookie (client-side) */
export function saveTokens(tokens: Tokens) {
  // simple cookie persist (fallback): secure settings recommended in prod
  document.cookie = `${COOKIE_NAME}=${encodeURIComponent(JSON.stringify(tokens))}; path=/; samesite=lax`;
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
