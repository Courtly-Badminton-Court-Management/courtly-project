// src/lib/auth.ts
export type Tokens = { access: string; refresh: string };
export type Me = { id: number; username: string; email: string; role: "player" | "manager" | "admin" };

const API_BASE =
  (process.env.NEXT_PUBLIC_API_BASE || "http://127.0.0.1:8000").replace(/\/+$/, "");

async function jsonFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
    cache: "no-store",
  });
  const text = await res.text();
  let data: any = null;
  try { data = text ? JSON.parse(text) : null; } catch { /* keep raw text */ }
  if (!res.ok) {
    const msg =
      (data && (data.detail || data.error || data.message || data.non_field_errors)) ||
      text ||
      `HTTP ${res.status}`;
    throw new Error(typeof msg === "string" ? msg : JSON.stringify(msg));
  }
  return data as T;
}

// ---------- NAMED EXPORTS (what your pages import) ----------

// EXACT signature your Register page calls:
export async function registerWithEmail(payload: {
  username: string;
  email: string;
  password: string;
  confirm: string;
  firstname: string;
  lastname: string;
  accept: boolean;
}): Promise<{ username: string; email: string; firstname: string; lastname: string }> {
  return jsonFetch(`${API_BASE}/api/auth/register/`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function loginWithEmail(identifier: string, password: string): Promise<Tokens> {
  // Your backend expects { email, password }. If it accepts username too, keep the same field.
  // If your backend requires "username" instead, switch key here based on a heuristic.
  const body = { email: identifier, password };
  return jsonFetch(`${API_BASE}/api/auth/login/`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function saveTokens(tokens: Tokens) {
  if (typeof window === "undefined") return;
  localStorage.setItem("access", tokens.access);
  localStorage.setItem("refresh", tokens.refresh);
}

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("access");
}

export async function fetchMe(access?: string): Promise<Me> {
  const token = access || getAccessToken();
  if (!token) throw new Error("Not authenticated");
  return jsonFetch(`${API_BASE}/api/auth/me/`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function roleDestination(role: Me["role"]): string {
  switch (role) {
    case "manager":
    case "admin":
      return "/dashboard";
    case "player":
    default:
      return "/home";
  }
}
