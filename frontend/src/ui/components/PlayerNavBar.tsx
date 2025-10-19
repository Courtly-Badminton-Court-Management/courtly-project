// src/ui/components/PlayerNavBar.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import BrandMark from "./basic/BrandMark";
import DesktopMenu from "./basic/DesktopMenu";
import MobileMenu from "./basic/MobileMenu";
import AvatarBlock from "./basic/AvatarBlock";
import Button from "./basic/Button";

import { useQueryClient } from "@tanstack/react-query";
import { clientLogout } from "@/lib/auth/logout";

// ✅ orval hooks
import { useAuthMeRetrieve } from "@/api-client/endpoints/auth/auth";
import {
  useWalletMeRetrieve,
} from "@/api-client/endpoints/wallet/wallet";

const NAV_ITEMS = [
  { name: "Home", href: "/home" },
  { name: "Booking", href: "/booking" },
  { name: "Wallet", href: "/wallet" },
  { name: "History", href: "/history" },
  { name: "About Us", href: "/aboutus" },
] as const;

const COIN_ICON = "/brand/cl-coin.svg";

export default function PlayerNavBar() {
  const pathname = usePathname();
  const router = useRouter();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);

  // profile
  const { data: meData, isLoading: meLoading } = useAuthMeRetrieve<any>();
  const username: string =
    meData?.username ?? meData?.name ?? meData?.email ?? "User";
  const avatarUrl: string | null = meData?.avatarUrl ?? null;

  // balance
  const { data: walletData, isLoading: balLoading } = useWalletMeRetrieve<any>();
  const balance: number = typeof walletData?.balance === "number" ? walletData.balance : 0;
  const loading = meLoading || balLoading;

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  const handleLogout = async () => {
    await clientLogout(qc);
    router.replace("/login");
  };

  const BalanceChip = () => (
    <div className="flex items-center gap-2 rounded-full border border-neutral-200 px-3 py-1.5">
      <Image src={COIN_ICON} alt="Coin" width={16} height={16} className="h-5 w-4.5" priority />
      <span className="text-sm font-semibold text-neutral-800">
        {loading ? "—" : balance}
      </span>
    </div>
  );

  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-200 bg-white/80 backdrop-blur-md">
      <nav className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-3 py-3 sm:px-4 lg:px-2">
        {/* logo */}
        <Link href="/home" className="flex shrink-0 items-center gap-2" aria-label="Courtly Home">
          <BrandMark />
        </Link>

        {/* Desktop menu → แสดงเฉพาะ ≥ lg */}
        <div className="hidden lg:block">
          <DesktopMenu items={NAV_ITEMS} />
        </div>

        {/* Right side (desktop) → แสดงเฉพาะ ≥ lg */}
        <div className="hidden items-center gap-4 lg:flex">
          <BalanceChip />
          <AvatarBlock
            name={username}
            avatarUrl={avatarUrl}
            loading={loading}
            variant="neutral"
          />
          <Button onClick={handleLogout} disabled={loading} label="Logout" />
        </div>

        {/* Mobile toggle → แสดงเฉพาะ < lg */}
        <button
          className="inline-flex items-center rounded-md border border-neutral-300 p-2 lg:hidden"
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

      {/* Mobile sheet → แสดงเฉพาะ < lg */}
      {open && (
        <div className="border-t border-neutral-200 bg-white lg:hidden">
          <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3">
            <div className="flex items-center justify-between">
              <AvatarBlock
                name={username}
                avatarUrl={avatarUrl}
                loading={loading}
                variant="neutral"
              />
              <BalanceChip />
            </div>
            <MobileMenu items={NAV_ITEMS} isActive={isActive} onClose={() => setOpen(false)} />
            <Button onClick={handleLogout} disabled={loading} full label="Logout" />
          </div>
        </div>
      )}
    </header>
  );
}
