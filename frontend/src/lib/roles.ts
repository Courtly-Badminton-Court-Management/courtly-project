// src/lib/roles.ts
export const PROTECTED_PATHS = {
  player: [
    "/home",
    "/wallet",
    "/booking",
    "/history",
    "/about-us",
  ],
  manager: [
    "/dashboard",
    "/approval",
    "/log",
    "/setting",
    "/booking-control",
  ],
} as const;

export type Role = keyof typeof PROTECTED_PATHS;

export function isPathAllowed(path: string, role: Role): boolean {
  const allowed = PROTECTED_PATHS[role];
  return allowed.some((prefix) => path.startsWith(prefix));
}
