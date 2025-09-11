"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

type PlayerNavBarProps = {
  userName?: string;
  balance?: number;
  avatarUrl?: string;
  onBook?: () => void;
};

// ✅ ชื่อและ path ตรงกับหน้า: Home / About Us / Booking / Wallet / History
const NAV_ITEMS = [
  { name: "Home", href: "/home" },
  { name: "About Us", href: "/about-us" },
  { name: "Booking", href: "/booking" },
  { name: "Wallet", href: "/wallet" },
  { name: "History", href: "/history" },
] as const;

export default function PlayerNavBar({
  userName = "Senior19",
  balance = 150,
  avatarUrl,
  onBook,
}: PlayerNavBarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  const handleBook = () => {
    onBook ? onBook() : router.push("/booking");
    setOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-200 bg-white/80 backdrop-blur-md">
      <nav className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 md:px-6 lg:px-2">
        {/* Logo */}
        <Link
          href="/home"
          className="flex items-center gap-2 shrink-0"
          aria-label="Courtly Home"
        >
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-emerald-100">
            <svg viewBox="0 0 24 24" className="h-5 w-5 text-emerald-700">
              <path
                d="M12 3c-.6 0-1 .4-1 1v2.2L6.7 9.5a1 1 0 0 0 0 1.4l6.4 6.4a1 1 0 0 0 1.4 0l3.3-3.3V20a1 1 0 0 0 2 0v-5.6c0-.27-.11-.52-.29-.71L13 6.2V4c0-.6-.4-1-1-1Zm.9 11.7-3.6-3.6 2.1-2.1 3.6 3.6-2.1 2.1Z"
                fill="currentColor"
              />
            </svg>
          </span>
          <span className="text-lg font-extrabold tracking-wide text-neutral-800">
            COURTLY
          </span>
        </Link>

        {/* Desktop menu */}
        <ul className="hidden items-center gap-6 md:flex">
          {NAV_ITEMS.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={[
                  "rounded-md px-2 py-1 text-[15px] font-semibold transition-colors",
                  isActive(item.href)
                    ? "text-emerald-700"
                    : "text-neutral-700 hover:text-emerald-700",
                ].join(" ")}
              >
                {item.name}
              </Link>
            </li>
          ))}
        </ul>

        {/* Right side (desktop) */}
        <div className="hidden items-center gap-4 md:flex">
          <div className="flex items-center gap-2 rounded-full border border-neutral-200 px-3 py-1.5">
            <svg
              viewBox="0 0 24 24"
              className="h-4 w-4 text-emerald-700"
              aria-hidden="true"
            >
              <path
                d="M12 3C7 3 3 5 3 8v8c0 3 4 5 9 5s9-2 9-5V8c0-3-4-5-9-5Zm0 2c4.4 0 7 1.7 7 3s-2.6 3-7 3-7-1.7-7-3 2.6-3 7-3Zm7 6.2V16c0 1.3-2.6 3-7 3s-7-1.7-7-3v-4.8c1.7 1.3 4.6 2 7 2s5.3-.7 7-2Z"
                fill="currentColor"
              />
            </svg>
            <span className="text-sm font-semibold text-neutral-800">
              {balance}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden text-sm font-semibold text-neutral-800 sm:inline">
              {userName}
            </span>
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt={`${userName} avatar`}
                width={32}
                height={32}
                className="h-8 w-8 rounded-full object-cover ring-2 ring-emerald-100"
              />
            ) : (
              <div
                className="grid h-8 w-8 place-items-center rounded-full bg-neutral-200 ring-2 ring-emerald-100"
                aria-hidden="true"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5 text-neutral-600">
                  <path
                    d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Zm0 2c-4 0-8 2-8 5v1h16v-1c0-3-4-5-8-5Z"
                    fill="currentColor"
                  />
                </svg>
              </div>
            )}
          </div>

          <button
            onClick={handleBook}
            className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-extrabold text-white shadow-sm transition-colors hover:bg-emerald-800"
          >
            Book the courts!
          </button>
        </div>

        {/* Mobile toggle */}
        <button
          className="inline-flex items-center rounded-md border border-neutral-300 p-2 md:hidden"
          aria-label="Toggle menu"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? (
            <svg viewBox="0 0 24 24" className="h-5 w-5 text-neutral-800">
              <path
                d="M6 6l12 12M18 6 6 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" className="h-5 w-5 text-neutral-800">
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
          <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4 text-emerald-700"
                  aria-hidden="true"
                >
                  <path
                    d="M12 3C7 3 3 5 3 8v8c0 3 4 5 9 5s9-2 9-5V8c0-3-4-5-9-5Zm0 2c4.4 0 7 1.7 7 3s-2.6 3-7 3-7-1.7-7-3 2.6-3 7-3Zm7 6.2V16c0 1.3-2.6 3-7 3s-7-1.7-7-3v-4.8c1.7 1.3 4.6 2 7 2s5.3-.7 7-2Z"
                    fill="currentColor"
                  />
                </svg>
                <span className="text-sm font-semibold text-neutral-800">
                  {balance}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-neutral-800">
                  {userName}
                </span>
                {avatarUrl ? (
                  <Image
                    src={avatarUrl}
                    alt={`${userName} avatar`}
                    width={28}
                    height={28}
                    className="h-7 w-7 rounded-full object-cover ring-2 ring-emerald-100"
                  />
                ) : (
                  <div
                    className="grid h-7 w-7 place-items-center rounded-full bg-neutral-200 ring-2 ring-emerald-100"
                    aria-hidden="true"
                  >
                    <svg viewBox="0 0 24 24" className="h-4 w-4 text-neutral-600">
                      <path
                        d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Zm0 2c-4 0-8 2-8 5v1h16v-1c0-3-4-5-8-5Z"
                        fill="currentColor"
                      />
                    </svg>
                  </div>
                )}
              </div>
            </div>

            <ul className="mt-2 flex flex-col">
              {NAV_ITEMS.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={[
                      "block rounded-md px-2 py-2 text-[15px] font-semibold",
                      isActive(item.href)
                        ? "bg-emerald-50 text-emerald-700"
                        : "text-neutral-800 hover:bg-neutral-50",
                    ].join(" ")}
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>

            <button
              onClick={handleBook}
              className="mt-2 w-full rounded-lg bg-emerald-700 px-4 py-2 text-sm font-extrabold text-white shadow-sm transition-colors hover:bg-emerald-800"
            >
              Book the courts!
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
