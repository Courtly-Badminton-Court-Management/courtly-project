"use client";

import { useEffect, useState, type ReactNode } from "react";

type Props = {
  children: ReactNode;
  fallback?: ReactNode;
};

export default function NoSSR({ children, fallback = null }: Props) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <>{fallback}</>;
  return <>{children}</>;
}
