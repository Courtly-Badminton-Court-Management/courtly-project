// src\ui\pages\visitor\LoginPage.tsx
"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { z } from "zod";
import { useRouter, useSearchParams } from "next/navigation";
import AuthHero from "@/ui/components/authpage/AuthHero";
import SplitPage from "@/ui/components/authpage/SplitPage";
import Field from "@/ui/components/basic/Field";
import PrimaryButton from "@/ui/components/basic/PrimaryButton";
import CopyToClipboard from "@/ui/components/basic/CopyToClipboard";

import { useAuthLoginCreate } from "@/api-client/endpoints/auth/auth";
import { setTokens } from "@/lib/auth/tokenStore";
import { setSessionCookie } from "@/lib/auth/session";
import { customRequest } from "@/api-client/custom-client";
import { extractRoleFromAccess, type Role } from "@/lib/auth/role";
import { schedulePreemptiveRefresh } from "@/lib/auth/tokenStore";
import { refreshAccessToken } from "@/lib/auth/refresh";

type LoginForm = { email: string; password: string; remember: boolean; };

const schema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Required"),
  remember: z.boolean().optional().default(false),
});

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next");

  const [data, setData] = useState<LoginForm>({ email: "", password: "", remember: false });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);

  const loginMutation = useAuthLoginCreate({
  mutation: {
    onSuccess: async (payload: any) => {
      const access = payload?.access;
      const refresh = payload?.refresh;
      if (!access) { setFormError("Login failed: missing token"); return; }

      
      setTokens({ access, refresh: refresh ?? null }, data.remember ?? false);
      schedulePreemptiveRefresh(() => { refreshAccessToken().catch(()=>{}); });

      
      let role = extractRoleFromAccess(access) as Role | null;
      if (!role) {
        try {
          const me: any = await customRequest({ url: "/api/auth/me/", method: "GET" });
          role = (me?.role ?? "player") as Role;
        } catch (e: any) {
          setFormError(e?.message ?? "Failed to load profile");
          return;
        }
      }
      setSessionCookie(role, 8);
      if (nextPath) router.replace(nextPath);
      else router.replace(role === "manager" ? "/dashboard" : "/home");
    },
    onError: (err: any) => {
      setFormError(err?.message || "Something went wrong");
    },
  },
});

  const handleChange =
    <K extends keyof LoginForm>(name: K) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const isCheckbox = e.currentTarget.type === "checkbox";
      const value = (isCheckbox ? e.currentTarget.checked : e.currentTarget.value) as LoginForm[K];
      setData((prev) => ({ ...prev, [name]: value }));
      setErrors((prev) => ({ ...prev, [String(name)]: "" }));
    };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError(null);

    const parsed = schema.safeParse(data);
    if (!parsed.success) {
      const fieldErrs: Record<string, string> = {};
      for (const issue of parsed.error.issues) fieldErrs[issue.path.join(".")] = issue.message;
      setErrors(fieldErrs);
      return;
    }
    loginMutation.mutate({ data: { email: data.email, password: data.password } });
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

        <Field type="email" label="Email" name="email" placeholder="e.g. player@email.com"
          value={data.email} onChange={handleChange("email")} error={errors.email} />
        <Field type="password" label="Password" name="password" placeholder="Enter your password"
          value={data.password} onChange={handleChange("password")} error={errors.password} />

        <PrimaryButton type="submit" disabled={loginMutation.isPending} className="mt-10 text-white" aria-busy={loginMutation.isPending}>
          {loginMutation.isPending ? "Signing in..." : "Sign in"}
        </PrimaryButton>

        <p className="pt-2 text-center text-sm text-walnut">
          Don’t have an account?{" "}
          <Link href="/register" className="font-semibold text-sea underline">Create one</Link>
        </p>

        <p className="mt-10 text-xs text-neutral-500">
          * Mockup credentials <br />
          * For Player: <CopyToClipboard text="test2@example.com" /> <CopyToClipboard text="Courtly_123" /> <br />
          * For Manager: <CopyToClipboard text="courtly.project@gmail.com" /> <CopyToClipboard text="ISPcourtly_2025" />
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


