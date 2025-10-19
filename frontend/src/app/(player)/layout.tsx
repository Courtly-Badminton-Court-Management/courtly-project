// src/app/(player)/layout.tsx
import type { ReactNode } from "react";
import PlayerNavBar from "@/ui/components/PlayerNavBar";

export default function PlayerLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <PlayerNavBar />
      <main className="mx-auto max-w-7xl px-4 py-4">{children}</main>
    </>
  );
}
