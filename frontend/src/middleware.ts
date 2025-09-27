// middleware.ts
import { NextRequest, NextResponse } from "next/server";

type Role = "player" | "manager";

function readSession(req: NextRequest): { role: Role; exp: number } | null {
  const raw = req.cookies.get("courtly_session")?.value;
  if (!raw) return null;
  try {
    const obj = JSON.parse(raw);
    if (typeof obj.exp !== "number" || Date.now() > obj.exp) return null; // session expired
    if (obj.role !== "player" && obj.role !== "manager") return null;
    return { role: obj.role, exp: obj.exp };
  } catch {
    return null;
  }
}

// Routes that require authentication
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

// Allowed routes for each role
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

  // Public pages (e.g., /, /auth/*) do not require login
  if (!isProtectedPath(pathname)) return NextResponse.next();

  const session = readSession(req);
  if (!session) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("next", pathname + (search || ""));
    return NextResponse.redirect(loginUrl);
  }

  // If user is logged in but not allowed to access the route, redirect to their home page
  if (!isAllowedForRole(pathname, session.role)) {
    const dest = session.role === "manager" ? "/dashboard" : "/home";
    return NextResponse.redirect(new URL(dest, req.url));
  }

  return NextResponse.next();
}

// Apply middleware to every path; we handle which ones are protected manually
export const config = {
  matcher: ["/:path*"],
};