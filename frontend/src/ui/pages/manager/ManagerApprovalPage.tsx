"use client";

import { useState } from "react";
import TopupApproval, { TopupRow } from "@/ui/components/wallet/TopupApproval";


export default function ManagerApprovalPage() {
  const [rows] = useState<TopupRow[]>([
    { id: "REQ02419824379", user: "Mata Nakee",     amount: 200, dt: "5 Sep 2025, 12:54 PM", status: "Pending"  },
    { id: "REQ02419824368", user: "Peony Smith",    amount: 100, dt: "5 Sep 2025, 10:39 AM", status: "Pending"  },
    { id: "REQ02419824353", user: "Somkid Meetung", amount: 300, dt: "5 Sep 2025, 09:03 AM", status: "Pending"  },
    { id: "REQ02419824349", user: "Tanont Meejai",  amount: 200, dt: "4 Sep 2025, 21:48 PM", status: "Approved" },
    { id: "REQ02419824344", user: "Jane Yeah",      amount: 100, dt: "4 Sep 2025, 21:26 PM", status: "Approved" },
    { id: "REQ02419824341", user: "Naphat Wainam",  amount: 150, dt: "4 Sep 2025, 20:07 PM", status: "Approved" },
    { id: "REQ02419824336", user: "Jetaime Sudlhor",amount: 500, dt: "4 Sep 2025, 19:52 PM", status: "Approved" },
  ]);

  return (
    <main className="mx-auto max-w-6xl p-4 md:p-8">
      <TopupApproval
        rows={rows}
        onView={(row) => console.log("open modal for:", row)}
      />
    </main>
  );
}

