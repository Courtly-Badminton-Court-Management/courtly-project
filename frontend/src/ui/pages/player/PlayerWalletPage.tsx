"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import PlayerWalletBalance from "@/ui/components/wallet/PlayerWalletBalance";
import PlayerTopupForm from "@/ui/components/wallet/PlayerTopupForm";
import PlayerTransactionHistory, {
  type LedgerItem,
} from "@/ui/components/wallet/PlayerTransactionHistory";
import BankInfoPanel from "@/ui/components/wallet/BankInfoPanel";
import SuccessfulRequestModal from "@/ui/components/wallet/RequestConfirmedModal";

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
  const [openSuccessModal, setOpenSuccessModal] = useState(false);

  /* 🔹 1. Fetch User Info */
  const { data: meData, isLoading: meLoading } = useAuthMeRetrieve<any>();
  const username =
    meData?.username ?? meData?.name ?? meData?.email ?? "User";

  /* 🔹 2. Wallet Balance */
  const { data: balanceData, isLoading: balanceLoading } =
    useWalletBalanceRetrieve<{ balance: number }>();
  const balanceCoins = balanceData?.balance ?? 0;

  /* 🔹 3. Top-up Requests */
  const { data: topupsData, isLoading: topupsLoading } =
    useWalletTopupsList();

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

          resetTopup();
          setOpenSuccessModal(true);
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
        slip_path: topup.slip as unknown as string,
      },
    });
  };

  /* 🔹 6. Export CSV */
  const { refetch: exportCsv, isFetching: csvLoading } =
    useWalletLedgerExportCsvRetrieve({
      query: { enabled: false },
    });

  const exportCSV = async () => {
    const { data } = await exportCsv();
    if (!data) {
      alert("⚠ No transaction data to export.");
      return;
    }

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

  /* 🔹 scroll → Transaction History */
  const scrollToHistory = () => {
    const section = document.getElementById("transaction-history");
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

  /* 🔹 Render */
  const loadingAll = balanceLoading || meLoading;

  return (
    <main className="space-y-8">
      {/* Wallet Header */}
      <PlayerWalletBalance
        balanceCoins={balanceCoins}
        userName={username}
        avatarUrl={meData?.avatarKey}
        isLoading={loadingAll}
      />

      {/* Form + Bank Info */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
        <PlayerTopupForm
          values={topup}
          onChange={(patch) => setTopup((v) => ({ ...v, ...patch }))}
          onSubmit={submitTopup}
          onReset={resetTopup}
          loading={topupLoading}
        />

        <BankInfoPanel />
      </section>

      {/* Transaction History */}
      <div id="transaction-history">
        <PlayerTransactionHistory
          items={ledger}
          onExport={exportCSV}
          loading={topupsLoading || csvLoading}
        />
      </div>

      {/* Success Modal */}
      <SuccessfulRequestModal
        open={openSuccessModal}
        onClose={() => setOpenSuccessModal(false)}
        onGoHistory={scrollToHistory}
      />
    </main>
  );
}
