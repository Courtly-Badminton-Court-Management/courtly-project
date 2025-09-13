"use client";

import Link from "next/link";
import Image from "next/image";
import { Suspense, useState } from "react";
import { z } from "zod";
import { useRouter, useSearchParams } from "next/navigation";
import AuthHero from "@/ui/components/authpage/AuthHero";
import SplitPage from "@/ui/components/authpage/SplitPage";
import Field from "@/ui/components/basic/Field";
import PrimaryButton from "@/ui/components/basic/PrimaryButton";

/** ── Types & Schema ─────────────────────────────────────────────────────── */
type LoginForm = {
  email: string;
  password: string;
  remember: boolean;
};

const schema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Required"),
  remember: z.boolean().optional().default(false),
});

type LoginResponse =
  | { ok: true; role: "player" | "manager" }
  | { ok: false; message?: string };

/** ── Content (must be wrapped in Suspense) ──────────────────────────────── */
function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next");

  const [data, setData] = useState<LoginForm>({
    email: "",
    password: "",
    remember: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleChange =
    <K extends keyof LoginForm>(name: K) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const isCheckbox = e.currentTarget.type === "checkbox";
      const value = (isCheckbox ? e.currentTarget.checked : e.currentTarget.value) as LoginForm[K];
      setData((prev) => ({ ...prev, [name]: value }));
      setErrors((prev) => ({ ...prev, [String(name)]: "" }));
    };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError(null);

    const parsed = schema.safeParse(data);
    if (!parsed.success) {
      const fieldErrs: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        fieldErrs[issue.path.join(".")] = issue.message;
      }
      setErrors(fieldErrs);
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.email, password: data.password }),
      });

      if (!res.ok) {
        const t = await res.text();
        throw new Error(t || "Login failed");
      }

      const payload: LoginResponse = await res.json();
      if (!payload.ok) throw new Error(payload.message || "Login failed");

      if (nextPath) {
        router.replace(nextPath);
      } else {
        router.replace(payload.role === "manager" ? "/dashboard" : "/home");
      }
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    window.alert("🔓 Google Sign-In clicked!");
  };

  const Right = (
    <>
      <h2 className="mb-5 text-4xl font-extrabold md:text-4xl">
        <span className="text-pine">Welcome back!</span>{" "}
        <span className="text-walnut">Player!</span>
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {formError && (
          <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {formError}
          </div>
        )}

        <Field
          type="email"
          label="Email"
          name="email"
          placeholder="e.g. player@email.com"
          value={data.email}
          onChange={handleChange("email")}
          error={errors.email}
        />

        <Field
          type="password"
          label="Password"
          name="password"
          placeholder="Enter your password"
          value={data.password}
          onChange={handleChange("password")}
          error={errors.password}
        />

        <PrimaryButton
          type="submit"
          disabled={loading}
          className="mt-10 text-white"
          aria-busy={loading}
        >
          {loading ? "Signing in..." : "Sign in"}
        </PrimaryButton>

        <PrimaryButton type="button" onClick={handleGoogleSignIn} className="bg-smoke text-onyx">
          <span className="inline-flex items-center gap-2">
            <Image src="/brand/google-icon.svg" alt="Google" width={20} height={20} priority />
            <span className="font-medium">Sign in with Google (optional)</span>
          </span>
        </PrimaryButton>

        <p className="pt-2 text-center text-sm text-walnut">
          Don’t have an account?{" "}
          <Link href="/register" className="font-semibold text-sea underline">
            Create one
          </Link>
        </p>

        <p className="text-xs text-neutral-500">
          * Mock: <code>ratchaprapa.c@ku.th / courtlyHokori25</code> ⇒ role = player
          <br />
          * Mock: <code>courtly.project@gmail.com</code> ⇒ role = manager
        </p>
      </form>
    </>
  );

  return <SplitPage heroPosition="left" formSide={Right} heroSide={<AuthHero side="right" />} />;
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-neutral-600">Loading…</div>}>
      <LoginContent />
    </Suspense>
  );
}
