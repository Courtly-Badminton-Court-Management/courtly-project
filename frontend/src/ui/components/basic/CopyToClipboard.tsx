"use client";

import { useState, useEffect } from "react";
import { Copy, Check } from "lucide-react";

type CopyToClipboardProps = {
  text: string;
};

export default function CopyToClipboard({ text }: CopyToClipboardProps) {
  const [mounted, setMounted] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Copy failed", err);
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="inline-flex items-center gap-1 rounded-full  bg-neutral-50 px-3 py-0.25 text-sm text-onyx hover:bg-neutral-100 transition"
      title={copied ? "Copied!" : "Copy text"}
    >
      <span className="font-mono">{text}</span>
      {mounted && copied ? (
        <Check className="h-4 w-4 text-emerald-500" />
      ) : (
        <Copy className="h-4 w-4 text-neutral-400" />
      )}
    </button>
  );
}
