// middleware.ts
import { NextRequest, NextResponse } from "next/server";

type Role = "player" | "manager";

function readSession(req: NextRequest): { role: Role; exp: number } | null {
  const raw = req.cookies.get("courtly_session")?.value;
  if (!raw) return null;
  try {
    const obj = JSON.parse(raw);
    if (typeof obj.exp !== "number" || Date.now() > obj.exp) return null; // expired
    if (obj.role !== "player" && obj.role !== "manager") return null;
    return { role: obj.role, exp: obj.exp };
  } catch {
    return null;
  }
}

// เส้นทางภายในที่ "ต้องล็อกอิน"
const PROTECTED_PATHS = [
  // player
  "/home",
  "/wallet",
  "/booking",
  "/history",
  "/about-us",
  // manager
  "/dashboard",
  "/approval",
  "/log",
  "/setting",
  "/booking-control",
];

// อนุญาตเส้นทางตาม role
const ROLE_ALLOWLIST: Record<Role, RegExp[]> = {
  player: [
    /^\/home(?:\/|$)/,
    /^\/wallet(?:\/|$)/,
    /^\/booking(?:\/|$)/,
    /^\/history(?:\/|$)/,
    /^\/about-us(?:\/|$)/,
  ],
  manager: [
    /^\/dashboard(?:\/|$)/,
    /^\/approval(?:\/|$)/,
    /^\/log(?:\/|$)/,
    /^\/setting(?:\/|$)/,
    /^\/booking-control(?:\/|$)/,
  ],
};

function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"));
}

function isAllowedForRole(pathname: string, role: Role): boolean {
  return ROLE_ALLOWLIST[role].some((re) => re.test(pathname));
}

export function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  // หน้า public (เช่น /, /auth/*) ไม่บังคับ
  if (!isProtectedPath(pathname)) return NextResponse.next();

  const session = readSession(req);
  if (!session) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("next", pathname + (search || ""));
    return NextResponse.redirect(loginUrl);
  }

  if (!isAllowedForRole(pathname, session.role)) {
    const dest = session.role === "manager" ? "/dashboard" : "/home";
    return NextResponse.redirect(new URL(dest, req.url));
  }

  return NextResponse.next();
}

// ให้ทำงานทุก path แล้วเราเป็นคนคุมเองว่าอะไร protected
export const config = {
  matcher: ["/:path*"],
};
