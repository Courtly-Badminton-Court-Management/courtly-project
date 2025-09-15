// src/ui/components/PlayerNavBar.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import BrandMark from "./basic/BrandMark";
import DesktopMenu from "./basic/DesktopMenu";
import MobileMenu from "./basic/MobileMenu";
import AvatarBlock from "./basic/AvatarBlock";
import Button from "./basic/Button";

type Me = {
  userName: string | null;
  balance: number | null;
  avatarUrl: string | null;
};

const NAV_ITEMS = [
  { name: "Home", href: "/home" },
  { name: "Booking", href: "/booking" },
  { name: "Wallet", href: "/wallet" },
  { name: "History", href: "/history" },
  { name: "About Us", href: "/aboutus" },
] as const;

const COIN_ICON = "/brand/cl-coin.svg"; // ← ปรับ path ให้ตรงโปรเจค

export default function PlayerNavBar() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [me, setMe] = useState<Me>({
    userName: null,
    balance: null,
    avatarUrl: null,
  });

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch("/api/me", { credentials: "include" });
        if (!res.ok) throw new Error("ME fetch failed");
        const data = await res.json();
        if (!cancelled) {
          setMe({
            userName: data?.userName ?? data?.name ?? "User",
            balance: typeof data?.balance === "number" ? data.balance : 0,
            avatarUrl: data?.avatarUrl ?? null,
          });
        }
      } catch {
        if (!cancelled) {
          setMe({ userName: "Senior19", balance: 150, avatarUrl: null });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  const handleLogout = async () => {
    try {
      await fetch("/api/logout", { method: "POST", credentials: "include" });
    } catch {
      // ignore
    } finally {
      router.push("/login");
      router.refresh();
    }
  };

  const BalanceChip = () => (
    <div className="flex items-center gap-2 rounded-full border border-neutral-200 px-3 py-1.5">
      <Image src={COIN_ICON} alt="Coin" width={16} height={16} className="h-5 w-4.5" priority />
      <span className="text-sm font-semibold text-neutral-800">
        {loading ? "—" : me.balance ?? 0}
      </span>
    </div>
  );

  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-200 bg-white/80 backdrop-blur-md">
      <nav className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 md:px-6 lg:px-2">
        {/* โลโก้ */}
        <Link href="/home" className="flex items-center gap-2 shrink-0" aria-label="Courtly Home">
          <BrandMark />
        </Link>

        {/* Desktop menu */}
        <DesktopMenu items={NAV_ITEMS} />

        {/* Right side (desktop) */}
        <div className="hidden items-center gap-4 md:flex">
          <BalanceChip />
          <AvatarBlock
            name={me.userName}
            avatarUrl={me.avatarUrl}
            loading={loading}
            variant="neutral"
          />
          <Button onClick={handleLogout} disabled={loading} label="Logout" />
        </div>

        {/* Mobile toggle */}
        <button
          className="inline-flex items-center rounded-md border border-neutral-300 p-2 md:hidden"
          aria-label="Toggle menu"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? (
            <svg viewBox="0 0 24 24" className="h-5 w-5 text-neutral-800">
              <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" className="h-5 w-5 text-neutral-800">
              <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          )}
        </button>
      </nav>

      {/* Mobile sheet */}
      {open && (
        <div className="border-t border-neutral-200 bg-white md:hidden">
          <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3">
            <div className="flex items-center justify-between">
              <BalanceChip />
              <AvatarBlock
                name={me.userName}
                avatarUrl={me.avatarUrl}
                loading={loading}
                variant="neutral"
              />
            </div>

            {/* ใช้ MobileMenu ที่แยกไว้ */}
            <MobileMenu items={NAV_ITEMS} isActive={isActive} onClose={() => setOpen(false)} />

            {/* ใช้ Button บน mobile แบบ full width */}
            <Button onClick={handleLogout} disabled={loading} full label="Logout" />
          </div>
        </div>
      )}
    </header>
  );
}
