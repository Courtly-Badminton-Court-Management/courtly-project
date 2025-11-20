"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import PlayerWalletBalance from "@/ui/components/wallet/PlayerWalletBalance";
import PlayerTopupForm from "@/ui/components/wallet/PlayerTopupForm";
import PlayerTransactionHistory, {
  type LedgerItem,
} from "@/ui/components/wallet/PlayerTransactionHistory";
import BankInfoPanel from "@/ui/components/wallet/BankInfoPanel";

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
      type: "Topup",
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
      // OpenAPI type is string (binary); cast File accordingly
      slip_path: topup.slip as unknown as string,
    },
  });
};

  /* 🔹 6. Export CSV (manual trigger) */
  const { refetch: exportCsv, isFetching: csvLoading } =
    useWalletLedgerExportCsvRetrieve({
      query: {
        enabled: false,
      },
    });

  const exportCSV = async () => {
    const { data } = await exportCsv();
    if (!data) {
      alert("⚠ No transaction data to export.");
      return;
    }

    // Treat API response as CSV string/binary
    const blob = new Blob([data as unknown as string], {
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
    <main className="space-y-6">
      <PlayerWalletBalance
        balanceCoins={balanceCoins}
        userName={username}
        isLoading={loadingAll}
      />
      
    <section className="grid items-stretch mb-8 gap-6 md:grid-cols-4">
        {/* Top up Form 2/3 */}
        <div className="md:col-span-2">
        <PlayerTopupForm
        values={topup}
        onChange={(patch) => setTopup((v) => ({ ...v, ...patch }))}
        onSubmit={submitTopup}
        onReset={resetTopup}
        loading={topupLoading}
        />
        </div>
        {/* Bank Info Panel 1/3 */}
       <div className="md:col-span-2">
        <BankInfoPanel/>
        </div>


      </section>

      <PlayerTransactionHistory
        items={ledger}
        onExport={exportCSV}
        loading={topupsLoading || csvLoading}
      />
    </main>
  );
}
