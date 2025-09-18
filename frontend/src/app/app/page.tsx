"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { authFetch } from "@/lib/http";
import { ROLE_DEST } from "@/lib/roles";
import { getRoleFromToken } from "@/lib/auth";

export default function AppEntry() {
  const router = useRouter();

  useEffect(() => {
    let canceled = false;
    (async () => {
      const access = localStorage.getItem("access");
      if (!access) { router.replace("/login"); return; }

      const r = await authFetch("/api/auth/me/");
      if (!r.ok) { router.replace("/login"); return; }
      const me = await r.json().catch(() => null);
      if (canceled) return;

      const role = me?.role || getRoleFromToken() || "player";
      const dest = ROLE_DEST[role] ?? ROLE_DEST.player;
      router.replace(dest); // manager -> /dashboard, player/user -> /home
    })();
    return () => { canceled = true; };
  }, [router]);

  return null;
}
