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
import { useWalletMeRetrieve } from "@/api-client/endpoints/wallet/wallet";

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
  const [showConfirm, setShowConfirm] = useState(false); // ✅ modal state

  // profile
  const { data: meData, isLoading: meLoading } = useAuthMeRetrieve<any>();
  const username: string =
    meData?.username ?? meData?.name ?? meData?.email ?? "User";
  const avatarUrl: string | null = meData?.avatarUrl ?? null;

  // balance
  const { data: walletData, isLoading: balLoading } = useWalletMeRetrieve<any>();
  const balance: number =
    typeof walletData?.balance === "number" ? walletData.balance : 0;
  const loading = meLoading || balLoading;

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  const handleLogout = async () => {
    await clientLogout(qc);
    router.replace("/login");
  };

  const BalanceChip = () => (
    <div className="flex items-center gap-2 rounded-full border border-neutral-200 px-3 py-1.5">
      <Image
        src={COIN_ICON}
        alt="Coin"
        width={16}
        height={16}
        className="h-5 w-4.5"
        priority
      />
      <span className="text-sm font-semibold text-neutral-800">
        {loading ? "—" : balance}
      </span>
    </div>
  );

  return (
    <>
      {/* ================= Navbar ================= */}
      <header className="sticky top-0 z-40 w-full border-b border-neutral-200 bg-white/80 backdrop-blur-md">
        <nav className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-3 py-3 sm:px-4 lg:px-2">
          {/* logo */}
          <Link
            href="/home"
            className="flex shrink-0 items-center gap-2"
            aria-label="Courtly Home"
          >
            <BrandMark />
          </Link>

          {/* Desktop menu */}
          <div className="hidden lg:block">
            <DesktopMenu items={NAV_ITEMS} />
          </div>

          {/* Right side (desktop) */}
          <div className="hidden items-center gap-4 lg:flex">
            <BalanceChip />
            <AvatarBlock
              name={username}
              avatarUrl={avatarUrl}
              loading={loading}
              variant="neutral"
            />
            {/* 🔹 เปลี่ยนเป็นเปิด modal */}
            <Button
              onClick={() => setShowConfirm(true)}
              disabled={loading}
              label="Logout"
              backIcon="LogOut"
            />
          </div>

          {/* Mobile toggle */}
          <button
            className="inline-flex items-center rounded-md border border-neutral-300 p-2 lg:hidden"
            aria-label="Toggle menu"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? (
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5 text-neutral-800"
              >
                <path
                  d="M6 6l12 12M18 6 6 18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            ) : (
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5 text-neutral-800"
              >
                <path
                  d="M4 7h16M4 12h16M4 17h16"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            )}
          </button>
        </nav>

        {/* Mobile sheet */}
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
              <MobileMenu
                items={NAV_ITEMS}
                isActive={isActive}
                onClose={() => setOpen(false)}
              />
              <Button
                onClick={() => setShowConfirm(true)}
                disabled={loading}
                full
                label="Logout"
                backIcon="LogOut"
              />
            </div>
          </div>
        )}
      </header>

      {/* ================= Confirm Modal ================= */}
      {showConfirm && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-[min(90%,360px)] rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-black/10 animate-in fade-in zoom-in-95">
            <h2 className="text-lg font-semibold text-neutral-900 mb-2">
              Confirm Logout
            </h2>
            <p className="text-sm text-neutral-600 mb-5">
              Are you sure you want to log out from your account?
            </p>

            <div className="flex justify-end gap-2">
              <Button
                label="Cancel"
                onClick={() => setShowConfirm(false)}
                bgColor="bg-neutral-100"
                textColor="text-neutral-800"
                hoverBgColor="hover:bg-neutral-200"
              />
              <Button
                label="Logout"
                backIcon="LogOut"
                onClick={handleLogout}
                bgColor="bg-red-600"
                hoverBgColor="hover:bg-red-700"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
