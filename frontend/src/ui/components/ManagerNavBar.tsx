"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import BrandMark from "./basic/BrandMark";
import DesktopMenu from "./basic/DesktopMenu";
import MobileMenu from "./basic/MobileMenu";
import AvatarBlock from "./basic/AvatarBlock";
import Button from "./basic/Button";
import LogoutModal from "@/ui/components/authpage/LogoutModal";

import { useQueryClient } from "@tanstack/react-query";
import { customRequest } from "@/api-client/custom-client";

type AdminMe = {
  displayName: string | null;
  avatarUrl: string | null;
};

const NAV_ITEMS = [
  { name: "Dashboard", href: "/dashboard" },
  { name: "Slot Control", href: "/control" },
  { name: "Top-up Approval", href: "/approval" },
  { name: "Booking Log", href: "/log" },

] as const;

export default function ManagerNavBar() {
  const pathname = usePathname();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showLogout, setShowLogout] = useState(false);
  const [me, setMe] = useState<AdminMe>({ displayName: null, avatarUrl: null });

  // โหลดข้อมูลแอดมิน
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await customRequest<{ username?: string; avatarUrl?: string }>({
          url: "/api/auth/me/",
          method: "GET",
        });
        if (!cancelled) {
          setMe({
            displayName: data?.username ?? "Admin",
            avatarUrl: data?.avatarUrl ?? null,
          });
        }
      } catch {
        if (!cancelled) setMe({ displayName: "Admin", avatarUrl: null });
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

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-neutral-200 bg-white/80 backdrop-blur-md">
        <nav className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 md:px-6 lg:px-2">
          {/* Brand */}
          <Link
            href="/dashboard"
            className="flex items-center gap-2 shrink-0"
            aria-label="Courtly Home"
          >
            <BrandMark />
          </Link>

          {/* Desktop menu */}
          <DesktopMenu items={NAV_ITEMS} />

          {/* Right side (desktop) */}
          <div className="hidden items-center gap-4 md:flex">
            <AvatarBlock
              name={me.displayName}
              avatarUrl={me.avatarUrl}
              loading={loading}
              variant="emerald"
            />
            <Button
              label="Logout"
              onClick={() => setShowLogout(true)}
              disabled={loading}
              bgColor="bg-cherry"
              hoverBgColor="hover:bg-cherry/90"
              textColor="text-white"
            />
          </div>

          {/* Mobile toggle */}
          <button
            className="inline-flex items-center rounded-md border border-neutral-300 p-2 md:hidden"
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
          <div className="border-t border-neutral-200 bg-white md:hidden">
            <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3">
              <div className="flex items-center justify-between">
                <AvatarBlock
                  name={me.displayName}
                  avatarUrl={me.avatarUrl}
                  loading={loading}
                  variant="emerald"
                />
              </div>

              <MobileMenu
                items={NAV_ITEMS}
                isActive={isActive}
                onClose={() => setOpen(false)}
              />

              <Button
                label="Logout"
                onClick={() => setShowLogout(true)}
                disabled={loading}
                full
                bgColor="bg-cherry"
                hoverBgColor="hover:bg-cherry/90"
                textColor="text-white"
              />
            </div>
          </div>
        )}
      </header>

      {/* ✅ Shared Logout Modal */}
      <LogoutModal open={showLogout} onClose={() => setShowLogout(false)} variant="manager" />
    </>
  );
}
