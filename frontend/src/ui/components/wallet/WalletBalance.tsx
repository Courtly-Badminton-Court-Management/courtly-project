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
          <div className="h-16 w-16 rounded-full bg-neutral-200" />
        )}

        <div>
          <div className="text-xl text-neutral-500">My Wallet</div>
          <h2 className="truncate text-5xl font-semibold md:text-2xl">{userName}</h2>
        </div>
      </div>

      {/* RIGHT: Wallet Balance Card */}
      <div className="relative w-full max-w-md md:max-w-m">
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
