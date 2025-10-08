// src/ui/providers/AuthBootstrap.tsx
"use client";
import { useEffect } from "react";
import { initTokensFromSession } from "@/lib/auth/tokenStore";
import { armRefreshTimerIfPossible } from "@/lib/auth/refresh";

export default function AuthBootstrap() {
  useEffect(() => {
    initTokensFromSession();
    armRefreshTimerIfPossible();
  }, []);
  return null;
}
