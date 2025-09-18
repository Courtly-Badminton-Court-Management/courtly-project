// src/ui/pages/visitor/LoginPage.tsx
"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import SplitPage from "@/ui/components/authpage/SplitPage";
import AuthHero from "@/ui/components/authpage/AuthHero";
import Field from "@/ui/components/basic/Field";
import PrimaryButton from "@/ui/components/basic/PrimaryButton";
import { loginWithEmail, saveTokens, fetchMe, roleDestination } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const search = useSearchParams();

  // Support email prefill via ?email=foo@bar
  const prefillEmail = search.get("email") ?? "";

  const [email, setEmail] = useState(prefillEmail);
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      // works with your backend
      const tokens = await loginWithEmail(email, password);
      saveTokens(tokens);

      // fetch profile & role → redirect
      const me = await fetchMe(tokens.access);
      const dest = search.get("next") || roleDestination(me.role);
      router.replace(dest);
    } catch (e: any) {
      setErr(e?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  const Right = (
    <>
      <h2 className="text-4xl md:text-4xl font-extrabold mb-5">
        <span className="text-pine">Welcome back!</span>
      </h2>

      <form onSubmit={onSubmit} className="space-y-3">
        {err && (
          <div className="rounded-md border p-3 text-sm text-red-600">{err}</div>
        )}

        <Field
          type="email"
          label="Email"
          name="email"
          placeholder="e.g. player@email.com"
          defaultValue={prefillEmail}
          onChange={(e) => setEmail((e.target as HTMLInputElement).value)}
        />

        <Field
          type="password"
          label="Password"
          name="password"
          placeholder="••••••••"
          onChange={(e) => setPassword((e.target as HTMLInputElement).value)}
        />

        <div className="mt-6">
          <PrimaryButton type="submit" disabled={loading} className="text-white">
            {loading ? "Please wait…" : "Sign In"}
          </PrimaryButton>
        </div>

        <p className="pt-2 text-center text-sm text-walnut">
          No account?{" "}
          <Link href="/register" className="font-semibold text-sea underline">
            Create one
          </Link>
        </p>
      </form>
    </>
  );

  // Use the shared hero for consistent look (no need for <Image /> block here)
  return (
    <SplitPage heroPosition="right" heroSide={<AuthHero side="left" />} formSide={Right} />
  );
}
