// frontend/src/ui/components/wallet/PlayerWalletBalance.tsx
"use client";

import Image from "next/image";

type WalletBalanceProps = {
  balanceCoins: number;
  userName?: string;
  avatarUrl?: string; // จะเป็น key ของไฟล์ใน /public/avatars
  isLoading?: boolean;
};

export default function PlayerWalletBalance({
  balanceCoins,
  userName = "Player",
  avatarUrl,
  isLoading = false,
}: WalletBalanceProps) {
  // 🟢 map key -> path จริงใน /public/avatars
  const avatarSrc =
    avatarUrl && avatarUrl.trim() !== ""
      ? avatarUrl.startsWith("http") || avatarUrl.startsWith("/")
        ? avatarUrl
        : `/avatars/${avatarUrl}`
      : null;

  return (
    <section
      className="
        relative rounded-2xl border border-platinum bg-white
        shadow-sm p-6 md:p-7 
        flex flex-col md:flex-row justify-between items-start md:items-center
        gap-6 transition-all duration-300 hover:shadow-md
      "
    >
      {/* Decorative Glow */}
      <div className="absolute -top-10 left-0 w-28 h-28 bg-emerald-200/30 blur-3xl rounded-full pointer-events-none" />
      <div className="absolute -bottom-10 right-0 w-28 h-28 bg-pine/20 blur-3xl rounded-full pointer-events-none" />

      {/* LEFT — Profile */}
      <div className="flex items-center gap-4">
        {avatarSrc ? (
          <Image
            src={avatarSrc}
            alt={userName}
            width={64}
            height={64}
            className="
              h-14 w-14 rounded-full object-cover 
              ring-2 ring-pine/20 shadow-md bg-white
            "
          />
        ) : (
          <div
            className="
              h-14 w-14 rounded-full flex items-center justify-center
              bg-neutral-100 shadow-inner ring-2 ring-emerald-200/40
            "
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              className="text-emerald-700/70"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Zm0 2c-4 0-8 2-8 5v1h16v-1c0-3-4-5-8-5Z" />
            </svg>
          </div>
        )}

        <div className="flex flex-col">
          <p className="text-xs font-semibold text-neutral-500 tracking-wider uppercase">
            My Wallet
          </p>
          <h2 className="text-2xl font-bold text-pine leading-tight">
            {userName}
          </h2>
        </div>
      </div>

      {/* RIGHT — Balance Box */}
      <div
        className="
          relative rounded-2xl border border-platinum bg-white/70
          backdrop-blur-sm shadow-md px-5 py-3 min-w-[240px]
          flex items-center justify-between gap-3
        "
      >
        {isLoading ? (
          <div className="animate-pulse w-full">
            <div className="h-4 w-28 bg-neutral-200 rounded mb-2"></div>
            <div className="h-3 w-20 bg-neutral-200 rounded"></div>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3">
              <Image
                src="/brand/cl-coin.png"
                alt="CL Coin"
                width={32}
                height={32}
                className="h-8 w-7 drop-shadow-sm"
              />
              <div className="flex flex-col leading-tight">
                <span className="text-2xl font-extrabold text-pine">
                  {balanceCoins.toLocaleString()}
                </span>
                <span className="text-xs font-medium text-neutral-600/80">
                  Coins
                </span>
              </div>
            </div>

            <span
              className="
                absolute bottom-2 right-4 
                text-[10px] text-neutral-500/80 tracking-wide
              "
            >
              1 Coin = 1 THB
            </span>
          </>
        )}
      </div>
    </section>
  );
}
