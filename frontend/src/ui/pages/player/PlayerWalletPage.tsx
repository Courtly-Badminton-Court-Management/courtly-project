"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import PlayerWalletBalance from "@/ui/components/wallet/PlayerWalletBalance";
import PlayerTopupForm from "@/ui/components/wallet/PlayerTopupForm";
import PlayerTransactionHistory, {
  type LedgerItem,
} from "@/ui/components/wallet/PlayerTransactionHistory";

// ✅ Orval auto-generated hooks
import {
  useWalletBalanceRetrieve,
  useWalletTopupsList,
  useWalletTopupsCreate,
  useWalletLedgerExportCsvRetrieve,
  getWalletBalanceRetrieveQueryKey,
  getWalletTopupsListQueryKey,
} from "@/api-client/endpoints/wallet/wallet";

import { useAuthMeRetrieve } from "@/api-client/endpoints/auth/auth";

export default function PlayerWalletPage() {
  const queryClient = useQueryClient();

  /* 🔹 1. Fetch User Info (me) */
  const { data: meData, isLoading: meLoading } = useAuthMeRetrieve<any>();
  const username =
    meData?.username ?? meData?.name ?? meData?.email ?? "User";

  /* 🔹 2. Wallet Balance */
  const { data: balanceData, isLoading: balanceLoading } =
    useWalletBalanceRetrieve<{ balance: number }>();

  const balanceCoins = balanceData?.balance ?? 0;

  /* 🔹 3. Top-up Requests (List) */
  const { data: topupsData, isLoading: topupsLoading } = useWalletTopupsList();

  const ledger: LedgerItem[] =
    topupsData?.map((item: any) => ({
      id: String(item.id),
      dt: new Date(item.created_at).toLocaleString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      type: "Topup" as const,
      amount: Number(item.coins ?? 0),
      status:
        item.status === "pending"
          ? "Pending"
          : item.status === "approved"
          ? "Approved"
          : "Rejected",
    })) ?? [];

  /* 🔹 4. Top-up Form State */
  const [topup, setTopup] = useState({
    amount: "" as number | "",
    date: "",
    time: "",
    slip: null as File | null,
    note: "",
  });

  const resetTopup = () => {
    setTopup({ amount: "", date: "", time: "", slip: null, note: "" });
  };

  /* 🔹 5. Mutation - Create Top-up */
  const { mutate: createTopup, isPending: topupLoading } =
    useWalletTopupsCreate({
      mutation: {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: getWalletBalanceRetrieveQueryKey(),
          });
          queryClient.invalidateQueries({
            queryKey: getWalletTopupsListQueryKey(),
          });
          alert("✅ Top-up request submitted successfully!");
          resetTopup();
        },
        onError: (err: unknown) => {
          console.error(err);
          alert("❌ Failed to submit top-up. Please try again.");
        },
      },
    });

  const submitTopup = () => {
    if (!topup.amount || !topup.slip || !topup.date || !topup.time) {
      alert("⚠ Please fill all required fields and upload your slip.");
      return;
    }

    createTopup({
      data: {
        amount_thb: Number(topup.amount),
        transfer_date: topup.date,
        transfer_time: topup.time,
        slip_path: topup.slip,
        note: topup.note || "",
      },
    });
  };

  /* 🔹 6. Export CSV */
  const { refetch: exportCsv, isFetching: csvLoading } =
    useWalletLedgerExportCsvRetrieve({ query: { enabled: false } });

  const exportCSV = async () => {
    const { data } = await exportCsv();
    if (!data) return alert("⚠ No transaction data to export.");

    const blob = new Blob([data as any], {
      type: "text/csv;charset=utf-8;",
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "wallet_ledger.csv";
    link.click();
    link.remove();
  };

  /* 🔹 7. Render */
  const loadingAll = balanceLoading || meLoading;

  return (
    <main className="mx-auto max-w-6xl p-4 md:p-8 space-y-8">
      {/* Balance */}
      <PlayerWalletBalance
        balanceCoins={balanceCoins}
        userName={username}
        isLoading={loadingAll}
      />

      {/* Top-up Form */}
      <PlayerTopupForm
        values={topup}
        onChange={(patch) => setTopup((v) => ({ ...v, ...patch }))}
        onSubmit={submitTopup}
        onReset={resetTopup}
        loading={topupLoading}
      />

      {/* Transaction History */}
      <PlayerTransactionHistory
        items={ledger}
        onExport={exportCSV}
        loading={topupsLoading || csvLoading}
      />
    </main>
  );
}