// src/app/api/login/route.ts
import { NextResponse } from "next/server";

type Role = "player" | "manager";

/** อีเมลที่เป็น manager แบบกำหนดแน่นอน */
const MANAGER_EMAILS = new Set<string>(["courtly.project@gmail.com"]);

/** mock users ที่ "ต้อง" ตรวจรหัสผ่านให้ตรง */
const USER_FIXTURES: Record<string, { password: string; role: Role }> = {
  "ratchaprapa.c@ku.th": { password: "courtlyHokori25", role: "player" },
  // เพิ่มได้ตามต้องการ...
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

  let role: Role | null = null;

  // 1) ถ้าอยู่ใน FIXTURES -> ต้องเช็ครหัสผ่าน
  const fx = USER_FIXTURES[email];
  if (fx) {
    if (password !== fx.password) {
      return new Response("Invalid email or password", { status: 401 });
    }
    role = fx.role;
  } else if (MANAGER_EMAILS.has(email) || /admin/i.test(email) || /@manager\.com$/i.test(email)) {
    // 2) manager whitelist หรือ pattern
    role = "manager";
  } else {
    // 3) ที่เหลือเป็น player
    role = "player";
  }

  // mock token + อายุคุกกี้ 1 วัน
  const token = "mock-" + Math.random().toString(36).slice(2);
  const exp = Date.now() + 24 * 60 * 60 * 1000; // 1 วัน

  const res = NextResponse.json({ ok: true, role });

  // คุกกี้ session เพื่อให้ middleware อ่านได้ (ภายหลังใช้ HttpOnly จาก Django ก็ได้)
  res.cookies.set("courtly_session", JSON.stringify({ token, role, exp }), {
    httpOnly: false,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    expires: new Date(exp),
    path: "/",
  });

  return res;
}
