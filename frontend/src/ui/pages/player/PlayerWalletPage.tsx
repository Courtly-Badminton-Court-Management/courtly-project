"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import PlayerWalletBalance from "@/ui/components/wallet/PlayerWalletBalance";
import PlayerTopupForm from "@/ui/components/wallet/PlayerTopupForm";
import PlayerTransactionHistory from "@/ui/components/wallet/PlayerTransactionHistory";

// ✅ wallet hooks
import {
  useWalletBalanceRetrieve,
  useWalletTopupsList,
  useWalletTopupsCreate,
  useWalletLedgerExportCsvRetrieve,
  getWalletBalanceRetrieveQueryKey,
  getWalletTopupsListQueryKey,
} from "@/api-client/endpoints/wallet/wallet";
import type { LedgerItem } from "@/ui/components/wallet/PlayerTransactionHistory";

// ✅ user info hook
import { useAuthMeRetrieve } from "@/api-client/endpoints/auth/auth";

export default function PlayerWalletPage() {
  const queryClient = useQueryClient();

  /* -------------------------------------------------------------------------- */
  /* 🔹 1. Fetch User Info (me)                                                */
  /* -------------------------------------------------------------------------- */
  const { data: meData, isLoading: meLoading } = useAuthMeRetrieve<any>();
  const username: string =
    meData?.username ?? meData?.name ?? meData?.email ?? "User";

  /* -------------------------------------------------------------------------- */
  /* 🔹 2. Fetch Wallet Balance                                                 */
  /* -------------------------------------------------------------------------- */
  const {
    data: balanceData,
    isLoading: balanceLoading,
  } = useWalletBalanceRetrieve<{ balance: number }>();

  const balanceCoins = balanceData?.balance ?? 0;

  /* -------------------------------------------------------------------------- */
  /* 🔹 3. Fetch Top-up Requests (Pending + History)                            */
  /* -------------------------------------------------------------------------- */
  const {
    data: topupsData,
    isLoading: topupsLoading,
  } = useWalletTopupsList();

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
      type: "Topup",
      amount: Number(item.coins ?? 0),
      status:
        item.status === "pending"
          ? "Pending"
          : item.status === "approved"
          ? "Approved"
          : "Rejected",
    })) ?? [];

  /* -------------------------------------------------------------------------- */
  /* 🔹 4. Top-up Form                                                          */
  /* -------------------------------------------------------------------------- */
  const [topup, setTopup] = useState({
    amount: "" as number | "",
    date: "",
    time: "",
    slip: null as File | null,
    note: "",
  });

  const { mutate: createTopup, isPending: topupLoading } = useWalletTopupsCreate({
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
      onError: (err) => {
        console.error(err);
        alert("❌ Failed to submit top-up. Please try again.");
      },
    },
  });

  const submitTopup = () => {
    if (!topup.amount || !topup.slip || !topup.date || !topup.time) {
      alert("⚠ Please fill in all required fields and upload your slip.");
      return;
    }

    createTopup({
      data: {
        amount_thb: Number(topup.amount),
        transfer_date: topup.date,
        transfer_time: topup.time,
        slip_path: topup.slip as any, // 👈 orval expects string, but backend accepts File (FormData)
      },
    });
  };

  const resetTopup = () => {
    setTopup({
      amount: "",
      date: "",
      time: "",
      slip: null,
      note: "",
    });
  };

  /* -------------------------------------------------------------------------- */
  /* 🔹 5. Export CSV (Optional: still uses ledger export for full coin history) */
  /* -------------------------------------------------------------------------- */
  const { refetch: exportCsv, isFetching: csvLoading } =
    useWalletLedgerExportCsvRetrieve({ query: { enabled: false } });

  const exportCSV = async () => {
    const { data } = await exportCsv();
    if (!data) {
      alert("⚠ No transaction data to export.");
      return;
    }

    const blob = new Blob([data as any], {
      type: "text/csv;charset=utf-8;",
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "wallet_ledger.csv");
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  /* -------------------------------------------------------------------------- */
  /* 🔹 6. Layout                                                               */
  /* -------------------------------------------------------------------------- */
  const loadingAll = balanceLoading || meLoading;

  return (
    <main className="mx-auto max-w-6xl p-4 md:p-8 space-y-8">
      {/* Wallet Balance */}
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

      {/* Transaction History (Top-up only) */}
      <PlayerTransactionHistory
        items={ledger}
        onExport={exportCSV}
        loading={topupsLoading || csvLoading}
      />
    </main>
  );
}
