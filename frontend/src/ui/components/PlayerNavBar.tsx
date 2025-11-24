"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

import BrandMark from "@/ui/components/basic/BrandMark";
import DesktopMenu from "@/ui/components/basic/DesktopMenu";
import MobileMenu from "@/ui/components/basic/MobileMenu";
import AvatarBlock from "@/ui/components/navbar/AvatarBlock";
import Button from "@/ui/components/basic/Button";
import LogoutModal from "@/ui/components/authpage/LogoutModal";

import WelcomeModal from "@/ui/components/navbar/WelcomeModal";
import AvatarPickerModal from "@/ui/components/navbar/AvatarPickerModal";

// ✅ correct orval hooks (GET only)
import { useAuthMeRetrieve } from "@/api-client/endpoints/auth/auth";
import { useWalletBalanceRetrieve } from "@/api-client/endpoints/wallet/wallet";


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

  const [open, setOpen] = useState(false);
  const [showLogout, setShowLogout] = useState(false);

  const [showWelcome, setShowWelcome] = useState(false);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [firstCheckDone, setFirstCheckDone] = useState(false);

  // ======================================
  // 👤 Profile (GET)
  // ======================================
  const {
    data: meData,
    isLoading: meLoading,
    refetch: refetchMe,
  } = useAuthMeRetrieve<any>();

  const avatarKey: string | null = meData?.avatarKey ?? null;
  const username: string =
    meData?.username ?? meData?.name ?? meData?.email ?? "User";

  // ======================================
  // 💰 Wallet (GET)
  // ======================================
  const { data: walletData, isLoading: balLoading } =
    useWalletBalanceRetrieve<any>();
  const balance: number =
    typeof walletData?.balance === "number" ? walletData.balance : 0;

  const loading = meLoading || balLoading;

  // ======================================
  // 🚀 POST /api/auth/me/ (manual commit)
  // ======================================
  async function updateAvatar(selectedKey: string) {
  if (!meData) return;

  // 📌 1) ดึง token จาก SessionStorage
  const tokensString = sessionStorage.getItem("courtly.tokens");
  const tokens = tokensString ? JSON.parse(tokensString) : null;
  const access = tokens?.access;

  if (!access) {
    console.error("* No access token found in SessionStorage");
    return;
  }

  const payload = {
    id: meData.id,
    username: meData.username,
    email: meData.email,
    firstname: meData.firstname,
    lastname: meData.lastname,
    avatarKey: selectedKey,
  };

  // 📌 2) ยิง POST พร้อม Authorization header
  const res = await fetch("http://localhost:8001/api/auth/me/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${access}`,   // 🔥 ใช้ token ที่ถูกต้อง
    },
    credentials: "include",
    mode: "cors",
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    console.error("Update failed", await res.text());
    return;
  }

  await refetchMe();
  setShowAvatarPicker(false);
}




  // ======================================
  // 🚀 เปิด welcome modal ถ้า avatarKey = null
  // ======================================
  useEffect(() => {
    if (!meData || firstCheckDone) return;

    if (meData.avatarKey === null) {
      setShowWelcome(true);
    }

    setFirstCheckDone(true);
  }, [meData, firstCheckDone]);

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  // UI
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

          <Link href="/home" className="flex shrink-0 items-center gap-2">
            <BrandMark />
          </Link>

          <div className="hidden lg:block">
            <DesktopMenu items={NAV_ITEMS} />
          </div>

          <div className="hidden items-center gap-4 lg:flex">
            <BalanceChip />


            <AvatarBlock
              name={username}
              avatarKey={avatarKey}
              loading={loading}
              variant="neutral"
              onClick={() => setShowAvatarPicker(true)}
              className="cursor-pointer"
            />


            <Button
              onClick={() => setShowLogout(true)}
              disabled={loading}
              label="Logout"
              backIcon="LogOut"
            />
          </div>

          <button
            className="inline-flex items-center rounded-md border border-neutral-300 p-2 lg:hidden"
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

        {open && (
          <div className="border-t border-neutral-200 bg-white lg:hidden">
            <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3">
              <div className="flex items-center justify-between">
                <AvatarBlock
                  name={username}
                  avatarKey={avatarKey}
                  loading={loading}
                  variant="neutral"
                  onClick={() => setShowAvatarPicker(true)} 
                />
                <BalanceChip />
              </div>

              <MobileMenu
                items={NAV_ITEMS}
                isActive={isActive}
                onClose={() => setOpen(false)}
              />

              <Button
                onClick={() => setShowLogout(true)}
                disabled={loading}
                full
                label="Logout"
                backIcon="LogOut"
              />
            </div>
          </div>
        )}
      </header>

      {/* =============== Logout Modal =============== */}
      <LogoutModal open={showLogout} onClose={() => setShowLogout(false)} />

      {/* =============== Welcome Modal =============== */}
      <WelcomeModal
        open={showWelcome}
        onClose={() => setShowWelcome(false)}
        onNext={() => {
          setShowWelcome(false);
          setShowAvatarPicker(true);
        }}
      />

      {/* =============== Avatar Picker =============== */}
      <AvatarPickerModal
        open={showAvatarPicker}
        onClose={() => setShowAvatarPicker(false)}
        onSelect={(avatarKey: string) => {
          updateAvatar(avatarKey);
        }}
      />
    </>
  );
}
