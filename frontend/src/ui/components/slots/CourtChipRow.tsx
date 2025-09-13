// /ui/components/slots/CourtChipRow.tsx
"use client";

import React from "react";
import type { Court } from "./types";
import { CourtChip } from "./CourtChip";

export function CourtChipRow({
  courts,
  selectedIds = new Set<string>(),
  onToggle,
}: {
  courts: Court[]; // will render up to 5
  selectedIds?: Set<string>;
  onToggle?: (court: Court) => void;
}) {
  const slice = courts.slice(0, 5);
  return (
    <div className="flex flex-wrap gap-2">
      {slice.map((c) => (
        <CourtChip
          key={c.id}
          court={c}
          disabled={!c.available}
          selected={selectedIds.has(c.id)}
          onToggle={onToggle}
        />
      ))}
    </div>
  );
}
