"use client";

import Image from "next/image";

type WalletBalanceProps = {
  balanceCoins: number;
  userName?: string;
  avatarUrl?: string;
};

export default function WalletBalance({
  balanceCoins,
  userName = "Player",
  avatarUrl,
}: WalletBalanceProps) {
  return (
    <section className="mb-6 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
      {/* LEFT: Avatar + Name */}
      <div className="flex items-center gap-4">
        {avatarUrl ? (
          <Image
            src={avatarUrl}
            alt={userName}
            width={150}
            height={150}
            className="h-16 w-16 rounded-full object-cover"
            priority
          />
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-neutral-200 ring-1 ring-cambridge">
            {/* SVG user icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="32"
              height="32"
              fill="currentColor"
              className="text-neutral-500"
            >
              <path d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Zm0 2c-4 0-8 2-8 5v1h16v-1c0-3-4-5-8-5Z" />
            </svg>
          </div>
        )}

        <div>
          <div className="text-xl text-neutral-500">My Wallet</div>
          <h2 className="truncate text-2xl font-semibold md:text-3xl">
            {userName}
          </h2>
        </div>
      </div>

      {/* RIGHT: Wallet Balance Card */}
      <div className="relative w-full max-w-md md:max-w-md">
        <div className="rounded-2xl border bg-white px-5 py-3 shadow-sm">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium text-neutral-700">Wallet Balance</span>
            <span className="text-xs text-neutral-500">1 Coin = 1 THB</span>
          </div>

          <div className="flex items-center gap-3">
            <Image
              src="/brand/cl-coin.png"
              alt="CL Coin"
              width={40}
              height={40}
              className="h-9 w-9"
              priority
            />
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold tracking-tight">
                {balanceCoins.toLocaleString()}
              </span>
              <span className="text-lg font-semibold">Coins</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
