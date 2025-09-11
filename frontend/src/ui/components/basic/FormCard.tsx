import { ReactNode } from "react";

export default function FormCard({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-3xl border border-platinum bg-white p-6 shadow-[var(--box-shadow-soft)] sm:p-8">
      {children}
    </div>
  );
}
