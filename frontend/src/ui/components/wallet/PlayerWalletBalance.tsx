"use client";

import Image from "next/image";

type WalletBalanceProps = {
  balanceCoins: number;
  userName?: string;
  avatarUrl?: string;
  isLoading?: boolean;
};

export default function PlayerWalletBalance({
  balanceCoins,
  userName = "Player",
  avatarUrl,
  isLoading = false,
}: WalletBalanceProps) {
  return (
    <section
      className="
        flex flex-col md:flex-row items-start md:items-center justify-between
        gap-4 rounded-2xl border border-white/40 bg-white/40 backdrop-blur-md
        shadow-sm px-5 py-3 md:px-6 md:py-3
        transition-all duration-300 hover:shadow-md
      "
    >
      {/* LEFT: Avatar + Name */}
      <div className="flex items-center gap-3">
        {avatarUrl ? (
          <Image
            src={avatarUrl}
            alt={userName}
            width={56}
            height={56}
            className="h-12 w-12 rounded-full object-cover ring-1 ring-white/60 shadow-sm"
          />
        ) : (
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/60 ring-1 ring-emerald-200/60 backdrop-blur-sm">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="24"
              height="24"
              fill="currentColor"
              className="text-emerald-700/70"
            >
              <path d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Zm0 2c-4 0-8 2-8 5v1h16v-1c0-3-4-5-8-5Z" />
            </svg>
          </div>
        )}

        <div>
          <p className="text-xs font-medium text-emerald-900/70 tracking-wide">
            My Wallet
          </p>
          <h2 className="truncate text-xl md:text-2xl font-bold text-pine">
            {userName}
          </h2>
        </div>
      </div>

      {/* RIGHT: Wallet Balance */}
      <div
        className="
          relative flex items-center justify-between gap-3
          rounded-xl border border-white/50 bg-white/60 backdrop-blur-md
          px-4 py-2 min-w-[220px]
        "
      >
        {isLoading ? (
          <div className="animate-pulse flex flex-col gap-1 w-full">
            <div className="h-3 w-24 bg-white/60 rounded"></div>
            <div className="h-4 w-20 bg-white/70 rounded"></div>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2">
              <Image
                src="/brand/cl-coin.png"
                alt="CL Coin"
                width={28}
                height={28}
                className="h-6 w-6 drop-shadow-sm"
              />
              <div className="flex flex-col leading-tight">
                <span className="text-lg font-bold text-pine">
                  {balanceCoins.toLocaleString()}
                </span>
                <span className="text-xs font-medium text-neutral-600/80">
                  Coins
                </span>
              </div>
            </div>
            <span className="absolute bottom-1 right-3 text-[10px] text-neutral-500/80">
              1 Coin = 1 THB
            </span>
          </>
        )}
      </div>
    </section>
  );
}
