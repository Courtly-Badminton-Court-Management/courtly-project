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

// ✅ Import directly from Orval-generated client
import { useAuthLoginCreate } from "@/api-client/endpoints/auth/auth";

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
  const [formError, setFormError] = useState<string | null>(null);

  // ✅ Use generated mutation
  const loginMutation = useAuthLoginCreate({
    mutation: {
      onSuccess: (payload: any) => {
        // Your backend likely returns { access, refresh }
        if (!payload?.access) {
          setFormError("Login failed: missing token");
          return;
        }

        // Save tokens (you can adjust to your storage strategy)
        localStorage.setItem("access", payload.access);
        localStorage.setItem("refresh", payload.refresh);

        if (nextPath) {
          router.replace(nextPath);
        } else {
          router.replace("/dashboard"); // or role-based redirect
        }
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
      for (const issue of parsed.error.issues) {
        fieldErrs[issue.path.join(".")] = issue.message;
      }
      setErrors(fieldErrs);
      return;
    }

    // ✅ Call generated mutation
    loginMutation.mutate({
      data: { email: data.email, password: data.password },
    });
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
          disabled={loginMutation.isPending}
          className="mt-10 text-white"
          aria-busy={loginMutation.isPending}
        >
          {loginMutation.isPending ? "Signing in..." : "Sign in"}
        </PrimaryButton>

        <p className="pt-2 text-center text-sm text-walnut">
          Don’t have an account?{" "}
          <Link href="/register" className="font-semibold text-sea underline">
            Create one
          </Link>
        </p>

        <p className="mt-10 text-xs text-neutral-500">
          * Mockup credentials <br />
          * For Player: <CopyToClipboard text="ratchaprapa.c@ku.th" /> <br />
          * For Manager: <CopyToClipboard text="courtly.project@gmail.com" />
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
