// src/ui/pages/visitor/RegisterPage.tsx
"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import SplitPage from "@/ui/components/authpage/SplitPage";
import AuthHero from "@/ui/components/authpage/AuthHero";
import Field from "@/ui/components/basic/Field";
import PrimaryButton from "@/ui/components/basic/PrimaryButton";
import { registerWithEmail } from "@/lib/auth";

export default function RegisterPage() {
  const router = useRouter();

  // keep the same style as Login: controlled inputs + top error banner
  const [username, setUsername] = useState("");
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [accept, setAccept] = useState(false);

  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErr(null);

    // minimal client checks (to mirror simple Login UX)
    if (!accept) return setErr("Please accept the terms to continue.");
    if (password !== confirm) return setErr("Passwords do not match.");

    setLoading(true);
    try {
      await registerWithEmail({
        username,
        email,
        password,
        confirm,
        firstname,
        lastname,
        accept,
      });
      router.replace("/login");
    } catch (e: any) {
      // show server message like LoginPage does
      setErr(e?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  const Right = (
    <>
      <h2 className="text-4xl md:text-4xl font-extrabold mb-5">
        <span className="text-pine">Game on!</span>
      </h2>

      <form onSubmit={onSubmit} className="space-y-3">
        {err && (
          <div className="rounded-md border p-3 text-sm text-red-600 whitespace-pre-wrap">
            {err}
          </div>
        )}

        <Field
          type="text"
          label="Username"
          name="username"
          placeholder="e.g. smashtiger88"
          value={username}
          onChange={(e) => setUsername((e.target as HTMLInputElement).value)}
          autoComplete="username"
        />

        <Field
          type="email"
          label="Email"
          name="email"
          placeholder="e.g. player@email.com"
          value={email}
          onChange={(e) => setEmail((e.target as HTMLInputElement).value)}
          autoComplete="email"
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            type="text"
            label="Firstname"
            name="firstname"
            placeholder="e.g. Tanawat"
            value={firstname}
            onChange={(e) => setFirstname((e.target as HTMLInputElement).value)}
            autoComplete="given-name"
          />
          <Field
            type="text"
            label="Lastname"
            name="lastname"
            placeholder="e.g. Srisawat"
            value={lastname}
            onChange={(e) => setLastname((e.target as HTMLInputElement).value)}
            autoComplete="family-name"
          />
        </div>

        <Field
          type="password"
          label="Password"
          name="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword((e.target as HTMLInputElement).value)}
          autoComplete="new-password"
        />

        <Field
          type="password"
          label="Confirm password"
          name="confirm"
          placeholder="••••••••"
          value={confirm}
          onChange={(e) => setConfirm((e.target as HTMLInputElement).value)}
          autoComplete="new-password"
        />

        {/* terms checkbox, styled simply to match page tone */}
        <label className="mt-2 flex items-center gap-2 text-sm text-walnut">
          <input
            type="checkbox"
            name="accept"
            checked={accept}
            onChange={(e) => setAccept((e.target as HTMLInputElement).checked)}
            className="h-4 w-4"
          />
          <span>
            I agree to the <span className="font-semibold underline">Terms &amp; Conditions</span>
          </span>
        </label>

        <div className="mt-6">
          <PrimaryButton type="submit" disabled={loading} className="text-white">
            {loading ? "Please wait…" : "Sign up Now!"}
          </PrimaryButton>
        </div>

        <p className="pt-2 text-center text-sm text-walnut">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-sea underline">
            Sign In
          </Link>
        </p>
      </form>
    </>
  );

  return (
    <SplitPage heroPosition="right" heroSide={<AuthHero side="left" />} formSide={Right} />
  );
}
