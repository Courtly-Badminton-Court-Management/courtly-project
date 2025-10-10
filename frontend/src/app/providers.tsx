"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useEffect, useState } from "react";
import { initTokensFromSession, getAccess } from "@/lib/auth/tokenStore";
import { extractRoleFromAccess } from "@/lib/auth/role";
import { setSessionCookie } from "@/lib/auth/session";

export default function Providers({ children }: { children: ReactNode }) {
  const [client] = useState(() => new QueryClient());

  useEffect(() => {
    initTokensFromSession();
    const a = getAccess();
    if (a) {
      const role = extractRoleFromAccess(a);
      if (role) setSessionCookie(role, 8);
    }
  }, []);

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
