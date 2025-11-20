"use client";

import { useMemo, useState } from "react";
import { ArrowUpDown, WalletCards } from "lucide-react";
import TopupApproval, {
  TopupRow,
} from "@/ui/components/wallet/TopupApprovalTable";
import RequestsDetailModal, {
  type TopupDetailRow,
} from "@/ui/components/wallet/RequestsDetailModal";

import {
  useWalletTopupsList,
  useWalletTopupsApproveCreate,
  useWalletTopupsRejectCreate,
} from "@/api-client/endpoints/wallet/wallet";

/* ────────────── Helpers ────────────── */
function parseDt(dt: string) {
  const t = Date.parse(dt);
  return Number.isNaN(t) ? 0 : t;
}

/* ────────────── Page ────────────── */
export default function ManagerApprovalPage() {
  const { data: topups, isLoading, refetch } = useWalletTopupsList();

  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [selected, setSelected] = useState<TopupDetailRow | null>(null);

  /* ────────────── Mutations ────────────── */
  const approveMutation = useWalletTopupsApproveCreate({
    mutation: {
      onSuccess: () => {
        refetch();
        setSelected(null);
      },
    },
  });

  const rejectMutation = useWalletTopupsRejectCreate({
    mutation: {
      onSuccess: () => {
        refetch();
        setSelected(null);
      },
    },
  });

  /* ────────────── Resolve Slip URL ────────────── */
  const resolveSlipUrl = (path?: string | null): string | null => {
    if (!path) return null;
    if (path.startsWith("http")) return path;
    const base = process.env.NEXT_PUBLIC_API_BASE_URL?.replace("/api", "");
    return `${base}/${path.replace(/^\/+/, "")}`;
  };

  /* ────────────── Mapping API → rows ────────────── */
  const baseRows: TopupDetailRow[] =
    topups?.map((t: any) => {
      const displayUser =
        t.user_display_name?.trim?.() ||
        t.user_email?.trim?.() ||
        (t.username ? `${t.username}` : "Unknown User");

      const status: TopupRow["status"] =
        t.status === "pending"
          ? "Pending"
          : t.status === "approved"
          ? "Approved"
          : "Rejected";

      return {
        id: String(t.id),
        username: displayUser,
        amount: Number(t.amount_thb) || 0,
        dt: new Date(t.created_at).toLocaleString("en-GB", {
          dateStyle: "medium",
          timeStyle: "short",
        }),
        status,
        slipUrl: resolveSlipUrl(t.slip_url),
      };
    }) ?? [];

  /* ────────────── Sorting ────────────── */
  const rows: TopupDetailRow[] = useMemo(() => {
    const copy = [...baseRows];
    copy.sort((a, b) => {
      const da = parseDt(a.dt);
      const db = parseDt(b.dt);
      return sortDir === "asc" ? da - db : db - da;
    });
    return copy;
  }, [baseRows, sortDir]);

  const isEmpty = !isLoading && rows.length === 0;

  /* ────────────── Actions ────────────── */
  const handleApprove = () => {
    if (!selected) return;
    approveMutation.mutate({ id: selected.id, data: {} as any });
  };

  const handleReject = () => {
    if (!selected) return;
    rejectMutation.mutate({ id: selected.id, data: {} as any });
  };

  /* ────────────── UI ────────────── */
  return (
    <main className="space-y-6">
      {/* Page Header */}
      <header className="flex flex-wrap items-start justify-between gap-5">
        {/* Header */}
      <div className="mb-2 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-pine">
            Manage Player Top-Up Approvals
          </h1>
          <p className="text-s font-semibold tracking-tight text-dimgray">
            Approve or reject player wallet top-up requests
          </p>
        </div>
      </div>

        {/* Sort Button */}
        <button
          type="button"
          onClick={() => setSortDir((d) => (d === "asc" ? "desc" : "asc"))}
          className="
            inline-flex items-center gap-1 rounded-full
            border border-platinum bg-white px-3 py-1.5
            text-[11px] font-medium text-neutral-700
            hover:bg-neutral-50 transition
          "
        >
          <ArrowUpDown size={14} />
          <span>{sortDir === "desc" ? "Newest first" : "Oldest first"}</span>
        </button>
      </header>

      {/* Card: Table + Warning */}
      <section
        className="
          relative rounded-2xl border border-platinum bg-white
          p-6 shadow-sm transition hover:shadow-md
        "
      >
        {/* Glow */}
        <div className="pointer-events-none absolute -top-10 left-0 h-24 w-24 rounded-full bg-emerald-200/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-10 right-0 h-24 w-24 rounded-full bg-pine/20 blur-3xl" />

        {/* Warning */}
        <p className="mb-4 text-xs italic text-cherry relative z-[1]">
          ⚠ Approvals can only be made during business hours. Off-hours requests
          will remain <span className="font-semibold">Pending</span>.
        </p>

        {/* Content */}
        {isLoading ? (
          <div className="mt-2 animate-pulse space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-6 rounded bg-neutral-100" />
            ))}
          </div>
        ) : (
          <TopupApproval
            rows={rows}
            onView={(row) => {
              const full = rows.find((r) => r.id === row.id) ?? row;
              setSelected(full);
            }}
          />
        )}

        {isEmpty && !isLoading && (
          <div className="mt-4 text-center text-sm text-neutral-500">
            No top-up requests found.
          </div>
        )}
      </section>

      {/* Detail Modal */}
      <RequestsDetailModal
        open={!!selected}
        data={selected}
        onClose={() => setSelected(null)}
        onApprove={selected?.status === "Pending" ? handleApprove : undefined}
        onReject={selected?.status === "Pending" ? handleReject : undefined}
        loadingApprove={approveMutation.isPending}
        loadingReject={rejectMutation.isPending}
      />
    </main>
  );
}
