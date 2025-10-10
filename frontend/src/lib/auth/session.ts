// src\lib\auth\session.ts
export type Role = "player" | "manager";

export function setSessionCookie(role: Role, hours = 8) {
  if (typeof document === "undefined") return;
  const exp = Date.now() + hours * 3600 * 1000;
  document.cookie = `courtly_session=${encodeURIComponent(
    JSON.stringify({ role, exp })
  )}; Path=/; Max-Age=${hours * 3600}`;
}

export function clearSessionCookie() {
  if (typeof document === "undefined") return;
  document.cookie = `courtly_session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT`;
}
