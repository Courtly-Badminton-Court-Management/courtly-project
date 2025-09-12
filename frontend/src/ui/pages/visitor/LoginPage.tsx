"use client";

import Link from "next/link";
import { useState } from "react";
import { z } from "zod";
import { useRouter, useSearchParams } from "next/navigation";
import AuthHero from "@/ui/components/authpage/AuthHero";
import SplitPage from "@/ui/components/authpage/SplitPage";
import Field from "@/ui/components/basic/Field";
import PrimaryButton from "@/ui/components/basic/PrimaryButton";

const schema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Required"),
  remember: z.boolean().optional().default(false),
});

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next");

  const [data, setData] = useState({
    email: "",
    password: "",
    remember: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleChange =
    (name: keyof typeof data) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value =
        e.target.type === "checkbox"
          ? (e.target as any).checked
          : e.target.value;
      setData((prev) => ({ ...prev, [name]: value }));
      setErrors((prev) => ({ ...prev, [name]: "" }));
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const parsed = schema.safeParse(data);
    if (!parsed.success) {
      const fieldErrs: Record<string, string> = {};
      parsed.error.issues.forEach((i) => {
        fieldErrs[i.path.join(".")] = i.message;
      });
      setErrors(fieldErrs);
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
        }),
      });

      if (!res.ok) {
        const t = await res.text();
        throw new Error(t || "Login failed");
      }

      const payload = (await res.json()) as { ok: boolean; role: "player" | "manager" };

      if (nextPath) {
        router.replace(nextPath);
        return;
      }
      router.replace(payload.role === "manager" ? "/dashboard" : "/home");
    } catch (err: any) {
      setFormError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      // TODO: Connect real Google OAuth
      alert("🔓 Google Sign-In clicked!");
      // เมื่อเชื่อมจริง ให้ทำ logic redirect เหมือน handleSubmit ด้านบน
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const Right = (
    <>
      <h2 className="text-4xl md:text-4xl font-extrabold mb-5">
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

        <div className="space-y-1">
          <Field
            type={showPwd ? "text" : "password"}
            label="Password"
            name="password"
            placeholder="Enter your password"
            value={data.password}
            onChange={handleChange("password")}
            error={errors.password}
          />
          {/* ถ้าอยากให้โชว์/ซ่อนรหัสผ่าน:
          <button type="button" className="text-xs underline"
                  onClick={() => setShowPwd((v) => !v)}>
            {showPwd ? "Hide password" : "Show password"}
          </button>
          */}
        </div>

        <div className="flex items-center justify-between"></div>

        <PrimaryButton
          type="submit"
          disabled={loading}
          className="text-white"
          aria-busy={loading}
        >
          {loading ? "Signing in..." : "Sign in"}
        </PrimaryButton>

        <PrimaryButton
          type="button"
          onClick={handleGoogleSignIn}
          className="bg-smoke text-onyx"
        >
          <img src="/brand/google-icon.svg" alt="Google" className="h-5 w-5" />
          <span className="font-medium">Sign in with Google (optional)</span>
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

  return (
    <SplitPage
      heroPosition="left"
      formSide={Right}
      heroSide={<AuthHero side="right" />}
    />
  );
}
