import { NextResponse, NextRequest } from "next/server";

const PROTECTED_PREFIXES = ["/dashboard", "/booking", "/wallet", "/manager"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  // อนุญาตไฟล์ระบบ / public assets
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/assets")
  ) {
    return NextResponse.next();
  }

  // ถ้าเข้าหน้าด้านใน แต่ไม่มี session ให้เด้งกลับหน้าแรก
  if (PROTECTED_PREFIXES.some((p) => pathname.startsWith(p))) {
    const hasSession = Boolean(req.cookies.get("cl_session")?.value);
    if (!hasSession) {
      const url = req.nextUrl.clone();
      url.pathname = "/";
      url.searchParams.set("from", pathname);
      return NextResponse.redirect(url);
    }
  }
  return NextResponse.next();
}

// กำหนด matcher เฉพาะเส้นทางหลัก (ยกเว้นไฟล์ระบบ/สาธารณะ)
export const config = {
  matcher: ["/((?!_next|api|assets|favicon.ico).*)"],
};
