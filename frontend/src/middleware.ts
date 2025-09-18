import { NextResponse, NextRequest } from "next/server";

const COOKIE_NAME = process.env.JWT_COOKIE || "auth_tokens";
const PUBLIC_PATHS = ["/login", "/register", "/_next", "/api", "/favicon.ico", "/images"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (PUBLIC_PATHS.some(p => pathname.startsWith(p))) return NextResponse.next();

  const cookie = req.cookies.get(COOKIE_NAME)?.value;
  if (!cookie) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|api).*)"], // suojaa kaikki paitsi julkiset
};
