"use client";

import { InputHTMLAttributes, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;         // <- เพิ่มรองรับ error
};

export default function Field({ label, type = "text", className, error, ...props }: Props) {
  const [show, setShow] = useState(false);
  const isPassword = type === "password";

  return (
    <div className="relative">
      <label className="mb-1 block text-sm font-medium text-walnut">{label}</label>
      <div className="relative">
        <input
          {...props}
          type={isPassword ? (show ? "text" : "password") : type}
          className={[
            "w-full rounded-xl border px-3 py-2.5 outline-none",
            "shadow-[0_2px_0_rgba(0,0,0,.12)] focus:shadow-none",
            "focus:ring-2 placeholder:text-walnut/40",
            error
              ? "border-red-500 focus:ring-red-400"
              : "border-platinum focus:ring-cambridge",
            className || ""
          ].join(" ")}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow(!show)}
            className="absolute right-5 top-1/2 -translate-y-1/2 text-walnut hover:text-onyx"
            aria-label={show ? "Hide password" : "Show password"}
          >
            {show ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        )}
      </div>

      {/* error เล็กๆ ที่มุมขวาล่างของฟิลด์ */}
      {error && (
        <span className="pointer-events-none absolute -bottom-4 right-0 text-xs text-red-600">
          {error}
        </span>
      )}
    </div>
  );
}
