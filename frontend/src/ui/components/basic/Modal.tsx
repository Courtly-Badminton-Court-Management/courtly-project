"use client";

import { useEffect, useRef } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  subtitle?: string;
};

export default function Modal({ open, onClose, title, subtitle, children, footer, className }: Props) {
  const dialogRef = useRef<HTMLDivElement>(null);

  // ปิดด้วย ESC + กัน scroll
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  // โฟกัสเข้า dialog เมื่อเปิด
  useEffect(() => {
    if (open) dialogRef.current?.focus();
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4"
      onMouseDown={(e) => {
        // คลิก backdrop เพื่อปิด (อย่าปิดถ้าคลิกภายในกล่อง)
        if (e.currentTarget === e.target) onClose();
      }}
      aria-modal="true"
      role="dialog"
      aria-labelledby="modal-title"
    >
      <div
        ref={dialogRef}
        tabIndex={-1}
        className={[
          "w-full max-w-xl rounded-2xl bg-white shadow-[var(--box-shadow-soft)]",
          "outline-none",
          className || "",
        ].join(" ")}
      >
        {title && (
          <div className="flex items-center justify-between px-5 py-4">
            <div>
              <h3 id="modal-title" className="text-lg font-extrabold text-onyx">{title}</h3>
              <p className="mt-1  text-sm text-gray-500">{subtitle}</p>
            </div>
            <button
              onClick={onClose}
              className="rounded px-2 py-1 text-walnut hover:bg-platinum/40"
              aria-label="Close"
            >
              ✕
            </button>
          </div>
        )}
        <div className="max-h-[50dvh] overflow-auto px-5 py-4 text-onyx">{children}</div>
        {footer && <div className="px-5 py-4">{footer}</div>}
      </div>
    </div>
  );
}
