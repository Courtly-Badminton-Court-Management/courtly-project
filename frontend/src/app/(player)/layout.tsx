// src/app/(player)/layout.tsx
import type { ReactNode } from "react";
import PlayerNavBar from "@/ui/components/basic/PlayerNavBar";

export default function PlayerLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <PlayerNavBar userName="Senior19" balance={150} />
      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
    </>
  );
}