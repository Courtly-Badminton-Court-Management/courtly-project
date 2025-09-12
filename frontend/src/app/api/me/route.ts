// src/app/api/me/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  // ⬅️ ต้อง await
  const jar = await cookies();

  const roleCookie = jar.get("role")?.value;
  const role = roleCookie === "admin" ? "admin" : "player";

  if (role === "admin") {
    const name = jar.get("adminName")?.value ?? "Admin";
    const avatarUrl = jar.get("adminAvatar")?.value ?? null;

    return NextResponse.json({
      role: "admin",
      name,
      displayName: name,   // alias ให้โค้ดเดิมยังใช้ได้
      userName: null,
      balance: null,
      avatarUrl,
    });
  }

  // player
  const name = jar.get("userName")?.value ?? "Senior19";
  const balanceStr = jar.get("balance")?.value ?? "150";
  const avatarUrl = jar.get("avatarUrl")?.value ?? null;

  const balanceNum = Number(balanceStr);
  const balance = Number.isFinite(balanceNum) ? balanceNum : 0;

  return NextResponse.json({
    role: "player",
    name,
    userName: name,        // alias ให้โค้ดเดิมยังใช้ได้
    displayName: null,
    balance,
    avatarUrl,
  });
}
