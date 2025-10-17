"use client";

import { useState } from "react";
import WalletBalance from "@/ui/components/wallet/WalletBalance";
import TopupForm, { TopupFormValues } from "@/ui/components/wallet/TopupForm";
import PendingRequests, { PendingItem } from "@/ui/components/wallet/PendingRequests";
import TransactionHistory, { LedgerItem } from "@/ui/components/wallet/TransactionHistory";

export default function PlayerWalletPage() {
  // —— mock data ———————————————————————————————————————————————
  const [balance] = useState(150);

  const [topup, setTopup] = useState<TopupFormValues>({
    amount: "",
    date: "",
    time: "",
    slip: null,
    note: "",
  });

  const [pending] = useState<PendingItem[]>([
    { id: "REQ0824198243", dt: "5 Sep 2025, 12:54 PM", amount: 200, status: "Pending" },
  ]);

  const [ledger] = useState<LedgerItem[]>([
    { id: "REQ02419824379", dt: "5 Sep 2025, 12:54 PM", type: "Topup", amount: +200, status: "Pending" },
    { id: "REQ02419824368", dt: "1 Sep 2025, 10:39 AM", type: "Booking Deduction", amount: -150, status: "Approved" },
    { id: "REQ02419824353", dt: "30 Aug 2025, 09:12 AM", type: "Booking Deduction", amount: -300, status: "Approved" },
    { id: "REQ02419824344", dt: "21 Aug 2025, 09:03 AM", type: "Refund", amount: +100, status: "Approved" },
  ]);

  // —— handlers ————————————————————————————————————————————————
  const submitTopup = () => {
    alert("Mock submit top-up");
  };

  const resetTopup = () => {
    setTopup({ amount: "", date: "", time: "", slip: null, note: "" });
  };

  const exportCSV = () => {
    alert("Mock export CSV");
  };

  // —— layout ————————————————————————————————————————————————
  return (
    <main className="mx-auto max-w-6xl p-4 md:p-8">
      {/* Title */}
      {/* <header className="mb-4">
        <h1 className="text-2xl font-bold">My Wallet</h1>
      </header> */}

      {/* Wallet Balance */}
      <WalletBalance balanceCoins={balance} userName="Senior19" />

      {/* Topup + (then) Pending + Transactions to match visual flow */}
      <div className="space-y-8">
        <TopupForm
          values={topup}
          onChange={(patch) => setTopup((v) => ({ ...v, ...patch }))}
          onSubmit={submitTopup}
          onReset={resetTopup}
        />

        <PendingRequests items={pending} />

        <TransactionHistory items={ledger} onExport={exportCSV} />
      </div>
    </main>
  );
}
