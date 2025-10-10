//src\lib\auth\role.ts
export type Role = "player" | "manager";

function decodeJwtPayload<T = any>(token: string): T | null {
  try {
    const payload = token.split(".")[1];
    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(json) as T;
  } catch {
    return null;
  }
}

export function extractRoleFromAccess(access: string): Role | null {
  const p = decodeJwtPayload<any>(access);
  if (!p) return null;

  if (p.role === "player" || p.role === "manager") return p.role;
  if (p.is_staff === true || p.is_manager === true) return "manager";
  if (Array.isArray(p.groups) && p.groups.includes("manager")) return "manager";

  return p.role === "player" ? "player" : null;
}
