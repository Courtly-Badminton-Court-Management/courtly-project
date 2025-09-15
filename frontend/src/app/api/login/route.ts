// src/app/api/login/route.ts
import { NextResponse } from "next/server";

type Role = "player" | "manager";

/**
 * ✅ Only allow 2 predefined accounts
 * - You can change email/password here
 * - If you want more users, just add them here
 */
const USERS: Record<string, { password: string; role: Role }> = {
  "ratchaprapa.c@ku.th": { password: "0", role: "player" },
  "courtly.project@gmail.com": { password: "0", role: "manager" },
};

export async function POST(req: Request) {
  let email = "";
  let password = "";

  try {
    const body = await req.json();
    email = String(body.email || "").trim().toLowerCase();
    password = String(body.password || "");
  } catch {
    return new Response("Invalid payload", { status: 400 });
  }

  // ❌ Reject if email not in USERS
  const user = USERS[email];
  if (!user) {
    return new Response("Invalid email or password", { status: 401 });
  }

  // ❌ Reject if password does not match
  if (password !== user.password) {
    return new Response("Invalid email or password", { status: 401 });
  }

  // ✅ Passed authentication
  const role = user.role;
  const token = "mock-" + Math.random().toString(36).slice(2);
  const exp = Date.now() + 24 * 60 * 60 * 1000; // 1 day

  const res = NextResponse.json({ ok: true, role });

  // Session cookie for middleware (can later switch to HttpOnly from Django or real backend)
  res.cookies.set(
    "courtly_session",
    JSON.stringify({ token, role, exp }),
    {
      httpOnly: true, // 🔒 safer to set true
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      expires: new Date(exp),
      path: "/",
    }
  );

  return res;
}
