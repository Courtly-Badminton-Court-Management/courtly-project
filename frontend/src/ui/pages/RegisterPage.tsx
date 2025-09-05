"use client";

import Link from "next/link";
import SplitPage from "@/ui/components/SplitPage";
import AuthHero from "@/ui/components/AuthHero";
import Field from "@/ui/components/Field";
import PrimaryButton from "@/ui/components/PrimaryButton";
import TermsModal from "@/ui/components/modal/TermsModal";
import { z } from "zod";
import { useRef, useState } from "react";

/** ── Zod schema ─────────────────────────────────────────────────────────── */
const schema = z
  .object({
    username: z.string().min(1, "Required"),
    email: z.string().email("Invalid email"),
    firstname: z.string().min(1, "Required"),
    lastname: z.string().min(1, "Required"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters long")
      .regex(/[a-z]/, "Must include a lowercase letter")
      .regex(/[A-Z]/, "Must include an uppercase letter")
      .regex(/[0-9]/, "Must include a number")
      .regex(/[^A-Za-z0-9]/, "Must include a special character"),
    confirm: z.string().min(1, "Required"),
    accept: z.boolean().refine((val) => val === true, {
      message: "Please accept terms",
    }),
  })
  .refine((data) => data.password === data.confirm, {
    message: "Passwords do not match",
    path: ["confirm"],
  });

export default function RegisterPage() {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const acceptRef = useRef<HTMLInputElement>(null);

  async function onSubmit(formData: FormData) {
    setErrors({});
    const payload = Object.fromEntries(formData) as Record<string, any>;
    payload.accept = payload.accept === "on";

    const parsed = schema.safeParse(payload);
    if (!parsed.success) {
      const map: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0]?.toString() || "root";
        map[key] = issue.message;
      }
      setErrors(map);
      return;
    }

    try {
      setLoading(true);
      // TODO: call API register จริง
      alert("Sign up success ✅\n" + JSON.stringify(parsed.data, null, 2));
    } catch (e: any) {
      setErrors({ root: e?.message ?? "Something went wrong" });
    } finally {
      setLoading(false);
    }
  }

  const Right = (
    <>
      <h2 className="text-4xl md:text-4xl font-extrabold mb-5">
        <span className="text-pine">Game on!</span>{" "}
        <span className="text-walnut">Create an Account.</span>
      </h2>

      <form action={onSubmit} className="space-y-3">
        <Field
          label="Username"
          name="username"
          placeholder="e.g. smashtiger88"
          error={errors.username}
        />
        <Field
          type="email"
          label="Email"
          name="email"
          placeholder="e.g. player@email.com"
          error={errors.email}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Firstname"
            name="firstname"
            placeholder="e.g. Tanawat"
            error={errors.firstname}
          />
          <Field
            label="Lastname"
            name="lastname"
            placeholder="e.g. Srisawat"
            error={errors.lastname}
          />
        </div>

        <Field
          type="password"
          label="Password"
          name="password"
          placeholder="Must be 8+ characters, include symbols"
          error={errors.password}
        />
        <Field
          type="password"
          label="Confirm password"
          name="confirm"
          placeholder="Re-enter your password"
          error={errors.confirm}
        />

        {/* Terms */}
        <div className="relative">
          <label className="mt-8 flex items-center gap-2 text-sm text-onyx">
            <input
              ref={acceptRef}
              type="checkbox"
              name="accept"
              className={`h-4 w-4 rounded border-platinum text-sea focus:ring-sea ${
                errors.accept ? "ring-2 ring-red-400" : ""
              }`}
            />
            <span>
              I agree to the{" "}
              <button
                type="button"
                onClick={() => setShowTerms(true)}
                className="font-semibold text-sea underline underline-offset-2"
              >
                Terms &amp; Conditions
              </button>
            </span>
          </label>
          {errors.accept && (
            <span className="pointer-events-none absolute -bottom-4 right-0 text-xs text-red-600">
              {errors.accept}
            </span>
          )}
        </div>

        {errors.root && (
          <p className="text-sm text-red-600">{errors.root}</p>
        )}

        <div className="mt-8">
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

      <TermsModal
        open={showTerms}
        onClose={() => setShowTerms(false)}
        onAccept={() => {
          if (acceptRef.current) acceptRef.current.checked = true;
          setErrors((e) => {
            const { accept, ...rest } = e;
            return rest;
          });
        }}
      />
    </>
  );

  return <SplitPage heroPosition="right" heroSide={<AuthHero side="left"/>} formSide={Right} />;
}
