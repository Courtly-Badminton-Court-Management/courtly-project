// src/app/(manager)/layout.tsx
import type { ReactNode } from "react";
import ManagerNavBar from "@/ui/components/ManagerNavBar";

export default function ManagerLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <ManagerNavBar />
      <main className="mx-auto max-w-7xl px-4 py-4">{children}</main>
    </>
  );
}
