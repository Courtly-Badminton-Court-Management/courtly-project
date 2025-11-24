//frontend/src/app/api/avatars/route.ts
import { NextResponse } from "next/server";
import path from "path";
import { promises as fs } from "fs";

export async function GET() {
  try {
    const avatarsDir = path.join(process.cwd(), "public", "avatars");
    const files = await fs.readdir(avatarsDir);
    const pngs = files.filter((f) => f.endsWith(".png") || f.endsWith(".jpg"));

    return NextResponse.json({ avatars: pngs });
  } catch (err) {
    console.error("Error reading avatars:", err);
    return NextResponse.json({ avatars: [] }, { status: 500 });
  }
}
