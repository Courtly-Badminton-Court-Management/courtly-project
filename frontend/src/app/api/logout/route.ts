// src/app/api/logout/route.ts
import { NextResponse } from "next/server";

export async function POST() {
  const res = NextResponse.json({ ok: true });

  // รายชื่อคุกกี้ที่เราใช้ในระบบตอนนี้
  const keys = [
    "courtly_session", // session หลัก
    "role",            // player/admin
    "userName", "balance", "avatarUrl", // ฝั่งผู้เล่น
    "adminName", "adminAvatar",         // ฝั่งแอดมิน
    // ถ้ามี token อื่น ๆ ก็ลบบวกเพิ่มได้
    "accessToken", "refreshToken",
  ];

  // ลบให้หมด
  for (const k of keys) res.cookies.delete(k);

  // ถ้าบางตัวเคยตั้ง path/option แปลก ๆ ไว้
  // ให้ใช้ set แบบกำหนด expires ซ้ำเพื่อความชัวร์:
  // for (const k of keys) res.cookies.set(k, "", { expires: new Date(0), path: "/" });

  return res;
}
